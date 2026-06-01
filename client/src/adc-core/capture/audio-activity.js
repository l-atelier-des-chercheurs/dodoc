var supported = !!(
  window.AudioContext &&
  window.MediaStreamAudioSourceNode &&
  window.AnalyserNode &&
  window.ScriptProcessorNode
);

export default function (media, options, callback) {
  if (!callback) {
    callback = options;
    options = null;
  }

  options = options || {};

  var that = {};
  var context = options.context || new AudioContext();
  var source = context.createMediaStreamSource(media);
  var analyser = context.createAnalyser();
  var processor = null;
  var time_data = null;
  var activity_threshold = Number.isFinite(options.activity_threshold)
    ? options.activity_threshold
    : 0.03;
  var latest_data = {
    level: 0,
    is_active: false,
    peak: 0,
    rms: 0,
  };

  if (callback) {
    processor = context.createScriptProcessor(2048, 1, 1);
    processor.onaudioprocess = function () {
      callback(that.get());
    };
  }

  analyser.smoothingTimeConstant = 0.15;
  analyser.fftSize = 512;
  time_data = new Uint8Array(analyser.fftSize);

  source.connect(analyser);

  that.get_data = function () {
    var sum_squares = 0;
    var peak = 0;

    analyser.getByteTimeDomainData(time_data);

    for (var i = 0; i < time_data.length; i++) {
      var centered_sample = (time_data[i] - 128) / 128;
      var abs_sample = Math.abs(centered_sample);
      sum_squares += centered_sample * centered_sample;
      if (abs_sample > peak) peak = abs_sample;
    }

    var rms = Math.sqrt(sum_squares / time_data.length);
    var normalized_rms = Math.min(1, rms * 3.4);
    var normalized_peak = Math.min(1, peak * 1.5);
    var level = Math.min(1, normalized_rms * 0.8 + normalized_peak * 0.2);

    latest_data = {
      level: level,
      is_active: level >= activity_threshold,
      peak: normalized_peak,
      rms: normalized_rms,
    };

    return latest_data;
  };

  that.get = function () {
    return that.get_data().level;
  };

  that.destroy = function () {
    if (processor) {
      processor.disconnect();
    }
    analyser.disconnect();

    source.disconnect();

    if (!options.context) context.close();
  };

  if (processor) {
    analyser.connect(processor);
    processor.connect(context.destination);
  }

  return that;
}

// module.exports.supported = supported;
