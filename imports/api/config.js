AccountsTemplates.configure({
  homeRoutePath: '/',
  onSubmitHook: function(err, state) {
    if (!err) {
     FlowRouter.go('home');
   }
  },
});


// toast mesajlari gostermek icin ayarlar (toastr)
toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": true,
  "progressBar": true,
  "positionClass": "toast-bottom-right",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "200",
  "hideDuration": "800",
  "timeOut": "2000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
