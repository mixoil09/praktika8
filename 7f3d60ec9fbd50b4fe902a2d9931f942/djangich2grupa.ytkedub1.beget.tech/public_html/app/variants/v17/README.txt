# ПР №8 (id 3014) — REST API ВУЗа, вариант 17 «Посещаемость вебинаров»

Курс: МДК 03.02 «Разработка кода»
Технологический стек: Node.js + Express + SQLite (better-sqlite3) + Swagger/OpenAPI

## Специфика варианта 17
- Дополнительная сущность: **Посещаемость вебинаров** (webinars + webinar_attendance).
- Специфический GET: **`/api/webinars/activity`** — активность студента на вебинаре.
- Бизнес-правило: посещение засчитывается, только если студент находился в комнате **> 80%** времени.

## Структура
```
src/
  server.js                 — точка входа, Express + Swagger + маршруты
  seed.js                   — заполнение БД тестовыми данными
  config/db.js              — подключение SQLite (better-sqlite3)
  models/index.js           — схема таблиц (groups, subjects, teachers, students, webinars, webinar_attendance)
  repositories/
    BaseRepository.js       — абстрактный CRUD
    baseRepos.js            — репозитории студенты/группы/предметы/преподаватели
    WebinarRepository.js    — репозиторий вебинаров + аналитика активности
  services/universityService.js — бизнес-логика
  controllers/
    crudController.js       — фабрика CRUD-контроллеров
    webinarController.js    — контроллер вебинаров (GET /webinars/activity)
  middleware/
    validation.js           — валидация входных данных
    errorMiddleware.js      — HttpError, 404, глобальный обработчик 500
  routes/index.js           — маршруты
  docs/openapi.js           — Swagger-аннотации
  tests/api.test.js         — базовые unit-тесты (опционально)
```

## Общее ядро (CRUD)
- Студенты:  `GET/POST /api/students`, `GET/PUT/DELETE /api/students/:id`
- Группы:    `GET/POST /api/groups`, ...
- Предметы:  `GET/POST /api/subjects`, ...
- Преподаватели: `GET/POST /api/teachers`, ...

## Специфика варианта 17
- `GET /api/webinars/activity`           — по всем вебинарам/студентам с полем `attended`
- `GET /api/webinars/activity/student?studentId=N` — активность конкретного студента
- Бизнес-правило реализовано в `WebinarRepository.activityReport()`:
  `attended = (minutesInRoom / durationMinutes) > 0.8`

## Валидация
- email (формат), ФИО (обязательность), числовые поля (course>=1, hours>=0, duration_minutes>0) → 400 Bad Request.

## Обработка ошибок
- `HttpError(404)` — маршрут/ресурс не найден
- `HttpError(400)` — ошибка валидации
- Глобальный обработчик → 500 Internal Server Error

## Документация API
- Swagger UI: `http://localhost:3000/api-docs`

## Запуск
```bash
npm install        # установить зависимости
npm run seed       # заполнить БД тестовыми данными
npm start          # запустить сервер на http://localhost:3000
```
Открой `http://localhost:3000/api` (приветствие) и `http://localhost:3000/api-docs` (Swagger).

## Тесты
```bash
npx jest           # если установлен; либо node src/tests/api.test.js (минимальный smoke)
```