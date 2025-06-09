<template>
  <BaseModal2 @close="$emit('close')">
    <div class="_corpusMenu">
      <LoaderSpinner v-if="!folders" />
      <template v-else>
        <div class="_selectFolder">
          <div>
            <label for="shared_folder_path">
              {{ $t("access_corpus") }}
            </label>

            <select v-model="shared_folder_path">
              <option value="">{{ $t("select_corpus") }}</option>
              <option
                v-for="folder in folders"
                :key="folder.$path"
                :value="folder.$path"
              >
                {{ folder.title || $t("untitled") }}
              </option>
              <option value="new">+ {{ $t("new_corpus") }}</option>
            </select>
            <div class="u-spacingBottom" />

            <div v-if="shared_folder_path === 'new'" class="u-spacingBottom">
              <TextInput
                :content.sync="new_corpus_name"
                :placeholder="$t('new_corpus_name')"
                :required="true"
                :input_type="'text'"
                :maxlength="30"
              />
            </div>

            <div class="_btnRow">
              <div />
              <button
                v-if="shared_folder_path !== 'new'"
                type="button"
                :disabled="!shared_folder_path"
                class="u-button"
                @click="openFolder"
              >
                {{ $t("open") }}
              </button>
              <button
                v-else-if="shared_folder_path === 'new'"
                type="button"
                class="u-button"
                :disabled="!new_corpus_name || is_creating_corpus"
                @click="createCorpus"
              >
                {{ $t("create") }}
              </button>
            </div>

            <div v-if="is_creating_corpus">
              <LoaderSpinner />
            </div>
          </div>
        </div>
      </template>
    </div>
  </BaseModal2>
</template>
<script>
import BaseModal2 from "@/adc-core/modals/BaseModal2.vue";
import LoaderSpinner from "@/adc-core/fields/LoaderSpinner.vue";

export default {
  props: {
    current_corpus_path: {
      type: String,
      default: "",
    },
  },
  components: { BaseModal2, LoaderSpinner },
  data() {
    return {
      path: "folders",
      folders: undefined,
      shared_folder_path: this.current_corpus_path,
      new_corpus_name: "",
      is_creating_corpus: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        access_corpus: "Accéder à un corpus",
        corpus: "Corpus",
        select_corpus: "– sélectionner un corpus –",
        new_corpus: "nouveau corpus",
        new_corpus_name: "Nom du corpus",
        untitled: "Sans titre",
        open: "Ouvrir",
        create: "Créer",
      },
      en: {
        access_corpus: "Access a corpus",
        corpus: "Corpus",
        select_corpus: "– select a corpus –",
        new_corpus: "new corpus",
        new_corpus_name: "Corpus name",
        untitled: "Untitled",
        open: "Open",
        create: "Create",
      },
    },
  },
  async created() {
    await this.loadFolders();
    this.$api.join({ room: this.path });
    // const last_opened_folder_slug = localStorage.getItem(
    //   "last_opened_folder_slug"
    // );
    // if (last_opened_folder_slug) {
    //   this.$emit("changeCorpus", last_opened_folder_slug);
    // }
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  methods: {
    async loadFolders() {
      this.folders = await this.$api
        .getFolders({ path: this.path })
        .catch((err) => {
          this.fetch_spaces_error = err.response;
          return;
        });
    },
    openFolder() {
      const folder_slug = this.shared_folder_path.split("/").pop();
      localStorage.setItem("last_opened_folder_slug", folder_slug);
      this.$emit("changeCorpus", folder_slug);
    },
    async createCorpus() {
      this.is_creating_corpus = true;
      const slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.new_corpus_name,
          $admins: "everyone",
        },
      });
      setTimeout(() => {
        this.shared_folder_path = "folders/" + slug;
        this.is_creating_corpus = false;
      }, 1000);
    },
  },
};
</script>
<style lang="scss" scoped>
._corpusMenu {
  // You can add or adjust styles as needed
}
._selectFolder {
  position: relative;
  max-width: 240px;
  padding: var(--spacing);
  margin: var(--spacing) auto;

  > div {
    background: var(--h-100);
    border-radius: 4px;
    padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);

    > label {
      font-size: var(--sl-font-size-small);
      font-family: "IBM Plex Mono";
    }
  }
}
._btnRow {
  display: flex;
  flex-flow: row nowrap;
  align-items: space-between;
  justify-content: space-between;
}
</style>
