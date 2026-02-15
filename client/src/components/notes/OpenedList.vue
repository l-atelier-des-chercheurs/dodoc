<template>
  <div class="_openedList">
    <LoaderSpinner v-if="!list_meta" class="_loader" />
    <template v-else>
      <div class="_header">
        <TitleField
          :label="$t('name')"
          :show_label="false"
          :content.sync="list_meta.title"
          :path="list_meta.$path"
          :field_name="'title'"
          :tag="'h1'"
          :required="true"
          :maxlength="50"
          :can_edit="true"
        />
        <DropDown :right="true" :show_label="false">
          <button
            type="button"
            class="u-buttonLink u-buttonLink_red"
            @click="show_remove_modal = true"
          >
            <b-icon icon="trash" />
            {{ $t("remove") }}
          </button>

          <RemoveMenu2
            v-if="show_remove_modal"
            :modal_title="$t('remove_todo_list', { name: list_meta.title })"
            :success_notification="$t('todo_list_was_removed')"
            :path="list_meta.$path"
            @removedSuccessfully="$emit('close')"
            @close="show_remove_modal = false"
          />
        </DropDown>
      </div>
      <transition-group name="listComplete" class="_listItems" appear>
        <div key="header">
          <DLabel :str="$t('new_note_todo')" />
        </div>
        <div class="_listItem _listItem_newItem" key="newItem">
          <TextInput
            :content.sync="new_item_title"
            :placeholder="$t('title')"
            :custom_formats="[]"
            @onEnter="createNewItem"
          >
            <template #suffix>
              <button
                type="button"
                class="u-button u-button_icon"
                :disabled="new_item_title.length === 0"
                @click="createNewItem"
              >
                <transition name="fade">
                  <b-icon
                    :icon="
                      new_item_title.length === 0
                        ? 'plus-circle'
                        : 'plus-circle-fill'
                    "
                  />
                </transition>
              </button>
            </template>
          </TextInput>
        </div>

        <div key="todo-separator" class="_separator" />

        <div key="list">
          <DLabel
            :str="
              $tc('list_of_notes_todo', local_todo_items.length, {
                count: local_todo_items.length,
              })
            "
          />
        </div>

        <template v-for="(item, index) in local_todo_items">
          <div
            class="_dropZone"
            :class="{
              _dropZone_active:
                draggedIndex !== null &&
                draggedIndex !== index &&
                draggedIndex !== index - 1,
              _dropZone_hovered:
                dragOverIndex === index && draggedIndex !== null,
            }"
            :key="item.$path + '_dropZone'"
            @dragover.prevent="handleDragOver($event, index)"
            @dragenter.prevent="handleDragEnter(index)"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop($event, index)"
          ></div>

          <TodoListItem
            :key="item.$path"
            :item="item"
            :index="index"
            :draggable="true"
            @toggle-state="toggleItemState"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
            @duplicate-item="duplicateItem($event, index)"
            @remove-item="removeItem"
          />
          <div
            v-if="
              index === local_todo_items.length - 1 &&
              draggedIndex !== local_todo_items.length - 1
            "
            class="_dropZone _dropZone_last"
            :class="{
              _dropZone_active: draggedIndex !== null,
              _dropZone_hovered:
                dragOverIndex === index + 1 && draggedIndex !== null,
            }"
            :key="item.$path + '_dropZone_last'"
            @dragover.prevent="handleDragOver($event, index + 1)"
            @dragenter.prevent="handleDragEnter(index + 1)"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop($event, index + 1)"
          ></div>
        </template>

        <div
          v-if="list_items_done.length > 0"
          key="done-separator"
          class="_separator"
        />

        <template v-if="list_items_done.length > 0">
          <div key="done-header">
            <DLabel
              :str="
                $tc('archived', list_items_done.length, {
                  count: list_items_done.length,
                })
              "
            />
          </div>
          <TodoListItem
            v-for="item in list_items_done"
            :key="item.$path"
            :item="item"
            :draggable="false"
            @toggle-state="toggleItemState"
            @duplicate-item="duplicateItem"
            @remove-item="removeItem"
          />
        </template>
      </transition-group>

      <div class="_footer"></div>
    </template>

    <!-- <pre>{{ list_meta }}</pre> -->
  </div>
</template>
<script>
import TodoListItem from "./TodoListItem.vue";

export default {
  props: {
    path: {
      type: String,
      required: true,
    },
  },
  components: {
    TodoListItem,
  },
  data() {
    return {
      new_item_title: "",
      list_meta: undefined,
      draggedIndex: null,
      dragOverIndex: null,
      local_todo_items: [],

      show_remove_modal: false,

      opened_item_path: undefined,
    };
  },
  async created() {
    await this.fetchListMeta();
    this.$api.join({ room: this.path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {
    list_items_todo: {
      handler(newItems) {
        // Update local items when computed property changes
        // Only update if the order actually changed (not just during drag)
        if (this.draggedIndex === null) {
          this.local_todo_items = [...newItems];
        }
      },
      immediate: true,
    },
  },
  computed: {
    all_notes() {
      return this.list_meta?.$files || [];
    },
    list_items_todo() {
      if (
        this.list_meta === undefined ||
        Array.isArray(this.list_meta.notes_list) === false
      )
        return [];

      const todo_items = this.all_notes.filter(
        (note) => note?.state === "todo"
      );

      // Reorder all todo_items: first, items listed in list_meta.notes_list in that order,
      // then items not listed (appended at the end).
      if (this.list_meta && Array.isArray(this.list_meta?.notes_list)) {
        // Get meta_filenames in the order specified by notes_list
        const listedFilenames = this.list_meta.notes_list.map(
          (meta) => meta.meta_filename
        );

        // Partition todo_items: those listed, and those not listed
        const listedItems = [];
        const listedSet = new Set(listedFilenames);
        todo_items.forEach((note) => {
          if (listedSet.has(note.$path.split("/").pop())) {
            listedItems.push(note);
          }
        });

        // Order listedItems according to listedFilenames
        const orderedListedItems = listedFilenames
          .map((meta_filename) =>
            listedItems.find((note) => note.$path.endsWith("/" + meta_filename))
          )
          .filter(Boolean);

        // Find unlisted items (in todo_items but not listed in notes_list)
        const unlistedItems = todo_items.filter(
          (note) => !listedSet.has(note.$path.split("/").pop())
        );
        // Concatenate: ordered listed items first, then unlisted items
        // const reordered = [...orderedListedItems, ...unlistedItems];

        // disabled for now, hopefully no unliisted note items appear there
        const reordered = orderedListedItems;

        // Now reimplement the logic below by returning reordered instead
        return reordered;
      } else {
        return todo_items;
      }
    },
    list_items_done() {
      return this.all_notes
        .filter((note) => note?.state === "done")
        .sort((a, b) => {
          const a_done_date = a.done_date ? new Date(a.done_date) : 0;
          const b_done_date = b.done_date ? new Date(b.done_date) : 0;
          return b_done_date.getTime() - a_done_date.getTime();
        });
    },
  },
  methods: {
    async fetchListMeta() {
      const list_meta = await this.$api.getFolder({
        path: this.path,
      });
      this.list_meta = list_meta;
    },
    async createNewItem() {
      if (!this.new_item_title) return;
      const filename = `${this.new_item_title}.txt`;

      const { meta_filename } = await this.$api.uploadText({
        path: this.list_meta.$path,
        filename,
        content: "",
        additional_meta: {
          title: this.new_item_title,
          state: "todo",
        },
      });

      this.new_item_title = "";

      const current_list = JSON.parse(
        JSON.stringify(this.list_meta?.notes_list || [])
      );
      current_list.splice(0, 0, { meta_filename });

      this.$api.updateMeta({
        path: this.list_meta.$path,
        new_meta: {
          notes_list: current_list,
        },
      });
    },
    async toggleItemState(item, isChecked) {
      const new_meta = {
        state: isChecked ? "done" : "todo",
      };

      if (isChecked) {
        new_meta.done_date = new Date().toISOString();
      } else {
        new_meta.done_date = null;
      }

      await this.$api.updateMeta({
        path: item.$path,
        new_meta,
      });

      const filename = item.$path.split("/").pop();

      let current_list = JSON.parse(
        JSON.stringify(this.list_meta?.notes_list || [])
      );
      if (isChecked) {
        current_list = current_list.filter(
          (meta) => meta.meta_filename !== filename
        );
      } else {
        current_list.push({ meta_filename: filename });
      }

      await this.$api.updateMeta({
        path: this.list_meta.$path,
        new_meta: { notes_list: current_list },
      });
    },
    async removeItem(item) {
      await this.$api.deleteItem({
        path: item.$path,
      });

      let current_list = JSON.parse(
        JSON.stringify(this.list_meta?.notes_list || [])
      );
      current_list = current_list.filter(
        (meta) => meta.meta_filename !== item.$path.split("/").pop()
      );

      await this.$api.updateMeta({
        path: this.list_meta.$path,
        new_meta: { notes_list: current_list },
      });
    },
    async duplicateItem(item, index) {
      const meta_filename = await this.$api.copyFile({
        path: item.$path,
      });

      if (item.state === "todo" && index !== undefined) {
        const current_list = JSON.parse(
          JSON.stringify(this.list_meta?.notes_list || [])
        );
        current_list.splice(index + 1, 0, { meta_filename });

        await this.$api.updateMeta({
          path: this.list_meta.$path,
          new_meta: { notes_list: current_list },
        });
      }
    },
    handleDragStart(event, item, index) {
      this.draggedIndex = index;
      // Event handling is already done in TodoListItem
    },
    handleDragEnd(event) {
      if (event.target && event.target.style) {
        event.target.style.opacity = "";
      }
      this.draggedIndex = null;
      this.dragOverIndex = null;
    },
    handleDragOver(event, index) {
      event.preventDefault();
      if (this.draggedIndex !== null && this.draggedIndex !== index) {
        this.dragOverIndex = index;
      }
    },
    handleDragEnter(index) {
      if (this.draggedIndex !== null && this.draggedIndex !== index) {
        this.dragOverIndex = index;
      }
    },
    handleDragLeave(event) {
      // Only clear if we're leaving the list item itself, not a child element
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        this.dragOverIndex = null;
      }
    },
    handleDrop(event, dropIndex) {
      event.preventDefault();
      if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
        return;
      }

      if (dropIndex > this.draggedIndex) {
        dropIndex--;
      }

      // Reorder items locally for immediate visual feedback
      const newItems = [...this.local_todo_items];
      const draggedItem = newItems[this.draggedIndex];
      newItems.splice(this.draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);
      this.local_todo_items = newItems;

      // Update the order on the server
      this.updateTodoOrder(newItems);

      this.draggedIndex = null;
      this.dragOverIndex = null;
    },
    async updateTodoOrder(reorderedItems) {
      // Extract meta_filename from each reordered item
      const reorderedMetaFilenames = reorderedItems.map((item) => {
        const filename = item.$path.split("/").pop();
        return { meta_filename: filename };
      });

      // Get current notes_list and separate done items
      const current_list = JSON.parse(
        JSON.stringify(this.list_meta?.notes_list || [])
      );

      const all_notes = this.list_meta?.$files || [];
      const doneItemsInList = current_list.filter((meta) => {
        const note = all_notes.find((note) =>
          note.$path.endsWith("/" + meta.meta_filename)
        );
        return note && note.state === "done";
      });

      // Create new list: reordered todo items first, then done items
      const updated_list = [...reorderedMetaFilenames, ...doneItemsInList];

      await this.$api.updateMeta({
        path: this.list_meta.$path,
        new_meta: {
          notes_list: updated_list,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._openedList {
  position: relative;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;

  padding: calc(var(--spacing) * 2);
  max-width: 800px;
  margin: 0 auto;
}

._loader {
  position: absolute;
  inset: 0;
  background: transparent;
}

._header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: calc(var(--spacing) * 1);
  :deep(h1) {
    color: white;
    font-size: var(--sl-font-size-large);
    line-height: 1.2;
    font-weight: 500;
  }
  :deep(._toggleDropdown) {
    color: white;
  }
}

._listItems {
  position: relative;
  background-color: rgba(0, 0, 0, 0.1);
  padding: calc(var(--spacing) / 2);
  border-radius: calc(var(--border-radius) * 2);

  :deep(.u-label) {
    color: white;
  }
}

._todoList {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._listItem {
  position: relative;
  background-color: white;
  padding: calc(var(--spacing) / 2);
  border-radius: var(--border-radius);
  margin-bottom: calc(var(--spacing) / 4);
}

._listItem_newItem {
  // display: flex;
  // flex-flow: row nowrap;
  padding: 0;
  background-color: transparent;
  padding-right: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 2);

  .u-button {
    color: white;
  }
}

._separator {
  margin: calc(var(--spacing)) 0;
  // border: none;
  // border-top: 1px solid var(--c-bleumarine_clair);
}

._listItems_done {
  margin-top: calc(var(--spacing) / 2);
}

._dropZone {
  position: relative;
  height: calc(var(--spacing) / 1);
  margin-top: calc(var(--spacing) / -1);
  margin-bottom: calc(var(--spacing) / -1);
  border-radius: var(--border-radius);
  transition: height 0.2s ease, background-color 0.2s ease;
  background-color: transparent;
  height: calc(var(--spacing) * 2);
  width: calc(100% + 20px);
  margin-left: -10px;
  background-color: transparent;
  pointer-events: none;
  // background-color: red;

  z-index: 1000;

  &:not(._dropZone_first) {
  }

  &::before {
    content: "•";
    font-weight: 600;
    font-family: "Fira Mono";
    position: absolute;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    // top: -10px;
    line-height: 0;
    left: 0;
    font-size: 150%;
    color: white;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

._dropZone_active {
  pointer-events: auto;
  &::before {
    opacity: 0.2;
  }
}

._dropZone_hovered {
  // background-color: white;

  &::before {
    opacity: 1;
  }

  + ._todoListItem {
    transform: translateY(5px);
    transition: transform 0.2s 0.3s ease;
  }
}

._footer {
  flex: 0 0 auto;
  height: calc(var(--spacing) * 2);
  width: 100%;
}
</style>
