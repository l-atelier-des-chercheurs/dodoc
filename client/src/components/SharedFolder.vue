<template>
  <div v-if="shared_folder">
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
      const _medias = JSON.parse(JSON.stringify(this.shared_folder.$files));
      _medias.sort(
        (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
      );
      return _medias;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 2px;
  margin: 2px;
  // padding: 0 calc(var(--spacing) / 2);
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
