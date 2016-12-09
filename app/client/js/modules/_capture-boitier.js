var boitierExterne = (function() {

  var $modeButtons = $('.js--modeSelector');

  var API = {
    init : function() {
      console.log('Boitier.init()');
  	  // switch mode if code == 115 (next mode, Z) or 122 (prev mode, S)
  	  // can't overflow past first or last mode buttons
      $("body").keyup(function(e){
        var key = e.key;
        // next/prev
        if( key === 'w' || key == 's' || key === 'z') {
          var direction = key === 's' ? 'next' : 'prev';
          _switchMediaMode(direction);
        } else
        // capture
        if( key === 'a' || key === 'q' || key === ' ' || key === 'Enter') {
          if( imageMode.isRunning())      imageMode.captureButtonPress();
          else if( videoMode.isRunning())       videoMode.captureButtonPress();
          else if( stopMotionMode.isRunning()) stopMotionMode.captureButtonPress();
          else if( audioMode.isRunning())      audioMode.captureButtonPress();
        }
      });
    },
  }

  function _switchMediaMode( direction) {
    // current active button
    var $currentActiveButton = $modeButtons.filter('.is--active');
    var $getRequestedButton = $();

    if(direction === 'prev')
      $getRequestedButton = $currentActiveButton.prev().length > 0 ? $currentActiveButton.prev() : $currentActiveButton;

    if(direction === 'next')
      $getRequestedButton = $currentActiveButton.next().length > 0 ? $currentActiveButton.next() : $currentActiveButton;

    // get its 'data-mediatype' and send it to changeMediaMode
    changeMediaMode( $getRequestedButton.attr('data-mediatype'));
  }

  return API;

})();
