/*
  Buraya, ayni klasordeki tum modullerin route dosyalari import edilecek.
  Daha sonra biz bu dosyayi baska bir yere import ettigimizde tum route
  dosyalarinin icerigini de almis olacagiz
*/


import '../../../ui/landing/landing.js'; // landing page routes
import '../../../ui/admin/admin.js'; // admin routes


FlowRouter.triggers.enter([() => {
  NProgress.start();
}]);
