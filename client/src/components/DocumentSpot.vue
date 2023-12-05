<template>
  <div
    class="_documentSpot"
    :class="{
      'is--draggedOn': is_draggedOn,
    }"
    @dragenter="dragEnter"
    @dragover="dragOver"
    @dragleave="dragLeave"
    @drop="drop"
  >
    <template v-if="!stack">+</template>
    <template v-else>
      <div class="" v-for="file in stack_files" :key="file.$path">
        <MediaContent context="preview" :file="file" />
      </div>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    index: Number,
    author_stacks_path: String,
    stack_path: String,
  },
  components: {},
  data() {
    return {
      stack: undefined,
      is_draggedOn: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {
    if (this.stack.$path) this.$api.leave({ room: this.stack.$path });
  },
  watch: {
    stack_path: {
      async handler() {
        if (!this.stack && this.stack_path) {
          this.stack = await this.$api.getFolder({
            path: this.stack_path,
          });
          this.$api.join({ room: this.stack.$path });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  computed: {
    stack_files() {
      if (this.stack?.$files && this.stack.$files.length > 0)
        return this.stack.$files;
      return [];
    },
  },
  methods: {
    async listStack() {},
    dragEnter(event) {
      const file_path = event.dataTransfer.getData("text/uri-list");
      if (file_path) this.is_draggedOn = true;
    },
    dragOver(event) {
      event.preventDefault();
    },
    dragLeave() {
      this.is_draggedOn = false;
    },
    async drop(event) {
      event.preventDefault();
      this.is_draggedOn = false;
      const file_path = event.dataTransfer.getData("text/uri-list");
      if (file_path) {
        await this.createOrAppendToStack(JSON.parse(file_path));
      }
    },
    async createOrAppendToStack(file_path) {
      let path_to_destination_folder;

      if (this.stack?.$path) {
        path_to_destination_folder = this.stack.$path;
      } else {
        const additional_meta = {
          requested_slug: "stack",
          stack_spot: this.index,
          $admins: [this.connected_as.$path],
        };

        const new_folder_slug = await this.$api
          .createFolder({
            path: this.author_stacks_path,
            additional_meta,
          })
          .catch((err) => {
            this.$alertify.delay(4000).error(err);
            throw err;
          });

        path_to_destination_folder =
          this.author_stacks_path + "/" + new_folder_slug;
      }

      // copy file to folder
      const file_meta_name = await this.$api.copyFile({
        path: file_path,
        path_to_destination_folder,
        new_meta: {},
      });
      await this.$api.deleteItem({ path: file_path });
      file_meta_name;
      debugger;

      // update folder meta to append file

      // await this.$api.updateMeta({
      //   path: file_path,
      //   new_meta: {
      //     belongs_to_stack: this.stack.$path,
      //   },
      // });
    },
  },
};
</script>
<style lang="scss" scoped>
._documentSpot {
  position: relative;

  width: 60px;
  height: 60px;
  margin-bottom: calc(var(--spacing) / 1);
  border-radius: 8px;

  border: 2px dotted currentColor;

  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: var(--sl-font-size-x-large);
  font-weight: bolder;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  &.is--draggedOn {
    background: var(--c-gris);
  }
}
</style>
