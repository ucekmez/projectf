import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Courses } from '/imports/api/collections/courses.js';

import './layout.html';         // InstructorLayout
import './left_menu.html';      // InstructorLeftMenu
import './add_new_course.html'; // InstructorAddNewCourse
import './list_courses.html';   // InstructorListCourses



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
    }
  },
  action() {
    BlazeLayout.render('InstructorLayout', {main: 'InstructorListCourses', nav: 'MainNavigation', leftmenu: 'InstructorLeftMenu' });
    FlowRouter.subsReady("CoursesForInstructor", function() {
      NProgress.done();
    });
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
          maxDate:$('#enddate').val()?moment($('#enddate').val()).subtract(1,'days').format('YYYY-MM-DD'):moment().add(10,'days').format('YYYY-MM-DD')
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
                toastr.success('New user has been added!');
                $('.modal.add-new-course').modal('hide');
                //FlowRouter.go('admin_list_users');
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
  }
});
