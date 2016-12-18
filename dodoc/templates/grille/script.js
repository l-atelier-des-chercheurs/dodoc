var scripts = (function() {
  var $m = $('.media');

  var $button = $('<button class="showCaption js--showCaption">t</button>');
  $m.find('.mediaContent').prepend($button);
  $button.on('click', function() { $(this).toggleClass('is--clicked');});

})();