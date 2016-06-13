var boitierExterne = (function() {

  var $modeButtons = $('.js--modeSelector');


  function switchMediaMode( direction) {
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

  return {
    init : function() {
  	  // switch mode if code == 115 (next mode, Z) or 122 (prev mode, S)
  	  // can't overflow past first or last mode buttons
      $("body").keypress(function(e){
        debugger;
        var key = e.key;
        // next/prev
        if( key === 'w' || key == 's' || key === 'z') {
          var direction = key === 's' ? 'next' : 'prev';
          switchMediaMode(direction);
        } else
        // capture
        if( key === 'a' || key === 'q') {
          if( imageMode.isRunning())      imageMode.captureButtonPress();
          else if( videoMode.isRunning())       videoMode.captureButtonPress();
          else if( stopMotionMode.isRunning()) stopMotionMode.captureButtonPress();
          else if( audioMode.isRunning())      audioMode.captureButtonPress();
        }
      });


    },
  }

})();




/*

    if(code == 113) {





    }


	  if($("#photo").hasClass('active')){
	      takePictures();
	      console.log("taking a picture");
	    }
	  }
    if($("#video-btn").hasClass('active')){
      if(code == 113) {//When Q is pressed
        countPress ++;
        recordingVideo();
      }
    }
    if($("#stopmotion").hasClass('active')){
      //redémarre le stop motion quand un autre média est choisi au milieu du stop motion
      if(code == 113) { //When Q is pressed
        countPress ++;
        if(countPress == 1){
          console.log("start a stopmotion");
          startStopMotion();
        }
        else{
          console.log("start taking pictures");
          onStopMotionDirectory();
        }
      }
    }

    if($("#audio").hasClass('active')){
      if(code == 113) {
        countPress ++;
        countEqualizer ++;
        audioCapture(code);
      }
    }

// REMOVED
// should reimplement better
function changeMediaBoitier(e){
  var $activeButton = $(".btn-choice").find('.active');
  var thisId;

  if($('body').hasClass('takingstopmotion') && (code == 115 || code == 122)){
    if(code == 115){
      var $nextButton = $activeButton.next();
      thisId = $nextButton.attr('id');
    }

    if(code == 122){
      var $prevButton = $activeButton.prev();
      thisId = $prevButton.attr('id');
    }
    $('#modal-change-alert').foundation('reveal', 'open');
    $('#modal-change-alert .supprimer-stop-motion').attr('data-choice', thisId);
  }

  else{
    if(code == 115) { // Z keypress
      var $nextButton = $activeButton.next();
      $activeButton.removeClass('active');
      if ($nextButton.length){
        $nextButton.addClass('active');
      }
      else{
        $nextButton = $(".btn-choice button").first().addClass('active');
      }
    }
    if(code == 122) { // S keypress
      var $prevButton = $activeButton.prev();
      $activeButton.removeClass('active');
      if ($prevButton.length){
        $prevButton.addClass('active');
      }
      else{
        $prevButton = $(".btn-choice button").last().addClass('active');
        $activeButton.removeClass('active');
      }
    }
    if(code == 115 || code == 122){
      if($('.screenshot .count-image')){
        $('.screenshot .count-image').remove();
      }
      backAnimation();

      if($("#photo").hasClass('active')){
        photoDisplay();
      }
      if($("#video-btn").hasClass('active')){
        videoDisplay();
      }
      if($("#stopmotion").hasClass('active')){
        stopMotionDisplay();
      }
      if($("#audio").hasClass('active')){
        audioDisplay();
      }
    }
//   }
}

*/

