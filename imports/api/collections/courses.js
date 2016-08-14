import shortid from 'shortid';

export const Courses = new Mongo.Collection('courses');

Courses.attachSchema(new SimpleSchema({
  code        : { type: String, max: 16 },
  title       : { type: String, max: 64 },
  instructor  : { type: String, max: 32 },
  description : { type: String, max: 4096, optional: true },
  isActive    : { type: Boolean, optional: true },
  startDate   : { type: Date, optional: true },
  endDate     : { type: Date, optional: true },
  shortid : {
    type: String,
    autoValue: function() { if (this.isInsert) { return shortid.generate(); } },
    optional: true
  },
  createdAt : {
    type: Date,
    autoValue: function() {
      if (this.isInsert) { return new Date(); }
      else if (this.isUpsert) { $setOnInsert: new Date(); }
      else { this.unset(); }
    }
  },
  updatedAt: {
    type: Date,
    autoValue: function() { if (this.isUpdate) { return new Date(); } },
    denyInsert: true,
    optional: true
  }
}));


Courses.allow({
  update: function (userId, doc, fields, modifier) {
    if (userId && doc.instructor === userId) {
      return true;
    }
  },
  remove: function (userId, doc, fields, modifier) {
    if (userId && doc.instructor === userId) {
      return true;
    }
  }
});
