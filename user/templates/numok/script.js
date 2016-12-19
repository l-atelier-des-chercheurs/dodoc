var scripts = (function() {
  var $m = $('.media');
  var $v = $m.find('video');

  $m.hover(function() {
    if( $v.length > 0) {
      $v
        .attr('loop', true)
        .removeAttr('controls')
        .get(0)
          .play()
        ;
    }
  }, function() {
    if( $v.length > 0) {
      $v
        .removeAttr('loop')
        .attr('controls', true)
        .get(0)
          .pause()
        ;
      $v.get(0).currentTime = 0;
    }
  });


})();