import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './layout.html'; // LandingLayout
import './main_navigation.html'; // LandingLayout
import './edit_profile'; // UserEditProfile


/***********************       ROUTES       ***********************/

FlowRouter.route('/', { name: 'home',
  action() {
    BlazeLayout.render('LandingLayout', { nav: 'MainNavigation'});
    NProgress.done();
  }
});

FlowRouter.route('/login', { name: 'login',
  triggersEnter: [() => {
    if (Meteor.loggingIn() || Meteor.userId() && Meteor.user()) {
      FlowRouter.go('home');
    }else {
      FlowRouter.go('login');
    }
  }],
  action() {
    BlazeLayout.render('LoginLayout', { nav: 'MainNavigation'});
    NProgress.done();
  }
});

/***********************       |ROUTES       ***********************/


Template.MainNavigation.events({
  'click #logout'(event, instance) {
    Meteor.logout(() => {
      FlowRouter.go('home');
    });
  },
  'click #login'(event, instance) {
    FlowRouter.go('login');
  }
});


Template.UserEditProfile.onRendered(() => {
  $('#gender-edit').dropdown('set selected', Meteor.user().profile.gender);
});

Template.UserEditProfile.events({
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

      Meteor.call('user_edit_profile', name_edit, age_edit, gender_edit, address_edit, email_edit, function (err, data) {
        if (err) { toastr.error(err.reason); }
        else {
          toastr.success('Profile has been updated!');
          Meteor.call('user_get_dashboard', function(err, data) {
            if (err) { toastr.error(err.reason); }
            else { FlowRouter.go(data); }
          });
        }
      });
    }else {
      toastr.error('Please correct the errors!');
    }
  }
});
