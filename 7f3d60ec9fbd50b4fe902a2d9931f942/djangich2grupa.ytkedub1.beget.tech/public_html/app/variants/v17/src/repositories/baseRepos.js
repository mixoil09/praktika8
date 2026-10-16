// Конкретные репозитории для базовых сущностей (слой Repository).
const BaseRepository = require("./BaseRepository");

class StudentRepository extends BaseRepository {
  constructor() {
    super("students", ["first_name", "last_name", "email", "group_id"]);
  }
  listWithGroup() {
    return db_query(
      `SELECT s.*, g.name AS group_name FROM students s
       JOIN groups g ON g.id = s.group_id`
    );
  }
}

class GroupRepository extends BaseRepository {
  constructor() {
    super("groups", ["name", "course"]);
  }
}

class SubjectRepository extends BaseRepository {
  constructor() {
    super("subjects", ["name", "hours"]);
  }
}

class TeacherRepository extends BaseRepository {
  constructor() {
    super("teachers", ["full_name", "email"]);
  }
}

function db_query(sql, params = []) {
  const { db } = require("../models");
  return db.prepare(sql).all(...params);
}

module.exports = { StudentRepository, GroupRepository, SubjectRepository, TeacherRepository };