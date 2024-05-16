<template>
  <div class="_montageModule">
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
      <div class="u-spacingBottom _topLine">
        <div class="u-label">
          <template v-if="first_media">
            {{ $t(first_media.$type) }}
            <template v-if="first_media_duration"
              >/ {{ first_media_duration }}</template
            >
          </template>
        </div>

        <div class="">
          <NumberInput
            :label="$t('duration')"
            :value="agoramodule.duration || 5000"
            :min="0"
            :suffix="'s'"
            @save="updateAgoramodule({ duration: $event })"
          />
        </div>

        <div>
          <button type="button" class="u-buttonLink" @click="removeModule">
            {{ $t("remove") }}
            <b-icon icon="trash" />
          </button>
        </div>
      </div>
      <div class="u-spacingBottom">
        <KeywordsField
          :label="$t('keywords')"
          :field_name="'keywords'"
          :keywords="agoramodule.keywords"
          :path="agoramodule.$path"
          :can_edit="can_edit"
        />
      </div>
      <template v-if="first_media">
        <MediaContent
          v-if="first_media.$type !== 'text'"
          :file="first_media"
          :resolution="1600"
          :context="'full'"
          :show_fs_button="true"
        />
        <CollaborativeEditor2
          v-else
          ref="textBloc"
          :path="first_media.$path"
          :content="first_media.$content"
          :line_selected="false"
          :can_edit="can_edit"
          @lineClicked="$emit('lineClicked', $event)"
          @contentIsEdited="$emit('contentIsEdited', $event)"
          @contentIsNotEdited="$emit('contentIsNotEdited', $event)"
        />
      </template>
    </div>
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {
    agoramodule: Object,
    index: Number,
    module_position: String,
    default_image_duration: Number,
    can_edit: Boolean,
  },
  components: {
    KeywordsField,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    first_media() {
      return this.firstMedia(this.agoramodule);
    },
    first_media_duration() {
      return this.displayDuration({ media: this.first_media });
    },
  },
  methods: {
    async updateAgoramodule(new_meta) {
      await this.$api.updateMeta({
        path: this.agoramodule.$path,
        new_meta,
      });
    },
    async removeModule() {
      await this.$api
        .deleteItem({
          path: this.agoramodule.$path,
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
  // max-width: 400px;
  margin: 0 auto;

  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;

  width: 100%;
  margin: 0 auto;

  &:last-child {
    ._line {
      height: calc(100%);
    }
  }
}

._index {
  position: sticky;
  top: 0;
  font-family: Fira Mono;
  text-transform: uppercase;
  line-height: 1;
  font-weight: 600;
  z-index: 1;

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
  padding: calc(var(--spacing) / 2);
  border-radius: 4px;

  ::v-deep ._mediaContent--image {
    max-width: none;
    width: 100%;
  }
}

._imageDurationPicker {
  max-width: 18ch;
  margin: calc(var(--spacing) / 2) auto;
}
._transitionPicker {
  text-align: center;
  margin: calc(var(--spacing) / 2) auto;
}

._topLine {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
}
</style>
