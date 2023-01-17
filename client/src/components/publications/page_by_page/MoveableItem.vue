<template>
  <!-- <div class="container"> -->
  <!-- <div class="" style="position: absolute">
      {{ transform }}
    </div> -->
  <div class="_moveableItem">
    <img class="" :src="src" />
  </div>
  <!-- </div> -->
</template>
<script>
// import Moveable from "vue-moveable";
import Moveable from "moveable";

export default {
  name: "app",
  props: {
    src: String,
  },
  components: {},
  data() {
    return {
      transform: undefined,
      is_loaded: false,
    };
  },
  created() {},
  mounted() {
    this.is_loaded = true;

    const moveable = new Moveable(this.$el.parentElement, {
      target: this.$el,
      // If the container is null, the position is fixed. (default: parentElement(document.body))
      container: this.$el.parentElement,
      snapContainer: this.$el.parentElement,
      bounds: { left: 0, right: 1000, top: 0, bottom: 1000 },
      draggable: true,
      resizable: true,
      scalable: true,
      rotatable: true,
      warpable: true,
      // Enabling pinchable lets you use events that
      // can be used in draggable, resizable, scalable, and rotateable.
      pinchable: true, // ["resizable", "scalable", "rotatable"]
      origin: true,
      keepRatio: true,
      // Resize, Scale Events at edges.
      edge: false,
      throttleDrag: 0,
      throttleResize: 0,
      throttleScale: 0.1,
      throttleRotate: 1,
    });
    /* draggable */

    /* eslint-disable no-unused-vars */
    moveable
      .on("dragStart", ({ target, clientX, clientY }) => {
        console.log("onDragStart", target);
      })
      .on(
        "drag",
        ({
          target,
          transform,
          left,
          top,
          right,
          bottom,
          beforeDelta,
          beforeDist,
          delta,
          dist,
          clientX,
          clientY,
        }) => {
          console.log("onDrag left, top", left, top);
          // target.style.left = `${left}px`;
          // target.style.top = `${top}px`;
          // console.log("onDrag translate", dist);
          target.style.transform = transform;
        }
      )
      .on("dragEnd", ({ target, isDrag, clientX, clientY }) => {
        console.log("onDragEnd", target, isDrag);
      });

    /* resizable */
    moveable
      .on("resizeStart", ({ target, clientX, clientY }) => {
        console.log("onResizeStart", target);
      })
      .on(
        "resize",
        ({ target, width, height, dist, delta, clientX, clientY }) => {
          console.log("onResize", target);
          delta[0] && (target.style.width = `${width}px`);
          delta[1] && (target.style.height = `${height}px`);
        }
      )
      .on("resizeEnd", ({ target, isDrag, clientX, clientY }) => {
        console.log("onResizeEnd", target, isDrag);
      });

    /* scalable */
    moveable
      .on("scaleStart", ({ target, clientX, clientY }) => {
        console.log("onScaleStart", target);
      })
      .on(
        "scale",
        ({ target, scale, dist, delta, transform, clientX, clientY }) => {
          console.log("onScale scale", scale);
          target.style.transform = transform;
        }
      )
      .on("scaleEnd", ({ target, isDrag, clientX, clientY }) => {
        console.log("onScaleEnd", target, isDrag);
      });

    /* rotatable */
    moveable
      .on("rotateStart", ({ target, clientX, clientY }) => {
        console.log("onRotateStart", target);
      })
      .on(
        "rotate",
        ({ target, beforeDelta, delta, dist, transform, clientX, clientY }) => {
          console.log("onRotate", dist);
          target.style.transform = transform;
        }
      )
      .on("rotateEnd", ({ target, isDrag }) => {
        console.log("rotateEnd", target, isDrag);
        // this.transform = transform;
      });

    /* pinchable */
    // Enabling pinchable lets you use events that
    // can be used in draggable, resizable, scalable, and rotateable.
    moveable
      .on("pinchStart", ({ target, clientX, clientY }) => {
        // pinchStart event occur before dragStart, rotateStart, scaleStart, resizeStart
        console.log("onPinchStart");
      })
      .on("pinch", ({ target, clientX, clientY, datas }) => {
        // pinch event occur before drag, rotate, scale, resize
        console.log("onPinch");
      })
      .on("pinchEnd", ({ isDrag, target, clientX, clientY, datas }) => {
        // pinchEnd event occur before dragEnd, rotateEnd, scaleEnd, resizeEnd
        console.log("onPinchEnd");
      });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    /* eslint-disable no-unused-vars */
    // onDrag({ target, transform }) {
    //   // this.transform = transform;
    //   debugger;
    //   target.style.transform = transform;
    // },
    // onScale({ target, drag }) {
    //   // this.transform = drag.transform;
    //   target.style.transform = drag.transform;
    // },
    // onRotate({ target, drag }) {
    //   // this.transform = drag.transform;
    //   target.style.transform = drag.transform;
    // },
  },
};
</script>
<style lang="scss" scoped>
._moveableItem {
  width: 50px;
}
</style>
