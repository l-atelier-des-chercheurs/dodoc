<template>
  <div
    class="_todoListItem"
    :class="{
      '_todoListItem--todo': item.state === 'todo',
      '_todoListItem--done': item.state === 'done',
      '_todoListItem--expanded': isExpanded,
      '_todoListItem--dragging': isDragging,
    }"
    :draggable="item.state === 'todo' && draggable"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <div class="_todoListItem_header">
      <div
        class="_todoListItem_header--clickZone"
        @click.stop="expandCollapse"
      />
      <input
        type="checkbox"
        :checked="item.state === 'done'"
        @change="toggleItemState"
        @click.stop
        class="_checkbox"
      />
      <div class="_itemTitle">
        <TitleField
          :field_name="'title'"
          :label="$t('title')"
          :show_label="false"
          :content="item.title"
          :path="item.$path"
          :required="true"
          :can_edit="isExpanded"
        />
      </div>
      <span v-if="item.state === 'done'" class="u-instructions _doneDate">
        {{ showDoneDate(item) }}
      </span>
      <b-icon v-if="has_notes" icon="text-paragraph" />
      <button
        v-if="isExpanded"
        type="button"
        class="u-button u-button_icon u-button_small"
        @click.stop="collapse"
        :title="$t('close')"
      >
        <b-icon icon="chevron-up" />
      </button>
      <button
        v-else
        type="button"
        class="u-button u-button_icon u-button_small"
        @click.stop="expand"
        :title="$t('open')"
      >
        <b-icon icon="chevron-down" />
      </button>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="_todoListItem_content">
        <CollaborativeEditor3
          :path="item.$path"
          :content="item.$content"
          :placeholder="$t('note_content')"
          :can_edit="can_edit"
          :custom_formats="['bold', 'italic', 'link']"
          class="_noteEditor"
        />
        <div class="_todoListItem_content_footer">
          <button
            type="button"
            class="u-button u-button_verysmall"
            @click.stop="duplicateItem"
          >
            <b-icon icon="file-plus" />
            {{ $t("duplicate") }}
          </button>
          <button
            type="button"
            class="u-button u-button_verysmall"
            @click.stop="removeItem"
          >
            <b-icon icon="trash" />
            {{ $t("remove") }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "TodoListItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      default: null,
    },
    draggable: {
      type: Boolean,
      default: true,
    },
    can_edit: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      isExpanded: false,
      isDragging: false,
      itemContent: null,
      isLoadingContent: false,
    };
  },
  computed: {
    has_notes() {
      return this.item.$content?.length > 0 || false;
    },
  },
  methods: {
    async toggleItemState(event) {
      const isChecked = event.target.checked;
      this.$emit("toggle-state", this.item, isChecked);
    },
    async expandCollapse(event) {
      // Don't expand if clicking on checkbox or button
      if (
        event.target.closest("._checkbox") ||
        event.target.closest("button")
      ) {
        return;
      }

      if (!this.isExpanded) {
        await this.expand();
      } else {
        await this.collapse();
      }
    },
    async expand() {
      if (this.isExpanded) return;

      this.isExpanded = true;
    },
    collapse() {
      this.isExpanded = false;
    },

    handleDragStart(event) {
      this.isDragging = true;
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/html", event.target);
      if (event.target && event.target.style) {
        event.target.style.opacity = "0.5";
      }
      this.$emit("drag-start", event, this.item, this.index);
    },
    handleDragEnd(event) {
      this.isDragging = false;
      if (event.target && event.target.style) {
        event.target.style.opacity = "";
      }
      this.$emit("drag-end", event);
    },
    showDoneDate(item) {
      return item.done_date
        ? new Date(item.done_date).toLocaleDateString()
        : "";
    },
    async duplicateItem() {
      this.$emit("duplicate-item", this.item);
    },
    async removeItem() {
      this.$emit("remove-item", this.item);
    },
  },
};
</script>

<style lang="scss" scoped>
._todoListItem {
  position: relative;
  background-color: white;
  padding: calc(var(--spacing) / 2);
  border-radius: var(--border-radius);
  margin-bottom: calc(var(--spacing) / 4);
  transition: transform 0.2s ease, opacity 0.2s ease;

  &--todo {
    display: flex;
    flex-flow: column nowrap;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &._todoListItem--dragging {
      opacity: 0.5;
    }
  }

  &--done {
    display: flex;
    flex-flow: column nowrap;
    opacity: 0.7;
  }

  &--expanded {
    ._todoListItem_content {
      margin-top: calc(var(--spacing) / 2);
      padding-top: calc(var(--spacing) / 2);
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }
  }
}

._todoListItem_header {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  width: 100%;
  gap: calc(var(--spacing) / 2);
  user-select: none;
  cursor: pointer;

  button,
  input[type="checkbox"] {
    position: relative;
    z-index: 2;
  }
}
._todoListItem_header--clickZone {
  position: absolute;
  inset: calc(var(--spacing) / -2);
  z-index: 1;
}

._checkbox {
  flex: 0 0 auto;
  cursor: pointer;
}

._itemTitle {
  flex: 1 1 auto;
}

._doneDate {
  flex: 0 0 auto;
  font-size: 0.85em;
  color: rgba(0, 0, 0, 0.6);
}

._todoListItem_content {
  position: relative;
  // min-height: 100px;
}

._noteEditor {
  width: 100%;
}

._todoListItem_content_footer {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
  margin-top: calc(var(--spacing) / 2);
  padding-top: calc(var(--spacing) / 2);

  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

// Expand transition
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
}

.expand-enter-to,
.expand-leave {
  max-height: 1000px;
  opacity: 1;
}
</style>
