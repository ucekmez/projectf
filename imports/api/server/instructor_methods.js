import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

Meteor.methods({
  /*
    instructor_add_new_course: adds new user and relates a profile to it
  */
  instructor_add_new_course(code, title, startdate, enddate, is_active, accept_students){
    // yeni bir course olusturuyoruz
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      const course_id = Courses.insert({
        code           : code,
        title          : title,
        startDate      : startdate,
        endDate        : enddate,
        instructor     : user_id,
        isActive       : is_active,
        acceptStudents : accept_students,
      });

      return Courses.findOne(course_id).shortid;
    }else {
      return -1;
    }
  },

  /*
    instructor_remove_course: removes the course
  */
  instructor_remove_course(course_id) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      course_shortid = Courses.findOne(course_id).shortid;
      Courses.remove(course_id);
      Schedules.remove({ course: course_shortid});
      return "OK";
    }else {
      return -1;
    }
  },

  instructor_edit_course(shortid, code, title, startdate, enddate, is_active, accept_students) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      Courses.update({ shortid: shortid}, {
        $set: {
          code           : code,
          title          : title,
          startDate      : startdate,
          endDate        : enddate,
          isActive       : is_active,
          acceptStudents : accept_students,
        }
      });
    } else {
      return -1;
    }
  },

  instructor_add_new_schedule(course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      const schedule_id = Schedules.insert({
        content    : '<p><span style="font-size: 20px;">Week # 1 content</span></p>',
        order      : 0,
        course     : course_shortid,
        instructor : user_id,
      });
      return course_shortid;
    } else {
      return -1;
    }
  },

  instructor_add_new_week_to_schedule(last_order, course_shortid) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      const schedule_id = Schedules.insert({
        content    : '',
        order      : last_order,
        course     : course_shortid,
        instructor : user_id,
      });
      return schedule_id;
    } else {
      return -1;
    }
  },

  /*
    instructor_week_from_schedule: removes a week from course schedule
  */
  instructor_week_from_schedule(week_id) {
    const user_id = Meteor.userId();

    if (Roles.userIsInRole(user_id, ['instructor'])) {
      Schedules.remove(week_id);
      return "OK";
    }else {
      return -1;
    }
  },

});
