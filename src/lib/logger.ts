export function logError(context: string, error: unknown, meta?: Record<string, unknown>) {
  console.error(JSON.stringify({
    level: "error",
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...meta,
    timestamp: new Date().toISOString(),
  }));
}

export function logInfo(context: string, message: string, meta?: Record<string, unknown>) {
  console.log(JSON.stringify({
    level: "info",
    context,
    message,
    ...meta,
    timestamp: new Date().toISOString(),
  }));
}
