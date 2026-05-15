<template>
  <BaseModal2 :title="$t('panes')" @close="$emit('close')">
    <p class="u-spacingBottom u-instructions" v-if="can_edit">
      {{ $t("panes_hidden_in_project_instr") }}
    </p>
    <RadioCheckboxInput
      :value="local_enabled"
      input_type="checkbox"
      :options="pane_options"
      :can_edit="can_edit"
      @update:value="onEnabledUpdate"
      class="_paneInput"
    />
    <template #footer>
      <SaveCancelButtons
        :allow_save="can_edit && has_changes"
        :cancel_text="$t('close')"
        @save="saveAndClose"
        @cancel="$emit('close')"
      />
    </template>
  </BaseModal2>
</template>
<script>
import BaseModal2 from "@/adc-core/modals/BaseModal2.vue";

export default {
  props: {
    project: Object,
    disabled_panes: Array,
    can_edit: Boolean,
  },
  components: { BaseModal2 },
  data() {
    return {
      local_disabled: [],
    };
  },
  watch: {
    disabled_panes: {
      handler(val) {
        this.syncLocalDisabled(val);
      },
      immediate: true,
    },
  },
  computed: {
    all_pane_types() {
      const all = [
        { type: "capture" },
        { type: "collect" },
        { type: "make" },
        { type: "publish" },
        { type: "notes_todo" },
        { type: "chats" },
      ];
      return all.filter((pane) => {
        if (pane.type === "chats") {
          return this.$root.app_infos?.instance_meta?.enable_chats === true;
        }
        return true;
      });
    },
    pane_options() {
      return this.all_pane_types.map((pane) => ({
        key: pane.type,
        label: this.$t(pane.type),
        icon_html: this.getIcon(pane.type) || undefined,
      }));
    },
    local_enabled() {
      return this.all_pane_types
        .map((p) => p.type)
        .filter((type) => !this.local_disabled.includes(type));
    },
    has_changes() {
      const current = (this.disabled_panes || []).slice().sort();
      const local = this.local_disabled.slice().sort();
      if (current.length !== local.length) return true;
      return current.some((t, i) => t !== local[i]);
    },
  },
  methods: {
    syncLocalDisabled(val) {
      this.local_disabled = val && val.length > 0 ? val.slice() : [];
    },
    onEnabledUpdate(new_enabled) {
      if (!this.can_edit) return;
      const all_types = this.all_pane_types.map((p) => p.type);
      this.local_disabled = all_types.filter((t) => !new_enabled.includes(t));
    },
    getIcon(type) {
      if (type === "capture") return this.dodoc_icon_capture;
      if (type === "collect") return this.dodoc_icon_collect;
      if (type === "make") return this.dodoc_icon_make;
      if (type === "publish") return this.dodoc_icon_publish;
      if (type === "notes_todo") return this.dodoc_icon_todo;
      if (type === "chats") return this.dodoc_icon_chats;
      return false;
    },
    saveAndClose() {
      if (!this.can_edit || !this.has_changes) return;
      this.$emit("updateDisabledPanes", this.local_disabled.slice());
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._paneInput {
  ::v-deep ._option_icon {
    // height: 1.5rem;
    // width: 1.5rem;
    // aspect-ratio: 1;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
}
</style>
