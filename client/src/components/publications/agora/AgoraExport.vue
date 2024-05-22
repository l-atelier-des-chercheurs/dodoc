<template>
  <div class="_agoraExport" :data-autoscroll="is_autoscroll === true">
    <div class="_agoraExport--items" ref="agoraView" @scroll="onScroll">
      <div class="_item">
        <div class="_item--content _firstEmptySlide">
          <transition name="fade" mode="out-in">
            <button
              v-if="currently_shown_module_index === -1"
              class="u-button u-button_icon"
              @click="slide_to_show = 1"
            >
              <b-icon icon="arrow-down" />
            </button>
          </transition>
        </div>
      </div>
      <div
        v-for="(agoramodule, index) in section_modules_list"
        :key="agoramodule.$path"
        :data-modulepath="agoramodule.$path"
        :data-iscurrent="index === currently_shown_module_index"
        :data-stickied="index < currently_shown_module_index"
        class="_item"
      >
        <transition name="fade" mode="out-in">
          <div
            class="_item--content"
            v-if="
              index >
              currently_shown_module_index -
                number_of_modules_to_keep_visible_at_once
            "
            :style="
              slideRandomLayout(
                index,
                getFirstSourceMedia(agoramodule.source_medias)
              )
            "
          >
            <template v-if="getFirstSourceMedia(agoramodule.source_medias)">
              <MediaContent
                :file="getFirstSourceMedia(agoramodule.source_medias)"
                :resolution="1600"
                :context="'full'"
                :show_fs_button="false"
              />
            </template>
            <template v-else>
              <div>Erreur au chargement du média</div>
            </template>
          </div>
        </transition>
      </div>
    </div>
    <transition name="showkeywords" mode="out-in">
      <div
        class="_agoraExport--bottom"
        v-if="currently_shown_module && currently_shown_module.keywords"
        :key="currently_shown_module.$path"
      >
        <!-- <div class="_progressBar" v-if="false">
          <button
            type="button"
            v-for="(agoramodule, index) in section_modules_list"
            :data-alreadyshown="index <= currently_shown_module_index"
            :key="agoramodule.$path"
            @click="updateCurrentSlide(index)"
          />
        </div> -->

        <div class="_keywords">
          <KeywordsField
            :field_name="'keywords'"
            :keywords="currently_shown_module.keywords"
            :can_edit="false"
          />
        </div>
      </div>
    </transition>

    <div
      class="_scrollIndicator"
      :style="{
        '--scroll-progress': scroll_y / scroll_height,
      }"
    />
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";
import { scrollToY } from "@/utils/scrollToY.js";

export default {
  props: {
    publication: Object,
  },
  components: {
    KeywordsField,
  },
  data() {
    return {
      scroll_y: 0,
      scroll_height: undefined,

      window_width: undefined,
      window_height: undefined,
      number_of_modules_to_keep_visible_at_once: 8,

      restart_autoscroll_on_end: true,

      number_of_different_layouts: 10,
      left_right_margin: 40,
      top_margin: 40,
      bottom_margin: 140,

      slide_to_show: 0,
      random_layouts_options: [],

      all_layouts: [
        {
          w: 70,
        },
        {
          w: 64,
        },
        {
          w: 60,
        },
        {
          w: 80,
        },
        {
          w: 100,
        },
      ],
    };
  },
  created() {
    this.all_layouts = this.all_layouts.map((layout) => ({
      ...layout,
      rnd: Math.random(),
    }));
    this.random_layouts_options = this.fillWithRandoms({
      items: 100,
      number_of_different_layouts: this.all_layouts.length,
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.onResize();
    });
    window.addEventListener("resize", this.onResize);

    if (this.is_autoscroll === true) {
      setTimeout(() => {
        this.startAutomaticScroll();
      }, 1000);
    }

    // scroll to top on reload to prevent scroll reload
    if (history.scrollRestoration) {
      history.scrollRestoration = "manual";
    } else {
      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      };
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  watch: {
    slide_to_show() {
      scrollToY(
        this.$refs.agoraView,
        this.slide_to_show * window.innerHeight,
        400
      );
    },
  },
  computed: {
    first_section() {
      const sections = this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      });
      return sections[0];
    },
    is_autoscroll() {
      return this.$route.query?.scroll === "auto";
    },
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
    currently_shown_module_index() {
      return Math.floor(this.scroll_y / this.window_height - 0.1);
    },
    currently_shown_module() {
      return this.section_modules_list[this.currently_shown_module_index];
    },
  },
  methods: {
    onResize() {
      this.window_width = window.innerWidth;
      this.window_height = window.innerHeight;
      // account for empty slides at the top
      this.scroll_height =
        this.window_height * this.section_modules_list.length;
      this.onScroll();
    },
    fillWithRandoms({ items, number_of_different_layouts }) {
      let randoms = [];

      while (randoms.length < items) {
        const first_bag = new Array(number_of_different_layouts)
          .fill(1)
          .map((_, index) => index)
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);
        randoms = randoms.concat(first_bag);
      }

      return randoms;
    },
    slideRandomLayout(index, source_media) {
      if (!source_media) return;

      const layout_index =
        this.random_layouts_options[index % this.random_layouts_options.length];
      const layout = this.all_layouts[layout_index];

      // get width
      const ratio = source_media.$infos?.ratio || 1;

      const slide_container_width =
        this.window_width - this.left_right_margin * 2;
      const slide_container_height =
        this.window_height - this.bottom_margin - this.top_margin;

      let width = (layout.w / 100) * slide_container_width;
      let height = width * ratio;

      if (height > slide_container_height) {
        height = slide_container_height;
        width = height / ratio;
      }

      const marginTop =
        Math.round((slide_container_height - height) * layout.rnd) +
        this.top_margin;
      const marginLeft =
        Math.round((slide_container_width - width) * layout.rnd) +
        this.left_right_margin;

      return {
        "--ratio": ratio,
        "--rnd": layout.rnd,
        width: width + "px",
        height: height + "px",
        marginTop: marginTop + "px",
        marginLeft: marginLeft + "px",
      };
    },

    getFirstSourceMedia(source_medias) {
      const first_source_media = source_medias[0];
      if (!first_source_media) return false;
      return this.getSourceMedia({
        source_media: {
          meta_filename: first_source_media.meta_filename,
        },
        folder_path: this.publication.$path,
      });
    },
    updateCurrentSlide(slide_index) {
      const targetPosition = slide_index * window.innerHeight;
      scrollToY(this.$refs.agoraView, targetPosition, 2000);
    },
    onScroll(e) {
      this.scroll_y = this.$refs.agoraView.scrollTop;
    },
    async startAutomaticScroll() {
      console.log("showing slide number", this.slide_to_show);

      this.slide_to_show += 1;
      const animation_duration = 1000;

      await new Promise((resolve) => setTimeout(resolve, animation_duration));

      this.stopAllVideos();
      this.autoPlayVideo(this.slide_to_show);

      const keep_showing_slide_for =
        this.section_modules_list[this.slide_to_show]?.duration * 1000 || 5000;

      console.log("will show slide for", keep_showing_slide_for, "ms");

      await new Promise((resolve) =>
        setTimeout(resolve, keep_showing_slide_for)
      );

      if (this.slide_to_show < this.section_modules_list.length) {
        this.startAutomaticScroll();
      } else {
        console.log("Last slide");
        if (this.restart_autoscroll_on_end) {
          this.slide_to_show = 0;
          await new Promise((resolve) =>
            setTimeout(resolve, animation_duration)
          );
          this.startAutomaticScroll();
        }
      }
    },
    autoPlayVideo(slide_index) {
      const slide_path = this.section_modules_list[slide_index - 1]?.$path;
      if (!slide_path) return;

      const module_element = this.$el.querySelector(
        `[data-modulepath="${slide_path}"]`
      );

      const video_el = module_element.querySelector("video");

      if (video_el) {
        video_el.muted = true;
        const play_btn = module_element.querySelector("[data-plyr='play']");
        if (play_btn) play_btn.click();
      }
    },
    stopAllVideos() {
      this.$el.querySelectorAll("video").forEach((video_el) => {
        video_el.pause();
        video_el.currentTime = 0;
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._agoraExport {
  &:not([data-autoscroll="true"]) {
    scroll-snap-type: y mandatory;
  }
  &[data-autoscroll="true"] ._agoraExport--items {
    overflow-y: hidden;

    ::v-deep [data-plyr="play"] {
      opacity: 0;
    }
  }
}
._agoraExport--items {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
}
._agoraExport--bottom {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
  // mask-image: linear-gradient(
  //   to top,
  //   white 0%,
  //   white calc(100% - calc(var(--spacing) * 2)),
  //   transparent 100%
  // );
  // background: white;
  bottom: 0;
  width: 100%;
  overflow: hidden;

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);

  ._keywords {
    padding: calc(var(--spacing) / 2);
    padding: 1vmin 3vmin 3vmin 3vmin;
  }

  ::v-deep {
    .u-keywords {
      font-size: 2vw;
      gap: 0.5vw;
    }
  }
}

._item {
  position: sticky;
  top: 0;
  scroll-snap-align: center;

  width: 100%;
  height: 100%;
  pointer-events: none;
  // backdrop-filter: blur(1px);
  overflow: hidden;

  transition: all 0.6s ease-in-out;

  &[data-stickied="true"] {
    background-color: rgba(255, 255, 255, 0.2);
  }

  ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    .plyr--video,
    .plyr__poster {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.55));
    }

    ._mediaContent--image,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: contain;
      background-size: contain;
      filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.55));
    }
  }
}
._item--content {
  width: 100%;
  height: 100%;
  pointer-events: auto;
  overflow: visible;

  &._firstEmptySlide {
    display: flex;
    align-items: flex-end;
    justify-content: center;

    padding: calc(var(--spacing) / 1);
  }
}

.showkeywords {
  &-enter-active,
  &-leave-active {
    // transform: translateY(0);
    transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    // transform: translateY(100%);
    opacity: 0;
    transition: all 1s cubic-bezier(0.19, 1, 0.22, 1);
  }
}

._progressBar {
  width: 100%;
  height: 15px;
  display: flex;
  align-items: center;
  justify-content: space-around;

  > button {
    width: 20px;
    height: 20px;
    padding: 5px;
    background: transparent;
    display: block;

    // disable for now because of scrolling back up because of stickies (!)
    pointer-events: none;

    &::before {
      content: "";
      display: block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: transparent;

      transition: all 0.3s ease-in-out;
    }

    &[data-alreadyshown="true"]::before {
      background: black;
    }
  }
}

._scrollIndicator {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  width: max(1vw, 10px);
  height: 100%;
  pointer-events: none;

  background-color: white;

  padding: 3px;

  &::before {
    content: "";
    display: block;
    width: 100%;
    height: calc(var(--scroll-progress) * 100%);
    background: var(--h-500);
  }
}
</style>
