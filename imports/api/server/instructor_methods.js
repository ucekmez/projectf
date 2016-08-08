import { Courses } from '/imports/api/collections/courses.js';

Meteor.methods({
  /*
    instructor_add_new_course: adds new user and relates a profile to it
  */
  instructor_add_new_course(code, title, startdate, enddate){
    // yeni bir course olusturuyoruz
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      const course_id = Courses.insert({
        code       : code,
        title      : title,
        startDate  : startdate,
        endDate    : enddate,
        instructor : user_id,
      });

      return course_id;
    }else {
      return -1;
    }
  },

  /*
    admin_remove_user: removes the user
  */
  instructor_remove_course(course_id) {
    Courses.remove(course_id);
    return "OK";
  },


});
