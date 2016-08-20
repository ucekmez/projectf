import { Courses } from '/imports/api/collections/courses.js';

Meteor.methods({
  courseadmin_fetch_pending(course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['courseadmin'])) {
      const course = Courses.findOne({ shortid: course_shortid });
      if (course && course.pending && course.pending.length > 0) {
        const pending = new Array();
        for(let i=0; i<course.pending.length;i++) {
          pending.push(course.pending[i]._id);
        }
        return Meteor.users.find({ _id: {$in : pending}})
          .map(function(document, index) {
            document.index = index + 1;
            return document;
          });
      }
    } else { return -1; }
  },

  courseadmin_fetch_students(course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['courseadmin'])) {
      const course = Courses.findOne({ shortid: course_shortid });
      if (course && course.students && course.students.length > 0) {
        const students = new Array();
        for(let i=0; i<course.students.length;i++) {
          students.push(course.students[i]._id);
        }
        return Meteor.users.find({ _id: {$in : students}})
          .map(function(document, index) {
            document.index = index + 1;
            return document;
          });
      }
    } else { return -1; }
  },

  courseadmin_fetch_suspended(course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['courseadmin'])) {
      const course = Courses.findOne({ shortid: course_shortid });
      if (course && course.suspended && course.suspended.length > 0) {
        const suspended = new Array();
        for(let i=0; i<course.suspended.length;i++) {
          suspended.push(course.suspended[i]._id);
        }
        return Meteor.users.find({ _id: {$in : suspended}})
          .map(function(document, index) {
            document.index = index + 1;
            return document;
          });
      }
    } else { return -1; }
  },

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
          $addToSet: { students: pending }
        });

        return "OK";
      }
    } else { return -1; }
  },
});
