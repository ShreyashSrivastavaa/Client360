export type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "jwt_secret",
  "turso_auth_token",
  "cookie",
  "authorization",
]);

function sanitizeContext(context: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(context)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeContext(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    const payload: LogPayload = {
      level: "info",
      message,
      context: context ? sanitizeContext(context) : undefined,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(payload));
  },

  warn(message: string, context?: Record<string, any>) {
    const payload: LogPayload = {
      level: "warn",
      message,
      context: context ? sanitizeContext(context) : undefined,
      timestamp: new Date().toISOString(),
    };
    console.warn(JSON.stringify(payload));
  },

  error(message: string, errorOrContext?: any) {
    let context: Record<string, any> = {};
    if (errorOrContext instanceof Error) {
      context = {
        name: errorOrContext.name,
        message: errorOrContext.message,
        stack: process.env.NODE_ENV === "development" ? errorOrContext.stack : undefined,
      };
    } else if (typeof errorOrContext === "object" && errorOrContext !== null) {
      context = sanitizeContext(errorOrContext);
    }

    const payload: LogPayload = {
      level: "error",
      message,
      context,
      timestamp: new Date().toISOString(),
    };
    console.error(JSON.stringify(payload));
  },
};
