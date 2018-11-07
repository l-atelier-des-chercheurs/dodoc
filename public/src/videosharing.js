// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................

var connection = new RTCMultiConnection();
// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';
// comment-out below line if you do not have your own socket.io server
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.socketMessageEvent = 'call-by-username-demo';
// do not shift room control to other users
connection.autoCloseEntireSession = true;
connection.session = {
  audio: true,
  video: true,
  broadcast: true // if you remove this, then it becomes MANY-to-MANY
};
connection.sdpConstraints.mandatory = {
  OfferToReceiveAudio: true,
  OfferToReceiveVideo: true
};
connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
  var existing = document.getElementById(event.streamid);
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
  event.mediaElement.removeAttribute('src');
  event.mediaElement.removeAttribute('srcObject');
  event.mediaElement.muted = true;
  event.mediaElement.volume = 0;
  var video = document.createElement('video');
  try {
    video.setAttributeNode(document.createAttribute('autoplay'));
    video.setAttributeNode(document.createAttribute('playsinline'));
  } catch (e) {
    video.setAttribute('autoplay', true);
    video.setAttribute('playsinline', true);
  }
  if (event.type === 'local') {
    video.volume = 0;
    try {
      video.setAttributeNode(document.createAttribute('muted'));
    } catch (e) {
      video.setAttribute('muted', true);
    }
    connection.dontCaptureUserMedia = true;
  }
  video.srcObject = event.stream;
  var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
  var mediaElement = getHTMLMediaElement(video, {
    title: event.userid,
    buttons: ['full-screen'],
    width: width,
    showOnMouseEnter: false
  });
  connection.videosContainer.appendChild(mediaElement);
  setTimeout(function() {
    mediaElement.media.play();
  }, 5000);
  mediaElement.id = event.streamid;
};
connection.onstreamended = function(event) {
  var mediaElement = document.getElementById(event.streamid);
  if (mediaElement) {
    mediaElement.parentNode.removeChild(mediaElement);
  }
};
connection.onMediaError = function(e) {
  if (e.message === 'Concurrent mic process limit.') {
    if (DetectRTC.audioInputDevices.length <= 1) {
      alert(
        'Please select external microphone. Check github issue number 483.'
      );
      return;
    }
    var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
    connection.mediaConstraints.audio = {
      deviceId: secondaryMic
    };
    connection.join(connection.sessionid);
  }
};
// ..................................
// ALL below scripts are redundant!!!
// ..................................
var joinCalleeUsingHisUsername = document.getElementById(
  'join-callee-using-his-username'
);
joinCalleeUsingHisUsername.onclick = function() {
  this.disabled = true;
  connection.checkPresence(calleeUserName.value, function(isOnline, username) {
    if (!isOnline) {
      joinCalleeUsingHisUsername.disabled = false;
      alert(username + ' is not online.');
      return;
    }
    connection.join(username);
  });
  setTimeout(function() {
    joinCalleeUsingHisUsername.disabled = false;
  }, 1000);
};
// caller
var currentUserName = document.getElementById('current-username');
currentUserName.onkeyup = currentUserName.onpaste = currentUserName.oninput = function() {
  localStorage.setItem(this.id, this.value);
};
currentUserName.value =
  localStorage.getItem(currentUserName.id) || connection.token();
connection.open(currentUserName.value);
document.getElementById('change-your-own-username').onclick = function() {
  this.disabled = true;
  location.reload();
};
// callee
var calleeUserName = document.getElementById('callee-username');
calleeUserName.onkeyup = calleeUserName.onpaste = calleeUserName.oninput = function() {
  localStorage.setItem(this.id, this.value);
};
calleeUserName.value =
  localStorage.getItem(calleeUserName.id) || connection.token();
// detect 2G
if (
  navigator.connection &&
  navigator.connection.type === 'cellular' &&
  navigator.connection.downlinkMax <= 0.115
) {
  alert('2G is not supported. Please use a better internet service.');
}
