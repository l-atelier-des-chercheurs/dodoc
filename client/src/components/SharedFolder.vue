<template>
  <div v-if="shared_folder" class="_sharedFolder">
    <div class="_floatingTopBtn">
      <div class="">Espace partagé</div>
    </div>

    <div class="_grid">
      <SharedFolderItem
        class="_item"
        v-for="file in shared_items"
        :key="file.$path"
        :file="file"
      />
    </div>
  </div>
</template>
<script>
import SharedFolderItem from "@/components/SharedFolderItem.vue";

export default {
  props: {
    shared_folder_path: String,
  },
  components: {
    SharedFolderItem,
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
    shared_items() {
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
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._sharedFolder {
  padding: calc(var(--spacing) * 1);
}

._grid {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: flex-end;
  gap: calc(var(--spacing) * 4) calc(var(--spacing) * 1);
}
._item {
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
</style>
