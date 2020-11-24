<template>
  <canvas class="m_audioEqualizer" width="1280" height="720" />
</template>
<script>
export default {
  props: {
    stream: MediaStream,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    setTimeout(() => {
      equalizer.start(this.$el, this.stream);
    }, 500);
  },
  beforeDestroy() {
    equalizer.stop();
  },
  watch: {
    // stream() {
    //   equalizer.start(this.$el, this.stream);
    // },
  },
  computed: {},
  methods: {},
};

// CREATE A SOUND EQUALIZER
var equalizer = (function () {
  window.requestAnimFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      function (callback, element) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  // Global Variables for Audio
  var sarahCouleur = "white";
  var audioContext;
  var analyserNode;
  var javascriptNode;
  var sampleSize = 1024; // number of samples to collect before analyzing
  // decreasing this gives a faster sonogram, increasing it slows it down
  var amplitudeArray; // array to hold frequency data
  var audioStream;
  var sourceNode;

  // Global Variables for Drawing
  var column = 0;
  var canvasWidth = 1280;
  var canvasHeight = 720;
  var ctx;

  var API = {
    start: function (canvasEl, stream) {
      if (!stream) return;

      ctx = canvasEl.getContext("2d");

      window.AudioContext = (function () {
        return window.AudioContext || window.mozAudioContext;
      })();

      try {
        audioContext = new AudioContext();
      } catch (e) {
        console.log("Web Audio API is not supported in this browser");
      }
      startEqualizer(stream);
    },
    stop: function () {
      stopEqualizer();
    },
    setSarahCouleur: function (isCurrentlyRecording) {
      if (isCurrentlyRecording) {
        sarahCouleur = "#fc4b60";
      } else {
        sarahCouleur = "white";
      }
    },
    clearCanvas: function () {
      clearCanvas();
    },
  };

  function startEqualizer(stream) {
    console.log("starting equalizer");
    // e.preventDefault();
    clearCanvas();
    // Initialise getUserMedia
    setupAudioNodes(stream);
  }

  function stopEqualizer() {
    if (javascriptNode !== undefined) javascriptNode.onaudioprocess = null;
    if (audioStream !== undefined) audioStream.stop();
    if (sourceNode !== undefined) sourceNode.disconnect();
  }

  function setupAudioNodes(stream) {
    // create the media stream from the audio input source (microphone)
    try {
      sourceNode = audioContext.createMediaStreamSource(stream);
    } catch (e) {
      console.error(`Failed to start equalizer : ` + e);
      return;
    }
    audioStream = stream;

    analyserNode = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // setup the event handler that is triggered every time enough samples have been collected
    // trigger the audio analysis and draw one column in the display based on the results
    javascriptNode.onaudioprocess = function () {
      amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteTimeDomainData(amplitudeArray);

      // draw one column of the display
      requestAnimFrame(drawTimeDomain);
    };

    // Now connect the nodes together
    // Do not connect source node to destination - to avoid feedback
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
  }

  function onError(e) {
    console.log(e);
  }

  function drawTimeDomain() {
    var minValue = 9999999;
    var maxValue = 0;
    for (var i = 0; i < amplitudeArray.length; i++) {
      var value = amplitudeArray[i] / 256;
      if (value > maxValue) {
        maxValue = value;
      } else if (value < minValue) {
        minValue = value;
      }
    }

    var y_lo = canvasHeight - canvasHeight * minValue - 1;
    var y_hi = canvasHeight - canvasHeight * maxValue - 1;

    ctx.fillStyle = sarahCouleur;
    ctx.fillRect(column, y_lo, 1, y_hi - y_lo);
    // loop around the canvas when we reach the end
    column += 1;
    if (column >= canvasWidth) {
      column = 0;
      clearCanvas();
    }
  }

  function clearCanvas() {
    if (ctx === undefined) {
      return;
    }

    column = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "#1d327f";
    var y = canvasHeight / 2 + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth - 1, y);
    ctx.stroke();
  }

  return API;
})();
</script>
<style lang="scss" scoped>
.m_audioEqualizer {
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
}
</style>
