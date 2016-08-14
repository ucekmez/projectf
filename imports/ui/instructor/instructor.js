import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

import './layout.html';                  // InstructorLayout
import './left_menu.html';               // InstructorLeftMenu
import './edit_profile.html';            // InstructorEditProfile

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


instructorRoutes.route('/course/:courseId', { name: 'instructor_single_course',
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
    BlazeLayout.render('InstructorLayout', {main: 'InstructorEditProfile', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
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


Template.InstructorLeftMenu.events({
  'click #instructor-add-new-course'(event, instance) {
    $('.modal.add-new-course')
      .modal({
        //blurring: true,
        onDeny() {
          $('.ui.form').form('reset');
          $('.ui.form').form('clear');
          Session.set("success", false);
        },
        onApprove() {
          $('.ui.form')
            .form({
              fields: {
                code      : 'empty',
                title     : 'empty',
                startdate : 'empty',
                enddate   : 'empty',
              }
            });

          if ($('.ui.form').form('is valid')) {
            const code      = $('#code').val();
            const title     = $('#title').val();
            const startdate = $('#startdate').val();
            const enddate   = $('#enddate').val();

            Meteor.call('instructor_add_new_course', code, title, startdate, enddate, function (err, data) {
              if (err) {
                //console.log(err);
                toastr.error(err.reason);
                Session.set("success", false);
              }else {
                Session.set("success", false);
                $(".ui.form").form('reset');
                $(".ui.form").form('clear');
                toastr.success('New course has been added!');
                $('.modal.add-new-course').modal('hide');
                FlowRouter.go('instructor_single_course', {courseId: data});
              }
            });

            if (!Session.get("success")) {
              Session.set("success", false); return false;
            }
          }else {
            toastr.error('Please correct the errors!');
            return false;
          }
        }
      })
      .modal('show');
  },
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
  'click #remove-course'(event, instance) {
    Meteor.call('instructor_remove_course', this._id, function(err, data) {
      if (err) { toastr.error(err.reason); }
      else { toastr.success('Course has been deleted!'); }
    });
  },
  'click #add-new-schedule'(event, instance) {
    Meteor.call('instructor_add_new_schedule', this.shortid, function(err, data) {
      if (err) { toastr.error(err.reason); }
      else {
        toastr.success('Course Schedule has been created!');
        FlowRouter.go('instructor_single_course_schedule', { courseId: data }); // to the newly created schedule page for editing purposes
      }
    });
  },
  'click #edit-schedule'(event, instance) {
    FlowRouter.go('instructor_single_course_schedule', { courseId: this.shortid }); // to the newly created schedule page for editing purposes
  }
});

Template.InstructorEditCourse.onRendered(() => {
  $('.fr-edit-course .fr-toolbar').addClass("ui segment fr-toolbar");
  //$('.fr-edit-course .fr-wrapper').addClass("ui segment fr-toolbar");

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
  'click #submit-button'(event, instance) {
    $('.ui.form')
      .form({
        fields: {
          code_edit        : 'empty',
          title_edit       : 'empty',
          startdate_edit   : 'empty',
          enddate_edit     : 'empty',
          is_active        : 'empty'
        }
      });

    if ($('.ui.form').form('is valid')) {
      const code_edit      = $('#code-edit').val();
      const title_edit     = $('#title-edit').val();
      const startdate_edit = $('#startdate-edit').val();
      const enddate_edit   = $('#enddate-edit').val();
      const is_active      = $('#is-active').is(':checked');

      Meteor.call('instructor_edit_course', FlowRouter.getParam('courseId'), code_edit, title_edit, startdate_edit, enddate_edit, is_active, function (err, data) {
        if (err) {
          toastr.error(err.reason);
        }else {
          toastr.success('Course has been updated!');
          FlowRouter.go('instructor_list_courses');
        }
      });
    }else {
      toastr.error('Please correct the errors!');
    }
  }
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
  $('.fr-toolbar').addClass("ui segment");
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

Template.InstructorEditProfile.onRendered(() => {
  $('#gender-edit').dropdown('set selected', Meteor.user().profile.gender);
});

Template.InstructorEditProfile.events({
  'click #submit-button'(event, instance) {
    $('.ui.form')
      .form({
        fields: {
          name_edit       : 'empty',
          age_edit        : 'empty',
          gender_edit     : 'empty',
          address_edit    : 'empty',
          email_edit      : 'empty',
        }
      });

    if ($('.ui.form').form('is valid')) {
      const name_edit     = $('#name-edit').val();
      const age_edit      = $('#age-edit').val();
      const gender_edit   = $('#gender-edit').val();
      const address_edit  = $('#address-edit').val();
      const email_edit    = $('#email-edit').val();

      Meteor.call('instructor_edit_profile', name_edit, age_edit, gender_edit, address_edit, email_edit, function (err, data) {
        if (err) {
          toastr.error(err.reason);
        }else {
          toastr.success('Profile has been updated!');
          FlowRouter.go('instructor_dashboard');
        }
      });
    }else {
      toastr.error('Please correct the errors!');
    }
  }
});
