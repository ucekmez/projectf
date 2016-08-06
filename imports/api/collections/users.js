import  shortid  from 'shortid';

export const UserProfiles = new Mongo.Collection('userprofiles');

UserProfiles.attachSchema(new SimpleSchema({
  user    : { type: String, max: 32 },
  name    : { type: String, max: 32, optional: true },
  surname : { type: String, max: 32, optional: true },
  gender  : { type: String, max: 1, optional: true },
  age     : { type: Number, min: 1, max:100, optional: true },
  address : { type: String, max: 128, optional: true },

  shortid: { type: String,
    autoValue: function() {
      if (this.isInsert) { return shortid.generate(); }
      else { this.unset(); }
    }
  },
  created_at: { type: Date,
    autoValue: function() {
      if (this.isInsert) { return new Date(); }
      else if (this.isUpsert) { $setOnInsert: new Date(); }
      else { this.unset(); }
    }
  },
  updated_at: { type: Date,
    autoValue: function() {
      if (this.isUpdate) { return new Date(); }
    },
    denyInsert: true,
    optional: true
  }
}));
