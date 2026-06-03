const ChatMessage = require('../models/ChatMessage');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');
const { fetchTaskContext, buildSystemPrompt } = require('../services/aiContextService');
const { chatCompletion } = require('../services/aiService');

const MAX_HISTORY = 40;
const MAX_CLIENT_MESSAGES = 30;

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role,
      content: String(m.content).trim().slice(0, 8000),
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_CLIENT_MESSAGES);
}

async function postChat(req, res, next) {
  try {
    const { messages: clientMessages, mode = 'general' } = req.body || {};
    const messages = sanitizeMessages(clientMessages);

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return sendError(res, {
        message: 'Send at least one user message',
        statusCode: 400,
      });
    }

    const taskContext = await fetchTaskContext(req.user._id);
    const systemContent = buildSystemPrompt({
      userName: req.user.name,
      taskContext,
      mode,
    });

    const apiMessages = [
      { role: 'system', content: systemContent },
      ...messages,
    ];

    let result;
    try {
      result = await chatCompletion({ messages: apiMessages });
    } catch (error) {
      if (error.code === 'NO_PROVIDERS_CONFIGURED') {
        return sendError(res, {
          message: 'AI service is not configured. Set OPENROUTER_API_KEY, GROK_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY on the server.',
          statusCode: 503,
        });
      }
      return sendError(res, {
        message: error.message || 'AI request failed',
        statusCode: error.status && error.status < 500 ? error.status : 502,
      });
    }

    // Parse AI Action blocks
    const actionRegex = /```action\n([\s\S]*?)```/g;
    let match;
    const actions = [];
    while ((match = actionRegex.exec(result.content)) !== null) {
      try {
        actions.push(JSON.parse(match[1].trim()));
      } catch (e) {
        console.error('Failed to parse AI action:', e);
      }
    }

    const { processAiAction } = require('../services/aiToolService');
    const actionCards = [];
    const pendingConfirmations = [];

    for (const action of actions) {
      const outcome = await processAiAction(action, req.user._id);
      if (outcome.requiresConfirmation) {
        pendingConfirmations.push(outcome.action);
      } else if (outcome.success) {
        actionCards.push({ type: outcome.type, message: outcome.message, data: outcome.data });
      }
    }

    const lastUser = messages[messages.length - 1];

    await ChatMessage.insertMany([
      { userId: req.user._id, role: 'user', content: lastUser.content, mode },
      { userId: req.user._id, role: 'assistant', content: result.content, mode },
    ]);

    const count = await ChatMessage.countDocuments({ userId: req.user._id });
    if (count > MAX_HISTORY * 2) {
      const oldest = await ChatMessage.find({ userId: req.user._id })
        .sort({ createdAt: 1 })
        .limit(count - MAX_HISTORY * 2)
        .select('_id');
      await ChatMessage.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
    }

    // Refresh task context after possible actions
    const finalTaskContext = await fetchTaskContext(req.user._id);

    return sendSuccess(res, {
      message: 'AI reply generated',
      data: {
        reply: result.content,
        model: result.model,
        provider: result.provider,
        responseTime: result.responseTime,
        taskContext: finalTaskContext,
        actionCards,
        pendingConfirmations,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getHistory(req, res, next) {
  try {
    const rows = await ChatMessage.find({
      userId: req.user._id,
      role: { $in: ['user', 'assistant'] },
    })
      .sort({ createdAt: 1 })
      .limit(MAX_HISTORY);

    const messages = rows.map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      mode: r.mode,
      createdAt: r.createdAt,
    }));

    return sendSuccess(res, { message: 'Chat history fetched', data: { messages } });
  } catch (error) {
    return next(error);
  }
}

async function clearHistory(req, res, next) {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    return sendSuccess(res, { message: 'Chat history cleared', data: { cleared: true } });
  } catch (error) {
    return next(error);
  }
}

async function confirmAction(req, res, next) {
  try {
    const { action } = req.body;
    action.confirmed = true;
    const { processAiAction } = require('../services/aiToolService');
    const outcome = await processAiAction(action, req.user._id);
    
    // Refresh task context
    const finalTaskContext = await fetchTaskContext(req.user._id);
    
    return sendSuccess(res, {
      message: 'Action confirmed',
      data: {
        outcome,
        taskContext: finalTaskContext,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { postChat, getHistory, clearHistory, confirmAction };
