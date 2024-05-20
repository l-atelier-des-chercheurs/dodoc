<template>
  <div class="_agoraExport" :data-autoscroll="publication.autoscroll === true">
    <div class="_agoraExport--items" ref="agoraView" @scroll="onScroll">
      <div class="_item--content _firstEmptySlide" />
      <div
        v-for="(agoramodule, index) in section_modules_list"
        :key="agoramodule.$path"
        :data-modulepath="agoramodule.$path"
        class="_item"
        :style="slide_styles"
      >
        <transition name="fade" mode="out-in">
          <div
            class="_item--content"
            v-if="
              index >
              currently_shown_module_index -
                number_of_modules_to_keep_visible_at_once
            "
            :style="slideRandomLayout(index)"
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
    <div class="_agoraExport--bottom">
      <div class="_progressBar">
        <button
          type="button"
          v-for="(agoramodule, index) in section_modules_list"
          :data-alreadyshown="index <= currently_shown_module_index"
          :key="agoramodule.$path"
          @click="updateCurrentSlide(index)"
        />
      </div>

      <!-- <transition name="fade" mode="out-in"> -->
      <div class="_keywords">
        <KeywordsField
          v-if="currently_shown_module && currently_shown_module.keywords"
          :key="currently_shown_module.$path"
          :field_name="'keywords'"
          :keywords="currently_shown_module.keywords"
          :can_edit="false"
        />
      </div>
      <!-- </transition> -->
    </div>
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

      number_of_different_layouts: 10,
      slide_margins: 20,

      slide_to_show: 0,
      random_layouts_options: [],

      all_layouts: [
        {
          w: 54,
          h: 54,
          ml: 30,
          mt: 40,
        },
        {
          w: 60,
          h: 30,
          ml: 10,
          mt: 25,
        },
        {
          w: 50,
          h: 40,
          ml: 0,
          mt: 60,
        },
        {
          w: 50,
          h: 40,
          ml: 50,
          mt: 0,
        },
        {
          w: 60,
          h: 80,
          ml: 5,
          mt: 20,
        },
        {
          w: 80,
          h: 40,
          ml: 10,
          mt: 50,
        },
        {
          w: 100,
          h: 50,
          ml: 0,
          mt: 50,
        },
      ],
    };
  },
  created() {
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

    if (this.publication.autoscroll === true) {
      this.startAutomaticScroll();
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
    section_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.first_section,
      }).map(({ _module }) => _module);
    },
    currently_shown_module_index() {
      // 0 to 0.1 --> 0
      // 0.1 to 1.1 --> 1
      // 1.1 to 2.1 --> 2
      return Math.ceil(this.scroll_y / this.scroll_height - 0.1);
    },
    currently_shown_module() {
      return this.section_modules_list[this.currently_shown_module_index];
    },
    slide_styles() {
      return {
        "--slide-margin": this.slide_margins + "px",
        "--slide-width": this.window_width - this.slide_margins * 2 + "px",
        "--slide-height": this.window_height - this.slide_margins * 2 + "px",
      };
    },
  },
  methods: {
    onResize() {
      if (this.$refs.agoraView)
        this.scroll_height = this.$refs.agoraView.offsetHeight;
      this.window_width = window.innerWidth;
      this.window_height = window.innerHeight;
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
    slideRandomLayout(index) {
      const layout_index =
        this.random_layouts_options[index % this.random_layouts_options.length];
      const layout = this.all_layouts[layout_index];
      // return {
      //   width: `${layout.w}%`,
      //   height: `${layout.h}%`,
      //   marginLeft: `${layout.ml}%`,
      //   marginTop: `${layout.mt}%`,
      // };
      return {
        width: `calc(var(--slide-width) * ${layout.w / 100})`,
        height: `calc(var(--slide-height) * ${layout.h / 100})`,
        marginLeft: `calc(var(--slide-width) * ${layout.ml / 100})`,
        marginTop: `calc(var(--slide-height) * ${layout.mt / 100})`,
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
      this.scroll_y = e.target.scrollTop;
    },
    async startAutomaticScroll() {
      console.log("showing slide", this.slide_to_show);

      this.slide_to_show += 1;
      const animation_duration = 1000;

      await new Promise((resolve) => setTimeout(resolve, animation_duration));

      this.stopAllVideos();
      this.autoPlayVideo(this.slide_to_show);

      const keep_showing_slide_for =
        this.section_modules_list[this.slide_to_show]?.duration * 1000 || 5000;
      await new Promise((resolve) =>
        setTimeout(resolve, keep_showing_slide_for)
      );

      if (this.slide_to_show < this.section_modules_list.length) {
        this.startAutomaticScroll();
      } else {
        console.log("Last slide");
        this.slide_to_show = 0;
        this.startAutomaticScroll();
      }
    },
    autoPlayVideo(slide_index) {
      if (this.section_modules_list?.[slide_index]?.$path) return;
      const module_element = this.$el.querySelector(
        `[data-modulepath="${this.section_modules_list[slide_index].$path}"]`
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
  &[data-autoscroll="false"] {
    scroll-snap-type: y mandatory;
  }
}
._agoraExport--items {
  height: 100vh;
  overflow-y: scroll;
  padding: var(--slide-margin);
}
._agoraExport--bottom {
  position: absolute;
  padding: calc(var(--spacing) / 2);
  background-color: rgba(255, 255, 255, 0.3);
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

  ::v-deep {
    .u-keywords {
      font-size: 1.1rem;
    }
  }
}

._item {
  position: sticky;
  top: 0;
  scroll-snap-align: center;

  padding: var(--slide-margin);
  width: calc(var(--slide-width) + var(--slide-margin) * 2);
  height: calc(var(--slide-height) + var(--slide-margin) * 2);

  // background-color: rgba(0, 0, 0, 0.3);
  // backdrop-filter: blur(2px);
  overflow: hidden;

  ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    .plyr--video,
    .plyr__poster {
      width: 100%;
      height: auto;
      filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.35));
    }

    ._mediaContent--image,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: contain;
      background-size: contain;
      filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.35));
    }
  }
}
._item--content {
  width: 100%;
  height: 100%;
  // background-color: rgba(0, 255, 0, 0.3);
  overflow: visible;
  display: flex;
  align-items: center;
}

.slideupkeywords {
  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    transition: all 1s ease-in-out;
  }
  &-enter,
  &-leave-to {
    transform: translateY(100%);
    transition: all 1s ease-in-out;
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
._keywords {
  height: 4rem;
}
</style>
