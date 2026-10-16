// Фабрика контроллеров для CRUD базовых сущностей (слой Controller).
const { validate } = require("../middleware/validation");
const { HttpError } = require("../middleware/errorMiddleware");

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function makeCrudController(entity, service, idParam = "id") {
  const getId = (req) => Number(req.params[idParam]);

  return {
    list: asyncHandler(async (req, res) => {
      const items = await service[`list${entity[0].toUpperCase()}${entity.slice(1)}s`]();
      res.json({ data: items, count: items.length });
    }),

    getOne: asyncHandler(async (req, res) => {
      const item = await service[`get${entity[0].toUpperCase()}${entity.slice(1)}`](getId(req));
      if (!item) throw new HttpError(404, `${entity} с id=${getId(req)} не найден`);
      res.json({ data: item });
    }),

    create: asyncHandler(async (req, res) => {
      const errors = validate(entity, req.body);
      if (errors.length) throw new HttpError(400, errors.join("; "));
      const item = await service[`create${entity[0].toUpperCase()}${entity.slice(1)}`](req.body);
      res.status(201).json({ data: item });
    }),

    update: asyncHandler(async (req, res) => {
      const errors = validate(entity, req.body);
      if (errors.length) throw new HttpError(400, errors.join("; "));
      const item = await service[`update${entity[0].toUpperCase()}${entity.slice(1)}`](getId(req), req.body);
      if (!item) throw new HttpError(404, `${entity} с id=${getId(req)} не найден`);
      res.json({ data: item });
    }),

    delete: asyncHandler(async (req, res) => {
      const ok = await service[`delete${entity[0].toUpperCase()}${entity.slice(1)}`](getId(req));
      if (!ok) throw new HttpError(404, `${entity} с id=${getId(req)} не найден`);
      res.status(204).send();
    }),
  };
}

module.exports = { makeCrudController, asyncHandler };