import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './layout.html'; // LandingLayout AdminLeftMenu
import './add_new_user.html'; // AdminAddNewUser


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
    BlazeLayout.render('AdminLayout', { nav: 'MainNavigation'});
    NProgress.done();
  }
});

/***********************       |ROUTES       ***********************/


Template.AdminLeftMenu.events({
  'click #admin-add-new-user'(event, instance) {
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
              Meteor.call('admin_add_new_user', username, email, password, function (err, data) {
                if (err) {
                  console.log(err);
                  //toastr.error(err.reason);
                  Session.set("success", false);
                }else {
                  Session.set("success", false);
                  $(".ui.form").form('reset');
                  $(".ui.form").form('clear');
                  //toastr.success('New Company has been added!');
                  $('.modal.add-new-user').modal('hide');
                  //FlowRouter.go('admin_list_users');
                }
              });

              if (!Session.get("success")) {
                Session.set("success", false);
                return false;
              }
            }else {
              //toastr.error('Please correct the errors!');
              return false;
            }
        }
      })
      .modal('show');
  }
});
