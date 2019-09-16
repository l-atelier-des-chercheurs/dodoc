<template>
  <div
    class="m_mediaCarreau"
    ref="media"
    :style="mediaStyles"
    :data-media_type="media.type"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
    @mousedown.stop="is_selected = true"
    :class="{ 
      'is--dragged' : is_dragged, 
      'is--resized' : is_resized, 
      'is--rotated' : is_rotated, 
      'is--waitingForServerResponse' : is_waitingForServer,
      'is--hovered' : is_hovered,
      'is--previewed' :  preview_mode,
      'is--overflowing' : is_text_overflowing
    }"
  >
    <MediaContent
      ref="mediaContent"
      :context="'full'"
      :slugFolderName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      :element_width_for_sizes="mediaSize.width"
      v-model="media.content"
    />
    <div
      v-if="(is_selected || is_hovered || is_touch)"
      class="controlFrame"
      @mousedown.stop.prevent="dragMedia('mouse')"
      @touchstart.stop.prevent="dragMedia('touch')"
    >
      <div
        class="handle handle_resizeMedia"
        @mousedown.stop.prevent="resizeMedia('mouse', 'bottomright')"
        @touchstart.stop.prevent="resizeMedia('touch', 'bottomright')"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="77.5px"
          height="77.5px"
          viewBox="0 0 77.5 77.5"
          style="enable-background:new 0 0 77.5 77.5;"
          xml:space="preserve"
        >
          <defs />
          <g>
            <path
              d="M42.5,0l0.4,12.6l-9.3,0.1c-2.8,0-5.1,0-6.9-0.2c-1.8-0.2-3.6-0.6-5.7-1.2l45.3,45.3c-0.6-2-1-3.9-1.2-5.7
              c-0.2-1.8-0.3-4-0.2-6.9v-9.4l12.6,0.4l-1.3,41.2l-41.2,1.3l-0.4-12.6l9.5,0c2.9,0,5.2,0.1,7,0.3c1.8,0.2,3.6,0.5,5.4,1.1
            L11.3,21.1c0.5,1.8,0.9,3.6,1.1,5.4c0.2,1.8,0.3,4.1,0.3,7l-0.1,9.4L0,42.5L1.3,1.3L42.5,0z"
            />
          </g>
        </svg>
      </div>
      <!-- <div class="handle handle_rotateMedia"
          @mousedown.stop.prevent="rotateMedia('mouse', 'bottomright')"
          @touchstart.stop.prevent="rotateMedia('touch', 'bottomright')"
        >
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="98.7px"
    height="132.2px" viewBox="0 0 98.7 132.2" style="enable-background:new 0 0 98.7 132.2;" xml:space="preserve">
  <defs>
  </defs>
  <path d="M80.1,117.7c-3.1-0.2-5.6-0.3-7.6-0.2c-1.4,0.1-2.9,0.3-4.5,0.5c14.7-13.7,36.9-42.4,29.1-63.4S71.6,27,24.8,24.6
    c1.1-0.8,2.2-1.6,3.1-2.4c1.5-1.3,3.2-3.1,5.3-5.5L40,9L29.3,0L0,34.9l32.9,31.5l9.7-10.1l-7.7-7c-2.4-2.1-4.3-3.8-5.9-4.9
    c-1.6-1.2-3.3-2.2-5.2-3.1l-0.1-1.2c29.3,1.4,52.5,6.6,56.5,20.7s-15.9,39.7-23.5,46.5l-0.5-0.6c0.7-1.9,1.2-3.9,1.6-5.9
    c0.3-2,0.6-4.5,0.8-7.7l0.7-10.5l-14-0.4L43.7,128l45.5,4.2l1.3-13.9L80.1,117.7z"/>
  </svg>

      </div>-->
    </div>
    <!-- </transition> -->

    <transition name="fade_fast" :duration="150">
      <div v-if="(is_selected || is_hovered || is_touch)" class="m_mediaCarreau--buttons">
        <!-- <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="editZIndex(+1)"
          @touchstart.stop.prevent="editZIndex(+1)"
          :title="$t('move_to_foreground') + '<br>' + $t('layer:') + ' ' + mediaZIndex"
          v-tippy="{ 
            placement : 'top',
            delay: [600, 0]
          }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="40.3px"
            height="59.6px"
            viewBox="0 0 40.3 59.6"
            style="enable-background:new 0 0 40.3 59.6;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M35,24.4l-4.6-4.2c-2.7-2.5-4.8-4.7-6.4-7.3l0,46.7l-7.7,0l0-46.6c-1.7,2.5-3.8,4.7-6.4,7.1l-4.6,4.2L0,18.1
              L20.2,0l20.2,18.1L35,24.4z"
            />
          </svg>
        </button>-->
        <!-- <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="editZIndex(-1)"
          @touchstart.stop.prevent="editZIndex(-1)"
          :title="$t('move_to_background') + '<br>' + $t('layer:') + ' ' + mediaZIndex"
          v-tippy="{ 
            placement : 'top',
            delay: [600, 0]
          }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="40.3px"
            height="59.6px"
            viewBox="0 0 40.3 59.6"
            style="enable-background:new 0 0 40.3 59.6;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M5.3,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7L24,0l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2
              L20.2,59.6L0,41.5L5.3,35.2z"
            />
          </svg>
        </button>-->
        <!-- <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="$root.openMedia({ slugProjectName: media.slugProjectName, metaFileName: media.metaFileName })"
          @touchstart.stop.prevent="$root.openMedia({ slugProjectName: media.slugProjectName, metaFileName: media.metaFileName })"
          :title="$t('edit_content')"
          v-tippy="{ 
            placement : 'top',
            delay: [600, 0]
          }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.7px"
            height="101px"
            viewBox="0 0 100.7 101"
            style="enable-background:new 0 0 100.7 101;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
            />
          </svg>
        </button>-->
        <button
          type="button"
          class="m_mediaCarreau--buttons--removeMedia buttonLink _no_underline"
          @click.stop.prevent="removePubliMedia()"
          :title="$t('withdraw')"
          v-tippy="{ 
            placement : 'top',
            delay: [600, 0]
          }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="37.2px"
            height="37.2px"
            viewBox="0 0 37.2 37.2"
            style="enable-background:new 0 0 37.2 37.2;"
            xml:space="preserve"
          >
            <polygon
              class="st0"
              points="37.2,30.6 30.6,37.2 18.6,25.2 6.6,37.2 0,30.6 12,18.6 0,6.6 6.6,0 18.6,12 30.6,0 37.2,6.6 
            25.2,18.6 "
            />
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import debounce from "debounce";

export default {
  props: {
    media: Object,
    page: Object,
    preview_mode: Boolean,
    read_only: Boolean
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_dragged: false,
      is_resized: false,
      is_rotated: false,
      is_waitingForServer: false,
      is_hovered: false,
      is_selected: false,
      is_touch: Modernizr.touchevents,
      is_text_overflowing: false,
      limit_media_to_page: true,

      mediaID: `${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      )}`,

      dragOffset: {
        x: 0,
        y: 0
      },

      // beware these are percents !
      mediaPos: {
        x: 0.25,
        y: 0.25,
        px: 0,
        py: 0
      },

      resizeOffset: {
        x: 0,
        y: 0
      },

      rotateOffset: {
        x: 0,
        y: 0,
        angle: 0
      },
      rotate: 0,

      mediaSize: {
        width: 0,
        height: 0,
        pwidth: 0,
        pheight: 0
      }
    };
  },

  created() {},
  mounted() {
    this.updateMediaStyles();
    this.$eventHub.$on("publication.newMediaSelected", this.newMediaSelected);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.newMediaSelected", this.newMediaSelected);
  },
  watch: {
    "media.publi_meta": {
      handler: function() {
        this.updateMediaStyles();
      },
      deep: true
    },
    is_selected: function() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • MediaCarreau: is_selected`);
      }
      if (this.is_selected) {
        window.addEventListener("mousedown", this.deselectMedia);
        window.addEventListener("touchstart", this.deselectMedia);
        this.$eventHub.$emit("publication.newMediaSelected", this.mediaID);
      } else {
        window.removeEventListener("mousedown", this.deselectMedia);
        window.removeEventListener("touchstart", this.deselectMedia);
      }
    }
  },
  computed: {
    mediaStyles() {
      let mediaStyles = `
        transform: translate(${this.page.width * this.mediaPos.x}px, ${this.page
        .height * this.mediaPos.y}px) rotate(${this.rotate * 0}deg);
        width: ${this.media_width}px;
        height: ${this.media_height}px;
      `;
      return mediaStyles;
    },

    media_width() {
      return this.page.width * this.mediaSize.width;
    },
    media_height() {
      if (this.media.ratio) {
        return this.media_width * this.media.ratio;
      }
      return this.page.height * this.mediaSize.height;
    }
  },
  methods: {
    newMediaSelected(mediaID) {
      if (mediaID !== this.mediaID) {
        this.is_selected = false;
      }
    },
    updateMediaStyles() {
      this.mediaPos.x =
        this.media.publi_meta.hasOwnProperty("x") &&
        !Number.isNaN(Number.parseFloat(this.media.publi_meta.x))
          ? this.limitMediaXPos(Number.parseFloat(this.media.publi_meta.x))
          : this.page.margin_top;
      this.mediaPos.y =
        this.media.publi_meta.hasOwnProperty("y") &&
        !Number.isNaN(Number.parseFloat(this.media.publi_meta.y))
          ? this.limitMediaYPos(Number.parseFloat(this.media.publi_meta.y))
          : this.page.margin_top;
      this.rotate =
        this.media.publi_meta.hasOwnProperty("rotate") &&
        !Number.isNaN(Number.parseFloat(this.media.publi_meta.rotate))
          ? this.media.publi_meta.rotate
          : 0;
      this.mediaSize.width =
        this.media.publi_meta.hasOwnProperty("width") &&
        !Number.isNaN(Number.parseFloat(this.media.publi_meta.width))
          ? this.limitMediaWidth(Number.parseFloat(this.media.publi_meta.width))
          : 0.6;
      this.mediaSize.height =
        this.media.publi_meta.hasOwnProperty("height") &&
        !Number.isNaN(Number.parseFloat(this.media.publi_meta.height))
          ? this.limitMediaHeight(
              Number.parseFloat(this.media.publi_meta.height)
            )
          : 0.6;

      if (this.media.type === "text") {
        this.$nextTick(() => {
          const el = this.$refs.media;
          this.is_text_overflowing =
            el.offsetHeight <
            el.firstElementChild.firstElementChild.firstElementChild
              .offsetHeight;
        });
      }
    },

    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaCarreau: updateMediaPubliMeta`);
      }
      this.$emit("editPubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName,
        val
      });
    },

    limitMediaXPos(xPos) {
      if (!this.limit_media_to_page) {
        return xPos;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaCarreau: limitMediaXPos / xPos = ${xPos}`);
      // }
      return Math.max(this.page.margin_left, Math.min(0.9, xPos));
    },
    roundMediaVal(val) {
      if (!this.page.gridstep) return val;
      return Math.round(val / this.page.gridstep) * this.page.gridstep;
    },

    limitMediaYPos(yPos) {
      if (!this.limit_media_to_page) {
        return yPos;
      }
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaCarreau: limitMediaYPos / yPos = ${yPos}`);
      }
      yPos = Math.max(
        this.page.margin_top,
        // Math.min(1 - this.page.margin_bottom - this.media_height, yPos)
        Math.min(0.9, yPos)
      );
      return yPos;
    },

    limitMediaWidth(w) {
      if (!this.limit_media_to_page) {
        return w;
      }
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaCarreau: limitMediaWidth / w = ${w}`);
      }
      return Math.max(0.05, Math.min(1, w));
    },
    limitMediaHeight(h) {
      if (!this.limit_media_to_page) {
        return h;
      }

      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaCarreau: limitMediaHeight / h = ${h}`);
      // }
      return Math.max(0.05, Math.min(1, h));
    },
    resizeMedia(type, origin) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: resizeMedia with is_resized = ${this.is_resized}`
        );
      }
      if (!this.read_only) {
        if (type === "mouse") {
          window.addEventListener("mousemove", this.resizeMove);
          window.addEventListener("mouseup", this.resizeUp);
        } else if (type === "touch") {
          window.addEventListener("touchmove", this.resizeMove);
          window.addEventListener("touchend", this.resizeUp);
        }
      }
    },
    rotateMedia(type, origin) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: rotateMedia with is_resized = ${this.is_resized}`
        );
      }
      if (!this.read_only) {
        if (type === "mouse") {
          window.addEventListener("mousemove", this.rotateMove);
          window.addEventListener("mouseup", this.rotateUp);
        } else if (type === "touch") {
          window.addEventListener("touchmove", this.rotateMove);
          window.addEventListener("touchend", this.rotateUp);
        }
      }
    },
    resizeMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: resizeMove with is_resized = ${this.is_resized}`
        );
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_percent = pageX / this.page.width;
      const pageY_percent = pageY / this.page.height;

      if (!this.is_resized) {
        this.is_resized = true;
        this.is_selected = true;
        this.resizeOffset.x = pageX_percent;
        this.resizeOffset.y = pageY_percent;
        this.mediaSize.pwidth = Number.parseFloat(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseFloat(this.mediaSize.height);
      } else {
        const deltaX =
          (pageX_percent - this.resizeOffset.x) /
          this.$root.settings.publi_zoom;
        let newWidth = this.mediaSize.pwidth + deltaX;
        this.mediaSize.width = this.limitMediaWidth(newWidth);

        // const deltaY =
        //   (pageY - this.resizeOffset.y) / this.$root.settings.publi_zoom;
        // let newHeight = this.mediaSize.pheight + deltaY;

        // this.mediaSize.height = this.limitMediaHeight(newHeight);
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: resizeUp with is_resized = ${this.is_resized}`
        );
      }
      if (this.is_resized) {
        this.mediaSize.width = this.roundMediaVal(this.mediaSize.width);
        this.mediaSize.height = this.roundMediaVal(this.mediaSize.height);

        this.updateMediaPubliMeta({
          width: this.mediaSize.width,
          height: this.mediaSize.height
        });
        this.is_resized = false;
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.resizeMove);
      window.removeEventListener("mouseup", this.resizeUp);
      window.removeEventListener("touchmove", this.resizeMove);
      window.removeEventListener("touchend", this.resizeUp);

      return false;
    },

    rotateMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: rotateMove with is_rotated = ${this.is_rotated}`
        );
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      if (!this.is_rotated) {
        this.is_rotated = true;
        this.is_selected = true;

        this.rotateOffset.x = this.$refs.media.getBoundingClientRect().x;
        this.rotateOffset.y = this.$refs.media.getBoundingClientRect().y;

        const radians = Math.atan2(
          pageX - this.rotateOffset.x,
          pageY - this.rotateOffset.y
        );
        const deg = Math.round(radians * (180 / Math.PI) * -1 + 100);
        this.rotateOffset.angle = deg;
      } else {
        // measure distance between pageX/pageY and this.rotateOffset.x / this.rotateOffset.y
        // const a = pageX - this.rotateOffset.x;
        // const b = pageY - this.rotateOffset.y;
        // const dist_since_down = Math.round(Math.sqrt( a*a + b*b ));

        const radians = Math.atan2(
          pageX - this.rotateOffset.x,
          pageY - this.rotateOffset.y
        );
        const deg = Math.round(radians * (180 / Math.PI) * -1 + 100);

        // const deg = radians * (180/Math.PI);

        // this.rotate = deg + this.rotateOffset.angle;
        this.rotate = this.rotateOffset.angle + deg;
        // this.rotate = deg - this.rotateOffset.angle;
      }
    },
    rotateUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: rotateUp with is_rotated = ${this.is_rotated}`
        );
      }
      if (this.is_rotated) {
        this.updateMediaPubliMeta({
          rotate: this.rotate
        });
        this.is_rotated = false;
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.rotateMove);
      window.removeEventListener("mouseup", this.rotateUp);
      window.removeEventListener("touchmove", this.rotateMove);
      window.removeEventListener("touchend", this.rotateUp);

      return false;
    },

    dragMedia(type) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: dragMedia with is_dragged = ${this.is_dragged}`
        );
      }
      if (!this.read_only) {
        if (type === "mouse") {
          this.is_selected = true;
          window.addEventListener("mousemove", this.dragMove);
          window.addEventListener("mouseup", this.dragUp);
        } else if (type === "touch") {
          window.addEventListener("touchmove", this.dragMove);
          window.addEventListener("touchend", this.dragUp);
        }
      }
    },
    dragMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: dragMove with is_dragged = ${this.is_dragged}`
        );
      }

      const pageX = !!event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = !!event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_percent = pageX / this.page.width;
      const pageY_percent = pageY / this.page.height;

      if (!this.is_dragged) {
        this.is_dragged = true;
        this.is_selected = true;

        this.dragOffset.x = pageX_percent;
        this.dragOffset.y = pageY_percent;

        this.mediaPos.px = Number.parseFloat(this.mediaPos.x);
        this.mediaPos.py = Number.parseFloat(this.mediaPos.y);
      } else {
        const deltaX =
          (pageX_percent - this.dragOffset.x) / this.$root.settings.publi_zoom;
        let newX = this.mediaPos.px + deltaX;
        this.mediaPos.x = this.limitMediaXPos(newX);

        const deltaY =
          (pageY_percent - this.dragOffset.y) / this.$root.settings.publi_zoom;
        let newY = this.mediaPos.py + deltaY;
        this.mediaPos.y = this.limitMediaYPos(newY);
      }
    },
    dragUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCarreau: dragUp with is_dragged = ${this.is_dragged}`
        );
      }
      if (this.is_dragged) {
        this.mediaPos.x =
          this.roundMediaVal(this.mediaPos.x - this.page.margin_left) +
          this.page.margin_left;
        this.mediaPos.y =
          this.roundMediaVal(this.mediaPos.y - this.page.margin_top) +
          this.page.margin_top;

        this.updateMediaPubliMeta({
          x: this.mediaPos.x,
          y: this.mediaPos.y
        });
        this.is_dragged = false;
      }

      window.removeEventListener("mousemove", this.dragMove);
      window.removeEventListener("mouseup", this.dragUp);
      window.removeEventListener("touchmove", this.dragMove);
      window.removeEventListener("touchend", this.dragUp);

      return false;
    },

    removePubliMedia() {
      this.$emit("removePubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName
      });
    },
    deselectMedia(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaCarreau: deselectMedia`);
      }
      this.is_selected = false;
      this.$emit("unselected");
    },
    mouseOver() {
      if (!this.is_touch) {
        this.is_hovered = true;
      }
    },
    mouseLeave() {
      if (!this.is_touch) {
        this.is_hovered = false;
      }
    }
  }
};
</script>
<style>
</style>