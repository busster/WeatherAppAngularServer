$(document).ready(function(){
  removeAlert();
});


function removeAlert() {
  setTimeout(function() {
    $('.alert').remove();
  }, 4000)
};