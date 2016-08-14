export const Schedules = new Mongo.Collection('schedules');

Schedules.attachSchema(new SimpleSchema({
  content     : { type: String, max: 16384, optional: true},
  order       : { type: Number, min: 0},
  course      : { type: String, max: 64}, // course shortid
  instructor  : { type: String, max: 64},
  createdAt : {
    type: Date,
    autoValue: function() {
      if (this.isInsert) { return new Date(); }
      else if (this.isUpsert) { $setOnInsert: new Date(); }
      else { this.unset(); }
    }
  },
  updatedAt : {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true
  }
}));

Schedules.allow({
  update: function (userId, doc, fields, modifier) {
    if (userId && doc.instructor === userId) {
      return true;
    }
  },
  remove: function (userId, doc, fields, modifier) {
    if (userId && doc.instructor === userId) {
      return true;
    }
  },
});
