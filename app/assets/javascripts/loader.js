function fullLoader() {
  $('.main').prepend('<div class="loading-screen"><h1 class="loading-text">Loading</h1><ul class="loading-clouds"><li></li><li></li><li></li><li></li></ul></div>');
};
function smallLoader() {
  $('.main').prepend('<div style="z-index: 1;" class="loading-screen"><h1 class="loading-text">Loading</h1><ul class="loading-clouds"><li></li><li></li><li></li><li></li></ul></div>');
}

function removeLoader() {
  $(".loading-screen").remove();
};