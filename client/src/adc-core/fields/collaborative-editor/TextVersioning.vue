<template>
  <BaseModal2
    :title="$t('list_of_versions')"
    class="_modal"
    @close="$emit('close')"
  >
    <div class="_archives" v-if="archives">
      <div class="_topbar">
        <button
          class="u-button u-button_small"
          :disabled="archive_shown_index === 0"
          @click="newerVersion"
        >
          <b-icon icon="arrow-up" />
          {{ $t("recent") }}
        </button>

        <div>
          <select v-model="selected_archive_filename">
            <option
              v-for="(archive, index) in archives"
              :value="archive.filename"
              :key="archive.filename"
              v-text="
                archive.filename === 'current'
                  ? $t('current')
                  : formatDateTimeToPrecise(archive.date) +
                    ' - version ' +
                    (archives.length - index)
              "
            />
          </select>
        </div>

        <button
          class="u-button u-button_small"
          :disabled="archive_shown_index === archives.length - 1"
          @click="olderVersion"
        >
          <b-icon icon="arrow-down" />
          {{ $t("ancient") }}
        </button>
      </div>

      <transition name="pagechange" mode="out-in" appear>
        <div
          v-if="
            archive_shown &&
            (archive_shown.content || archive_shown.content === '')
          "
          :key="selected_archive_filename"
        >
          <div class="_archiveText">
            <CollaborativeEditor3
              :content="archive_shown.content"
              :can_edit="false"
            />
          </div>
        </div>
      </transition>
    </div>

    <SaveCancelButtons
      slot="footer"
      :allow_save="selected_archive_filename !== 'current'"
      :save_text="$t('restore_this_version')"
      @save="restoreVersion(archive_shown.content)"
      @cancel="$emit('close')"
    />
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: String,
    current_content: String,
  },
  components: {},
  data() {
    return {
      archives: null,
      selected_archive_filename: "current",
    };
  },
  created() {},
  mounted() {
    this.getAllArchives({ path: this.path });
    // this.$refs.showArchives.show();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    archive_shown() {
      if (this.archives)
        return this.archives.find(
          (a) => a.filename === this.selected_archive_filename
        );
      return false;
    },
    archive_shown_index() {
      if (this.archives)
        return this.archives.findIndex(
          (a) => a.filename === this.selected_archive_filename
        );
      return false;
    },
  },
  methods: {
    async getAllArchives() {
      const { $archives } = await this.$api.getFile({
        path: this.path,
      });
      this.archives = $archives || [];
      this.archives.push({
        filename: "current",
        content: this.current_content,
      });
      this.archives.reverse();
    },
    olderVersion() {
      this.selected_archive_filename =
        this.archives[this.archive_shown_index + 1].filename;
    },
    newerVersion() {
      this.selected_archive_filename =
        this.archives[this.archive_shown_index - 1].filename;
    },
    restoreVersion(content) {
      this.$emit("restore", content);
    },
    onHide() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._archives {
  // border: 1px solid black;
  // display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  // gap: 1px;
  // padding: 1px;

  > * {
    // background: white;
    // padding: calc(var(--spacing) / 2);
  }
}

._modal {
  max-width: 600px;
}

._topbar {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing) / 1) 0;
  background: white;
  z-index: 1;
  gap: calc(var(--spacing) / 1);
}

._archiveText {
  background: var(--c-gris_clair);
  border: 1px solid var(--c-gris_clair);
  border-radius: 1px;

  padding: calc(var(--spacing) / 2);
  width: 100%;
  overflow-x: auto;
  // max-height: 150px;
  // overflow: auto;

  ::v-deep {
    > * {
      padding: 0;
      margin: 0;
    }
    > img {
      max-width: 30ch;
    }

    blockquote {
      padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
      border-radius: 5px;
      border: none;
      border-left: 2px solid var(--c-gris);
      background-color: var(--c-gris_clair);
    }

    pre.ql-syntax {
      font-family: Fira Mono;
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    }
  }
}
</style>
