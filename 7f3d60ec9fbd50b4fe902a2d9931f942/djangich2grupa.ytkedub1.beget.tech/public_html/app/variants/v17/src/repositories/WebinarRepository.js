// Репозиторий вебинаров (слой Repository). Вариант 17.
const BaseRepository = require("./BaseRepository");
const { db } = require("../models");

class WebinarRepository extends BaseRepository {
  constructor() {
    super("webinars", ["title", "subject_id", "teacher_id", "starts_at", "duration_minutes"]);
  }

  /**
   * Отдаёт по каждому вебинару статистику активности студента:
   * суммарное время в комнате и процент от длительности вебинара.
   */
  activityReport() {
    const rows = db.prepare(`
      SELECT
        w.id                                   AS webinar_id,
        w.title                                AS webinar_title,
        w.duration_minutes                     AS duration_minutes,
        st.id                                  AS student_id,
        st.first_name || ' ' || st.last_name   AS student_full_name,
        SUM(
          (julianday(COALESCE(a.left_at, w.starts_at))
           - julianday(a.joined_at)) * 24 * 60
        ) AS minutes_in_room
      FROM webinars w
      JOIN webinar_attendance a ON a.webinar_id = w.id
      JOIN students st ON st.id = a.student_id
      GROUP BY w.id, st.id
    `).all();

    return rows.map((r) => ({
      studentId: r.student_id,
      studentName: r.student_full_name,
      webinarId: r.webinar_id,
      webinarTitle: r.webinar_title,
      durationMinutes: r.duration_minutes,
      minutesInRoom: Math.round((r.minutes_in_room || 0) * 10) / 10,
      percentInRoom: Math.round(((r.minutes_in_room || 0) / r.duration_minutes) * 1000) / 10,
      // Бизнес-правило: засчитывается, если студент был в комнате > 80% времени
      attended: (r.minutes_in_room || 0) > 0.8 * r.duration_minutes,
    }));
  }

  /**
   * Активность конкретного студента по всем вебинарам.
   */
  activityForStudent(studentId) {
    return this.activityReport().filter((r) => r.studentId === studentId);
  }
}

module.exports = WebinarRepository;