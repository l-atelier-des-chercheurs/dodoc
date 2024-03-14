<template>
  <BaseModal2
    :title="$t('list_of_versions')"
    class="_modal"
    @close="$emit('close')"
  >
    <div class="_archives" v-if="archives">
      <div class="_topbar">
        <sl-button
          variant="default"
          size="small"
          pill
          :disabled="archive_shown_index === 0"
          @click="newerVersion"
        >
          <b-icon icon="arrow-up" />
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
                : formatDateTimeToPrecise(archive.date) +
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
          <b-icon icon="arrow-down" />
          ancient
        </sl-button>
      </div>

      <transition name="pagechange" mode="out-in" appear>
        <div
          v-if="
            archive_shown &&
            (archive_shown.content || archive_shown.content === '')
          "
          :key="selected_archive_filename"
        >
          <!-- <DateDisplay :show_detail_initially="true" :date="archive_shown.date" /> -->
          <div class="_archiveText" v-html="archive_shown.content" />
        </div>
      </transition>
    </div>
    <div slot="footer">
      <SaveCancelButtons
        :allow_save="selected_archive_filename !== 'current'"
        :save_text="$t('restore_this_version')"
        @save="restoreVersion(archive_shown.content)"
        @cancel="$emit('close')"
      />
    </div>
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
      const { $archives } = await this.$api.getArchives({
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: calc(var(--spacing) / 1) 0;
  gap: calc(var(--spacing) / 1);
}

._archiveText {
  background: var(--c-gris);
  padding: calc(var(--spacing) / 2);
  width: 100%;
  // max-height: 150px;
  // overflow: auto;

  ::v-deep {
    @import "./imports/mainText.scss";
  }
}
</style>
