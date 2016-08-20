import shortid from 'shortid';

export const Courses = new Mongo.Collection('courses');

Courses.attachSchema(new SimpleSchema({
  code           : { type: String, max: 16 },
  title          : { type: String, max: 64 },
  instructor     : { type: String, max: 32 },
  description    : { type: String, max: 4096, optional: true },
  contract       : { type: String, max: 4096, optional: true },
  isActive       : { type: Boolean, optional: true },
  acceptStudents : { type: Boolean, optional: true },
  startDate      : { type: Date, optional: true },
  endDate        : { type: Date, optional: true },
  pending        : { type: Array, optional: true },
    'pending.$'         : { type: Object },
    'pending.$.date'    : { type: Date },
    'pending.$._id'     : { type: String },
  students       : { type: Array, optional: true },
    'students.$'        : { type: Object },
    'students.$.date'   : { type: Date },
    'students.$._id'    : { type: String },
  suspended      : { type: Array, optional: true },
    'suspended.$'       : { type: Object },
    'suspended.$.date'  : { type: Date },
    'suspended.$._id'   : { type: String },
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
    // burayi yalnizca oturum acan VE bu dokumani olusturan VEYA courseadmin ise sadece contracti degistirmek isteyene aciyoruz
    if (userId &&
        (doc.instructor === userId ||
          (Roles.userIsInRole(userId, ['courseadmin']) &&
            (_.difference(fields, ['contract',  'updatedAt']).length == 0 ||
             _.difference(fields, ['pending',   'updatedAt']).length == 0 ||
             _.difference(fields, ['students',  'updatedAt']).length == 0 ||
             _.difference(fields, ['suspended', 'updatedAt']).length == 0 )))) {
      return true;
    }
  },
  remove: function (userId, doc, fields, modifier) {
    if (userId && doc.instructor === userId) {
      return true;
    }
  }
});


/////////////////////////////////////////
