// Маршруты базовых сущностей (слой Route).
const { Router } = require("express");
const { makeCrudController } = require("../controllers/crudController");
const { makeWebinarController } = require("../controllers/webinarController");
const service = require("../services/universityService");

function crudRoutes(entity) {
  const router = Router();
  const ctrl = makeCrudController(entity, service);
  const base = `/${entity}s`;   // student -> /students, group -> /groups

  router.get(base, ctrl.list);
  router.get(`${base}/:id`, ctrl.getOne);
  router.post(base, ctrl.create);
  router.put(`${base}/:id`, ctrl.update);
  router.delete(`${base}/:id`, ctrl.delete);
  return router;
}

// Отдельный маршрут для вебинаров с аналитикой (вариант 17)
function webinarRoutes() {
  const router = Router();
  const ctrl = makeWebinarController(service);
  router.get("/activity", ctrl.activity);
  router.get("/activity/student", ctrl.activityForStudent);
  return router;
}

module.exports = { crudRoutes, webinarRoutes };