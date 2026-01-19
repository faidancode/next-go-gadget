// src/constants/auth.ts
export const AUTH_COOKIES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  AUTH_USER_COOKIE: "authUser",
  COOKIE_MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
} as const;
