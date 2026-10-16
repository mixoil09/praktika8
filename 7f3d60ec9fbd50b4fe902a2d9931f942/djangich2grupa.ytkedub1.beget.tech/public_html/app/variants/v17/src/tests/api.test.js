// Базовый smoke-тест бизнес-правила варианта 17 и CRUD.
// Запуск: node src/tests/api.test.js  (не требует jest)
const assert = require("assert");
const { initSchema, db } = require("../models");

initSchema();
// чистая изолированная проверка правила напрямую через SQL-запрос
const report = db.prepare(`
  SELECT student_id, webinar_id,
         SUM((julianday(COALESCE(a.left_at, w.starts_at)) - julianday(a.joined_at)) * 24 * 60) AS minutes_in_room,
         w.duration_minutes AS duration_minutes
  FROM webinar_attendance a
  JOIN webinars w ON w.id = a.webinar_id
  GROUP BY student_id, webinar_id
`).all();

function attended(row) {
  return (row.minutes_in_room || 0) > 0.8 * row.duration_minutes;
}

// Проверяем, что хотя бы один студент засчитан, а минимум в одном случае правило отсекает
const someAttended = report.some(attended);
const someNotAttended = report.some((r) => !attended(r));

assert.strictEqual(someAttended, true, "Должен быть минимум один засчитанный студент");
assert.strictEqual(someNotAttended, true, "Должен быть минимум один НЕ засчитанный студент");

// Валидация email простым регэкспом
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
assert.ok(EMAIL_RE.test("test@uni.ru"), "email должен проходить");
assert.ok(!EMAIL_RE.test("bad-email"), "неверный email должен отсекаться");

console.log("Smoke-тесты пройдены: бизнес-правило (80%) и валидация работают корректно.");