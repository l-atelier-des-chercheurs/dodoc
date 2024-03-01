<template>
  <div class="">
    <div class="_creditsBtn">
      <EditBtn
        :btn_type="'credits'"
        :label_position="'left'"
        v-if="!show_credits_caption"
        @click="show_credits_caption = true"
      />
    </div>

    <transition name="pagechange" mode="out-in">
      <div class="_showCredits" v-if="show_credits_caption">
        <button
          type="button"
          class="u-button u-button_icon _closeCredits"
          @click="show_credits_caption = false"
        >
          <b-icon icon="x-lg" />
        </button>

        <div class="u-spacingBottom">
          <TitleField
            :label="$t('caption')"
            :field_name="'caption'"
            :content="media.caption"
            :path="media.$path"
            :input_type="'markdown'"
            :can_edit="canEditLinkedMedia(media.$path) === 'local'"
          />
        </div>
        <div class="u-spacingBottom">
          <TitleField
            :label="$t('credit/reference')"
            :field_name="'$credits'"
            :content="media.$credits"
            :path="media.$path"
            :can_edit="canEditLinkedMedia(media.$path) === 'local'"
          />
        </div>

        <div>
          <button
            type="button"
            class="u-buttonLink"
            v-if="canEditLinkedMedia(media.$path) === 'link'"
            @click="$eventHub.$emit('publication.openModal', media.$path)"
          >
            <b-icon icon="pencil" />
            {{ $t("edit_source") }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    media: Object,
    publication_path: String,
  },
  components: {},
  data() {
    return {
      show_credits_caption: false,
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
  computed: {},
  methods: {
    canEditLinkedMedia(path) {
      const media_parent_folder = this.getParent(path);

      // media is directly inside publication
      let folder = this.publication_path;
      if (media_parent_folder === folder) {
        if (this.canLoggedinEditFolder({ folder })) return "local";
      }

      // media is linked to parent
      folder = this.getParent(this.getParent(this.publication_path));
      if (media_parent_folder === folder)
        if (this.canLoggedinEditFolder({ folder })) return "link";

      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
._creditsBtn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 1);

  @media print {
    display: none;
  }
  ::v-deep {
    ._editBtn {
      background: rgba(255, 255, 255, 0.4) !important;
      backdrop-filter: blur(5px) !important;
    }
  }
}
._showCredits {
  position: absolute;
  z-index: 1000;
  inset: 0;
  overflow: auto;
  text-align: left;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  overflow: auto;
  padding: calc(var(--spacing) * 1);
}
._closeCredits {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 1);
}
</style>
