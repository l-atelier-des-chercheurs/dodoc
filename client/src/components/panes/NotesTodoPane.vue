<template>
  <div class="_notesTodoPane">
    <div class="_topTabs">
      <transition-group tag="div" class="_tabsReorder" name="tabsReorder">
        <div
          class="_tabGroup"
          v-for="(folder, index) in ordered_notes_folders"
          :key="folder.$path"
        >
          <div
            class="_dropZone"
            :class="{
              _dropZone_active: isDropZoneAvailable(index),
              _dropZone_hovered:
                drag_over_drop_index === index && isDropZoneAvailable(index),
            }"
            @dragover.prevent="handleDragOverDropZone(index)"
            @dragenter.prevent="handleDragEnterDropZone(index)"
            @dragleave="handleDragLeaveDropZone(index)"
            @drop.prevent="handleDropOnDropZone(index)"
          ></div>
          <div
            class="_tabWrapper"
            :class="{
              'is--dragSource': dragged_tab_index === index,
            }"
          >
            <button
              type="button"
              class="u-button u-button_black"
              :class="{
                'is--active': folder.$path === opened_notes_path,
              }"
              :draggable="can_edit_project"
              @click="toggleList(folder.$path)"
              @dragstart="handleDragStartTab(index)"
              @dragend="handleDragEndTab"
            >
              {{ folder.title }}
            </button>
          </div>
        </div>
      </transition-group>
      <div
        v-if="ordered_notes_folders.length > 0"
        class="_dropZone _dropZone_last"
        :class="{
          _dropZone_active: isDropZoneAvailable(ordered_notes_folders.length),
          _dropZone_hovered:
            drag_over_drop_index === ordered_notes_folders.length &&
            isDropZoneAvailable(ordered_notes_folders.length),
        }"
        @dragover.prevent="handleDragOverDropZone(ordered_notes_folders.length)"
        @dragenter.prevent="
          handleDragEnterDropZone(ordered_notes_folders.length)
        "
        @dragleave="handleDragLeaveDropZone(ordered_notes_folders.length)"
        @drop.prevent="handleDropOnDropZone(ordered_notes_folders.length)"
      ></div>
      <button
        type="button"
        class="u-button u-button_icon"
        :title="$t('create')"
        @click="show_create_notes_modal = true"
      >
        <b-icon icon="plus-lg" />
      </button>
    </div>

    <div class="_content">
      <transition name="fade" mode="out-in">
        <OpenedList
          v-if="!!current_opened_notes_path"
          :key="current_opened_notes_path"
          :path="current_opened_notes_path"
          @close="current_opened_notes_path = false"
        />
      </transition>
    </div>

    <CreateNotesList
      v-if="show_create_notes_modal"
      :path="path"
      @close="show_create_notes_modal = false"
      @openNew="handleFolderCreated"
    >
      <template #instructions>
        <div class="u-instructions">
          {{ $t("create_list_instructions") }}
        </div>
      </template>
    </CreateNotesList>
  </div>
</template>
<script>
import OpenedList from "@/components/notes/OpenedList.vue";
import CreateNotesList from "@/components/notes/CreateNotesList.vue";

export default {
  props: {
    project: Object,
    can_edit_project: {
      type: Boolean,
      default: false,
    },
    opened_notes_path: {
      type: String,
      default: undefined,
    },
  },
  components: {
    OpenedList,
    CreateNotesList,
  },
  data() {
    return {
      notes_folders: [],
      path: `${this.project.$path}/notes_todo`,
      show_create_notes_modal: false,
      dragged_tab_index: null,
      drag_over_drop_index: null,
    };
  },
  async mounted() {
    this.notes_folders = await this.getNotes();
    this.$api.join({ room: this.path });

    if (this.notes_folders.length === 0) {
      await this.createDefaultNotesFolder();
    } else if (!this.current_opened_notes_path) {
      this.current_opened_notes_path =
        this.ordered_notes_folders[0]?.$path || this.notes_folders[0]?.$path;
    }
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  computed: {
    todolists_order() {
      return Array.isArray(this.project?.todolists_order)
        ? this.project.todolists_order
        : [];
    },
    ordered_notes_folders() {
      if (!Array.isArray(this.notes_folders) || this.notes_folders.length === 0)
        return [];

      const ordered_slugs = this.todolists_order;
      const ordered_set = new Set(ordered_slugs);

      const folder_by_slug = this.notes_folders.reduce((acc, folder) => {
        acc[this.getFilename(folder.$path)] = folder;
        return acc;
      }, {});

      const ordered_folders = ordered_slugs
        .map((slug) => folder_by_slug[slug])
        .filter(Boolean);

      const unlisted_folders = this.notes_folders
        .filter((folder) => !ordered_set.has(this.getFilename(folder.$path)))
        .sort((a, b) => {
          const a_label = (
            a.title ||
            this.getFilename(a.$path) ||
            ""
          ).toString();
          const b_label = (
            b.title ||
            this.getFilename(b.$path) ||
            ""
          ).toString();
          return a_label.localeCompare(b_label, undefined, {
            sensitivity: "base",
          });
        });

      return [...ordered_folders, ...unlisted_folders];
    },
    current_opened_notes_path: {
      get() {
        return this.opened_notes_path || false;
      },
      set(new_path) {
        this.$emit("update:opened_notes_path", new_path);
      },
    },
  },
  methods: {
    getFilename(path) {
      if (!path) return "";
      return path.split("/").pop();
    },
    async getNotes() {
      const notes_folders = await this.$api.getFolders({
        path: this.path,
      });
      return notes_folders;
    },
    async createDefaultNotesFolder() {
      const slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: this.$t("task_list") + " 1",
        },
      });
      this.notes_folders = await this.getNotes();
      this.current_opened_notes_path = `${this.path}/${slug}`;
    },
    async handleFolderCreated(slug) {
      this.notes_folders = await this.getNotes();
      this.current_opened_notes_path = `${this.path}/${slug}`;
      this.show_create_notes_modal = false;
    },
    async removeNote(path) {
      await this.$api.deleteItem({ path });
      this.notes_folders = await this.getNotes();
      if (this.current_opened_notes_path === path) {
        this.current_opened_notes_path = false;
      }
    },
    toggleList(path) {
      // if (this.opened_notes_path === path) {
      //   this.opened_notes_path = null;
      //   return;
      // } else {
      this.current_opened_notes_path = path;
      // }
    },
    handleDragStartTab(index) {
      if (!this.can_edit_project) return;
      this.dragged_tab_index = index;
      this.drag_over_drop_index = null;
    },
    handleDragEndTab() {
      this.dragged_tab_index = null;
      this.drag_over_drop_index = null;
    },
    handleDragOverDropZone(index) {
      if (!this.isDropZoneAvailable(index)) return;
      this.drag_over_drop_index = index;
    },
    handleDragEnterDropZone(index) {
      if (!this.isDropZoneAvailable(index)) return;
      this.drag_over_drop_index = index;
    },
    handleDragLeaveDropZone(index) {
      if (this.drag_over_drop_index === index) {
        this.drag_over_drop_index = null;
      }
    },
    async handleDropOnDropZone(drop_index) {
      if (
        !this.can_edit_project ||
        this.dragged_tab_index === null ||
        !this.isDropZoneAvailable(drop_index)
      ) {
        this.handleDragEndTab();
        return;
      }

      let target_index = drop_index;
      if (target_index > this.dragged_tab_index) target_index -= 1;
      if (target_index === this.dragged_tab_index) {
        this.handleDragEndTab();
        return;
      }

      const reordered_folders = [...this.ordered_notes_folders];
      const dragged_folder = reordered_folders[this.dragged_tab_index];
      reordered_folders.splice(this.dragged_tab_index, 1);
      reordered_folders.splice(target_index, 0, dragged_folder);
      this.notes_folders = reordered_folders;

      await this.$api.updateMeta({
        path: this.project.$path,
        new_meta: {
          todolists_order: reordered_folders.map((folder) =>
            this.getFilename(folder.$path)
          ),
        },
      });

      this.handleDragEndTab();
    },
    isDropZoneAvailable(index) {
      if (!this.can_edit_project || this.dragged_tab_index === null)
        return false;
      return (
        index !== this.dragged_tab_index && index !== this.dragged_tab_index + 1
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._notesTodoPane {
  position: relative;
  height: 100%;
  background-color: var(--color-notes_todo);
  display: flex;
  flex-flow: column nowrap;
}

._topTabs {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  overflow-x: auto;
  padding: calc(var(--spacing) / 2);
  border-bottom: 2px dashed var(--c-noir);
  color: white;

  button {
    white-space: nowrap;
  }
}

._tabsReorder {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._tabWrapper {
  flex: 0 0 auto;
  border-radius: 6px;
}

._tabWrapper.is--dragSource {
  opacity: 0.4;
}

._tabGroup {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  flex: 0 0 auto;
}

._dropZone {
  position: relative;
  flex: 0 0 0;
  width: 0;
  align-self: stretch;
  min-height: 2.2rem;
  pointer-events: none;
  transition: flex-basis 0.2s ease, width 0.2s ease;

  &::before {
    content: "•";
    font-weight: 600;
    font-family: "Fira Mono";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    line-height: 1;
    font-size: 125%;
    color: white;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

._dropZone_active {
  flex-basis: calc(var(--spacing) * 1.5);
  width: calc(var(--spacing) * 1.5);
  pointer-events: auto;
  &::before {
    opacity: 0.2;
  }
}

._dropZone_hovered {
  &::before {
    opacity: 1;
  }
}

.tabsReorder-move {
  transition: transform 0.22s ease;
}

._content {
  flex: 1 1 0;
  height: 100%;
  overflow: auto;
}
</style>
