// Точка входа приложения. Настраивает Express, Swagger, маршруты и обработчики.
const path = require("path");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const { initSchema } = require("./models");
const { crudRoutes, webinarRoutes } = require("./routes/index");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

initSchema();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger / OpenAPI
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "University API (ПР №8, вариант 17)",
      version: "1.0.0",
      description:
        "REST API ВУЗа: базовые сущности (студенты, группы, предметы, преподаватели) + " +
        "специфика варианта 17 — посещаемость вебинаров (засчитывается при пребывании в комнате > 80% времени).",
    },
        servers: [{ url: "/v17/api" }],
  },
  apis: [path.join(__dirname, "docs/*.js"), path.join(__dirname, "routes/*.js")],
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Группируем базовые CRUD под префиксом /api
const api = express.Router();
api.use("/", crudRoutes("student"));
api.use("/", crudRoutes("group"));
api.use("/", crudRoutes("subject"));
api.use("/", crudRoutes("teacher"));
api.use("/webinars", webinarRoutes());
// Алиас специфического GET по требованию варианта:

app.use("/api", api);

// Статика и корневая страница
app.use(express.static(path.join(__dirname, "..", "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3100;
  app.listen(PORT, () => {
    console.log(`[v17] listening on ${PORT}`);
  });
}

module.exports = app;