const isDev = import.meta.env.DEV;

const redactedKeys = ["password", "token", "access_token", "authorization", "message"];

function sanitize(value) {
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (redactedKeys.includes(key.toLowerCase())) return [key, "[REDACTED]"];
      if (typeof entry === "string" && entry.length > 80) return [key, `${entry.slice(0, 80)}...`];
      return [key, entry];
    })
  );
}

function write(level, scope, message, meta) {
  const formatted = `[${level}] ${scope} - ${message}`;
  const safeMeta = sanitize(meta);

  if (safeMeta) {
    console[level.toLowerCase()](formatted, safeMeta);
    return;
  }

  console[level.toLowerCase()](formatted);
}

export const logger = {
  info(scope, message, meta) {
    if (isDev) write("INFO", scope, message, meta);
  },
  warn(scope, message, meta) {
    write("WARN", scope, message, meta);
  },
  error(scope, message, meta) {
    write("ERROR", scope, message, meta);
  },
  debug(scope, message, meta) {
    if (isDev) write("DEBUG", scope, message, meta);
  },
};
