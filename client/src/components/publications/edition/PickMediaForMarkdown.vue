<template>
  <div class="pick-media-for-markdown">
    <BaseModal2 :title="$t('add_media')" @close="closePickModal">
      <div class="u-spacingBottom" v-if="!pick_medias_text">
        {{ $t("from_project") }}
        <b-icon icon="arrow-right" />&nbsp;
        <button
          type="button"
          class="u-button u-button_orange"
          @click="show_media_picker = true"
        >
          <b-icon icon="image" style="font-size: var(--icon-size)" />
          {{ $t("import") }}
        </button>
      </div>
      <MediaPicker
        v-if="show_media_picker"
        :publication_path="publication_path"
        :select_mode="'multiple'"
        :pick_from_types="['image', 'video', 'audio']"
        @pickMedias="pickMedias"
        @close="show_media_picker = false"
      />

      <div class="u-spacingBottom u-inputGroup" v-if="pick_medias_text">
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

      <div class="u-spacingBottom" v-else>
        <hr />
        {{ $t("multisupport_embed_img_instr") }}

        <ul>
          <li>
            <code>(image: https://www.example.com/url-vers-l-image.jpeg) </code>
          </li>
          <li>
            <code>(video: https://www.example.com/url-vers-la-video.mp4) </code>
          </li>
          <li>
            <code
              >(audio: https://www.example.com/url-vers-la-musique.mp3)
            </code>
          </li>
          <li>
            <code>(embed: https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde) </code>
          </li>
          <li>
            <code>(embed: https://www.youtube.com/watch?v=Bn6zdyCAwJs) </code>
          </li>
          <li>
            <code>(embed: https://scratch.mit.edu/projects/1061783643) </code>
          </li>
        </ul>
      </div>

      <div class="u-spacingBottom">
        {{ $t("attributes_for_embeds") }}

        <ul>
          <li>
            <code>caption: Ma légende</code>
          </li>
          <li>
            <code>class: nomDeLaClasse</code>
          </li>
          <li>
            <code>float: left</code>
          </li>
          <li>
            <code>float: right</code>
          </li>
        </ul>
      </div>
      <div>
        {{ $t("for_example") }}
        <div>
          <code
            >(embed: https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde caption: Voici
            une vidéo de PeerTube class: maClass)</code
          >
        </div>
      </div>

      <div class="u-spacingBottom" />

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
      show_media_picker: false,
      medias_were_picked: false,
      isCopied: false,
      pick_medias_text: "",
    };
  },
  methods: {
    pickMedias(medias) {
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

        if (m.caption) {
          const md_caption = this.turnHtmlToMarkdown(m.caption);
          media_html += ` caption: ${md_caption}`;
        }

        media_html += ")";

        html.push(media_html);
      });

      return html.join("\n");
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
