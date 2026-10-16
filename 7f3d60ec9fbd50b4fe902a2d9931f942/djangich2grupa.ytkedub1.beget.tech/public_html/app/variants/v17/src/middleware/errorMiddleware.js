// Глобальный обработчик ошибок и кастомный класс HttpError.
// - 400 Bad Request для ошибок валидации
// - 404 Not Found при отсутствии ресурса
// - 500 Internal Server Error для непредвиденных исключений

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res, next) {
  next(new HttpError(404, `Маршрут ${req.originalUrl} не найден`));
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = status === 500 ? "Внутренняя ошибка сервера" : err.message;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === "development" && err.stack ? { stack: err.stack } : {}),
    },
  });
}

module.exports = { HttpError, notFound, errorHandler };