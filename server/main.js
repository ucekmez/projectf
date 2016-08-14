import { Meteor } from 'meteor/meteor';

import '/imports/startup/server/importtoserver.js';

import { Accounts } from 'meteor/accounts-base';

import ghost from 'ghost';

import { Courses } from '/imports/api/collections/courses.js';
import { Schedules } from '/imports/api/collections/schedules.js';

Sortable.collections = ['schedules'];

Meteor.startup(() => {
  ghost().then(function (ghostServer) {
    const config = ghostServer.config;
    // modify theme and config ...
    ghostServer.start();
  });


  if (Meteor.users.find().count() === 0) {
    const users = [
      { username: "ugur",
        email: "a@f.com",
        roles: ['admin'],
      }
    ];

    users.forEach(function(user) {
      // Kullanici olusturuyoruz
      const id = Accounts.createUser({
        email: user.email,
        username: user.username,
        password: "asdasd",
      });

      if (user.roles.length > 0) {
        Roles.addUsersToRoles(id, user.roles);
      }

      console.log("User " + user.name + " added in role " + user.role);
    });

  }
});


AccountsTemplates.configure({
  postSignUpHook: function(userId, info) {
    Roles.addUsersToRoles(userId, ['student']);
  },
});

Meteor.publish("UsersForAdmin", function(role){
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    if (role === 'courseadmin') {
      return Meteor.users.find({roles: 'courseadmin'}, {
        fields: {'username':1, 'emails':1, 'roles':1, 'createdAt':1, 'profile': 1}
      });
    } else if (role === 'instructor') {
      return Meteor.users.find({roles: 'instructor'}, {
        fields: {'username':1, 'emails':1, 'roles':1, 'createdAt':1, 'profile': 1}
      });
    } else if (role === 'student') {
      return Meteor.users.find({roles: 'student'}, {
        fields: {'username':1, 'emails':1, 'roles':1, 'createdAt':1, 'profile': 1}
      });
    }
  }
});

Meteor.publish("CoursesForInstructor", function(){
  if (Roles.userIsInRole(this.userId, ['instructor'])) {
    return Courses.find({instructor: this.userId});
  }
});

Meteor.publish("SingleCourseForInstructor", function(course_shortid){
  if (Roles.userIsInRole(this.userId, ['instructor'])) {
    return Courses.find({shortid: course_shortid});
  }
});

Meteor.publish("SchedulesIDsForInstructor", function(){
  if (Roles.userIsInRole(this.userId, ['instructor'])) {
    return Schedules.find({instructor: this.userId}, {
      fields: { '_id': 1, 'course': 1 }
    });
  }
});

Meteor.publish("SingleScheduleForInstructor", function(course_id){
  if (Roles.userIsInRole(this.userId, ['instructor'])) {
    return Schedules.find({course: course_id});
  }
});
