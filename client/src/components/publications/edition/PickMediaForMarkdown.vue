<template>
  <div class="pick-media-for-markdown">
    <MediaPicker
      v-if="show_media_picker"
      :publication_path="publication_path"
      :select_mode="'multiple'"
      :pick_from_types="['image', 'video', 'audio']"
      @pickMedias="pickMedias"
      @close="show_media_picker = false"
    />

    <BaseModal2
      v-if="medias_were_picked"
      :title="$t('add_media')"
      @close="closePickModal"
    >
      <ToggleInput
        :content.sync="setMediaAsFullPage"
        :label="$t('full_page')"
      />
      <div class="u-spacingBottom" />

      <div class="u-spacingBottom u-inputGroup">
        <textarea
          ref="urlToCopy"
          class="_textField"
          v-model="pick_medias_text"
        />
        <button
          type="button"
          class="u-button u-button_icon u-suffix _clipboardBtn"
          @click="copyToClipboard"
        >
          <b-icon icon="clipboard" v-if="!isCopied" />
          <b-icon icon="clipboard-check" v-else />
        </button>
      </div>

      <div class="u-instructions">
        {{ $t("copy_paste_to_include_media") }}
      </div>
    </BaseModal2>
  </div>
</template>

<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  name: "PickMediaForMarkdown",
  components: {
    MediaPicker,
  },
  props: {
    publication_path: String,
  },
  data() {
    return {
      show_media_picker: true,
      medias_were_picked: false,
      setMediaAsFullPage: false,
      isCopied: false,
      pick_medias_text: "",
    };
  },
  methods: {
    pickMedias(medias) {
      debugger;
      this.medias_were_picked = true;
      this.pick_medias_text = this.makeStringFromMedias(medias);
    },
    makeStringFromMedias(medias) {
      let html = [];

      medias.map((m) => {
        let media_html = "(";

        const meta_filename = m.$path.split("/").pop();

        let tag;
        if (m.$type === "image") tag = "image";
        else if (m.$type === "video") tag = "video";
        else if (m.$type === "audio") tag = "audio";
        else throw new Error("Unknown media type");

        media_html += `${tag}: ${meta_filename}`;

        if (m.caption) media_html += ` caption: ${m.caption}`;

        media_html += ")";

        html.push(media_html);
      });

      return html.join("\n");
    },
    copyToClipboard() {
      this.isCopied = false;

      // Get the text field
      var copyText = this.$refs.urlToCopy;

      // Select the text field
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices

      // Copy the text inside the text field
      navigator.clipboard.writeText(copyText.value);

      this.isCopied = true;
    },
    closePickModal() {
      this.medias_were_picked = false;
      this.setMediaAsFullPage = false;
      this.isCopied = false;
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
._textField {
  resize: vertical;
  min-height: 8rem;
  width: 100%;
}

._clipboardBtn {
  flex-shrink: 0;
}
</style>
