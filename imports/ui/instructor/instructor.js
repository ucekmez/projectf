import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

import './layout.html';                  // InstructorLayout
import './left_menu.html';               // InstructorLeftMenu

import './courses/add_new_course.html';  // InstructorAddNewCourse
import './courses/list_courses.html';    // InstructorListCourses
import './courses/edit_course.html';     // InstructorEditCourse

import './schedules/edit_schedule.html'; // InstructorEditScheduleLayout



/***********************       ROUTES       ***********************/

const instructorRoutes = FlowRouter.group({ prefix: '/instructor', name: 'instructor',
  triggersEnter: [() => {
    if (Meteor.userId() && Meteor.user()) {
      if (!Roles.userIsInRole(Meteor.userId(), ['instructor'])) { FlowRouter.go('home'); }
    }else { FlowRouter.go('home'); }
  }],
});

instructorRoutes.route('/', { name: 'instructor_dashboard',
  action() {
    BlazeLayout.render('InstructorLayout', { main: 'InstructorMainScreen', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
    NProgress.done();
  }
});

instructorRoutes.route('/courses', { name: 'instructor_list_courses',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('CoursesForInstructor', Meteor.subscribe("CoursesForInstructor"));
      this.register('SchedulesIDsForInstructor', Meteor.subscribe("SchedulesIDsForInstructor"));
    }
  },
  action() {
    BlazeLayout.render('InstructorLayout', {main: 'InstructorListCourses', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
    FlowRouter.subsReady("CoursesForInstructor", function() {
      NProgress.done();
    });
  }
});


instructorRoutes.route('/course/new', { name: 'instructor_add_new_course', // edit course
  action() {
    BlazeLayout.render('InstructorLayout', {main: 'InstructorAddNewCourse', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
    NProgress.done();
  }
});

instructorRoutes.route('/course/:courseId', { name: 'instructor_single_course', // edit course
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('CoursesForInstructor', Meteor.subscribe("CoursesForInstructor"));
    }
  },
  action() {
    BlazeLayout.render('InstructorLayout', {main: 'InstructorEditCourse', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
    FlowRouter.subsReady("CoursesForInstructor", function() {
      NProgress.done();
    });
  }
});

instructorRoutes.route('/course/:courseId/schedule', { name: 'instructor_single_course_schedule',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('SingleScheduleForInstructor', Meteor.subscribe("SingleScheduleForInstructor", params.courseId));
      this.register('SingleCourseForInstructor', Meteor.subscribe("SingleCourseForInstructor", params.courseId));
    }
  },
  action() {
    BlazeLayout.render('InstructorEditScheduleLayout', {main: 'InstructorEditSchedule', nav: 'MainNavigation'});
    FlowRouter.subsReady("SingleScheduleForInstructor", function() {
      NProgress.done();
    });
  }
});


instructorRoutes.route('/profile', { name: 'instructor_edit_profile',
  action() {
    BlazeLayout.render('InstructorLayout', {main: 'UserEditProfile', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
    NProgress.done();
  }
});

/***********************       |ROUTES       ***********************/


Template.InstructorAddNewCourse.onRendered(() => {
  $.getScript("/js/datetimepicker.js")
    .done(function(script, textStatus) {
      $('#startdate').datetimepicker({
        format:'Y-m-d',
        onShow:function( ct ){
         this.setOptions({
          minDate: 0,
          maxDate:$('#enddate').val()?moment($('#enddate').val()).subtract(1,'days').format('YYYY-MM-DD'):moment().add(100,'days').format('YYYY-MM-DD')
         })
        },
        timepicker:false
      });

      $('#enddate').datetimepicker({
        format:'Y-m-d',
        onShow:function( ct ){
         this.setOptions({
          minDate:$('#startdate').val()?moment($('#startdate').val()).add(1,'days').format('YYYY-MM-DD'):moment().add(1,'days').format('YYYY-MM-DD'),
          maxDate:$('#startdate').val()? moment($('#startdate').val()).add(300,'days').format('YYYY-MM-DD'):moment().add(300,'days').format('YYYY-MM-DD')
         })
        },
        timepicker:false
      });
  });
});


Template.InstructorAddNewCourse.events({
  'click #add-new-course-submit-button'(event, instance) {
    const code            = $('#code').val();
    const title           = $('#title').val();
    const startdate       = $('#startdate').val();
    const enddate         = $('#enddate').val();
    const is_active       = $('#is-active').is(':checked');
    const accept_students = $('#accept-students').is(':checked');

    if (code && title && startdate && enddate) {
      Meteor.call('instructor_add_new_course', code, title, startdate, enddate, is_active, accept_students, function (err, data) {
        if (err) {
          toastr.error(err.reason);
        }else {
          toastr.success('New course has been created!');
          FlowRouter.go('instructor_list_courses');
        }
      });
    } else {
      toastr.error('Please fill in the blanks!');
    }
  }
});

Template.InstructorListCourses.helpers({
  courses() {
    return Courses.find({}, {sort: { createdAt : -1 }})
      .map(function(document, index) {
        document.index = index + 1;
        return document;
      });
  }
});

Template.InstructorListCourses.events({
  'click #instructor-remove-course'(event, instance) {
    Meteor.call('instructor_remove_course', this._id, function(err, data) {
      if (err) { toastr.error(err.reason); }
      else { toastr.success('Course has been deleted!'); }
    });
  },
  'click #instructor-add-new-schedule'(event, instance) {
    Meteor.call('instructor_add_new_schedule', this.shortid, function(err, data) {
      if (err) { toastr.error(err.reason); }
      else {
        toastr.success('Course Schedule has been created!');
        FlowRouter.go('instructor_single_course_schedule', { courseId: data }); // to the newly created schedule page for editing purposes
      }
    });
  },
  'click #instructor-edit-schedule'(event, instance) {
    FlowRouter.go('instructor_single_course_schedule', { courseId: this.shortid }); // to the newly created schedule page for editing purposes
  }
});

Template.InstructorEditCourse.onRendered(() => {
  $('.fr-edit-course .fr-toolbar').addClass("panel panel-default");

  $.getScript("/js/datetimepicker.js")
    .done(function(script, textStatus) {
      $('#startdate-edit').datetimepicker({
        format:'Y-m-d',
        onShow:function( ct ){
         this.setOptions({
          minDate: 0,
          maxDate:$('#enddate-edit').val()?moment($('#enddate-edit').val()).subtract(1,'days').format('YYYY-MM-DD'):moment().add(100,'days').format('YYYY-MM-DD')
         })
        },
        timepicker:false
      });

      $('#enddate-edit').datetimepicker({
        format:'Y-m-d',
        onShow:function( ct ){
         this.setOptions({
          minDate:$('#startdate-edit').val()?moment($('#startdate-edit').val()).add(1,'days').format('YYYY-MM-DD'):moment().add(1,'days').format('YYYY-MM-DD'),
          maxDate:$('#startdate-edit').val()? moment($('#startdate-edit').val()).add(300,'days').format('YYYY-MM-DD'):moment().add(300,'days').format('YYYY-MM-DD')
         })
        },
        timepicker:false
      });
  });
});

Template.InstructorEditCourse.helpers({
  course() {
    return Courses.findOne({ shortid: FlowRouter.getParam('courseId')});
  },
  getFEContext() {
    const self = this;
    return {
      _value: self.description, // set HTML content
      //_keepMarkers: true, // preserving cursor markers
      _className: "fr-edit-course", // Override wrapper class
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
        if (!_.isEqual(newHTML, self.description)) {
          Courses.update({_id: self._id}, {
            $set: {description: newHTML}
          });
          toastr.success('Description is automatically saved!');
        }
        return false; // Stop Froala Editor from POSTing to the Save URL
      },
    };
  }
});

Template.InstructorEditCourse.events({
  'click #edit-course-submit-button'(event, instance) {
    const code_edit      = $('#code-edit').val();
    const title_edit     = $('#title-edit').val();
    const startdate_edit = $('#startdate-edit').val();
    const enddate_edit   = $('#enddate-edit').val();
    const is_active      = $('#is-active').is(':checked');
    const accept_students = $('#accept-students').is(':checked');

    if (code_edit && title_edit && startdate_edit && enddate_edit) {
      Meteor.call('instructor_edit_course', FlowRouter.getParam('courseId'), code_edit, title_edit, startdate_edit, enddate_edit, is_active, accept_students, function (err, data) {
        if (err) {
          toastr.error(err.reason);
        }else {
          toastr.success('Course has been updated!');
          FlowRouter.go('instructor_list_courses');
        }
      });
    } else {
      toastr.error('Please fill in the blanks!');
    }
  },
});



////////////////////// keynotes


Template.InstructorEditSchedule.helpers({
  course() {
    return Courses.findOne({ shortid: FlowRouter.getParam('courseId')});
  },
  weeks() {
    return Schedules.find({course: FlowRouter.getParam('courseId')}, { sort: {order: 1} });
  },
  sortableOptions() {
    return {
      sort: true,
      group: {
        scroll: true,
        name: 'weeksSortGroup',
        pull: false
      },
      //onSort: function(event) {
      //  Schedules.update({_id: event.data._id}, {
      //    $set: {order: event.data.order}
      //  });
      //}
    }
  }
});


Template.InstructorEditSchedule.events({
  'click #week-add-icon': function(event, template) {
    const course_shortid = FlowRouter.getParam('courseId');
    const weeks_cursor = Schedules.find({course: course_shortid});
    const weeks_count = weeks_cursor.count();
    const weeks = weeks_cursor.fetch();

    let last_order = 0;
    if (weeks_count > 0) {
      last_order = weeks[weeks_count - 1].order + 1;
    }

    Meteor.call('instructor_add_new_week_to_schedule', last_order, course_shortid, function(err, data) {});
  },
  'click #week-delete-icon': function(event, template) {
    Meteor.call('instructor_week_from_schedule', this._id, function(err, data) {
      if (err) {
        toastr.error(err.reason);
      }else {
        toastr.info('Note removed!');
      }
    });
  },

  'click #thumbnail': function() {
    $(".row.edit-wrapper").css("min-height", "450px");
    $('#start-editing').hide();
    if (!Session.get("active-week-before")) {
      Session.set("active-week-before", this._id);
    }else {
      $('#week-' + Session.get("active-week-before")).removeClass('active').addClass('passive');
      Session.set("active-week-before", this._id);
    }
    $('#week-' + this._id).removeClass('passive').addClass('active');
  }
});

Template.EditSingleWeek.onRendered(() => {
  $('.fr-toolbar').addClass("panel panel-default");
  $('.fr-wrapper').addClass("panel panel-default");
});


Template.EditSingleWeek.helpers({
  getFEContext : function() {
    const self = this;
    return {
      _value: self.content, // set HTML content
      _keepMarkers: true, // preserving cursor markers
      _className: "froala-reactive-meteorized-override", // Override wrapper class
      toolbarInline: false, // Set some FE options
      initOnClick: false, // Set some FE options
      tabSpaces: false, // Set some FE options
      disableRightClick: false,
      maxCharacters: 2048,
      width: 'auto',
      height: '360',
      heightMax: '360',
      toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '|', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html'],
      "_oncontentChanged": function (e, editor) { // FE save.before event handler function:
        // Get edited HTML from Froala-Editor
        const newHTML = editor.html.get(true /* keep_markers */);
        // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
        if (!_.isEqual(newHTML, self.content)) {
          Schedules.update({_id: self._id}, {
            $set: {content: newHTML}
          });
          toastr.success('Schedule saved!');
        }
        return false; // Stop Froala Editor from POSTing to the Save URL
      },
    };
  }
});
