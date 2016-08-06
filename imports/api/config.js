AccountsTemplates.configure({
  homeRoutePath: '/',
  onSubmitHook: function(err, state) {
    if (!err) {
     FlowRouter.go('home');
   }
  },
});
