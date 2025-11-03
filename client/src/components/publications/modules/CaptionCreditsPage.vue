<template>
  <div class="">
    <div class="_creditsBtn">
      <EditBtn
        :btn_type="'credits'"
        :label_position="'left'"
        v-if="show_credits_caption_button"
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

        <div
          class="u-spacingBottom"
          v-if="
            !isHTMLEmpty(media.caption) ||
            canEditLinkedMedia(media.$path) !== false
          "
        >
          <CollaborativeEditor3
            :label="$t('caption')"
            :field_to_edit="'caption'"
            :content="media.caption"
            :path="media.$path"
            :custom_formats="['bold', 'italic', 'link', 'emoji']"
            :is_collaborative="false"
            :can_edit="can_edit"
          />
        </div>
        <div
          class="u-spacingBottom"
          v-if="
            !isHTMLEmpty(media.$credits) ||
            canEditLinkedMedia(media.$path) !== false
          "
        >
          <CollaborativeEditor3
            :label="$t('credit/reference')"
            :field_to_edit="'$credits'"
            :content="media.$credits"
            :path="media.$path"
            :custom_formats="['bold', 'italic', 'link', 'emoji']"
            :is_collaborative="false"
            :can_edit="can_edit"
          />
        </div>

        <div class="u-instructions" v-if="can_edit">
          <small>
            {{ $t("edit_caption_changes_for_all_medias") }}
          </small>
        </div>

        <!-- <div>
          <button
            type="button"
            class="u-buttonLink"
            v-if="canEditLinkedMedia(media.$path) === 'link'"
            @click="$eventHub.$emit('publication.openModal', media.$path)"
          >
            <b-icon icon="pencil" />
            {{ $t("edit_source") }}
          </button>
        </div> -->
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    media: Object,
    publication_path: String,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      show_credits_caption: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    show_credits_caption_button() {
      if (this.show_credits_caption) return false;
      if (this.media.$type === "text" || this.media.$type === "table")
        return false;
      if (
        this.canEditLinkedMedia(this.media.$path) === false &&
        this.isHTMLEmpty(this.media.$credits) &&
        this.isHTMLEmpty(this.media.caption)
      )
        return false;

      return true;
    },
  },
  methods: {
    isHTMLEmpty(html) {
      if (!html) return true;

      // Create a temporary div to parse HTML and get plain text
      const temp = document.createElement("div");
      temp.innerHTML = html;
      const text = this.cleanUpString(temp.innerText);
      return text.length === 0;
    },
    canEditLinkedMedia(path) {
      if (!path || !this.publication_path || !this.can_edit) return false;

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
  z-index: 150;
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
  z-index: 101;
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
  z-index: 100;
  margin: calc(var(--spacing) / 1);
}
</style>
