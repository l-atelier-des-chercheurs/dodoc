export function scrollToY(
  container,
  scrollTargetY = 0,
  speed = 2000,
  easing = "easeOutSine"
) {
  // scrollTargetY: the target scrollY property of the window
  // speed: time in pixels per second
  // easing: easing equation to use

  var scrollY = container.scrollTop || document.documentElement.scrollTop,
    currentTime = 0;

  console.log(scrollY, scrollTargetY, speed, easing);

  // min time .1, max time .8 seconds
  var time = Math.max(
    0.1,
    Math.min(Math.abs(scrollY - scrollTargetY) / speed, 0.8)
  );

  console.log(time);

  // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
  var easingEquations = {
    easeOutSine: function (pos) {
      return Math.sin(pos * (Math.PI / 2));
    },
    easeInOutSine: function (pos) {
      return -0.5 * (Math.cos(Math.PI * pos) - 1);
    },
    easeInOutQuint: function (pos) {
      if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 5);
      }
      return 0.5 * (Math.pow(pos - 2, 5) + 2);
    },
  };

  // add animation loop
  function tick() {
    currentTime += 1 / 60;

    var p = currentTime / time;
    var t = easingEquations[easing](p);

    if (p < 1) {
      window.requestAnimationFrame(tick);
      container.scrollTop = scrollY + (scrollTargetY - scrollY) * t;
      // console.log("scroll", scrollY + (scrollTargetY - scrollY) * t);
    } else {
      console.log("scroll done");
      container.scrollTop = scrollTargetY;
    }
  }

  // call it once to get started
  tick();
}
