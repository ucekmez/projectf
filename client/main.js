/* Tum route dosyalarimizi client tarafindan gorulebilecek sekilde dahil ediyoruz*/
import '/imports/startup/client/routes/routes.js';

/* useraccounts icin ayarlar iceriyor, login yonlendirmesi gibi */
import '/imports/api/config.js';

import { Schedules } from '/imports/api/collections/schedules.js';





/////////////////// registerHelpers for general use

setInterval(function() { Session.set("time", new Date()); }, 60000);
Template.registerHelper("dateFromNow", function(date){
  Session.get('time');
  return moment(date).fromNow();
});

Template.registerHelper("hasPassed", function(date){
  Session.get('time');
  if ((moment(date) - moment.now()) < 0) { return true; }
  else { return false; }
});

Template.registerHelper("convertToDateFormat", function(date) {
  let day = date.getDate();
  if (day < 10) { day = "0" + day }
  let month = date.getMonth() + 1;
  if (month < 10) { month = "0" + month }
  return date.getFullYear() + "-" + month + "-" + day;
});

Template.registerHelper('equals', function(s1, s2){
  return s1 === s2;
});


/////////////////// registerHelpers for specific use

Template.registerHelper("hasSchedule", function(course_id){
  const schedule = Schedules.findOne({ course: course_id });
  if (schedule) { return true; }
  else { return false; }
});


// for Single Course Schedule view
Template.registerHelper("scaleText", function(content){
  if (content) {
    let c = content.replace(new RegExp("[1][0-9]px","gm"), "6px");
    c = c.replace(new RegExp("[2][0-9]px","gm"), "9px");
    c = c.replace(new RegExp("[3-9][0-9]px","gm"), "12px");
    c = c.replace(new RegExp("<br>","gm"), "");
    c = c.replace(new RegExp("<p></p>","gm"), "");
    return c;
  }
});



////////
