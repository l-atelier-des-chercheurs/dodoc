<template>
  <div class="_startsOnPagePicker">
    <button
      type="button"
      class="_card _card--current"
      :title="current_option.text"
      @click="show_modal = true"
    >
      <StartsOnPageSchema :option_key="current_option.key" />
      <span class="_card--text">{{ current_option.text }}</span>
      <b-icon class="_card--icon" icon="chevron-down" aria-hidden="true" />
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('starts_on_page')"
      @close="show_modal = false"
    >
      <div class="u-instructions u-spacingBottom">
        <small>{{ $t(instructions_key) }}</small>
      </div>
      <div class="_options" role="radiogroup">
        <button
          v-for="option in options"
          :key="option.key"
          type="button"
          class="_card"
          role="radio"
          :class="{ 'is--active': option.key === current_option.key }"
          :aria-checked="option.key === current_option.key"
          @click="selectOption(option.key)"
        >
          <StartsOnPageSchema :option_key="option.key" />
          <span class="_card--text">{{ option.text }}</span>
        </button>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import StartsOnPageSchema from "@/components/publications/edition/StartsOnPageSchema.vue";

export default {
  props: {
    options: Array,
    value: String,
  },
  components: {
    StartsOnPageSchema,
  },
  data() {
    return {
      show_modal: false,
    };
  },
  computed: {
    // chapters that can not flow (grids, galleries) have no "in the flow" option
    instructions_key() {
      return this.options.some((o) => o.key === "")
        ? "starts_on_page_instructions"
        : "starts_on_page_instructions_new_page";
    },
    current_option() {
      return (
        this.options.find((o) => o.key === (this.value || "")) ||
        this.options[0]
      );
    },
  },
  methods: {
    selectOption(key) {
      if (key !== this.current_option.key) this.$emit("select", key);
      this.show_modal = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._startsOnPagePicker {
  display: flex;
}

._options {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._card {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 1);
  width: 100%;
  padding: calc(var(--spacing) / 2);
  font: inherit;
  color: inherit;
  text-align: left;
  // transparent border like the inputs, so heights match
  border: 2px solid transparent;
  border-radius: var(--input-border-radius);
  background: var(--c-gris_clair);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: var(--c-gris);
  }

  &.is--active {
    background: var(--c-gris);
  }
}

// same height as the inputs and selects next to it:
// one line of text + vertical padding + 2px borders
._card--current {
  --card-height: calc(
    var(--input-font-size) * 1.5 + var(--spacing) + 4px
  );
  --schema-height: calc(var(--card-height) - 4px - 8px);
  box-sizing: border-box;
  width: auto;
  max-width: 100%;
  height: var(--card-height);
  padding: 0 calc(var(--spacing) / 2) 0 4px;
  gap: calc(var(--spacing) / 2);
}

._card--text {
  flex: 1 1 auto;
  font-size: var(--sl-font-size-small);
  line-height: 1.2;
}

._card--icon {
  flex: 0 0 auto;
}
</style>
