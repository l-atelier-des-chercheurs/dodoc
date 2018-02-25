var boitierExterne = (function() {

  var $modeButtons = $('.js--modeSelector');

  var API = {
    init : function() {
      console.log('Boitier.init()');
  	  // switch mode if code == 115 (next mode, Z) or 122 (prev mode, S)
  	  // can't overflow past first or last mode buttons
      $('body').keyup(function(e){
        var key = e.key;
        console.log('key pressed : ' + key);

        let checkIfAnyFieldIsFocus = false;
        $('textarea').each(function() {
          	if($(this).is(':focus')) {
          		checkIfAnyFieldIsFocus = true;
          }
        });
        if(checkIfAnyFieldIsFocus) {
          console.log('an input field is selected, not using boitier commands');
          return;
        }

        function bouton_direction_pressed(direction) {
          if($('body').data('boitiermode') === 'media_nav') {
            if(direction === 'left') {
              $('.m_modal .js--big-mediaNav-prev').click();
            } else
            if(direction === 'right') {
              $('.m_modal .js--big-mediaNav-next').click();
            }
          } else
          if($('body').data('boitiermode') === 'capturemode_nav') {
            var prev_or_next = direction === 'left' ? 'prev' : 'next';
            boitierExterne.switchMediaMode(prev_or_next);
          }
        }
        function bouton_capture_pressed() {
          if($('body').data('boitiermode') === 'media_nav') {
            var $video_audio = $('.m_modal .mediaContent').find('video, audio');
            if($video_audio.length > 0) {
              var $v = $video_audio.eq(0);
              if($v.get(0).paused) {
                $video_audio.get(0).play();
              } else {
                $video_audio.get(0).pause();
              }
            }
          } else
          if($('body').data('boitiermode') === 'capturemode_nav') {
            if( imageMode.isRunning())      imageMode.captureButtonPress();
            else if( videoMode.isRunning())       videoMode.captureButtonPress();
            else if( stopMotionMode.isRunning()) stopMotionMode.captureButtonPress();
            else if( audioMode.isRunning())      audioMode.captureButtonPress();
          }
        }

        switch(key) {
          case 'w':
          case 'z':
          case 'ArrowLeft':
            bouton_direction_pressed('left');
            break;
          case 's':
          case 'ArrowRight':
            bouton_direction_pressed('right');
            break;
          case 'a':
          case 'q':
          case ' ':
          case 'Enter':
            bouton_capture_pressed();
            break;
        }
      });
    },
    switchMediaMode: function(direction) {
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
  }

  return API;

})();
