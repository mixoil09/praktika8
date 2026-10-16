// Абстрактный CRUD-репозиторий (слой Repository).
// Работает с определённой таблицей SQLite и позволяет выполнять
// создание, чтение, обновление и удаление записей.
const { db } = require("../models");

const ALLOWED_COLUMNS = /^[a-z_]+$/;

class BaseRepository {
  /**
   * @param {string} table имя таблицы
   * @param {string[]} fields разрешённые колонки (без id)
   */
  constructor(table, fields = []) {
    this.table = table;
    this.fields = fields;
  }

  _checkFields(data) {
    const clean = {};
    for (const key of Object.keys(data)) {
      if (this.fields.includes(key)) {
        clean[key] = data[key];
      }
    }
    if (Object.keys(clean).length === 0) {
      throw new Error(`Нет допустимых полей для таблицы ${this.table}`);
    }
    return clean;
  }

  findAll() {
    return db.prepare(`SELECT * FROM ${this.table}`).all();
  }

  findById(id) {
    return db.prepare(`SELECT * FROM ${this.table} WHERE id = ?`).get(id) || null;
  }

  create(data) {
    const clean = this._checkFields(data);
    const keys = Object.keys(clean);
    const cols = keys.join(", ");
    const placeholders = keys.map(() => "?").join(", ");
    const info = db
      .prepare(`INSERT INTO ${this.table} (${cols}) VALUES (${placeholders})`)
      .run(...keys.map((k) => clean[k]));
    return this.findById(info.lastInsertRowid);
  }

  update(id, data) {
    const clean = this._checkFields(data);
    const keys = Object.keys(clean);
    if (keys.length === 0) return null;
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    const info = db
      .prepare(`UPDATE ${this.table} SET ${setClause} WHERE id = ?`)
      .run(...keys.map((k) => clean[k]), id);
    if (info.changes === 0) return null;
    return this.findById(id);
  }

  delete(id) {
    const info = db.prepare(`DELETE FROM ${this.table} WHERE id = ?`).run(id);
    return info.changes > 0;
  }

  count() {
    return db.prepare(`SELECT COUNT(*) AS c FROM ${this.table}`).get().c;
  }
}

module.exports = BaseRepository;