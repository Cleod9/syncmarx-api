
// Show modal on page load
$(window).on('load',function() {
  var elem = null;
  var hash = window.location.hash.replace(/#/g, '') || window.location.search.replace(/\?/g, '').split('=')[0];
  if (hash) {
    elem = document.getElementById(hash);
    if (elem) {
      $(elem).modal('show');
    }
  }
});