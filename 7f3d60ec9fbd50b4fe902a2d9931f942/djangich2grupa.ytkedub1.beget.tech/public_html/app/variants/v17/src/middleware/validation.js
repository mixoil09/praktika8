// Слой валидации входных данных.
// Возвращает объект { valid, errors } либо бросает HttpError(400).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRequired(value, field) {
  return value !== undefined && String(value).trim() !== "" ? null : `Поле ${field} обязательно`;
}

function validateEmail(value) {
  if (value !== undefined && value !== "" && !EMAIL_RE.test(String(value))) {
    return "Некорректный email";
  }
  return null;
}

function buildErrors(checks) {
  return checks.filter((c) => c !== null);
}

const validators = {
  student(data) {
    return buildErrors([
      validateRequired(data.first_name, "first_name"),
      validateRequired(data.last_name, "last_name"),
      validateRequired(data.group_id, "group_id"),
      validateEmail(data.email),
    ]);
  },
  group(data) {
    return buildErrors([
      validateRequired(data.name, "name"),
      data.course !== undefined && Number(data.course) < 1 ? "course должен быть >= 1" : null,
    ]);
  },
  subject(data) {
    return buildErrors([
      validateRequired(data.name, "name"),
      data.hours !== undefined && Number(data.hours) < 0 ? "hours не может быть отрицательным" : null,
    ]);
  },
  teacher(data) {
    return buildErrors([
      validateRequired(data.full_name, "full_name"),
      validateEmail(data.email),
    ]);
  },
  webinar(data) {
    return buildErrors([
      validateRequired(data.title, "title"),
      validateRequired(data.subject_id, "subject_id"),
      validateRequired(data.teacher_id, "teacher_id"),
      data.duration_minutes !== undefined && Number(data.duration_minutes) <= 0 ? "duration_minutes должен быть > 0" : null,
    ]);
  },
};

function validate(entity, data) {
  const fn = validators[entity];
  if (!fn) return [];
  return fn(data || {});
}

module.exports = { validate };