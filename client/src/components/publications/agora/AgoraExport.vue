<template>
  <div class="_agoraExport" :data-autoscroll="publication.autoscroll === true">
    <div class="_agoraExport--items" ref="agoraView" @scroll="onScroll">
      <div class="_item _firstEmptySlide" />
      <div
        v-for="(agoramodule, index) in section_modules_list"
        :key="agoramodule.$path"
        :data-modulepath="agoramodule.$path"
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
    <div class="_agoraExport--bottom">
      <div class="_progressBar" v-if="false">
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

      restart_autoscroll_on_end: false,

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
    slide_container_width() {
      return this.window_width;
    },
    slide_container_height() {
      return this.window_height;
    },

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
      return this.slide_to_show - 1;
    },
    currently_shown_module() {
      return this.section_modules_list[this.currently_shown_module_index];
    },
  },
  methods: {
    onResize() {
      if (this.$refs.agoraView)
        this.scroll_height =
          this.$refs.agoraView.offsetHeight * this.section_modules_list.length;
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
    slideRandomLayout(index, source_media) {
      if (!source_media) return;

      const layout_index =
        this.random_layouts_options[index % this.random_layouts_options.length];
      const layout = this.all_layouts[layout_index];

      // get width
      const ratio = source_media.$infos?.ratio || 1;

      const width = (layout.w / 100) * this.slide_container_width;
      const height = width * ratio;
      const marginTop = Math.round(
        (this.slide_container_height - height) * layout.rnd
      );
      const marginLeft = Math.round(
        (this.slide_container_width - width) * layout.rnd
      );

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
  &[data-autoscroll="false"] {
    scroll-snap-type: y mandatory;
  }
}
._agoraExport--items {
  height: 100vh;
  overflow-y: hidden;
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

  width: 100%;
  height: 100%;

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

    [data-plyr="play"] {
      opacity: 0;
    }
  }
}
._item--content {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 255, 0, 0.3);
  overflow: visible;
  // display: flex;
  // align-items: center;
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

._scrollIndicator {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  width: 10px;
  height: calc(var(--scroll-progress) * 100%);
  pointer-events: none;

  padding: 3px;

  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    background: var(--h-500);
  }
}
</style>
