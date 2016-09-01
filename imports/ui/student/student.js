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


studentRoutes.route('/courses/:courseId/contract', { name: 'student_course_contract',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('SingleCourseForStudent', Meteor.subscribe("SingleCourseForStudent", params.courseId));
    }
  },
  action() {
    BlazeLayout.render('StudentLayout', {main: 'StudentAcceptContract', nav: 'MainNavigation', leftmenu: 'StudentLeftMenu' });
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
  schedule() {
    return Schedules.find({ course : FlowRouter.getParam('courseId')}, { sort: { order: 1 }});
  },
  status() {
    return ReactiveMethod.call('student_check_status', FlowRouter.getParam('courseId'), function(err, data) {
      if (err) {
        console.log(err.reason);
      }else {
        return data;
      }
    });
  },
});


Template.StudentListCoursesTable.helpers({
  student_course_is_given_by(courseId) {
    return ReactiveMethod.call('student_course_is_given_by', courseId, function(err, data) {
      if (err) {
        console.log(err.reason);
      }else {
        return data;
      }
    });
  }
});


Template.StudentAcceptContract.helpers({
  course() {
    return Courses.findOne({ shortid : FlowRouter.getParam('courseId')});
  },
});

Template.StudentAcceptContract.events({
  'click #contract-submit-button'(event, instance) {
    $('#contract-submit-button').addClass('disabled');
    Meteor.call('student_send_enroll_request', FlowRouter.getParam('courseId'), function(err, data) {
      if (err) {
        toastr.error(err.reason);
      }else {
        if (data == "OK") { toastr.info("Your request has been sent!"); }
        if (data == "ALREADY") { toastr.warning("Your request is being processed! Please wait"); }
        FlowRouter.go('student_single_course', { courseId:FlowRouter.getParam('courseId') });
      }
    });
  },
  'click #contract-dismiss-button'(event, instance) {
    FlowRouter.go('student_single_course', { courseId:FlowRouter.getParam('courseId') });
  },
});
