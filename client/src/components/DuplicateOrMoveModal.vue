<template>
  <BaseModal2 :title="title || $t('duplicate_or_move')" @close="$emit('close')">
    <div v-if="scope_options" class="u-spacingBottom">
      <DLabel :str="$t('where')" />
      <RadioCheckboxInput
        :value="scope"
        :options="scope_options"
        :can_edit="!is_copying"
        @update:value="$emit('update:scope', $event)"
      />
    </div>

    <slot />

    <template slot="footer">
      <template v-if="!is_copying">
        <button type="button" class="u-button" @click="$emit('close')">
          <b-icon icon="x-circle" />
          {{ $t("cancel") }}
        </button>
        <div class="u-sameRow _actions">
          <button
            v-if="show_move"
            class="u-button"
            type="button"
            :disabled="!can_confirm || !!move_disabled_reason"
            :title="move_disabled_reason || ''"
            @click="$emit('confirm', { remove_original: true })"
          >
            <b-icon icon="arrow-left-right" />
            {{ $t("move") }}
          </button>
          <button
            class="u-button u-button_bleuvert"
            type="button"
            :disabled="!can_confirm"
            @click="$emit('confirm', { remove_original: false })"
          >
            <b-icon :icon="duplicate_icon" />
            {{ duplicate_label || $t("duplicate") }}
          </button>
        </div>
      </template>
      <LoaderSpinner v-else />
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    title: String,
    scope: String,
    scope_options: Array,
    can_confirm: Boolean,
    show_move: {
      type: Boolean,
      default: true,
    },
    // moving to where the item already is does nothing
    move_disabled_reason: [String, Boolean],
    duplicate_label: String,
    duplicate_icon: {
      type: String,
      default: "file-plus",
    },
    is_copying: Boolean,
  },
};
</script>
<style lang="scss" scoped>
._actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
}
</style>
