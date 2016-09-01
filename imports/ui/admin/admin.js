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

adminRoutes.route('/newuser', { name: 'admin_add_new_user',
  action() {
    BlazeLayout.render('AdminLayout', {main: 'AdminAddNewUser', nav: 'MainNavigation', leftmenu: 'AdminLeftMenu' });
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


Template.AdminAddNewUser.events({
  'click #admin-add-new-user-button'(event, instance) {
    event.preventDefault();
    const email    = $('#email').val();
    const password = $('#password').val();
    const role     = $('.radio-inline input[name=role]:checked').val();

    if (email && password && role) {
      Meteor.call('admin_add_new_user', email, password, role, function (err, data) {
        if (err) {
          toastr.error(err.reason);
        }else {
          toastr.success('New user has been added!');
          if (role == "1") { FlowRouter.go("admin_list_courseadmins"); }
          if (role == "2") { FlowRouter.go("admin_list_instructors"); }
          if (role == "3") { FlowRouter.go("admin_list_students"); }
        }
      });
    }else {
      toastr.warning("Please fill all the fields!");
    }
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
