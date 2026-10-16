// Модель данных и схема БД (слой Model).
// Таблицы: groups, subjects, teachers, students, webinars, webinar_attendance
const db = require("../config/db");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      course INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hours INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      group_id INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT
    );

    -- Вариант 17: посещаемость вебинаров
    CREATE TABLE IF NOT EXISTS webinars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject_id INTEGER NOT NULL,
      teacher_id INTEGER NOT NULL,
      starts_at TEXT NOT NULL,              -- ISO дата-время начала
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    );

    -- Факты нахождения студента в комнате вебинара (сессии входа/выхода)
    CREATE TABLE IF NOT EXISTS webinar_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      webinar_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      joined_at TEXT NOT NULL,              -- когда вошёл в комнату
      left_at TEXT,                         -- когда вышел (NULL = ещё внутри)
      FOREIGN KEY (webinar_id) REFERENCES webinars(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);
}

module.exports = { initSchema, db };