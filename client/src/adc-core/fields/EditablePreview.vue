<template>
  <component
    :is="tag"
    class="_editablePreview"
    :class="[
      'is--' + layout,
      {
        'is--editable': can_edit,
      },
    ]"
    @click="onClick"
  >
    <slot />
    <!-- sized in em so it follows the text, whatever the tag -->
    <button
      v-if="can_edit"
      type="button"
      class="_edit"
      :title="label || $t('edit')"
      :aria-label="label || $t('edit')"
      @click.stop="$emit('edit')"
    >
      <b-icon icon="pencil-fill" />
    </button>
  </component>
</template>
<script>
// Read-only preview of a field value, with a hover highlight and a pencil
// showing it can be edited. Clicking anywhere on it emits "edit".
export default {
  props: {
    can_edit: Boolean,
    tag: {
      type: String,
      default: "div",
    },
    // inline: text flow, pencil after the last word
    // block: rich text made of blocks, pencil pinned top right
    // row: list of items (tags, avatars), pencil as the last item
    layout: {
      type: String,
      default: "inline",
    },
    label: String,
  },
  methods: {
    onClick(event) {
      if (!this.can_edit) return;
      // let interactive children (links, show more buttons…) do their job
      if (
        event.target.closest?.(
          "a[href], button:not(:disabled), input, select, textarea, label"
        )
      )
        return;
      // don't start editing while selecting text
      if (window.getSelection && window.getSelection().toString().length > 0)
        return;
      this.$emit("edit");
    },
  },
};
</script>
<style lang="scss" scoped>
._editablePreview.is--editable {
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;

  // box-shadow extends the highlight without shifting the layout
  &:hover {
    background-color: var(--c-gris_clair);
    box-shadow: 0 0 0 0.25em var(--c-gris_clair);
  }
}

._editablePreview.is--block.is--editable {
  position: relative;
  padding-right: 1.25em;
}

._editablePreview.is--row {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}

._edit {
  all: unset;
  display: inline-block;
  margin-left: 0.3em;
  // a small glyph sitting on the baseline of the surrounding text
  font-size: 0.6em;
  line-height: 1;
  color: var(--c-gris_fonce);
  cursor: pointer;
  border-radius: 2px;
  // always visible (faint) so editable fields can be spotted at a glance
  opacity: 0.45;
  transition: opacity 0.15s ease, color 0.15s ease;

  .b-icon {
    min-width: 0;
    min-height: 0;
    width: 1em;
    height: 1em;
    vertical-align: baseline;
  }

  ._editablePreview:hover > &,
  &:focus-visible {
    opacity: 1;
    color: var(--c-noir);
  }

  &:focus-visible {
    outline: 2px solid var(--c-bleuvert);
    outline-offset: 2px;
  }

  // rich text is made of blocks: pin the pencil next to the first line
  .is--block > & {
    position: absolute;
    top: 0.35em;
    right: 0;
    margin: 0;
    font-size: max(0.6em, 0.75rem);
  }

  // next to tags or avatars, there's no text to follow
  .is--row > & {
    margin-left: 0;
    padding: 0.25em;
    font-size: 0.75rem;
  }
}
</style>
