export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  tasks: "/tasks",
  timeline: "/timeline",
  calendar: "/calendar",
  analytics: "/analytics",
  aiAssistant: "/ai",
  notifications: "/notifications",
  settings: "/settings",
  profile: "/profile",
  habits: "/habits",
  goals: "/goals",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
