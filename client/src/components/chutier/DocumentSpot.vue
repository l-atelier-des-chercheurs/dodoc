<template>
  <div class="">
    <div
      class="_documentSpot"
      :class="{
        'is--draggedOn': is_draggedOn,
        'has--content': stack_files.length > 0,
      }"
      @dragenter="dragEnter"
      @dragover="dragOver"
      @dragleave="dragLeave"
      @drop="drop"
      @click="openStack"
    >
      <template v-if="!stack">+</template>
      <template v-else>
        <!-- <div class="" v-for="file in stack_files" :key="file.$path">
          <MediaContent context="preview" :file="file" />
        </div> -->
        <template v-if="stack_files && stack_files.at(-1)">
          <MediaContent context="preview" :file="stack_files.at(-1)" />
          <div class="_count">{{ stack_files.length }}</div>
        </template>
      </template>
    </div>

    <!-- <OpenStack
      v-if="show_stack"
      class="_showStack"
      :stack="stack"
      @close="show_stack = false"
    /> -->
    <transition name="slideup">
      <MediaStack
        v-if="show_mediastack_modal"
        class="_mediaStack"
        :stack="stack"
        :files="stack_files_in_order"
        @close="show_mediastack_modal = false"
      />
    </transition>
  </div>
</template>
<script>
import MediaStack from "@/components/chutier/MediaStack.vue";

export default {
  props: {
    index: Number,
    author_stacks_path: String,
    stack_path: String,
  },
  components: {
    MediaStack,
  },
  data() {
    return {
      stack: undefined,
      is_draggedOn: false,
      show_mediastack_modal: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {
    if (this.stack?.$path) this.$api.leave({ room: this.stack.$path });
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
    stack_files_in_order() {
      return this.stack.stack_files_metas.reduce((acc, meta_filename) => {
        const file = this.stack_files.find(
          (f) => this.getFilename(f.$path) === meta_filename
        );
        if (file) acc.push(file);
        return acc;
      }, []);
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
    openStack() {
      this.show_mediastack_modal = true;
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

      await this.appendMetaToStack(path_to_destination_folder, file_meta_name);
    },
    async appendMetaToStack(path_to_destination_folder, file_meta_name) {
      let stack_files_metas = this.stack.stack_files_metas?.slice() || [];
      stack_files_metas.push(file_meta_name);

      // update folder meta to append file
      await this.$api.updateMeta({
        path: path_to_destination_folder,
        new_meta: {
          stack_files_metas,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._documentSpot {
  position: relative;

  width: 60px;
  height: 60px;
  flex: 0 0 auto;
  margin-bottom: calc(var(--spacing) / 1);
  border-radius: 8px;
  border: 2px dotted currentColor;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: var(--sl-font-size-x-large);
  font-weight: bolder;

  cursor: pointer;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &.has--content {
    border-color: transparent;
    background: #333;
  }

  &:hover,
  &:focus-visible,
  &.is--draggedOn {
    transform: scale(1.2);
    background: black;
  }

  > * {
    pointer-events: none;
  }
}

._count {
  position: absolute;
  color: white;
  bottom: 0;
  right: 0;
  font-size: var(--sl-font-size-small);
}
</style>
