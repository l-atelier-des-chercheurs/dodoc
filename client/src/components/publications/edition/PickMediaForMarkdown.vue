<template>
  <div class="pick-media-for-markdown">
    <BaseModal2 :title="$t('add_media')" @close="closePickModal">
      <div class="u-spacingBottom" v-if="!pick_medias_text">
        <DLabel :str="$t('from_project')" />
        <button
          type="button"
          class="u-button u-button_orange _pickMediaBtn"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" />
          {{ $t("import") }}
        </button>
      </div>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        :select_mode="'multiple'"
        :pick_from_types="['image', 'video', 'audio', 'text', 'pdf']"
        :passed_meta_filenames_already_present="
          meta_filenames_already_present_for_picker
        "
        @pickMedias="pickMedias"
        @close="show_media_picker = false"
      />

      <template v-if="pick_medias_text">
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
        <div class="u-spacingBottom" v-if="pick_medias_list.length > 1">
          <DLabel :str="$t('layout')" />
          <label class="u-switch u-switch-xs u-switch_twoway">
            <label class="_switchLabel" for="medias_on_new_line">
              {{ $t("side_by_side") }} <b-icon icon="three-dots" />
            </label>
            <input
              id="medias_on_new_line"
              type="checkbox"
              v-model="medias_on_new_line"
            />
            <label class="_switchLabel" for="medias_on_new_line">
              {{ $t("new_line") }} <b-icon icon="three-dots-vertical" />
            </label>
          </label>
        </div>
      </template>

      <DetailsPane
        :header="$t('advanced_options')"
        :icon="'rulers'"
        :has_items="false"
      >
        <hr />
        {{ $t("multisupport_embed_img_instr") }}

        <CodeBlock
          code="(image: https://www.pageweb.com/image.jpeg)"
          :explanation="$t('embed_example_image')"
        />
        <CodeBlock
          code="(video: https://www.pageweb.com/video.mp4)"
          :explanation="$t('embed_example_video')"
        />
        <CodeBlock
          code="(audio: https://www.pageweb.com/audio.mp3)"
          :explanation="$t('embed_example_audio')"
        />
        <CodeBlock
          code="(pdf: https://www.pageweb.com/document.pdf)"
          :explanation="$t('embed_example_pdf')"
        />
        <CodeBlock
          code="(embed: https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde)"
          :explanation="$t('embed_example_peertube')"
        />
        <CodeBlock
          code="(embed: https://www.youtube.com/watch?v=Bn6zdyCAwJs)"
          :explanation="$t('embed_example_youtube')"
        />
        <CodeBlock
          code="(embed: https://scratch.mit.edu/projects/1061783643)"
          :explanation="$t('embed_example_scratch')"
        />

        <div class="u-spacingBottom">
          {{ $t("attributes_for_embeds") }}

          <CodeBlock
            code="caption: Ma légende"
            :explanation="$t('embed_attr_caption')"
          />
          <CodeBlock
            code="class: nomDeLaClasse"
            :explanation="$t('embed_attr_class')"
          />
          <CodeBlock
            code="float: left"
            :explanation="$t('embed_attr_float_left')"
          />
          <CodeBlock
            code="float: right"
            :explanation="$t('embed_attr_float_right')"
          />
          <CodeBlock
            code="size: full"
            :explanation="$t('embed_attr_size_full')"
          />
          <CodeBlock
            code="size: full-cover"
            :explanation="$t('embed_attr_size_full_cover')"
          />
          <CodeBlock code="width: 5cm" :explanation="$t('embed_attr_width')" />
        </div>
        <div>
          {{ $t("for_example") }}
          <div>
            <CodeBlock
              code="(embed: https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde caption: Voici une vidéo de PeerTube class: maClass)"
            />
          </div>
        </div>
      </DetailsPane>

      <div class="u-spacingBottom" />

      <div class="u-instructions" v-if="medias_were_picked">
        {{ $t("copy_paste_to_include_media_or_click_to_add_at_cursor") }}
      </div>

      <template #footer v-if="medias_were_picked">
        <div />
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="insertToText"
        >
          {{ $t("add") }}
        </button>
      </template>
    </BaseModal2>
  </div>
</template>

<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
import CodeBlock from "@/adc-core/fields/collaborative-editor/CodeBlock.vue";

export default {
  name: "PickMediaForMarkdown",
  components: {
    MediaPicker,
    CodeBlock,
  },
  inject: {
    $getMetaFilenamesAlreadyPresent: {
      default: false,
    },
  },
  props: {
    publication_path: String,
  },
  data() {
    return {
      show_media_picker: true,
      medias_were_picked: false,
      isCopied: false,
      pick_medias_list: [],
      pick_medias_text: "",
      medias_on_new_line: false,
    };
  },
  watch: {
    medias_on_new_line(newVal) {
      this.pick_medias_text = this.makeStringFromMedias(
        this.pick_medias_list,
        this.medias_on_new_line
      );
    },
  },
  computed: {
    meta_filenames_already_present_for_picker() {
      return this.$getMetaFilenamesAlreadyPresent
        ? this.$getMetaFilenamesAlreadyPresent()
        : [];
    },
  },
  methods: {
    async pickMedias(medias) {
      this.medias_were_picked = true;

      let source_medias = [];
      for (const media of medias) {
        const import_mode = this.$root.publication_include_mode;
        const new_entry = await this.prepareMediaForPublication({
          path_to_source_media_meta: media.$path,
          publication_path: this.publication_path,
          import_mode,
        });
        new_entry.$type = media.$type;
        new_entry.$content = media.$content;
        new_entry.caption = media.caption;
        source_medias.push(new_entry);
      }

      this.pick_medias_list = source_medias;
      this.pick_medias_text = this.makeStringFromMedias(
        this.pick_medias_list,
        this.medias_on_new_line
      );
    },
    makeStringFromMedias(source_medias, medias_on_new_line) {
      let html = [];

      source_medias.map((m) => {
        if (m.$type === "text") {
          const md_content = this.turnHtmlToMarkdown(m.$content);
          html.push(md_content);
          return;
        }

        let media_html = "(";

        let src;
        if (m.hasOwnProperty("meta_filename_in_project")) {
          src = "../" + m.meta_filename_in_project;
        } else if (m.hasOwnProperty("meta_filename")) {
          src = "./" + m.meta_filename;
        }

        let tag;
        if (m.$type === "image") tag = "image";
        else if (m.$type === "video") tag = "video";
        else if (m.$type === "audio") tag = "audio";
        else if (m.$type === "pdf") tag = "pdf";
        else throw new Error("Unknown media type");

        media_html += `${tag}: ${src}`;

        if (m.caption) {
          const md_caption = this.turnHtmlToMarkdown(m.caption);
          if (md_caption && md_caption.trim() !== "") {
            // Replace newlines with a visible separator to prevent breaking markdown syntax
            const sanitized_caption = md_caption.replace(/\n/g, " · ");
            media_html += ` caption: ${sanitized_caption}`;
          }
        }

        media_html += ")";
        html.push(media_html);
      });

      if (medias_on_new_line) {
        html = html.join("\n\n");
      } else {
        html = html.join(" ");
      }

      html += "\n\n";

      return html;
    },
    turnHtmlToMarkdown(html) {
      // turn <p><strong>Plop</strong></p><p><em>Plip</em></p><p><a href="https://geojson.io" rel="noopener noreferrer" target="_blank">qqq</a></p><p><strong><em>Hehehe</em></strong></p>
      // into
      // Plop
      // Plip
      // [qqq](https://geojson.io)
      // Hehehe

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      let md = "";
      const paragraphs = tempDiv.querySelectorAll("p");

      paragraphs.forEach((p, index) => {
        let text = p.textContent;

        // Handle links
        const links = p.querySelectorAll("a");
        links.forEach((link) => {
          const linkText = link.textContent;
          const linkHref = link.getAttribute("href");
          if (linkHref) {
            const mdLink = `[${linkText}](${linkHref})`;
            text = text.replace(linkText, mdLink);
          }
        });

        // Add line breaks between paragraphs
        md += text + (index < paragraphs.length - 1 ? "\n" : "");
      });

      return md;
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
      this.isCopied = false;
      this.$emit("close");
    },
    insertToText() {
      this.$emit("insertToText", this.pick_medias_text);
      this.closePickModal();
    },
  },
};
</script>

<style lang="scss" scoped>
._textField {
  resize: vertical;
  min-height: 12rem;
  width: 100%;
}

._clipboardBtn {
  flex-shrink: 0;
}

._switchLabel {
  font-size: var(--sl-font-size-small);
  // font-weight: 500;
  // text-transform: lowercase;
  // font-weight: bold;
  // background: var(--c-bleumarine);
  // color: white;
  // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  // border-radius: 4px;
}

ul {
  margin: 0;
  margin-top: calc(var(--spacing) / 2);
  padding-left: var(--spacing);
  list-style: circle;

  li {
    margin-bottom: calc(var(--spacing) / 2);
  }
}
</style>
