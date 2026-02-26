export const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    // eslint-disable-next-line no-console
    console.log(
      JSON.stringify({
        level: "info",
        method,
        path: originalUrl,
        statusCode,
        durationMs: duration
      })
    );
  });

  next();
};

