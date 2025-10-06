<template>
  <div class="_toggleInput">
    <label :for="id" class="_inputLabel">
      <input
        ref="field"
        :id="id"
        :name="label"
        class="_inputCb"
        type="checkbox"
        :disabled="disabled"
        :checked="content"
        @change="$emit('update:content', $event.target.checked)"
      />
      <span v-if="label" class="u-label _label">
        {{ label }}
      </span>
    </label>

    <div class="u-instructions" v-if="current_instruction">
      <small>{{ current_instruction }}</small>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    content: {
      type: Boolean,
      default: false,
    },
    options: Object,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      id: `id_${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 2
      )}`,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_instruction() {
      if (!this.options) return false;
      return this.options[this.content.toString()];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._toggleInput {
}
._inputLabel {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
._label {
  margin-bottom: 0;
}
._inputCb:checked {
  + ._label {
    font-weight: 500;
  }
}
</style>
