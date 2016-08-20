import { Courses } from '/imports/api/collections/courses.js';

Meteor.methods({
  courseadmin_accept_pending_student(student_id, course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['courseadmin'])) {

      const course = Courses.findOne({ shortid: course_shortid });
      if (course && course.pending && course.pending.length > 0) {
        let pending = {};
        for(let i=0; i<course.pending.length;i++) {
          if (course.pending[i]._id === student_id) {
            pending = course.pending[i];
            break;
          }
        }
        Courses.update({ shortid: course_shortid}, {
          $pull : { pending: pending },
          $addToSet: { students: { '_id': pending._id, 'date': new Date() } }
        });

        return "OK";
      }
    } else { return -1; }
  },

  courseadmin_suspend_registration(student_id, course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['courseadmin'])) {

      const course = Courses.findOne({ shortid: course_shortid });
      if (course && course.students && course.students.length > 0) {
        let student = {};
        for(let i=0; i<course.students.length;i++) {
          if (course.students[i]._id === student_id) {
            student = course.students[i];
            break;
          }
        }
        Courses.update({ shortid: course_shortid}, {
          $pull : { students: student },
          $addToSet: { suspended: { '_id': student._id, 'date': new Date() } }
        });

        return "OK";
      }
    } else { return -1; }
  },

  courseadmin_accept_suspended_student(student_id, course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['courseadmin'])) {

      const course = Courses.findOne({ shortid: course_shortid });
      if (course && course.suspended && course.suspended.length > 0) {
        let suspended = {};
        for(let i=0; i<course.suspended.length;i++) {
          if (course.suspended[i]._id === student_id) {
            suspended = course.suspended[i];
            break;
          }
        }
        Courses.update({ shortid: course_shortid}, {
          $pull : { suspended: suspended },
          $addToSet: { students: { '_id': suspended._id, 'date': new Date() } }
        });

        return "OK";
      }
    } else { return -1; }
  }
});
