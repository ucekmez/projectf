import { Meteor } from 'meteor/meteor';

import '/imports/startup/server/importtoserver.js';

import { Accounts } from 'meteor/accounts-base';

Meteor.startup(() => {
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
