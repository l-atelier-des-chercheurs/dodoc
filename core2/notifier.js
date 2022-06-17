var EventEmitter2 = require("eventemitter2");
var notifier = new EventEmitter2({
  wildcard: true,
});

module.exports = (function () {
  notifier.onAny((event, path, data) => {
    dev.logfunction({ event, path, data });
  });
  return notifier;
})();
