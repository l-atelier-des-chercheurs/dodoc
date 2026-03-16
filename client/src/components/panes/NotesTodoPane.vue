<template>
  <div class="_notesTodoPane">
    <div class="_topTabs">
      <button
        type="button"
        v-for="folder in notes_folders"
        :key="folder.$path"
        class="u-button u-button_black"
        :class="{
          'is--active': folder.$path === opened_notes_path,
        }"
        @click="toggleList(folder.$path)"
      >
        {{ folder.title }}
      </button>
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
    };
  },
  async mounted() {
    this.notes_folders = await this.getNotes();
    this.$api.join({ room: this.path });

    if (this.notes_folders.length === 0) {
      await this.createDefaultNotesFolder();
    } else if (!this.current_opened_notes_path) {
      this.current_opened_notes_path = this.notes_folders[0]?.$path;
    }
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  computed: {
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

._content {
  flex: 1 1 0;
  height: 100%;
  overflow: auto;
}
</style>
