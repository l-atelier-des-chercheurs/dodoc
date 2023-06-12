<template>
  <div v-if="shared_folder" class="_sharedFolder">
    <div class="_topbar">
      <div class="_topbar--content">
        <div class="_title">ESPACE PARTAGÉ / ARCHIVE</div>
        <div class="">jour | mois | année | date</div>
        <div class=""></div>
      </div>
    </div>

    <ItemModal v-if="opened_files" :file="opened_files" @close="closeFile" />

    <div
      class="_dayFileSection"
      v-for="{ label, files } in grouped_files"
      :key="label"
    >
      <div class="_label">
        {{ formatDateToHuman(label) }}
      </div>
      <div class="_grid">
        <SharedFolderItem
          class="_file"
          v-for="file in files"
          :key="file.$path"
          :file="file"
          :is_opened="opened_files && opened_files.$path === file.$path"
          @open="openFile(file.$path)"
        />
      </div>
    </div>

    <footer class="_footer">
      <small>
        <a href="mailto:ckernreuter@luma-arles.org" target="_blank"
          >aide/contact</a
        ><br />
        version {{ $root.app_infos.version }}
      </small>
    </footer>
  </div>
</template>
<script>
import SharedFolderItem from "@/components/SharedFolderItem.vue";
import ItemModal from "@/components/ItemModal.vue";

export default {
  props: {
    shared_folder_path: String,
  },
  components: {
    SharedFolderItem,
    ItemModal,
  },
  data() {
    return {
      shared_folder: undefined,
    };
  },
  created() {},
  async mounted() {
    this.shared_folder = await this.$api.getFolder({
      path: this.shared_folder_path,
    });
    this.$api.join({ room: this.shared_folder_path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    opened_files() {
      if (!this.$route.query?.file) return false;
      return this.shared_files.find(
        (si) => this.getFilename(si.$path) === this.$route.query.file
      );
    },
    shared_files() {
      if (!this.shared_folder?.$files) return [];
      const _all_medias = JSON.parse(JSON.stringify(this.shared_folder.$files));

      const _stacks_of_medias = _all_medias.filter((m) => m.belongs_to_stack);

      // remove medias part of stacks
      const _medias_not_in_stacks = _all_medias.reduce((acc, m) => {
        if (m.belongs_to_stack) return acc;
        if (m.is_stack && m.stack_files_metas) {
          m._stack_files = m.stack_files_metas.map((sfm) =>
            _stacks_of_medias.find((sm) => sm.$path.endsWith("/" + sfm))
          );
        }
        acc.push(m);
        return acc;
      }, []);

      _medias_not_in_stacks.sort(
        (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
      );
      return _medias_not_in_stacks;
    },
    grouped_files() {
      return this.groupFilesByDay(this.shared_files);
    },
  },
  methods: {
    openFile(path) {
      let query = Object.assign({}, this.$route.query) || {};
      const meta_filename = this.getFilename(path);
      query.file = meta_filename;
      this.$router.push({ query });
    },
    closeFile() {
      let query = Object.assign({}, this.$route.query) || {};
      delete query.file;
      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._sharedFolder {
  padding-bottom: calc(var(--spacing) * 4);
  border-radius: 4px;
  // overflow: auto;
  // height: 100%;
}

._topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  // margin: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 1);
  border-bottom: 2px solid white;

  // background: white;
  backdrop-filter: blur(6px);
  // mask: linear-gradient(black 75%, transparent 100%);
  mask: linear-gradient(#000 55%, transparent);
}
._topbar--content {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: flex-end;
  padding: calc(var(--spacing) * 1);
}
._title {
  font-size: 1.5em;
  font-weight: 600;
}

._dayFileSection {
  padding: calc(var(--spacing) * 2);
}

._label {
  position: relative;
  z-index: 2;
  padding-bottom: calc(var(--spacing) * 2);
  font-weight: 600;
  font-size: var(--sl-font-size-normal);
}

._grid {
  position: relative;
  z-index: 1;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-end;
  gap: calc(var(--spacing) * 4) calc(var(--spacing) * 2);
}
._file {
  width: 150px;
}

._removeBtn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}

._floatingTopBtn {
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: calc(var(--spacing) / 1);
  pointer-events: none;

  > * {
    border-radius: 25px;
    padding: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
    background: black;
    color: white;
    pointer-events: auto;
  }
}

._footer {
  margin-top: calc(var(--spacing) * 6);
  text-align: center;

  a {
    color: inherit;
  }
}
</style>
