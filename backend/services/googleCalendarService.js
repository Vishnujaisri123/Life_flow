const jwt = require('jsonwebtoken');

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/**
 * Generate Google OAuth2 Consent URL
 */
function getAuthUrl(userId) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    throw new Error('Google OAuth credentials are not fully configured in environment variables.');
  }

  // Securely encode user identity in the state parameter using a JWT
  const stateToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state: stateToken,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange Auth Code for Access/Refresh Tokens
 */
async function getTokensFromCode(code) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error_description || body.error || 'Failed to exchange OAuth code');
  }

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresIn: body.expires_in, // in seconds
  };
}

/**
 * Refresh the Google Access Token if expired or near expiry
 */
async function refreshAccessToken(user) {
  // If token is still valid for the next 5 minutes, reuse it
  if (user.googleAccessToken && user.googleTokensExpiry && new Date(user.googleTokensExpiry) > new Date(Date.now() + 5 * 60_000)) {
    return user.googleAccessToken;
  }

  if (!user.googleRefreshToken) {
    throw new Error('No refresh token available. User must re-authenticate.');
  }

  console.log(`[Google Calendar] Refreshing access token for user ${user._id}...`);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleRefreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error_description || body.error || 'Failed to refresh token');
  }

  user.googleAccessToken = body.access_token;
  user.googleTokensExpiry = new Date(Date.now() + body.expires_in * 1000);
  await user.save();

  return body.access_token;
}

/**
 * Synchronize a task to Google Calendar (Insert or Update)
 */
async function upsertCalendarEvent(user, task) {
  try {
    if (!user.googleRefreshToken) return null; // Google not connected

    // Events require at least a due date or start time
    const start = task.startTime || task.dueDate || task.startDate;
    if (!start) return null;

    const token = await refreshAccessToken(user);

    // Calculate end time (default to 30 mins after start if none exists)
    const end = task.endTime || task.dueDate || new Date(new Date(start).getTime() + 30 * 60_000);

    const eventResource = {
      summary: task.title,
      description: task.description || 'Synced from LifeFlow AI Dashboard.',
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: user.timezone || 'UTC',
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: user.timezone || 'UTC',
      },
      colorId: task.priority === 'urgent' || task.priority === 'high' ? '11' : task.priority === 'medium' ? '5' : '1', // 11 is bold red, 5 is yellow, 1 is blue
    };

    let url = GOOGLE_CALENDAR_API;
    let method = 'POST';

    if (task.googleEventId) {
      url = `${GOOGLE_CALENDAR_API}/${task.googleEventId}`;
      method = 'PUT';
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventResource),
    });

    const body = await response.json();

    // If updating a deleted event, recreate it
    if (method === 'PUT' && response.status === 404) {
      task.googleEventId = null;
      return upsertCalendarEvent(user, task);
    }

    if (!response.ok) {
      console.warn('[Google Calendar Sync] Sync failed:', body.error?.message || response.statusText);
      return null;
    }

    if (body.id && task.googleEventId !== body.id) {
      task.googleEventId = body.id;
      await task.save();
    }

    console.log(`[Google Calendar Sync] Successfully synced task "${task.title}" (Event ID: ${body.id})`);
    return body.id;
  } catch (error) {
    console.warn('[Google Calendar Sync] Upsert failed gracefully:', error.message);
    return null;
  }
}

/**
 * Delete a synchronized task from Google Calendar
 */
async function deleteCalendarEvent(user, task) {
  try {
    if (!user.googleRefreshToken || !task.googleEventId) return;

    const token = await refreshAccessToken(user);
    const url = `${GOOGLE_CALENDAR_API}/${task.googleEventId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) {
      // Event already deleted in Calendar
      return;
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.warn('[Google Calendar Sync] Delete failed:', body.error?.message || response.statusText);
      return;
    }

    console.log(`[Google Calendar Sync] Successfully deleted synced event: ${task.googleEventId}`);
  } catch (error) {
    console.warn('[Google Calendar Sync] Delete failed gracefully:', error.message);
  }
}

async function importEventsFromGoogle(user) {
  try {
    if (!user.googleRefreshToken) return [];

    const token = await refreshAccessToken(user);
    // Query events from 1 day ago to retrieve recent updates
    const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const url = `${GOOGLE_CALENDAR_API}?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.warn('[Google Calendar Sync] Import failed:', body.error?.message || response.statusText);
      return [];
    }

    const body = await response.json();
    return body.items || [];
  } catch (error) {
    console.warn('[Google Calendar Sync] Import failed gracefully:', error.message);
    return [];
  }
}

module.exports = {
  getAuthUrl,
  getTokensFromCode,
  refreshAccessToken,
  upsertCalendarEvent,
  deleteCalendarEvent,
  importEventsFromGoogle,
};
