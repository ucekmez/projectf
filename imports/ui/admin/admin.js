import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './layout.html'; // AdminLayout
import './left_menu.html'; // AdminLeftMenu
import './add_new_user.html'; // AdminAddNewUser
import './list_users.html'; // AdminListCourseAdmins, AdminListInstructors, AdminListStudents

/***********************       ROUTES       ***********************/

const adminRoutes = FlowRouter.group({ prefix: '/admin', name: 'admin',
  triggersEnter: [() => {
    if (Meteor.userId() && Meteor.user()) {
      if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) { FlowRouter.go('home'); }
    }else { FlowRouter.go('home'); }
  }],
});

adminRoutes.route('/', { name: 'admin_dashboard',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminMainScreen', nav: 'MainNavigation', leftmenu: 'AdminLeftMenu' });
    NProgress.done();
  }
});

adminRoutes.route('/courseadmins', { name: 'admin_list_courseadmins',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('UsersForAdmin', Meteor.subscribe("UsersForAdmin", "courseadmin"));
    }
  },
  action() {
    BlazeLayout.render('AdminLayout', {main: 'AdminListCourseAdmins', nav: 'MainNavigation', leftmenu: 'AdminLeftMenu' });
    FlowRouter.subsReady("UsersForAdmin", function() {
      NProgress.done();
    });
  }
});

adminRoutes.route('/instructors', { name: 'admin_list_instructors',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('UsersForAdmin', Meteor.subscribe("UsersForAdmin", "instructor"));
    }
  },
  action() {
    BlazeLayout.render('AdminLayout', {main: 'AdminListInstructors', nav: 'MainNavigation', leftmenu: 'AdminLeftMenu' });
    FlowRouter.subsReady("UsersForAdmin", function() {
      NProgress.done();
    });
  }
});

adminRoutes.route('/students', { name: 'admin_list_students',
  subscriptions: function(params, queryParams) {
    if(Meteor.isClient) {
      this.register('UsersForAdmin', Meteor.subscribe("UsersForAdmin", "student"));
    }
  },
  action() {
    BlazeLayout.render('AdminLayout', {main: 'AdminListStudents', nav: 'MainNavigation', leftmenu: 'AdminLeftMenu' });
    FlowRouter.subsReady("UsersForAdmin", function() {
      NProgress.done();
    });
  }
});

adminRoutes.route('/profile', { name: 'admin_edit_profile',
  action() {
    BlazeLayout.render('AdminLayout', {main: 'UserEditProfile', nav: 'MainNavigation', leftmenu: 'AdminLeftMenu' });
    NProgress.done();
  }
});

/***********************       |ROUTES       ***********************/


Template.AdminLeftMenu.events({
  'click #admin-add-new-user-left-menu'(event, instance) {
    $('.modal.add-new-user')
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
                username      : 'empty',
                email         : 'empty',
                password      : ['minLength[4]', 'empty'],
              }
            });

            if ($('.ui.form').form('is valid')) {
              const username = $('#username').val();
              const email = $('#email').val();
              const password = $('#password').val();
              const role = $('.checkbox input[name=role]:checked').val();
              Meteor.call('admin_add_new_user', username, email, password, role, function (err, data) {
                if (err) {
                  //console.log(err);
                  toastr.error(err.reason);
                  Session.set("success", false);
                }else {
                  Session.set("success", false);
                  $(".ui.form").form('reset');
                  $(".ui.form").form('clear');
                  toastr.success('New user has been added!');
                  $('.modal.add-new-user').modal('hide');
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



Template.AdminListUsersTable.events({
  'click #remove-user'(event, instance) {
    Meteor.call('admin_remove_user', this._id, function(err, data) {
      if (err) { toastr.error(err.reason); }
      else { toastr.success('User has been deleted!'); }
    });
  },
});




Template.AdminListCourseAdmins.helpers({
  users() {
    return Meteor.users.find({ roles: 'courseadmin'}, {sort: { createdAt: -1 } })
      .map(function(document, index) {
        document.index = index + 1;
        return document;
      });
  }
});



Template.AdminListInstructors.helpers({
  users() {
    return Meteor.users.find({ roles: 'instructor'})
      .map(function(document, index) {
        document.index = index + 1;
        return document;
      });
  }
});





Template.AdminListStudents.helpers({
  users() {
    return Meteor.users.find({ roles: 'student'})
      .map(function(document, index) {
        document.index = index + 1;
        return document;
      });
  }
});
