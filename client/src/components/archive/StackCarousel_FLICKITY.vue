<template>
  <div class="_stackCarousel">
    <flickity
      ref="flickity"
      class="_mainCarousel"
      :options="flickityOptions"
      :key="slider_key"
    >
      <div class="carousel-cell" v-for="file in files" :key="file.$path">
        <MediaContent
          :file="file"
          :context="'full'"
          :resolution="1600"
          :show_fs_button="true"
          :zoom_on_click="false"
        />
      </div>
    </flickity>

    <flickity
      ref="nav"
      class="_navCarousel"
      :options="navOptions"
      :key="slider_key"
    >
      <div class="carousel-cell" v-for="file in files" :key="file.$path">
        <MediaContent :file="file" :context="'preview'" :resolution="360" />
      </div>
    </flickity>

    <!-- <div
        class="_preview"
        :data-iscurrent="current_file_shown.$path === file.$path"
        @click="toggleFile(index)"
      >
        <MediaContent :file="file" :context="'preview'" :resolution="360" />
      </div> -->
  </div>
</template>
<script>
import Flickity from "vue-flickity";
import "flickity-as-nav-for";
import "flickity-imagesloaded";

export default {
  props: {
    files: Array,
  },
  components: {
    Flickity,
  },
  data() {
    return {
      active_file_index: 0,

      flickityOptions: {
        initialIndex: 0,
        groupCells: false,
        imagesLoaded: true,
        pageDots: true,
        selectedAttraction: 0.2,
        percentPosition: false,
        friction: 0.8,
        cellAlign: "left",
        contain: true,
      },
      navOptions: {
        asNavFor: "._mainCarousel",
        contain: true,
      },
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_file_shown() {
      if (this.active_file_index !== false)
        return this.files[this.active_file_index];
      return false;
    },
    slider_key() {
      const key = this.files.map((f, index) => f.$path + "-index-" + index);
      if (key) return JSON.stringify(key);
      return "none";
    },
  },
  methods: {
    toggleFile(index) {
      if (this.active_file_index === index) this.active_file_index = false;
      else this.active_file_index = index;
    },
  },
};
</script>
<style lang="scss" scoped>
._stackCarousel {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;

  > ._mainCarousel {
    flex: 1 1 150px;
  }
  > ._navCarousel {
    flex: 0 0 10vh;
  }
}

._mainCarousel {
  .carousel-cell {
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
  }
}

._preview {
  width: 10vh;
  height: 10vh;
  overflow: hidden;
  // background: var(--c-gris_clair);
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    transform: scale(0.98);
  }

  &[data-iscurrent] {
    opacity: 0.5;
    pointer-events: none;
  }

  ._mediaContent {
    height: 100%;

    ::v-deep ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
      max-width: none;
    }
  }
}

._mainCarousel {
  // padding: calc(var(--spacing) / 4);
  .carousel-cell {
    width: 100%;
    aspect-ratio: 1/1;
    margin-right: calc(var(--spacing) * 1);
  }
}
._navCarousel {
  // margin-top: calc(var(--spacing) / 2);

  .carousel-cell {
    aspect-ratio: 1/1;
    height: 100%;
    margin-right: calc(var(--spacing) / 2);
  }
}
</style>
