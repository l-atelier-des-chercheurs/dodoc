<template>
  <div class="_moveableItem" :style="item_styles">
    <img :src="src" />
  </div>
</template>
<script>
import Moveable from "moveable";

export default {
  props: {
    src: String,
  },
  components: {},
  data() {
    return {
      transform: undefined,
    };
  },
  created() {},
  mounted() {
    const moveable = new Moveable(this.$el.parentElement, {
      target: this.$el,
      // If the container is null, the position is fixed. (default: parentElement(document.body))
      container: this.$el.parentElement,
      draggable: true,
      resizable: true,
      scalable: true,
      rotatable: true,
      // warpable: true,
      // Enabling pinchable lets you use events that
      // can be used in draggable, resizable, scalable, and rotateable.
      pinchable: true, // ["resizable", "scalable", "rotatable"]
      origin: true,
      keepRatio: true,
      // Resize, Scale Events at edges.
      edge: true,
      throttleDrag: 0,
      throttleResize: 0,
      throttleScale: 0,
      throttleRotate: 0,
    });
    moveable;

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
          // target.style.transform = transform;
          this.transform = transform;
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
      .on("rotateEnd", ({ target, isDrag, clientX, clientY }) => {
        console.log("onRotateEnd", target, isDrag);
      });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
