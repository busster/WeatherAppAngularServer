$(".application.index").ready(function(){

  $('#search').on( "focus", function() {
    $('.brand-logo').addClass('no-z-index')
  }).on( "blur", function() {
    $('.brand-logo').removeClass('no-z-index')
  })


});

