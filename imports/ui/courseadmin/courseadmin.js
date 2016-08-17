import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

import './layout.html';                  // StudentLayout
import './left_menu.html';               // StudentLeftMenu
import './list_courses.html';            // CourseAdminListCourses
import './edit_contract.html';           // CourseAdminEditContract
import './list_course_students.html';    // CourseAdminListCourseStudents
import '../landing/edit_profile.html';   // UserEditProfile



/***********************       ROUTES       ***********************/

const courseadminRoutes = FlowRouter.group({ prefix: '/courseadmin', name: 'courseadmin',
  triggersEnter: [() => {
    if (Meteor.userId() && Meteor.user()) {
      if (!Roles.userIsInRole(Meteor.userId(), ['courseadmin'])) { FlowRouter.go('home'); }
    }else { FlowRouter.go('home'); }
  }],
});

courseadminRoutes.route('/', { name: 'courseadmin_dashboard',
  action() {
    BlazeLayout.render('CourseAdminLayout', { main: 'CourseAdminMainScreen', nav: 'MainNavigation', leftmenu: 'CourseAdminLeftMenu' });
    NProgress.done();
  }
});

courseadminRoutes.route('/profile', { name: 'courseadmin_edit_profile',
  action() {
    BlazeLayout.render('CourseAdminLayout', {main: 'UserEditProfile', nav: 'MainNavigation', leftmenu: 'CourseAdminLeftMenu' });
    NProgress.done();
  }
});

courseadminRoutes.route('/courses', { name: 'courseadmin_list_courses',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('CoursesForCourseAdmin', Meteor.subscribe("CoursesForCourseAdmin"));
      this.register('InstructorsForCourseAdmin', Meteor.subscribe("InstructorsForCourseAdmin"));
    }
  },
  action() {
    BlazeLayout.render('CourseAdminLayout', {main: 'CourseAdminListCourses', nav: 'MainNavigation', leftmenu: 'CourseAdminLeftMenu' });
    FlowRouter.subsReady("CoursesForCourseAdmin", function() {
      NProgress.done();
    });
  }
});

courseadminRoutes.route('/courses/:courseId/contract', { name: 'courseadmin_edit_contract',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('SingleCourseForCourseAdmin', Meteor.subscribe("SingleCourseForCourseAdmin", this.courseId));
    }
  },
  action() {
    BlazeLayout.render('CourseAdminLayout', {main: 'CourseAdminEditContract', nav: 'MainNavigation', leftmenu: 'CourseAdminLeftMenu' });
    FlowRouter.subsReady("SingleCourseForCourseAdmin", function() {
      NProgress.done();
    });
  }
});

courseadminRoutes.route('/courses/:courseId/students', { name: 'courseadmin_list_course_students',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('SingleCourseForCourseAdmin', Meteor.subscribe("SingleCourseForCourseAdmin", this.courseId));
      this.register('SingleCourseStudentsForCourseAdmin', Meteor.subscribe("SingleCourseStudentsForCourseAdmin", this.courseId));
    }
  },
  action() {
    BlazeLayout.render('CourseAdminLayout', {main: 'CourseAdminListCourseStudents', nav: 'MainNavigation', leftmenu: 'CourseAdminLeftMenu' });
    FlowRouter.subsReady("SingleCourseStudentsForCourseAdmin", function() {
      NProgress.done();
    });
  }
});


/***********************       |ROUTES       ***********************/


Template.CourseAdminListCourses.helpers({
  courses() {
    return Courses.find({}, {sort: { createdAt : -1 }})
      .map(function(document, index) {
        document.index = index + 1;
        return document;
      });
  }
});

Template.CourseAdminEditContract.onRendered(() => {
  $('.fr-edit-contract .fr-toolbar').addClass("ui segment fr-toolbar");
});

Template.CourseAdminEditContract.events({
  "click #ok-button"(event, instance){
    FlowRouter.go('courseadmin_list_courses');
  },
  "click .message .close.icon"(event, instance) {
    $(".ui.info.message").hide();
    Session.set("contract_alert_seen", true);
  },
});

Template.CourseAdminEditContract.helpers({
  course() {
    return Courses.findOne({ shortid : FlowRouter.getParam('courseId')});
  },
  getFEContext() {
    const self = this;
    return {
      _value: self.contract, // set HTML content
      //_keepMarkers: true, // preserving cursor markers
      _className: "fr-edit-contract", // Override wrapper class
      toolbarInline: false, // Set some FE options
      initOnClick: false, // Set some FE options
      tabSpaces: false, // Set some FE options
      disableRightClick: false,
      maxCharacters: 2048,
      width: 'auto',
      height: '300',
      heightMax: '600',
      toolbarButtons: ['bold', 'italic', 'underline', 'fontFamily', 'fontSize', 'color', 'align', 'formatOL', 'formatUL', 'insertHR', 'insertLink', 'insertImage', 'insertVideo', 'undo'],
      "_oncontentChanged": function (e, editor) { // FE save.before event handler function:
        // Get edited HTML from Froala-Editor
        const newHTML = editor.html.get(true);
        // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
        if (!_.isEqual(newHTML, self.contract)) {
          Courses.update({_id: self._id}, {
            $set: {contract: newHTML}
          });
          toastr.success('Contract is automatically saved!');
        }
        return false; // Stop Froala Editor from POSTing to the Save URL
      },
    };
  }
});
