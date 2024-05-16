<template>
  <div class="_agoraExport">
    <div class="_agoraExport--items" ref="agoraView" @scroll="onScroll">
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
            :data-layout="getRandomLayout(index)"
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

      slide_to_show: 0,
      random_layouts_options: [],
    };
  },
  created() {
    this.random_layouts_options = this.fillWithRandoms({
      items: 100,
      number_of_different_layouts: 10,
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.onResize();
    });
    window.addEventListener("resize", this.onResize);

    if (this.publication.autoscroll === true) {
      this.$nextTick(() => {
        this.startAutomaticScroll();
      });
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
      this.$refs.agoraView.scrollTop = this.slide_to_show * window.innerHeight;
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
        "--slide-width": this.window_width + "px",
        "--slide-height": this.window_height + "px",
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
    getRandomLayout(index) {
      // return 4;
      return this.random_layouts_options[
        index % this.random_layouts_options.length
      ];
    },
    fillWithRandoms({ items, number_of_different_layouts }) {
      let previous_value;

      return new Array(items).fill(1).map((_, index) => {
        // previously generated value

        function generate_value() {
          return Math.floor(Math.random() * number_of_different_layouts) + 1;
        }

        let rnd = generate_value();
        while (rnd === previous_value) {
          rnd = generate_value();
        }
        previous_value = rnd;
        return rnd;
      });
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
      this.slide_to_show = slide_index;
    },
    onScroll(e) {
      this.scroll_y = e.target.scrollTop;
    },
    startAutomaticScroll() {
      console.log("showing slide", this.slide_to_show);

      const animation_duration = 1000;
      const keep_showing_slide_for =
        this.section_modules_list[this.slide_to_show].duration * 1000 +
        animation_duration;

      setTimeout(() => {
        const module_element = this.$el.querySelector(
          `[data-modulepath="${
            this.section_modules_list[this.slide_to_show].$path
          }"]`
        );
        const video_el = module_element.querySelector("video");
        if (video_el) {
          video_el.muted = true;
          const play_btn = module_element.querySelector("[data-plyr='play']");
          if (play_btn) play_btn.click();
        }
      }, animation_duration);

      setTimeout(() => {
        this.slide_to_show += 1;
        if (this.slide_to_show < this.section_modules_list.length) {
          this.startAutomaticScroll();
        } else {
          console.log("Last slide");
        }
      }, keep_showing_slide_for);
    },
  },
};
</script>
<style lang="scss" scoped>
._agoraExport {
}
._agoraExport--items {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
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
  align-items: center;

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

  width: var(--slide-width, 100%);
  height: var(--slide-height, 100%);

  // background-color: rgba(0, 0, 0, 0.3);
  // backdrop-filter: blur(2px);
  overflow: hidden;

  ::v-deep ._mediaContent {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
    }

    ._mediaContent--image,
    .plyr--video,
    .plyr__poster,
    ._mediaContent--iframe,
    ._iframeStylePreview {
      position: absolute;
      height: 100%;
      width: 100%;
      object-fit: contain;
      background-size: contain;
    }
  }
}
._item--content {
  width: 100%;
  height: 100%;
  padding: 1cm;

  // background-color: rgba(0, 255, 0, 0.3);
  // > * {
  //   display: none;
  // }

  &[data-layout="1"] {
    width: calc(var(--slide-width) * 0.6666);
    height: calc(var(--slide-height) * 0.6666);
  }
  &[data-layout="2"] {
    width: calc(var(--slide-width) * 0.6666);
    height: calc(var(--slide-height) * 0.6666);
    margin-left: calc(var(--slide-width) * 0.3334);
  }
  &[data-layout="3"] {
    width: calc(var(--slide-width) * 0.6666);
    height: calc(var(--slide-height) * 0.6666);
    margin-top: calc(var(--slide-height) * 0.3334);
  }
  &[data-layout="4"] {
    width: calc(var(--slide-width) * 0.6666);
    height: calc(var(--slide-height) * 0.6666);
    margin-top: calc(var(--slide-height) * 0.3334);
    margin-left: 33.34%;
  }
  &[data-layout="5"] {
    width: 50%;
    height: 50%;
    margin-top: 25%;
    margin-left: 25%;
  }
  &[data-layout="6"] {
    width: 50%;
    height: 50%;
    margin-top: 0;
    margin-left: 25%;
  }
  &[data-layout="7"] {
    width: 50%;
    height: 50%;
    margin-top: 0;
    margin-left: 50%;
  }
  &[data-layout="8"] {
    width: 50%;
    height: 50%;
    margin-top: 0;
    margin-left: 0;
  }
  &[data-layout="9"] {
    width: 50%;
    height: 50%;
    margin-top: 25%;
    margin-left: 50%;
  }
  &[data-layout="10"] {
    width: 50%;
    height: 50%;
    margin-top: 25%;
    margin-left: 0%;
  }
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
