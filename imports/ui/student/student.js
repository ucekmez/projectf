import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

import './layout.html';                  // StudentLayout
import './left_menu.html';               // StudentLeftMenu
import './list_courses.html';            // StudentListCourses
import './single_course.html';           // StudentSingleCourse

import '../landing/edit_profile.html';   // UserEditProfile



/***********************       ROUTES       ***********************/

const studentRoutes = FlowRouter.group({ prefix: '/student', name: 'student',
  triggersEnter: [() => {
    if (Meteor.userId() && Meteor.user()) {
      if (!Roles.userIsInRole(Meteor.userId(), ['student'])) { FlowRouter.go('home'); }
    }else { FlowRouter.go('home'); }
  }],
});

studentRoutes.route('/', { name: 'student_dashboard',
  action() {
    BlazeLayout.render('StudentLayout', { main: 'StudentMainScreen', nav: 'MainNavigation', leftmenu: 'StudentLeftMenu' });
    NProgress.done();
  }
});

studentRoutes.route('/profile', { name: 'student_edit_profile',
  action() {
    BlazeLayout.render('StudentLayout', {main: 'UserEditProfile', nav: 'MainNavigation', leftmenu: 'StudentLeftMenu' });
    NProgress.done();
  }
});



studentRoutes.route('/courses', { name: 'student_list_courses',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('CoursesForStudent', Meteor.subscribe("CoursesForStudent"));
    }
  },
  action() {
    BlazeLayout.render('StudentLayout', {main: 'StudentListCourses', nav: 'MainNavigation', leftmenu: 'StudentLeftMenu' });
    FlowRouter.subsReady("CoursesForStudent", function() {
      NProgress.done();
    });
  }
});



studentRoutes.route('/courses/:courseId', { name: 'student_single_course',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('SingleCourseForStudent', Meteor.subscribe("SingleCourseForStudent", params.courseId));
      this.register('SingleCourseScheduleForStudent', Meteor.subscribe("SingleCourseScheduleForStudent", params.courseId));

    }
  },
  action() {
    BlazeLayout.render('StudentLayout', {main: 'StudentSingleCourse', nav: 'MainNavigation', leftmenu: 'StudentLeftMenu' });
    FlowRouter.subsReady("SingleCourseForStudent", function() {
      NProgress.done();
    });
  }
});

/***********************       |ROUTES       ***********************/


Template.StudentListCourses.helpers({
  courses() {
    return Courses.find({}, {sort: { startDate : 1 }})
      .map(function(document, index) {
        document.index = index + 1;
        return document;
      });
  }
});

Template.StudentSingleCourse.helpers({
  course() {
    return Courses.findOne({ shortid : FlowRouter.getParam('courseId')});
  },
  haveStudentAlreadyEnrolled() {

  },
  haveStudentAlreadyRequested() {

  }
});

Template.StudentSingleCourse.events({
  'click #enroll-button'(event, instance) {
    Meteor.call('student_send_enroll_request', Meteor.userId(), FlowRouter.getParam('courseId'), function(err, data) {
      if (err) {
        toastr.error(err.reason);
      }else {
        toastr.info("Your request has been sent!");
      }
    })
  }
});
