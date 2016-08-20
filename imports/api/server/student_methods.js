import { Courses } from '/imports/api/collections/courses.js';

Meteor.methods({

  student_send_enroll_request(course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['student'])) {
      let result = "ALREADY";
      Meteor.call('student_check_status', course_shortid, function(err, data) {
        if (!err) {
          if (data == "NOTFOUND") {
            Courses.update({ shortid: course_shortid }, {
              $addToSet: {
                pending: { 'date': new Date(), '_id': user_id }
              }
            });
            result = "OK";
          }
        }
      });
      return result;
    } else { return -1; }
  },

  student_check_status(course_shortid) {
    const user_id = Meteor.userId();
    if (Roles.userIsInRole(user_id, ['student'])) {
      const pending = Courses.findOne({ shortid : course_shortid , 'pending._id': user_id });
      if (pending) { return "PENDING"; }
      else {
        const student = Courses.findOne({ shortid : course_shortid , 'students._id': user_id });
        if (student) { return "STUDENT"; }
        else {
          const suspended = Courses.findOne({ shortid : course_shortid , 'suspended._id': user_id });
          if (suspended) { return "SUSPENDED"; }
          else { return "NOTFOUND"; }
        }
      }
    }else { return -1; }
  }

});
