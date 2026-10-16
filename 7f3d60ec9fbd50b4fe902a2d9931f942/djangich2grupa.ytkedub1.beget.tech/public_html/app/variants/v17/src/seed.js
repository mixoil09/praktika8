// Заполняет БД тестовыми данными. Запуск: npm run seed
const { initSchema, db } = require("./models");

initSchema();

// Очищаем таблицы для повторного запуска
db.exec(`
  DELETE FROM webinar_attendance;
  DELETE FROM webinars;
  DELETE FROM students;
  DELETE FROM teachers;
  DELETE FROM subjects;
  DELETE FROM groups;
`);

// Группы
const groups = db.prepare("INSERT INTO groups (name, course) VALUES (?, ?)");
[["09.02.09-454", 3], ["09.02.09-455", 3]].forEach(([n, c]) => groups.run(n, c));

// Предметы
const subjects = db.prepare("INSERT INTO subjects (name, hours) VALUES (?, ?)");
[["Веб-разработка", 80], ["Базы данных", 60], ["Алгоритмы", 40]].forEach(([n, h]) => subjects.run(n, h));

// Преподаватели
const teachers = db.prepare("INSERT INTO teachers (full_name, email) VALUES (?, ?)");
[["Иванов И.И.", "ivanov@uni.ru"], ["Петрова А.С.", "petrova@uni.ru"]].forEach(([n, e]) => teachers.run(n, e));

// Студенты
const stud = db.prepare("INSERT INTO students (first_name, last_name, email, group_id) VALUES (?, ?, ?, ?)");
const students = [
  ["Алексей", "Молоков", "molokov@uni.ru", 1],
  ["Мария", "Сидорова", "sidorova@uni.ru", 1],
  ["Иван", "Петров", "petrov@uni.ru", 1],
  ["Ольга", "Кузнецова", "kuznetsova@uni.ru", 2],
];
students.forEach(([f, l, e, g]) => stud.run(f, l, e, g));

// Вебинары (вариант 17)
const webinar = db.prepare(
  "INSERT INTO webinars (title, subject_id, teacher_id, starts_at, duration_minutes) VALUES (?, ?, ?, ?, ?)"
);
const now = Date.now();
const webinars = [
  ["Веб-разработка: введение", 1, 1, new Date(now - 24*3600e3).toISOString(), 60],
  ["Базы данных: SQL", 2, 2, new Date(now - 3*24*3600e3).toISOString(), 90],
  ["Алгоритмы: сортировка", 3, 1, new Date(now - 5*24*3600e3).toISOString(), 45],
];
const wids = webinars.map(([title, s, t, st, d]) => {
  const r = webinar.run(title, s, t, st, d);
  return r.lastInsertRowid;
});

// Посещаемость: сессии входа/выхода. Хоум для >80%: присутствие почти всю длительность.
const att = db.prepare(
  "INSERT INTO webinar_attendance (webinar_id, student_id, joined_at, left_at) VALUES (?, ?, ?, ?)"
);
function addAttendance(webinarId, studentId, startOffsetMin, stayMin, duration) {
  const start = new Date(now - 24*3600e3 + startOffsetMin*60e3);
  const left = new Date(start.getTime() + stayMin*60e3);
  att.run(webinarId, studentId, start.toISOString(), left.toISOString());
}

// Студент 1 (Молоков): на вебинаре 1 присутствовал 55 из 60 мин (91%) -> засчитан
addAttendance(wids[0], 1, 10, 55, 60);
// Студент 1 на вебинаре 2: 40 из 90 мин (44%) -> НЕ засчитан
addAttendance(wids[1], 1, 5, 40, 90);
// Студент 2 (Мария): на вебинаре 1 присутствовала все 60 мин (100%) -> засчитана
addAttendance(wids[0], 2, 0, 60, 60);
// Студент 2 на вебинаре 3: 25 из 45 (55%) -> НЕ засчитана
addAttendance(wids[2], 2, 3, 25, 45);
// Студент 3 (Иван): на вебинаре 1 присутствовал 50 из 60 (83%) -> засчитан
addAttendance(wids[0], 3, 2, 50, 60);
// Студент 4 (Ольга): на вебинаре 2 присутствовала 75 из 90 (83%) -> засчитана
addAttendance(wids[1], 4, 10, 75, 90);

console.log("Тестовые данные добавлены.");
console.log("Студентов:", db.prepare("SELECT COUNT(*) c FROM students").get().c);
console.log("Вебинаров:", db.prepare("SELECT COUNT(*) c FROM webinars").get().c);
console.log("Записей посещаемости:", db.prepare("SELECT COUNT(*) c FROM webinar_attendance").get().c);