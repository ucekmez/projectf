import  shortid  from 'shortid';

Meteor.methods({
  /*
    admin_add_new_user: adds new user and relates a profile to it
  */
  admin_add_new_user(email, password, role){

    if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      // yeni bir kullanici olusturuyoruz

      profile = {'name': "", 'gender': "", 'age': "", 'address': "", 'shortid': shortid.generate()};
      const user_id = Accounts.createUser({
        email: email,
        password: password,
        profile: profile
      });
      if (role === "1") { Roles.addUsersToRoles(user_id, ["courseadmin"]); }
      else if(role === "2") { Roles.addUsersToRoles(user_id, ["instructor"]); }
      else { Roles.addUsersToRoles(user_id, ["student"]); }
    }
    else { return -1; }
  },

  /*
    admin_remove_user: removes the user
  */
  admin_remove_user(user_id) {
    if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      Meteor.users.remove(user_id);
      return "OK";
    }else { return -1; }
  },

});
