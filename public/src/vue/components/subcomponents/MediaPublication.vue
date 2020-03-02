<template>
  <div
    class="m_mediaPublication"
    ref="media"
    :style="mediaStyles"
    :data-media_type="media.type"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
    @mousedown.stop="is_selected = true"
    :class="{
      'is--dragged': is_dragged,
      'is--resized': is_resized,
      'is--rotated': is_rotated,
      'is--waitingForServerResponse': is_waitingForServer,
      'is--hovered': is_hovered,
      'is--previewed': preview_mode,
      'is--overflowing': is_text_overflowing,
      'is--inline_edited': inline_edit_mode
    }"
  >
    <MediaContent
      v-if="!media.publi_meta.hasOwnProperty('type') || preview_mode"
      :context="preview_mode && mode !== 'contact_sheet' ? 'full' : 'preview'"
      :slugFolderName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      :element_width_for_sizes="mediaSize.width * pixelsPerMillimeters"
      v-model="media.content"
      :style="media.publi_meta.custom_css"
    />
    <div class="mediaContainer" v-else>
      <template v-if="media.publi_meta.type === 'text'">
        <CollaborativeEditor
          v-if="inline_edit_mode"
          v-model="htmlForEditor"
          :media="media.publi_meta"
          :slugFolderName="media.publi_meta.slugFolderName"
          ref="textField"
        />
        <div v-else class="mediaTextContent">
          <div v-if="htmlForEditor.length !== 0" v-html="htmlForEditor" />
          <p v-else v-html="'…'" />
        </div>
      </template>
    </div>
    <!-- <p class="mediaCaption">{{ media.caption }}</p> -->

    <button
      class="m_mediaPublication--overflowing_sign"
      type="button"
      v-if="media.type === 'text' && is_text_overflowing && !preview_mode"
      @mousedown.stop.prevent="setMediaHeightToContent"
      @touchstart.stop.prevent="setMediaHeightToContent"
      :content="$t('text_overflow')"
      v-tippy="{
        placement: 'top',
        delay: [600, 0]
      }"
    >
      <span>…</span>
    </button>

    <div
      class="m_mediaPublication--edit_styles"
      v-if="
        (is_selected || is_hovered || is_touch) &&
          !preview_mode &&
          show_edit_styles_window
      "
    >
      <button
        type="button"
        class="m_mediaPublication--edit_styles--helpButton"
        :content="$t('write_some_CSS_code_for_example')"
        v-tippy="{
          delay: [600, 0]
        }"
      >
        ?
      </button>
      <PrismEditor
        v-model="custom_css"
        @change="setCSSForMedia"
        language="css"
      />
    </div>

    <!-- <transition name="fade_fast" :duration="150"> -->
    <div
      v-if="
        (is_selected || is_hovered || is_touch) &&
          !preview_mode &&
          !inline_edit_mode
      "
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
      <div
        v-if="
          (is_selected || is_hovered || is_touch) &&
            !preview_mode &&
            !inline_edit_mode
        "
        class="m_mediaPublication--buttons"
      >
        <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="editZIndex(+1)"
          @touchstart.stop.prevent="editZIndex(+1)"
          :content="
            $t('move_to_foreground') + '<br>' + $t('layer:') + ' ' + mediaZIndex
          "
          v-tippy="{
            placement: 'top',
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
        </button>

        <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="editZIndex(-1)"
          @touchstart.stop.prevent="editZIndex(-1)"
          :content="
            $t('move_to_background') + '<br>' + $t('layer:') + ' ' + mediaZIndex
          "
          v-tippy="{
            placement: 'top',
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
        </button>

        <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="toggleEditWindow()"
          @touchstart.stop.prevent="toggleEditWindow()"
          :class="{ 'is--active': show_edit_styles_window }"
          :content="$t('css_settings')"
          v-tippy="{
            placement: 'top',
            delay: [600, 0]
          }"
        >
          {{ $t("css") }}
          <sup v-if="custom_css">*</sup>
        </button>

        <button
          type="button"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="editButtonClicked"
          @touchstart.stop.prevent="editButtonClicked"
          :content="
            media.slugProjectName
              ? $t('edit_original_media')
              : $t('edit_content')
          "
          v-tippy="{
            placement: 'top',
            delay: [600, 0]
          }"
        >
          <svg
            v-if="media.slugProjectName"
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="40.9px"
            height="40.9px"
            viewBox="0 0 37.9 37.9"
            style="enable-background:new 0 0 37.9 37.9;"
            xml:space="preserve"
          >
            <defs></defs>
            <g>
              <path
                d="M3,35c4,3.9,10.4,3.9,14.3,0l5.6-5.6c-0.4,0-0.9,0.1-1.4,0.1c-1.4,0-2.8-0.2-4.1-0.7l-3.2,3.2c-1.1,1.1-2.6,1.7-4.1,1.7
		c-1.6,0-3-0.6-4.1-1.7c-1.1-1.1-1.7-2.6-1.7-4.1c0-1.6,0.6-3,1.7-4.1l6.3-6.3c1.1-1.1,2.6-1.7,4.1-1.7c1.6,0,3,0.6,4.1,1.7
		c0.5,0.5,1,1.2,1.2,1.8c0.7,0,3.6-2.5,3.6-2.5c-0.5-0.8-1-1.6-1.8-2.4c-3.9-3.9-10.4-3.9-14.3,0L3,20.7C-1,24.6-1,31,3,35z"
              />
              <path
                d="M16.3,8.5c1.4,0,2.8,0.2,4.2,0.7L23.7,6c1.1-1.1,2.6-1.7,4.1-1.7c1.6,0,3,0.6,4.1,1.7c1.1,1.1,1.7,2.6,1.7,4.1
		c0,1.6-0.6,3-1.7,4.1l-6.3,6.3c-1.1,1.1-2.6,1.7-4.1,1.7c-1.6,0-3-0.6-4.1-1.7c-0.5-0.5-1-1.2-1.2-1.8c-0.7,0-1.4,0.3-1.9,0.8
		l-1.7,1.7c0.5,0.8,1,1.6,1.8,2.4c3.9,3.9,10.4,3.9,14.3,0l6.3-6.3c4-3.9,4-10.4,0-14.3C31-1,24.6-1,20.7,3L15,8.6
		C15.4,8.6,15.9,8.5,16.3,8.5L16.3,8.5L16.3,8.5z"
              />
            </g>
          </svg>

          <svg
            v-else
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
          <!-- {{ $t('edit') }} -->
        </button>
        <button
          type="button"
          class="buttonLink _no_underline"
          @click.stop.prevent="removePubliMedia()"
          :content="$t('withdraw')"
          v-tippy="{
            placement: 'top',
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
import PrismEditor from "vue-prism-editor";
import debounce from "debounce";
import CollaborativeEditor from "./CollaborativeEditor.vue";

export default {
  props: {
    media: Object,
    mode: String,
    page: Object,
    read_only: Boolean,
    preview_mode: Boolean,
    lowdef: Boolean,
    pixelsPerMillimeters: Number
  },
  components: {
    MediaContent,
    PrismEditor,
    CollaborativeEditor
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

      inline_edit_mode: false,

      custom_css: this.media.publi_meta.hasOwnProperty("custom_css")
        ? this.media.publi_meta.custom_css
        : "",
      show_edit_styles_window: false,

      limit_media_to_page: true,
      htmlForEditor: this.media.publi_meta.content
        ? this.media.publi_meta.content
        : "",

      mediaID: `${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      )}`,

      dragOffset: {
        x: 0,
        y: 0
      },
      mediaPos: {
        x: 0,
        y: 0,
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
      debounce_setCSSForMedia: undefined,

      mediaSize: {
        width: 0,
        height: 0,
        pwidth: 0,
        pheight: 0
      },

      mediaZIndex: 0
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
        console.log(`WATCH • MediaPublication: is_selected`);
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
        transform: translate(${this.mediaPos.x}mm, ${this.mediaPos.y}mm) rotate(${this.rotate}deg);
        width: ${this.mediaSize.width}mm;
        height: ${this.mediaSize.height}mm;
        z-index: ${this.mediaZIndex};
      `;
      return mediaStyles;
    }
    // text_is_overflowing() {
    //   const el = this.$refs.media;
    //   return (el.offsetHeight + 15 < el.scrollHeight);
    // }
  },
  methods: {
    newMediaSelected(mediaID) {
      if (mediaID !== this.mediaID) {
        this.is_selected = false;
      }
    },
    editButtonClicked() {
      if (this.media.slugProjectName)
        this.$root.openMedia({
          slugProjectName: this.media.slugProjectName,
          metaFileName: this.media.metaFileName
        });
      else this.inline_edit_mode = true;
    },
    editZIndex(val) {
      this.updateMediaPubliMeta({
        z_index: this.mediaZIndex + val
      });
    },
    setMediaHeightToContent() {
      const el = this.$refs.media;
      let contentHeight =
        el.firstElementChild.firstElementChild.firstElementChild.offsetHeight;
      contentHeight = contentHeight / this.pixelsPerMillimeters;
      if (this.page.snap_to_grid) {
        contentHeight += this.page.gridstep;
      }
      contentHeight = this.roundMediaVal(contentHeight);
      contentHeight = this.limitMediaHeight(contentHeight);
      this.mediaSize.height = contentHeight;

      this.updateMediaPubliMeta({
        height: this.mediaSize.height
      });
    },
    toggleEditWindow() {
      this.show_edit_styles_window = !this.show_edit_styles_window;
    },
    setCSSForMedia(event) {
      if (this.debounce_setCSSForMedia)
        clearTimeout(this.debounce_setCSSForMedia);
      this.debounce_setCSSForMedia = setTimeout(() => {
        const val = {
          custom_css: this.custom_css
        };
        this.$emit("editPubliMedia", {
          slugMediaName: this.media.publi_meta.metaFileName,
          val
        });
      }, 500);
    },
    updateMediaStyles() {
      this.rotate = this.media.publi_meta.hasOwnProperty("rotate")
        ? this.media.publi_meta.rotate
        : 0;
      this.mediaSize.width =
        this.media.publi_meta.hasOwnProperty("width") &&
        !!Number.parseInt(this.media.publi_meta.width)
          ? this.limitMediaWidth(Number.parseInt(this.media.publi_meta.width))
          : 100;
      this.mediaSize.height =
        this.media.publi_meta.hasOwnProperty("height") &&
        !!Number.parseInt(this.media.publi_meta.height)
          ? this.limitMediaHeight(Number.parseInt(this.media.publi_meta.height))
          : 100;
      this.mediaPos.x =
        this.media.publi_meta.hasOwnProperty("x") &&
        !!Number.parseInt(this.media.publi_meta.x)
          ? this.limitMediaXPos(Number.parseInt(this.media.publi_meta.x))
          : this.page.margin_left;
      this.mediaPos.y =
        this.media.publi_meta.hasOwnProperty("y") &&
        !!Number.parseInt(this.media.publi_meta.y)
          ? this.limitMediaYPos(Number.parseInt(this.media.publi_meta.y))
          : this.page.margin_top;
      this.custom_css = this.media.publi_meta.hasOwnProperty("custom_css")
        ? this.media.publi_meta.custom_css
        : this.custom_css;
      this.mediaZIndex = this.media.publi_meta.hasOwnProperty("z_index")
        ? this.media.publi_meta.z_index
        : 0;

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
        console.log(`METHODS • MediaPublication: updateMediaPubliMeta`);
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
      //   console.log(`METHODS • MediaPublication: limitMediaXPos / xPos = ${xPos}`);
      // }
      return Math.max(
        this.page.margin_left,
        Math.min(
          this.page.width - this.page.margin_right - this.mediaSize.width,
          xPos
        )
      );
    },
    roundMediaVal(val) {
      if (this.page.snap_to_grid) {
        return Math.round(val / this.page.gridstep) * this.page.gridstep;
      }
      return +val.toFixed(1);
    },

    limitMediaYPos(yPos) {
      if (!this.limit_media_to_page) {
        return yPos;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaYPos / yPos = ${yPos}`);
      // }
      yPos = Math.max(
        this.page.margin_top,
        Math.min(
          this.page.height - this.page.margin_bottom - this.mediaSize.height,
          yPos
        )
      );
      return yPos;
    },

    limitMediaWidth(w) {
      if (!this.limit_media_to_page) {
        return w;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaWidth / w = ${w}`);
      // }
      return Math.max(
        20,
        Math.min(this.page.width - this.page.margin_right - this.mediaPos.x, w)
      );
    },
    limitMediaHeight(h) {
      if (!this.limit_media_to_page) {
        return h;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaHeight / h = ${h}`);
      // }
      return Math.max(
        20,
        Math.min(
          this.page.height - this.page.margin_bottom - this.mediaPos.y,
          h
        )
      );
    },

    removePubliMedia() {
      this.$emit("removePubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName
      });
    },
    resizeMedia(type, origin) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: resizeMedia with is_resized = ${this.is_resized}`
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
          `METHODS • MediaPublication: rotateMedia with is_resized = ${this.is_resized}`
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
          `METHODS • MediaPublication: resizeMove with is_resized = ${this.is_resized}`
        );
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_resized) {
        this.is_resized = true;
        this.is_selected = true;
        this.resizeOffset.x = pageX_mm;
        this.resizeOffset.y = pageY_mm;
        this.mediaSize.pwidth = Number.parseInt(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseInt(this.mediaSize.height);
      } else {
        const deltaX =
          (pageX_mm - this.resizeOffset.x) / this.$root.settings.publi_zoom;
        let newWidth = this.mediaSize.pwidth + deltaX;
        this.mediaSize.width = this.limitMediaWidth(newWidth);

        const deltaY =
          (pageY_mm - this.resizeOffset.y) / this.$root.settings.publi_zoom;
        let newHeight = this.mediaSize.pheight + deltaY;
        this.mediaSize.height = this.limitMediaHeight(newHeight);
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: resizeUp with is_resized = ${this.is_resized}`
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
          `METHODS • MediaPublication: rotateMove with is_rotated = ${this.is_rotated}`
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
          `METHODS • MediaPublication: rotateUp with is_rotated = ${this.is_rotated}`
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
          `METHODS • MediaPublication: dragMedia with is_dragged = ${this.is_dragged}`
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
          `METHODS • MediaPublication: dragMove with is_dragged = ${this.is_dragged}`
        );
      }

      const pageX = !!event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = !!event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_dragged) {
        this.is_dragged = true;
        this.is_selected = true;

        this.dragOffset.x = pageX_mm;
        this.dragOffset.y = pageY_mm;

        this.mediaPos.px = Number.parseInt(this.mediaPos.x);
        this.mediaPos.py = Number.parseInt(this.mediaPos.y);
      } else {
        const deltaX =
          (pageX_mm - this.dragOffset.x) / this.$root.settings.publi_zoom;
        let newX = this.mediaPos.px + deltaX;
        this.mediaPos.x = this.limitMediaXPos(newX);

        const deltaY =
          (pageY_mm - this.dragOffset.y) / this.$root.settings.publi_zoom;
        let newY = this.mediaPos.py + deltaY;
        this.mediaPos.y = this.limitMediaYPos(newY);
      }
    },
    dragUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: dragUp with is_dragged = ${this.is_dragged}`
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
    deselectMedia(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaPublication: deselectMedia`);
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
<style></style>
