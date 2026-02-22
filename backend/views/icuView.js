export function sendSuccess(res, data) {
  res.status(200).json({
    status: "success",
    data,
  });
}

export function sendError(res, message) {
  res.status(500).json({
    status: "error",
    message,
  });
}
