<template>
  <div class="_montageModule">
    <div class="_line" />
    <div class="_index">
      <div class="_btns">
        <button
          type="button"
          class="u-button u-button_icon"
          :disabled="module_position === 'alone' || module_position === 'first'"
          @click="$emit('moveUp')"
        >
          <b-icon icon="chevron-up" />
        </button>
        <button
          type="button"
          class="u-button u-button_icon"
          :disabled="module_position === 'alone' || module_position === 'last'"
          @click="$emit('moveDown')"
        >
          <b-icon icon="chevron-down" />
        </button>
      </div>
      <span class="_num">
        {{ index }}
      </span>
    </div>

    <div class="_preview">
      <div class="_topRow">
        <div class="u-label">
          <template v-if="first_media">
            {{ $t(first_media.$type) }}
            <template v-if="first_media_duration"
              >/ {{ first_media_duration }}</template
            >
          </template>
          <RemoveMenu @remove="removeModule" />
        </div>
        <div class="">
          <span class="u-switch u-switch-xs">
            <input
              class="switch"
              :id="'transition_in_' + makemodule.$path"
              type="checkbox"
              :checked="makemodule.transition_in === 'fade'"
              @change="toggleTransition('transition_in')"
            />
            <label class="u-label" :for="'transition_in_' + makemodule.$path">{{
              $t("transition_fade")
            }}</label>
          </span>
        </div>
      </div>
      <template v-if="first_media">
        <MediaContent
          v-if="first_media.$type !== 'text'"
          :file="first_media"
          :resolution="1600"
          :context="'full'"
          :show_fs_button="true"
        />
        <CollaborativeEditor3
          v-else
          ref="textBloc"
          :path="first_media.$path"
          :content="first_media.$content"
          :line_selected="false"
          :can_edit="true"
          @lineClicked="$emit('lineClicked', $event)"
          @contentIsEdited="$emit('contentIsEdited', $event)"
          @contentIsNotEdited="$emit('contentIsNotEdited', $event)"
        />
        <div class="_imageDurationPicker" v-if="first_media.$type === 'image'">
          <NumberInput
            :value="makemodule.image_duration || default_image_duration"
            :suffix="$t('seconds')"
            :size="'medium'"
            :min="0"
            :max="3600"
            @save="updateMakemodule({ image_duration: $event })"
          />
        </div>

        <div class="_transitionPicker" v-if="module_position === 'last'">
          <span class="u-switch u-switch-xs">
            <input
              class="switch"
              :id="'transition_out_' + makemodule.$path"
              type="checkbox"
              :checked="makemodule.transition_out === 'fade'"
              @change="toggleTransition('transition_out')"
            />
            <label
              class="u-label"
              :for="'transition_out_' + makemodule.$path"
              >{{ $t("transition_fade") }}</label
            >
          </span>
        </div>
      </template>
    </div>
  </div>
</template>
<script>
import RemoveMenu from "@/adc-core/fields/RemoveMenu.vue";

export default {
  props: {
    makemodule: Object,
    index: Number,
    module_position: String,
    default_image_duration: Number,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    first_media() {
      return this.firstMedia(this.makemodule);
    },
    first_media_duration() {
      return this.displayDuration({ media: this.first_media });
    },
  },
  methods: {
    toggleTransition(transition_type) {
      if (this.makemodule[transition_type] === "fade")
        this.updateMakemodule({
          [transition_type]: "none",
        });
      else
        this.updateMakemodule({
          [transition_type]: "fade",
        });
    },
    async updateMakemodule(new_meta) {
      await this.$api.updateMeta({
        path: this.makemodule.$path,
        new_meta,
      });
    },
    async removeModule() {
      await this.$api
        .deleteItem({
          path: this.makemodule.$path,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      this.$emit("remove");
    },
  },
};
</script>
<style lang="scss" scoped>
._montageModule {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;

  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;

  width: 100%;
  margin: 0 auto;

  gap: calc(var(--spacing) / 1);
  color: white;

  &:last-child {
    ._line {
      height: calc(100%);
    }
  }
}

._line {
  position: absolute;
  background: white;
  width: 4px;
  height: calc(100% + 3rem);
  margin-left: 3.1rem;
  margin-top: 2px;
  z-index: 0;
  top: 0;
  border-radius: 4px;
}
._index {
  position: sticky;
  top: 0;
  font-family: Fira Mono;
  text-transform: uppercase;
  line-height: 1;
  font-weight: 600;
  z-index: 1;
  background-color: var(--c-bleumarine);

  margin-top: -9px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  ._btns {
    display: flex;
    flex-flow: column nowrap;

    > .u-button {
      font-size: 140%;
    }
  }

  ._num {
    font-size: 5rem;
  }

  > .u-button {
    font-size: 50%;
  }
}

.u-label {
  // color: white;
}

._lastModule {
  margin-top: calc(var(--spacing) * 2);
}

._preview {
  flex: 1 1 auto;
  background: white;
  padding: calc(var(--spacing) / 2);
  border-radius: 4px;
  color: var(--c-noir);

  ::v-deep ._mediaContent--image {
    max-width: none;
    width: 100%;
  }
}

._topRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}
._imageDurationPicker {
  max-width: 18ch;
  margin: calc(var(--spacing) / 2) auto;
}
._transitionPicker {
  text-align: center;
  margin: calc(var(--spacing) / 2) auto;
}
</style>
