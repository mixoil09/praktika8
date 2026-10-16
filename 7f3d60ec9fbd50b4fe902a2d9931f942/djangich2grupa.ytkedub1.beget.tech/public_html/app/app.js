const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// ---------- MySQL pool ----------
const pool = mysql.createPool({
  host: 'localhost',
  user: 'ytkedub1_jsnode',
  password: 'Mishka8857',
  database: 'ytkedub1_jsnode',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4'
});

// ---------- Схема ----------
async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    level_code VARCHAR(10) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  await pool.query(`CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  await pool.query(`CREATE TABLE IF NOT EXISTS \`groups\` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    language_id INT NULL,
    teacher_id INT NULL,
    level VARCHAR(10) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  await pool.query(`CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NULL,
    group_id INT NULL,
    level VARCHAR(10) NULL,
    status VARCHAR(20) DEFAULT 'active'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  await pool.query(`CREATE TABLE IF NOT EXISTS clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    club_name VARCHAR(100) NULL,
    visited_at DATE NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
  await pool.query(`CREATE TABLE IF NOT EXISTS tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    target_level VARCHAR(10) NULL,
    score INT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
}
init().catch(e => console.error('init error:', e));

// ---------- Helpers ----------
const err = (res, code, msg) => res.status(code).json({ status_code: code, errors: msg });
const vName = (v) => (v && String(v).trim().split(/\s+/).length >= 2) ? null : 'минимум 2 слова';
const vEmail = (v) => (v && String(v).includes('@')) ? null : 'некорректный email';
const vScore = (v) => (Number.isInteger(v) && v >= 0 && v <= 100) ? null : 'должен быть 0..100';

// ---------- Generic CRUD (id — только цифры, чтобы не перехватывать /level-up) ----------
function crud(table, columns, validate) {
  app.get('/api/' + table + '/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM `' + table + '`');
      res.json(rows);
    } catch (e) { err(res, 500, e.message); }
  });

  app.post('/api/' + table + '/', async (req, res) => {
    const d = req.body || {};
    const e = validate ? validate(d) : null;
    if (e) return err(res, 400, e);
    const cols = columns.filter(c => d[c] !== undefined);
    if (!cols.length) return err(res, 400, 'пустое тело запроса');
    const placeholders = cols.map(() => '?').join(', ');
    const sql = 'INSERT INTO `' + table + '` (' + cols.map(c => '`' + c + '`').join(', ') + ') VALUES (' + placeholders + ')';
    try {
      const [r] = await pool.query(sql, cols.map(c => d[c]));
      const [rows] = await pool.query('SELECT * FROM `' + table + '` WHERE id = ?', [r.insertId]);
      res.status(201).json(rows[0]);
    } catch (e) { err(res, 500, e.message); }
  });

  app.get('/api/' + table + '/:id(\\d+)/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM `' + table + '` WHERE id = ?', [req.params.id]);
      if (!rows.length) return err(res, 404, 'Не найдено');
      res.json(rows[0]);
    } catch (e) { err(res, 500, e.message); }
  });

  app.put('/api/' + table + '/:id(\\d+)/', async (req, res) => {
    const d = req.body || {};
    try {
      const [existing] = await pool.query('SELECT * FROM `' + table + '` WHERE id = ?', [req.params.id]);
      if (!existing.length) return err(res, 404, 'Не найдено');
      const merged = Object.assign({}, existing[0], d);
      const e = validate ? validate(merged) : null;
      if (e) return err(res, 400, e);
      const cols = columns.filter(c => d[c] !== undefined);
      if (!cols.length) return err(res, 400, 'пустое тело запроса');
      const setSql = cols.map(c => '`' + c + '` = ?').join(', ');
      await pool.query('UPDATE `' + table + '` SET ' + setSql + ' WHERE id = ?',
        [...cols.map(c => d[c]), req.params.id]);
      const [rows] = await pool.query('SELECT * FROM `' + table + '` WHERE id = ?', [req.params.id]);
      res.json(rows[0]);
    } catch (e) { err(res, 500, e.message); }
  });

  app.delete('/api/' + table + '/:id(\\d+)/', async (req, res) => {
    try {
      const [r] = await pool.query('DELETE FROM `' + table + '` WHERE id = ?', [req.params.id]);
      if (!r.affectedRows) return err(res, 404, 'Не найдено');
      res.status(204).end();
    } catch (e) { err(res, 500, e.message); }
  });
}

// ---------- Регистрация CRUD ----------
crud('languages', ['name', 'level_code'],
  d => d.name ? null : { name: 'обязательное поле' });

crud('teachers', ['full_name', 'email'],
  d => {
    const e = {};
    if (!d.full_name) e.full_name = 'обязательное поле';
    const em = vEmail(d.email); if (em) e.email = em;
    return Object.keys(e).length ? e : null;
  });

crud('groups', ['name', 'language_id', 'teacher_id', 'level'],
  d => d.name ? null : { name: 'обязательное поле' });

crud('students', ['full_name', 'email', 'group_id', 'level', 'status'],
  d => {
    const e = {};
    if (!d.full_name) e.full_name = 'обязательное поле';
    else { const x = vName(d.full_name); if (x) e.full_name = x; }
    const em = vEmail(d.email); if (em) e.email = em;
    return Object.keys(e).length ? e : null;
  });

crud('clubs', ['student_id', 'club_name', 'visited_at'], null);

crud('tests', ['student_id', 'target_level', 'score'],
  d => {
    const e = {};
    if (d.student_id === undefined || d.student_id === null) e.student_id = 'обязательное поле';
    const s = vScore(d.score); if (s) e.score = s;
    return Object.keys(e).length ? e : null;
  });

// ---------- Бизнес-логика варианта 25 ----------
const REQUIRED_CLUBS = 10;

async function checkLevelUp(student) {
  const sid = student.id;
  const [clubs] = await pool.query('SELECT * FROM clubs WHERE student_id = ?', [sid]);
  const [tests] = await pool.query('SELECT * FROM tests WHERE student_id = ? AND score >= 70', [sid]);
  const eligible = clubs.length >= REQUIRED_CLUBS && tests.length > 0;

  const problems = [];
  if (clubs.length < REQUIRED_CLUBS) problems.push('посещено клубов ' + clubs.length + ' из ' + REQUIRED_CLUBS);
  if (!tests.length) problems.push('внутренний тест не сдан');

  return {
    student_id: sid,
    full_name: student.full_name,
    current_level: student.level,
    clubs_visited: clubs.length,
    clubs_required: REQUIRED_CLUBS,
    has_passed_test: tests.length > 0,
    eligible_for_level_up: eligible,
    reason: eligible ? null : problems.join('; ')
  };
}

app.get('/api/clubs/level-up/', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT * FROM students');
    const out = [];
    for (const s of students) out.push(await checkLevelUp(s));
    res.json(out);
  } catch (e) { err(res, 500, e.message); }
});

app.get('/api/clubs/level-up/:sid(\\d+)/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.sid]);
    if (!rows.length) return err(res, 404, 'Студент не найден');
    res.json(await checkLevelUp(rows[0]));
  } catch (e) { err(res, 500, e.message); }
});

// ---------- Swagger ----------
const openapi = {
  openapi: '3.0.0',
  info: { title: 'Language School API — Вариант 25', version: '1.0.0' },
  paths: {
    '/api/students/': {
      get: { summary: 'Список студентов', responses: { 200: { description: 'OK' } } },
      post: { summary: 'Создать студента', responses: { 201: { description: 'Создан' }, 400: { description: 'Ошибка' } } }
    },
    '/api/students/{id}/': {
      get: { summary: 'Студент по id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      put: { summary: 'Обновить', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } },
      delete: { summary: 'Удалить', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Удалено' } } }
    },
    '/api/languages/': { get: { summary: 'Языки', responses: { 200: { description: 'OK' } } }, post: { summary: 'Создать язык', responses: { 201: { description: 'Создан' } } } },
    '/api/teachers/': { get: { summary: 'Преподаватели', responses: { 200: { description: 'OK' } } }, post: { summary: 'Создать', responses: { 201: { description: 'Создан' } } } },
    '/api/groups/': { get: { summary: 'Группы', responses: { 200: { description: 'OK' } } }, post: { summary: 'Создать', responses: { 201: { description: 'Создан' } } } },
    '/api/clubs/': { get: { summary: 'Посещения клубов', responses: { 200: { description: 'OK' } } }, post: { summary: 'Создать', responses: { 201: { description: 'Создано' } } } },
    '/api/tests/': { get: { summary: 'Тесты', responses: { 200: { description: 'OK' } } }, post: { summary: 'Создать', responses: { 201: { description: 'Создан' } } } },
    '/api/clubs/level-up/': { get: { summary: 'Переход на уровень (все)', responses: { 200: { description: 'OK' } } } },
    '/api/clubs/level-up/{sid}/': { get: { summary: 'Переход на уровень (один)', parameters: [{ name: 'sid', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } } }
  }
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// ---------- Монтирование вариантов из variants/ ----------
const variantsDir = path.join(__dirname, 'variants');
if (fs.existsSync(variantsDir)) {
  for (const name of fs.readdirSync(variantsDir)) {
    const entry = path.join(variantsDir, name, 'src', 'server.js');
    if (!fs.existsSync(entry)) continue;
    try {
      const sub = require(entry);
      app.use('/' + name, sub);
      console.log('[variants] mounted: /' + name);
    } catch (e) {
      console.error('[variants] failed to mount ' + name + ':', e.message);
    }
  }
}

// ---------- Static ----------
app.use(express.static(path.join(__dirname, 'public')));

app.get('/variant/25', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'variant-25.html'));
});

// ---------- Fallbacks ----------
app.use((req, res) => err(res, 404, 'Not found'));
app.use((e, req, res, next) => { console.error(e); err(res, 500, 'Internal server error'); });

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on ' + port));

module.exports = app;
