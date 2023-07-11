<template>
  <div class="_mediaModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />

    <button
      type="button"
      class="u-button u-button_transparent _navBtn _closeButton"
      @click="$emit('close')"
    >
      <img
        :src="`${$root.publicPath}images/i_close_sansfond.svg`"
        width="2rem"
        height="2rem"
        class=""
      />
    </button>
    <div class="_mediaModal--content">
      <div class="_preview">
        <!-- <DebugBtn :content="file" /> -->
        <MediaContent
          :file="file"
          :is_draggable="false"
          :autoload="false"
          :resolution="1600"
          :context="'full'"
        />
      </div>
      <div class="_meta" v-if="!select_mode">
        <div class="u-spacingBottom">
          <h3>{{ $t("informations") }}</h3>
          <small class="fieldCaption">{{ file.$media_filename }}</small>
        </div>
        <div class="u-mediaOptions u-spacingBottom">
          <div>
            <DownloadFile :file="file">
              <sl-icon name="file-earmark-arrow-down" />
              {{ $t("download") }}
            </DownloadFile>
          </div>
          <div class="">
            <DuplicateMedia :path="file.$path" @close="$emit('close')" />
          </div>

          <RemoveMenu
            :remove_text="$t('remove_media')"
            @remove="$emit('remove')"
          />
        </div>

        <div class="u-spacingBottom">
          <TitleField
            :label="$t('caption')"
            :field_name="'caption'"
            :content="file.caption"
            :path="file.$path"
            :input_type="'markdown'"
            :can_edit="true"
          />
        </div>

        <div>
          <DateDisplay
            :title="$t('date_uploaded')"
            :date="file.$date_uploaded"
          />
          <DateDisplay
            :title="$t('date_modified')"
            :date="file.$date_modified"
          />
        </div>
      </div>
      <div class="_selectBtn" v-else>
        <button
          type="button"
          class="u-buttonLink has--whitebg"
          @click="$emit('close')"
        >
          {{ $t("cancel") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="$emit('select')"
        >
          {{ $t("add") }}
        </button>
      </div>
    </div>

    <transition name="scaleInFade" mode="out-in">
      <div class="_navBtns" v-if="position_in_list !== 'alone' && show_nav_btn">
        <span>
          <button
            type="button"
            class="u-button u-button_transparent _navBtn _leftArrow"
            v-if="position_in_list !== 'first'"
            @click="$emit('prevMedia')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
              <path
                d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
                style="fill: var(--c-noir)"
              />
            </svg>
          </button>
        </span>
        <span>
          <button
            type="button"
            class="u-button u-button_transparent _navBtn _rightArrow"
            v-show="position_in_list !== 'last'"
            @click="$emit('nextMedia')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
              <path
                d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
                style="fill: #353535"
              />
            </svg>
          </button>
        </span>
      </div>
    </transition>
  </div>
</template>
<script>
import DuplicateMedia from "@/components/DuplicateMedia.vue";

export default {
  props: {
    file: Object,
    project_path: String,
    select_mode: String,
    position_in_list: String,
  },
  components: {
    DuplicateMedia,
  },
  data() {
    return {
      show_nav_btn: false,
    };
  },
  created() {},
  mounted() {
    window.addEventListener("keyup", this.handleKeyPress);
    setTimeout(() => {
      this.show_nav_btn = true;
    }, 200);
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
  },
  watch: {},
  computed: {},
  methods: {
    handleKeyPress(event) {
      if (
        this.$root.modal_is_opened ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable")
      )
        return;

      if (event.key === "Escape") this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaModal {
  position: absolute;
  overflow: hidden;
  inset: 0;
  z-index: 10;
  // padding: calc(var(--spacing) / 2);

  ._mediaModal--overlay {
    background: var(--c-orange);
    position: absolute;
    inset: 0;
    opacity: 0.6;
    cursor: pointer;
  }

  ._mediaModal--content {
    background: var(--c-noir);
    // border-radius: var(--border-radius);
    // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  ._navBtn {
    padding: calc(var(--spacing) / 2);
    background: rgba(255, 255, 255, 0.25);
    pointer-events: auto;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &:hover,
    &:focus {
      background: rgba(255, 255, 255, 1);
    }
  }

  ::v-deep {
    ._mediaContent {
      // position: absolute;
      // width: 100%;
      // height: 100%;
      // pointer-events: auto;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;

      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }
}

._meta {
  // margin: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  // border-radius: var(--panel-radius);
}

._selectBtn {
  display: flex;
  place-items: center;
  justify-content: center;
  width: 100%;
  gap: calc(var(--spacing) / 1);

  position: absolute;
  bottom: 0;
  left: 0;
  background: none;
  margin: calc(var(--spacing) / 1);
}

._mediaModal--content {
  position: relative;
  height: calc(100% - 4px);
  width: calc(100% - 4px);
  margin-top: 2px;
  margin-left: 2px;
  display: flex;
  flex-flow: row wrap;

  > * {
    &._preview {
      position: relative;
      flex: 10 1 320px;
      color: white;
      min-height: 50vh;

      // height: 50%;
    }
    &._meta {
      background: white;
      flex: 1 0 240px;
    }
  }
}

._closeButton {
  position: absolute;
  z-index: 10000;
  top: 0em;
  right: 0em;
  // color: currentColor;
  // font-size: 200%;
  // background: rgba(255, 255, 255, 0.25);
  // border-radius: 50%;

  padding: calc(var(--spacing) / 4);
  margin: 0;

  img {
    width: 2rem;
    height: 2rem;
  }

  &::part(base) {
    color: currentColor;
  }

  &:not(:hover) {
    margin-top: -10px;
    margin-right: -10px;
  }
}

._navBtns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding-bottom: calc(var(--spacing) * 5);
  pointer-events: none;

  display: flex;
  justify-content: space-between;
  align-items: center;

  ._leftArrow {
    &:not(:hover) {
      margin-left: -10px;
    }
  }

  ._rightArrow {
    &:not(:hover) {
      margin-right: -10px;
    }
  }
}
</style>
