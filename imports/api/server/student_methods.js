import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

Meteor.methods({
  
  student_send_enroll_request(student_id, course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['student'])) {
      Courses.update({ shortid: course_shortid }, {
        $push: {
          pending: student_id
        }
      });
      return "OK";
    }else { return -1; }
  },

});
