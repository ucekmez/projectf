import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import './layout.html'; // LandingLayout
import './main_navigation.html'; // LandingLayout


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
