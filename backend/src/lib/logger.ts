export type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
    return;
  }

  console.log(JSON.stringify(entry));
}
