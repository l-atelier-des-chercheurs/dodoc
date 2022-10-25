<template>
  <div class="_mediaLibrary">
    <div class="u-instructions u-padding-small">
      Retrouvez ici toutes vos captures. Vous pouvez les légender, les supprimer
      et les organiser dans des groupes.
      <br />
      Vous pouvez aussi importer des fichiers (photos, vidéos, audios, 3D, PDF
      ou autre) depuis vos appareils.
    </div>
    <splitpanes horizontal :dbl-click-splitter="false" @resized="resized">
      <pane
        min-size="5"
        class="_mediaLibrary--lib"
        ref="topLib"
        :size="lib_pane_size"
      >
        <!-- <label for="add_file" class="_boldBtn"> -->
        <input
          type="file"
          multiple="multiple"
          :id="id + '-add_file'"
          name="file"
          accept=""
          class="inputfile-2"
          @change="updateInputFiles($event)"
        />
        <label :for="id + '-add_file'">
          <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          {{ $t("import") }}
        </label>
        <!-- </label> -->
        <!-- <sl-button @click="createText">Créer du texte</sl-button>
    <sl-button
      type="button"
      @click="show_create_link_field = !show_create_link_field"
    >
      Ajouter un site web
    </sl-button> -->
        <UploadFiles
          v-if="selected_files.length > 0"
          :selected_files="selected_files"
          :folder_type="'projects'"
          :folder_slug="project.slug"
          @importedMedias="mediaJustImported"
          @close="selected_files = []"
        />

        <br />

        <form
          v-if="show_create_link_field"
          class="input-validation-required"
          @submit.prevent="createLink"
        >
          <input type="url" required v-model="url_to" />
          <br />
          <input type="submit" />
        </form>

        Médias = {{ medias.length }}

        <div class="_mediaLibrary--lib--grid" ref="mediaTiles">
          <MediaTile
            v-for="file of medias"
            :key="file.slug"
            :project_slug="project.slug"
            :file="file"
            :is_focused="media_focused === file.slug"
            :data-fileslug="file.slug"
            @toggleMediaFocus="(slug) => toggleMediaFocus(slug)"
          />
        </div>
      </pane>
      <pane
        min-size="5"
        class="_mediaLibrary--focusPane"
        ref="bottomLib"
        :size="focus_pane_size"
      >
        <transition name="fade_fast" mode="out-in">
          <MediaFocus
            v-if="focused_media"
            :key="focused_media.slug"
            :file="focused_media"
            :project_slug="project.slug"
            @remove="removeMedia(focused_media.slug)"
            @close="toggleMediaFocus(focused_media.slug)"
          />
        </transition>
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";

import MediaFocus from "@/components/MediaFocus";
import MediaTile from "@/components/MediaTile.vue";

export default {
  props: {
    project: Object,
    focus_height: Number,
    media_focused: [Boolean, String],
  },
  components: {
    Splitpanes,
    Pane,
    MediaTile,
    MediaFocus,
  },
  data() {
    return {
      selected_files: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      show_create_link_field: false,
      url_to: "https://latelier-des-chercheurs.fr/",

      focuspane_height_when_opened: this.focus_height,
    };
  },
  created() {},
  mounted() {
    console.log(`MediaLibrary / mounted`);

    if (this.media_focused)
      this.$nextTick(() => {
        this.scrollToMediaTile(this.media_focused);
      });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    medias() {
      return this.project.files.filter((f) => !f.is_journal) || [];
    },
    focused_media() {
      const _focused_media =
        this.project.files.find((f) => f.slug === this.media_focused) || false;
      if (_focused_media && this.$refs.mediaTiles)
        this.scrollToMediaTile(_focused_media.slug);

      return _focused_media;
    },
    lib_pane_size() {
      return 100 - this.focus_pane_size;
    },
    focus_pane_size() {
      if (!this.focused_media) return 0;
      return this.focus_height;
    },
  },
  methods: {
    scrollToMediaTile(slug) {
      slug;
      // const focused_tile = this.$refs.mediaTiles.querySelector(
      //   `[data-fileslug="${slug}"]`
      // );
      // if (focused_tile)
      // focused_tile.scrollIntoView({
      //   behavior: "smooth",
      //   block: "center",
      //   inline: "nearest",
      // });
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    mediaJustImported(list_of_added_metas) {
      list_of_added_metas;
      // this.$alertify
      //   .closeLogOnClick(true)
      //   .delay(4000)
      //   .success(list_of_added_metas);
    },

    async createText() {
      const filename = "texte.txt";
      const content = "PLOP PLIP";

      const additional_meta = {
        caption: "plip",
      };

      this.$api.uploadText({ filename, content, additional_meta });
    },

    async createLink() {
      const filename = this.url_to;
      const content = this.url_to;

      const additional_meta = {
        type: "url",
      };

      this.$api.uploadText({ filename, content, additional_meta });
    },

    resized(panes) {
      const focus_pane_height = Number(panes[1].size.toFixed(1));
      this.$emit("update:focus_height", focus_pane_height);
    },
    toggleMediaFocus(slug) {
      if (!slug || this.media_focused === slug) {
        this.$emit("update:media_focused", null);
      } else {
        this.$emit("update:media_focused", slug);
        if (this.focus_height === 0) this.$emit("update:focus_height", 50);
        // debugger;
        // this.resized([
        //   { size: 100 - this.focuspane_height_when_opened },
        //   { size: this.focuspane_height_when_opened },
        // ]);
      }
    },

    async removeMedia(slug) {
      await this.$api.deleteFile({
        folder_type: "projects",
        folder_slug: this.project.slug,
        meta_slug: slug,
      });
      this.toggleMediaFocus(slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaLibrary {
  background: var(--color-Collecter);
  height: 100%;
  overflow: auto;

  --active-color: var(--c-vert);
}

._mediaLibrary--lib {
  overflow: auto;
}

._mediaLibrary--lib--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 2px;
  padding: 2px;
}

._mediaLibrary--focusPane {
  // background: var(--c-bleu);
}

._focusBtns {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
