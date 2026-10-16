// OpenAPI-описания эндпоинтов (Swagger / OpenAPI).
// Подключается swagger-jsdoc по пути ./src/docs/*.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required: [first_name, last_name, email, group_id]
 *       properties:
 *         id: { type: integer }
 *         first_name: { type: string }
 *         last_name: { type: string }
 *         email: { type: string, format: email }
 *         group_id: { type: integer }
 *     Group:
 *       type: object
 *       required: [name]
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         course: { type: integer }
 *     Subject:
 *       type: object
 *       required: [name]
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         hours: { type: integer }
 *     Teacher:
 *       type: object
 *       required: [full_name, email]
 *       properties:
 *         id: { type: integer }
 *         full_name: { type: string }
 *         email: { type: string, format: email }
 *     WebinarActivity:
 *       type: object
 *       properties:
 *         studentId: { type: integer }
 *         studentName: { type: string }
 *         webinarId: { type: integer }
 *         webinarTitle: { type: string }
 *         durationMinutes: { type: integer }
 *         minutesInRoom: { type: number }
 *         percentInRoom: { type: number }
 *         attended: { type: boolean }
 */

/** @swagger
 * /students:
 *   get:
 *     summary: Список студентов с группами
 *     tags: [Students]
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { type: object } } } }
 *   post:
 *     summary: Создать студента
 *     tags: [Students]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Student' } } } }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Ошибка валидации }
 */

/** @swagger
 * /students/{id}:
 *   get:
 *     summary: Студент по id
 *     tags: [Students]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       200: { description: OK }
 *       404: { description: Не найден }
 *   put:
 *     summary: Обновить студента
 *     tags: [Students]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Student' } } } }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Ошибка валидации }
 *   delete:
 *     summary: Удалить студента
 *     tags: [Students]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: integer } }]
 *     responses:
 *       204: { description: Удалён }
 *       404: { description: Не найден }
 */

/** @swagger
 * /groups:
 *   get: { summary: Список групп, tags: [Groups], responses: { '200': { description: OK } } }
 *   post: { summary: Создать группу, tags: [Groups], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Group' } } } }, responses: { '201': { description: Created }, '400': { description: Ошибка валидации } } }
 */
/** @swagger
 * /groups/{id}:
 *   get: { summary: Группа по id, tags: [Groups], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], responses: { '200': { description: OK }, '404': { description: Не найдена } } }
 *   put: { summary: Обновить группу, tags: [Groups], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Group' } } } }, responses: { '200': { description: OK } } }
 *   delete: { summary: Удалить группу, tags: [Groups], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], responses: { '204': { description: Удалена }, '404': { description: Не найдена } } }
 */

/** @swagger
 * /subjects:
 *   get: { summary: Список предметов, tags: [Subjects], responses: { '200': { description: OK } } }
 *   post: { summary: Создать предмет, tags: [Subjects], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Subject' } } } }, responses: { '201': { description: Created } } }
 */
/** @swagger
 * /subjects/{id}:
 *   get: { summary: Предмет по id, tags: [Subjects], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], responses: { '200': { description: OK }, '404': { description: Не найден } } }
 *   put: { summary: Обновить предмет, tags: [Subjects], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Subject' } } } }, responses: { '200': { description: OK } } }
 *   delete: { summary: Удалить предмет, tags: [Subjects], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], responses: { '204': { description: Удалён }, '404': { description: Не найден } } }
 */

/** @swagger
 * /teachers:
 *   get: { summary: Список преподавателей, tags: [Teachers], responses: { '200': { description: OK } } }
 *   post: { summary: Создать преподавателя, tags: [Teachers], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Teacher' } } } }, responses: { '201': { description: Created } } }
 */
/** @swagger
 * /teachers/{id}:
 *   get: { summary: Преподаватель по id, tags: [Teachers], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], responses: { '200': { description: OK }, '404': { description: Не найден } } }
 *   put: { summary: Обновить преподавателя, tags: [Teachers], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/Teacher' } } } }, responses: { '200': { description: OK } } }
 *   delete: { summary: Удалить преподавателя, tags: [Teachers], parameters: [{ in: path, name: id, required: true, schema: { type: integer } }], responses: { '204': { description: Удалён }, '404': { description: Не найден } } }
 */

/** @swagger
 * /webinars/activity:
 *   get:
 *     summary: Активность студентов на вебинарах (вариант 17)
 *     description: Посещение засчитывается, если студент находился в комнате > 80% времени вебинара.
 *     tags: [Webinars]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         required: false
 *         schema: { type: integer }
 *         description: id студента для фильтрации
 *     responses:
 *       200:
 *         description: Статистика активности
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/WebinarActivity' }
 */