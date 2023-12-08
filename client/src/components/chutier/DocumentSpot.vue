<template>
  <div class="">
    <div
      class="_documentSpot"
      :class="{
        'is--draggedOn': is_draggedOn,
        'has--content': stack_files.length > 0,
        'is--expectingDrag': is_expecting_drag,
        'is--expectingClick': selected_items && selected_items.length > 0,
      }"
      @dragenter="dragEnter"
      @dragover="dragOver"
      @dragleave="dragLeave"
      @click="openOrAddToStack"
      @drop="drop"
    >
      <div class="_topContent">
        <template v-if="!stack">+</template>
        <template v-else>
          <MediaContent
            v-if="stack_files_in_order && stack_files_in_order.at(0)"
            class="_mediaPreview"
            context="preview"
            :file="stack_files_in_order.at(0)"
          />

          <transition name="pagechange" mode="out-in">
            <div class="_count" :key="stack_files_in_order.length">
              {{ stack_files_in_order.length }}
            </div>
          </transition>
        </template>

        <template
          v-if="
            is_expecting_drag || (selected_items && selected_items.length > 0)
          "
        >
          <div class="anim_backgroundPosition" />
          <div
            class="_addTo"
            v-if="
              !stack ||
              !stack_files_in_order ||
              stack_files_in_order.length === 0
            "
          >
            <!-- <b-icon icon="file-earmark-plus" /> -->
            +
          </div>
        </template>
        <LoaderSpinner v-if="is_adding_to_stack" class="_loader" />
      </div>
      <div class="_stackTitle" v-if="stack && stack.title">
        {{ stack.title }}
      </div>
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
        @removeMediaFromStack="removeMediaFromStack"
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
    selected_items: Array,
    stack_path: String,
  },
  components: {
    MediaStack,
  },
  data() {
    return {
      stack: undefined,
      is_expecting_drag: false,
      is_draggedOn: false,
      show_mediastack_modal: false,
      is_adding_to_stack: false,
    };
  },
  created() {},
  async mounted() {
    if (this.stack_path) {
      this.stack = await this.$api.getFolder({
        path: this.stack_path,
      });
      this.$api.join({ room: this.stack_path });
    }

    this.$eventHub.$on("chutierItem.startDrag", this.startDragItem);
    this.$eventHub.$on("chutierItem.endDrag", this.endDragItem);
  },
  beforeDestroy() {
    this.$eventHub.$off("chutierItem.startDrag", this.startDragItem);
    this.$eventHub.$off("chutierItem.endDrag", this.endDragItem);

    if (this.stack_path) this.$api.leave({ room: this.stack_path });
  },
  watch: {
    stack_path: {
      async handler() {},
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
      if (this.stack_files.length === 0 || !this.stack?.stack_files_metas)
        return [];

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
    startDragItem() {
      this.is_expecting_drag = true;
    },
    endDragItem() {
      this.is_expecting_drag = false;
    },
    dragEnter(event) {
      const drag_types = event.dataTransfer?.types[0] === "text/plain";
      if (drag_types) this.is_draggedOn = true;
    },
    dragOver(event) {
      event.preventDefault();
    },
    dragLeave() {
      this.is_draggedOn = false;
    },
    async drop(event) {
      this.$alertify.delay(4000).success("dropped item");

      event.preventDefault();
      this.is_draggedOn = false;

      if (this.selected_items.length > 0) await this.addSelectedToStack();
      else {
        const file_path = event.dataTransfer?.getData("text/plain");
        if (file_path) {
          const file_paths = [JSON.parse(file_path)];
          await this.createOrAppendToStack(file_paths);
        }
      }
    },
    async addSelectedToStack() {
      const file_paths = this.selected_items.map((f) => f.$path);
      await this.createOrAppendToStack(file_paths);
    },
    async openOrAddToStack() {
      if (this.selected_items.length > 0) await this.addSelectedToStack();
      else this.openStack();
    },
    async removeMediaFromStack(file_path) {
      await this.$api.copyFile({
        path: file_path,
        path_to_destination_folder: this.connected_as.$path,
        new_meta: {},
      });
      await this.$api.deleteItem({ path: file_path });

      let stack_files_metas = this.stack?.stack_files_metas.slice();
      stack_files_metas = stack_files_metas.filter((m) => m !== file_path);
      await this.$api.updateMeta({
        path: this.stack.$path,
        new_meta: {
          stack_files_metas,
        },
      });
    },
    openStack() {
      if (this.stack) this.show_mediastack_modal = true;
    },
    async createOrAppendToStack(file_paths) {
      this.is_adding_to_stack = true;

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

      await new Promise((r) => setTimeout(r, 100));

      let stack_files_metas = [];
      if (
        this.stack?.stack_files_metas &&
        Array.isArray(this.stack?.stack_files_metas)
      )
        stack_files_metas = this.stack?.stack_files_metas.slice();

      for (const file_path of file_paths) {
        const file_meta_name = await this.$api.copyFile({
          path: file_path,
          path_to_destination_folder,
          new_meta: {},
        });
        await this.$api.deleteItem({ path: file_path });

        stack_files_metas.push(file_meta_name);
        await this.$api.updateMeta({
          path: path_to_destination_folder,
          new_meta: {
            stack_files_metas,
          },
        });
      }

      await new Promise((r) => setTimeout(r, 300));

      this.is_adding_to_stack = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._documentSpot {
  position: relative;

  flex: 0 0 auto;
  width: 60px;

  margin: calc(var(--spacing) / 2) calc(var(--spacing) / 1);

  cursor: default;

  > * {
    pointer-events: none;
  }

  &:not(.has--content) {
    ._topContent {
      border: 1px dashed currentColor;
    }
  }
  &.has--content {
    cursor: pointer;

    &:hover,
    &:focus-visible {
      ._topContent {
        border-color: transparent;
        opacity: 0.8;
      }
    }
  }
  &.is--expectingClick {
    cursor: pointer;
  }

  &.is--draggedOn {
    ._topContent {
      cursor: pointer;
      transform: scale(1.2);
      background: black;
    }
  }

  &.is--expectingDrag {
    cursor: pointer;
    color: white;
  }
}
._topContent {
  position: relative;

  border-radius: 8px;
  overflow: hidden;
  color: #666;
  background: black;

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: var(--sl-font-size-x-large);
  font-weight: bolder;

  width: 60px;
  height: 60px;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
}
._stackTitle {
  font-size: var(--sl-font-size-x-small);
}

._mediaPreview {
  color: white;
}

._count {
  position: absolute;
  z-index: 10;
  color: white;
  text-shadow: #000 1px 0 10px;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: var(--sl-font-size-x-large);
}

.anim_backgroundPosition {
  position: absolute;
  width: 100%;
  height: 100%;
  color: black;
}

._addTo {
  color: white;
  position: absolute;
  // background: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

._loader {
  background: black;
  color: var(--c-rouge);
  z-index: 2;
}
</style>
