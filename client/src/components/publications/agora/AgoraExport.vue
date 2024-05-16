<template>
  <div class="_agoraExport">
    <div class="_agoraExport--items" ref="agoraView" @scroll="onScroll">
      <div
        v-for="agoramodule in section_modules_list"
        :key="agoramodule.$path"
        :data-modulepath="agoramodule.$path"
        class="_item"
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
    </div>
    <div class="_agoraExport--bottom">
      <transition name="fade" mode="out-in">
        <div
          v-if="currently_shown_module && currently_shown_module.keywords"
          :key="currently_shown_module.$path"
        >
          <KeywordsField
            :field_name="'keywords'"
            :keywords="currently_shown_module.keywords"
            :can_edit="false"
          />
        </div>
      </transition>
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
    };
  },
  created() {},
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
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  watch: {},
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
  },
  methods: {
    onResize() {
      if (this.$refs.agoraView)
        this.scroll_height = this.$refs.agoraView.offsetHeight;
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
    onScroll(e) {
      this.scroll_y = e.target.scrollTop;
    },
    startAutomaticScroll() {
      this.$refs.agoraView.scrollTop = 0;
      const first_module_duration =
        this.section_modules_list[0]?.duration * 1000 || 5000;
      setTimeout(() => {
        this.scrollAutomatically();
      }, first_module_duration);
    },
    scrollAutomatically() {
      console.log("scrollToNextSlide");
      this.scrollToNextSlide();

      const animation_duration = 1000;
      const next_slide_in =
        this.currently_shown_module?.duration * 1000 ||
        5000 + animation_duration;

      setTimeout(() => {
        this.scrollAutomatically();
      }, next_slide_in);
    },
    scrollToNextSlide() {
      if (this.$refs.agoraView) {
        const current_module_path = this.currently_shown_module.$path;
        const module_element = this.$refs.agoraView.querySelector(
          `[data-modulepath="${current_module_path}"]`
        );
        module_element.nextSibling.scrollIntoView();
      }
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
  padding: calc(var(--spacing) / 1);
  padding-top: calc(var(--spacing) * 2);
  // background-color: rgba(255, 255, 255, 0.3);
  mask-image: linear-gradient(
    to top,
    white 0%,
    white calc(100% - calc(var(--spacing) * 2)),
    transparent 100%
  );
  backdrop-filter: blur(4px);
  bottom: 0;
  width: 100%;
  overflow: hidden;

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
  padding: 10px;
  padding-bottom: calc(var(--spacing) * 2);
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
</style>
