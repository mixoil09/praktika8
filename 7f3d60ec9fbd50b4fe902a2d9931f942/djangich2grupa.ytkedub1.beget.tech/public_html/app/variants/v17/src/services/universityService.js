// Сервисный слой. Содержит бизнес-логику.
const {
  StudentRepository,
  GroupRepository,
  SubjectRepository,
  TeacherRepository,
} = require("../repositories/baseRepos");
const WebinarRepository = require("../repositories/WebinarRepository");

const studentRepo = new StudentRepository();
const groupRepo = new GroupRepository();
const subjectRepo = new SubjectRepository();
const teacherRepo = new TeacherRepository();
const webinarRepo = new WebinarRepository();

class UniversityService {
  // ---------- Students ----------
  listStudents() {
    return studentRepo.listWithGroup();
  }
  getStudent(id) {
    return studentRepo.findById(id);
  }
  createStudent(data) {
    return studentRepo.create(data);
  }
  updateStudent(id, data) {
    return studentRepo.update(id, data);
  }
  deleteStudent(id) {
    return studentRepo.delete(id);
  }

  // ---------- Groups ----------
  listGroups() {
    return groupRepo.findAll();
  }
  getGroup(id) {
    return groupRepo.findById(id);
  }
  createGroup(data) {
    return groupRepo.create(data);
  }
  updateGroup(id, data) {
    return groupRepo.update(id, data);
  }
  deleteGroup(id) {
    return groupRepo.delete(id);
  }

  // ---------- Subjects ----------
  listSubjects() {
    return subjectRepo.findAll();
  }
  getSubject(id) {
    return subjectRepo.findById(id);
  }
  createSubject(data) {
    return subjectRepo.create(data);
  }
  updateSubject(id, data) {
    return subjectRepo.update(id, data);
  }
  deleteSubject(id) {
    return subjectRepo.delete(id);
  }

  // ---------- Teachers ----------
  listTeachers() {
    return teacherRepo.findAll();
  }
  getTeacher(id) {
    return teacherRepo.findById(id);
  }
  createTeacher(data) {
    return teacherRepo.create(data);
  }
  updateTeacher(id, data) {
    return teacherRepo.update(id, data);
  }
  deleteTeacher(id) {
    return teacherRepo.delete(id);
  }

  // ---------- Вариант 17: вебинары ----------
  listWebinarsWithAttendance() {
    return webinarRepo.activityReport();
  }
  webinarActivityForStudent(studentId) {
    return webinarRepo.activityForStudent(studentId);
  }
}

module.exports = new UniversityService();