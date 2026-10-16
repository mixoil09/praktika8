// Контроллер вебинаров (слой Controller). Вариант 17.
const { asyncHandler } = require("./crudController");
const { HttpError } = require("../middleware/errorMiddleware");

function makeWebinarController(service) {
  return {
    // GET /api/webinars/activity — активность студентов на вебинарах
    activity: asyncHandler(async (req, res) => {
      const report = service.listWebinarsWithAttendance();
      res.json({ data: report });
    }),

    // GET /api/webinars/activity?studentId=N — активность конкретного студента
    activityForStudent: asyncHandler(async (req, res) => {
      const studentId = Number(req.query.studentId);
      if (!studentId) throw new HttpError(400, "Параметр studentId обязателен");
      const report = service.webinarActivityForStudent(studentId);
      res.json({ data: report });
    }),
  };
}

module.exports = { makeWebinarController };