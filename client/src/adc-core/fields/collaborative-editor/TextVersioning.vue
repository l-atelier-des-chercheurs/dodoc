<template>
  <div>
    <sl-dialog ref="showArchives" label="Archives" class="" @sl-hide="onHide">
      <div class="_archives" v-if="archives">
        <!-- not sure why sl-select doesnt work here -->
        <div class="_topbar">
          <sl-button
            variant="default"
            size="small"
            pill
            :disabled="archive_shown_index === 0"
            @click="newerVersion"
          >
            <sl-icon name="arrow-up" />
            récent
          </sl-button>

          <select v-model="selected_archive_filename">
            <option
              v-for="(archive, index) in archives"
              :value="archive.filename"
              :key="archive.filename"
              v-text="
                archive.filename === 'current'
                  ? $t('current')
                  : formatDateToPrecise(archive.date) +
                    ' - version ' +
                    (archives.length - index)
              "
            />
          </select>

          <sl-button
            variant="default"
            size="small"
            pill
            :disabled="archive_shown_index === archives.length - 1"
            @click="olderVersion"
          >
            <sl-icon name="arrow-down" label="Plus ancien" pill />
            ancient
          </sl-button>
        </div>

        <!-- <sl-select v-sl-model="selected_archive_filename">
          <sl-menu-item
            v-for="archive in archives"
            :value="archive.filename"
            :key="archive.filename"
            v-text="formatDateToPrecise(archive.date)"
          />
        </sl-select> -->

        <div
          v-if="
            archive_shown &&
            (archive_shown.content || archive_shown.content === '')
          "
        >
          <!-- <DateField :show_detail_initially="true" :date="archive_shown.date" /> -->
          <div class="_archiveText" v-html="archive_shown.content" />
        </div>
      </div>
      <sl-button
        slot="footer"
        variant="primary"
        :disabled="selected_archive_filename === 'current'"
        @click="restoreVersion(archive_shown.content)"
      >
        {{ $t("restore_this_version") }}
      </sl-button>
    </sl-dialog>
  </div>
</template>
<script>
export default {
  props: {
    folder_type: String,
    folder_slug: String,
    meta_slug: String,
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
    this.getArchives();
    this.$refs.showArchives.show();
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
    async getArchives() {
      this.archives = await this.$api.getArchives({
        folder_type: this.folder_type,
        folder_slug: this.folder_slug,
        meta_slug: this.meta_slug,
      });

      this.archives.push({
        filename: "current",
        content: this.current_content,
      });

      this.archives.reverse();

      // this.selected_archive_filename = this.archives[0].filename;
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
      debugger;
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

._topbar {
  display: flex;
  justify-content: space-between;
  margin: calc(var(--spacing) / 1) 0;
  gap: calc(var(--spacing) / 1);
}

._archiveText {
  background: var(--color-Journal);
  padding: calc(var(--spacing) / 2);
  width: 100%;
  // max-height: 150px;
  // overflow: auto;

  ::v-deep {
    @import "./imports/mainText.scss";
  }
}

sl-dialog::part(base) {
  align-items: flex-start;
}
</style>
