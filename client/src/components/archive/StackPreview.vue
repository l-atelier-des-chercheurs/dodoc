<template>
  <div
    class="_stackPreview"
    @mouseenter="startSlide"
    @mousemove="updateMousePos"
    @mouseleave="endSlide"
    :style="{}"
  >
    <button
      type="button"
      class="_stackPreview--content"
      :class="{
        'is--slider': start_slide,
        'is--selected': is_selected,
        'is--compact': display === 'compact',
      }"
      :title="stack.title"
      @click="openStack"
    >
      <div class="_preview">
        <div
          key="preview"
          class="_mainPreview"
          :class="{
            'is--showingSlides': slide_file_to_show,
          }"
        >
          <MediaContent
            v-if="stack.$preview"
            :file="stack.$preview"
            class="_mediaPreview"
          />
          <b-icon v-else icon="eye-slash" />
        </div>

        <div
          v-for="slide_file in stack_files"
          class="_slide"
          :class="{
            'is--shown': slide_file.$path === slide_file_to_show?.$path,
          }"
          :key="slide_file.$path"
        >
          <MediaContent :file="slide_file" class="_mediaPreview" />
        </div>
        <!-- <transition name="fade_fast" mode="out-in">
          <div
            class="_count"
            v-if="
              index_of_slide_file_to_show !== undefined &&
              number_of_medias_in_stack > 0
            "
          ></div>
        </transition> -->
        <!-- <transition-group name="projectsList" class="_count">
          <template
            v-if="
              index_of_slide_file_to_show !== undefined &&
              number_of_medias_in_stack > 0
            "
          >
            <div key="slide">
              {{ index_of_slide_file_to_show + 1 }}
            </div>
            <div key="slash">/</div>
          </template>
          <div key="preview">
            {{ number_of_medias_in_stack }}
          </div>
        </transition-group> -->
      </div>
      <div class="_title" v-if="display !== 'compact'">
        {{ stack.title }}
      </div>
    </button>

    <transition name="fade_fast" mode="out-in">
      <div>
        <button
          type="button"
          class="u-button u-button_icon u-button_transparent _addToFav"
          :data-isfav="is_favorite"
          :disabled="!can_be_added_to_fav"
          @click.stop="$emit('toggleFav')"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.38174 1.75501C7.59507 1.19234 8.40241 1.19234 8.61641 1.75501L9.99641 5.57767C10.0931 5.83101 10.3391 5.99967 10.6137 5.99967H14.0051C14.6317 5.99967 14.9051 6.77967 14.4124 7.16167L11.9991 9.33301C11.891 9.41611 11.812 9.53132 11.7734 9.66211C11.7348 9.7929 11.7387 9.93255 11.7844 10.061L12.6657 13.7963C12.8804 14.3963 12.1857 14.9117 11.6604 14.5423L8.38241 12.4623C8.27015 12.3834 8.13628 12.3411 7.99907 12.3411C7.86187 12.3411 7.728 12.3834 7.61574 12.4623L4.33774 14.5423C3.81307 14.9117 3.11774 14.3957 3.33241 13.7963L4.21374 10.061C4.25946 9.93255 4.26331 9.7929 4.22475 9.66211C4.18618 9.53132 4.10718 9.41611 3.99907 9.33301L1.58574 7.16167C1.09241 6.77967 1.36707 5.99967 1.99241 5.99967H5.38374C5.51727 6.00012 5.64778 5.96001 5.75802 5.88466C5.86825 5.8093 5.95301 5.70225 6.00107 5.57767L7.38107 1.75501H7.38174Z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          <!-- <b-icon v-if="!is_favorite" icon="star" :aria-label="$t('add')" />
          <b-icon v-else icon="star-fill" :aria-label="$t('remove')" /> -->
        </button>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    stack: Object,
    is_selected: Boolean,
    is_favorite: Boolean,
    can_be_added_to_fav: Boolean,
    display: String,
  },
  components: {},
  data() {
    return {
      start_slide: false,
      stack_files: undefined,
      index_of_slide_file_to_show: undefined,
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
    number_of_medias_in_stack() {
      return this.stack.stack_files_metas?.length || 0;
    },
    slide_file_to_show() {
      return this.stack_files && this.index_of_slide_file_to_show !== undefined
        ? this.stack_files[this.index_of_slide_file_to_show]
        : false;
    },
  },
  methods: {
    openStack() {
      const stack_slug = this.getFilename(this.stack.$path);
      this.$emit("openStack", stack_slug);
    },
    async startSlide(event) {
      this.start_slide = true;
      setTimeout(async () => {
        if (this.start_slide) {
          const files = await this.loadFiles();
          this.stack_files = files;
          this.updateMousePos(event);
        }
      }, 200);
    },
    updateMousePos(event) {
      if (!this.stack_files) return;

      const { pageX } = event;
      const { x, width } = this.$el.getBoundingClientRect();
      const move_percent = (pageX - x) / width;
      this.index_of_slide_file_to_show = Math.floor(
        move_percent * this.number_of_medias_in_stack
      );
    },
    endSlide() {
      this.start_slide = false;
      this.stack_files = undefined;
      this.index_of_slide_file_to_show = undefined;
    },
    async loadFiles() {
      const stack = await this.$api.getFolder({
        path: this.stack.$path,
      });
      return this.getStackFilesInOrder({
        stack,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._stackPreview {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-end;
  align-items: stretch;
  padding: 0px;
  // min-height: 8rem;
}

._stackPreview--content {
  appearance: none;
  padding: 0;
  text-align: left;
  font-size: var(--sl-font-size-x-small);

  position: relative;
  // box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  background: transparent;
  // border: 2px solid var(--c-bodybg);
  cursor: pointer;

  // border-radius: 2px;
  overflow: hidden;
  padding: clamp(
    1px,
    calc(var(--stack_preview_width) / 40),
    calc(var(--stack_preview_width) / 40)
  );

  transform-origin: center calc(100% - 2em);
  transition: all 0.45s cubic-bezier(0.19, 1, 0.22, 1);

  > * {
    pointer-events: none;
  }

  &.is--selected {
    background-color: var(--active-color);
  }
  &.is--slider {
    background: var(--h-200);
  }

  &:hover,
  &:focus-visible {
    // z-index: 2;
    // border-color: var(--c-gris_fonce);
    // background: var(--c-gris);
    // transform: scale(1.05);
  }
}

._preview {
  position: relative;
  width: 100%;
  // min-height: 3rem;
  // aspect-ratio: 1/1;
  overflow: hidden;

  cursor: pointer;

  ._stackPreview--content.is--compact & {
    aspect-ratio: 1/1;
  }

  ._mediaPreview {
    position: relative;
    height: 100%;
    width: 100%;
    max-height: 14rem;

    &[data-filetype="text"] {
      max-height: 10rem;
      overflow: hidden;
      float: left;
    }

    ::v-deep {
      ._mediaContent--image {
        height: 100%;
        width: 100%;
        object-fit: contain;
        object-position: center;

        ._stackPreview--content.is--compact & {
          object-fit: cover;
        }
      }

      &._mediaContent[data-novisual] {
        align-items: flex-start;
        color: var(--h-600);
        padding: calc(var(--spacing) / 4);
      }
    }
  }
}
._slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  align-content: center;
  align-items: center;

  opacity: 0;
  z-index: 2;

  // transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--shown {
    z-index: 1;
    opacity: 1;
    transition: none;
  }
}

._title {
  // position: absolute;
  // bottom: 0;
  // background: rgba(255, 255, 255, 0.9);

  // height: 1.5em;
  padding-top: calc(var(--spacing) / 4);

  // text-overflow: ellipsis;
  // white-space: nowrap;
  // overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
}

._count {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 8);
  align-content: center;
  bottom: 0;
  left: 0;
  width: 0.5em;
  height: 0.5em;
  border-radius: 50%;

  margin: 0;
  margin: calc(var(--spacing) / 4);
  font-weight: 400;
  background: white;
  line-height: 1;

  > * {
    // background: white;
  }
}

._mainPreview {
  width: 100%;
  height: 100%;
  opacity: 1;
  // transition: all 0.05s ease-out;
  &.is--showingSlides {
    opacity: 0;
  }
}

._addToFav {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0px;
  z-index: 1;
  color: transparent;
  stroke: var(--c-noir);

  &[data-isfav] {
    stroke: transparent;
    color: var(--active-color);
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
}
@media (hover: hover) {
  ._stackPreview:not(:hover) {
    ._addToFav:not([data-isfav]) {
      opacity: 0;
    }
  }
}

.slideview {
  transition: all 0.02s cubic-bezier(0.19, 1, 0.22, 1);

  &-enter-active,
  &-leave-active {
    transform: translateY(0);
    opacity: 1;
  }
  &-enter,
  &-leave-to {
    transform: translateY(5px);
    opacity: 0;
  }
}
</style>
