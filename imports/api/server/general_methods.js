import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

Meteor.methods({
  /*
    user_edit_profile: instructor edits his profile
  */

  user_edit_profile(name, age, gender, address, email) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['admin', 'courseadmin', 'instructor', 'student'])) {
      const profile = {}
      profile.name = name;
      profile.age = age;
      profile.gender = gender;
      profile.address = address;

      Meteor.users.update({ _id: user_id }, {
        $set: {
          profile: profile,
          'emails.0.address': email.toLowerCase()
        }
      });

      return "OK";
    }else { return -1; }
  },

  user_get_dashboard() {
    const user_id = Meteor.userId();
    if (Roles.userIsInRole(user_id, ['admin'])) { return 'admin_dashboard'; }
    else if (Roles.userIsInRole(user_id, ['courseadmin'])) { return 'courseadmin_dashboard'; }
    else if (Roles.userIsInRole(user_id, ['instructor'])) { return 'instructor_dashboard'; }
    else if (Roles.userIsInRole(user_id, ['student'])) { return 'student_dashboard'; }
    else { return 'not_found'; }
  }
});
