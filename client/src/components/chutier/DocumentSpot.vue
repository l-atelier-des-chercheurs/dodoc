<template>
  <div class="">
    <div
      class="_documentSpot"
      :class="{
        'is--draggedOn': is_draggedOn,
        'has--content': stack,
        'is--expectingDrag': mode === 'add',
        'is--expectingClick': selected_items && selected_items.length > 0,
      }"
      @dragenter="dragEnter"
      @dragover="dragOver"
      @dragleave="dragLeave"
      @click="openOrAddToStack"
      @drop="drop"
    >
      <div class="_topContent">
        <div v-if="!stack" class="_plus">+</div>
        <template v-else>
          <MediaContent
            v-if="stack.$preview"
            :file="stack.$preview"
            class="_mediaPreview"
          />
          <div v-else class="_mediaPreview _noPreview">
            {{ $t("no_preview_to_show") }}
          </div>

          <transition name="pagechange" mode="out-in">
            <div
              class="_count"
              v-if="stack && stack.stack_files_metas"
              :key="stack.stack_files_metas.length + '_' + mode"
            >
              <template v-if="mode === 'add'">+</template>
              {{ stack.stack_files_metas.length }}
            </div>
          </transition>
        </template>

        <transition name="slideupFade" mode="out-in">
          <div class="" v-if="mode === 'add'">
            <div class="anim_backgroundPosition" :key="mode" />
          </div>
        </transition>

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
    <transition name="slideup" mode="out-in">
      <StackDisplay
        v-if="show_mediastack_modal"
        class="_stackModal"
        :stack_path="stack.$path"
        :context="'chutier'"
        @close="show_mediastack_modal = false"
      />
    </transition>
  </div>
</template>
<script>
import StackDisplay from "@/components/StackDisplay.vue";

export default {
  props: {
    index: Number,
    author_stacks_path: String,
    selected_items: Array,
    mode: String,
    stack: Object,
  },
  components: {
    StackDisplay,
  },
  data() {
    return {
      is_draggedOn: false,
      show_mediastack_modal: false,
      is_adding_to_stack: false,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
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
    openStack() {
      if (this.stack) this.show_mediastack_modal = true;
    },
    async createOrAppendToStack(file_paths) {
      this.is_adding_to_stack = true;

      let path_to_destination_folder;
      if (this.stack?.$path) {
        path_to_destination_folder = this.stack?.$path;
      } else {
        let additional_meta = {
          requested_slug: "stack",
          stack_spot: this.index,
          $authors: [this.connected_as.$path],
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

      await new Promise((r) => setTimeout(r, 250));

      let stack_files_metas = [];

      if (
        this.stack &&
        this.stack.stack_files_metas &&
        Array.isArray(this.stack.stack_files_metas)
      )
        stack_files_metas = this.stack.stack_files_metas.slice();

      for (const file_path of file_paths) {
        const file_meta_name = await this.$api.copyFile({
          path: file_path,
          path_to_destination_folder,
          new_meta: {},
        });
        await this.$api.deleteItem({ path: file_path });

        stack_files_metas.push(file_meta_name);
        let new_meta = {
          stack_files_metas,
        };
        if (stack_files_metas.length === 1) new_meta.$preview = file_meta_name;

        await this.$api.updateMeta({
          path: path_to_destination_folder,
          new_meta,
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
  width: auto;

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
  background: var(--sd-separator);

  display: flex;
  justify-content: center;
  align-items: center;

  font-size: var(--sl-font-size-x-large);
  font-weight: bolder;

  width: 50px;
  height: 50px;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
}
._stackTitle {
  font-size: var(--sl-font-size-x-small);
}

._mediaPreview {
  width: 100%;
  height: 100%;

  &._noPreview {
    font-size: 30%;
    padding: calc(var(--spacing) / 4);
  }

  ::v-deep ._mediaContent--image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    max-width: none;
  }
}

._count {
  position: absolute;
  z-index: 10;
  color: white;
  text-shadow: #000 1px 0 10px;

  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  font-size: var(--sl-font-size-medium);
}

.anim_backgroundPosition {
  position: absolute;
  width: 100%;
  height: 100%;
  color: rgba(0, 0, 0, 0.3);
  z-index: 9;
  top: 0;
  left: 0;
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
  background: #424146;
  color: var(--c-rouge);
  z-index: 2;
}

._plus {
  color: var(--active-color);
}
</style>
