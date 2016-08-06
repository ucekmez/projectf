import { UserProfiles } from '/imports/api/collections/users.js';

Meteor.methods({
  /*
    admin_add_new_user: adds new user and relates a profile to it
  */
  admin_add_new_user(username, email, password){
    // yeni bir kullanici olusturuyoruz
    const user_id = Accounts.createUser({
      username: username,
      email: email,
      password: password,
    });

    // bu kullanici icin bir profil atiyoruz
    const profile_id = UserProfiles.insert({
      user: user_id,
    });
  },

  /*
    admin_remove_user: removes the user and its profile
  */
  admin_remove_user(user_id) {
    Meteor.users.remove(user_id);
    UserProfiles.remove({ user: user_id });
  },


});
