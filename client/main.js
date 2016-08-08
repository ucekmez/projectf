/* Tum route dosyalarimizi client tarafindan gorulebilecek sekilde dahil ediyoruz*/
import '/imports/startup/client/routes/routes.js';

/* useraccounts icin ayarlar iceriyor, login yonlendirmesi gibi */
import '/imports/api/config.js';







/////////////////// registerHelpers

setInterval(function() { Session.set("time", new Date()); }, 60000);
Template.registerHelper("dateFromNow", function(date){
  Session.get('time');
  return moment(date).fromNow();
});
