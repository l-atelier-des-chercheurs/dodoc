<template>
  <div class="_toggleInput">
    <div class="_inputLabel">
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
      <label :for="id" class="u-label">{{ label }}</label>
    </div>

    <div class="_toggled" v-if="content">
      <slot />
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
  computed: {},
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
}
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
.u-label {
  margin-bottom: 0;
}
._inputCb {
  margin: calc(var(--spacing) / 4);
}

._toggled {
  border-left: 2px solid var(--c-orange);
  margin-top: calc(var(--spacing) / 2 * -1);
  padding-top: calc(var(--spacing) / 2);
  padding-left: calc(var(--spacing) / 1.5);
  margin-left: calc(var(--spacing) / 1.5);
}
</style>
