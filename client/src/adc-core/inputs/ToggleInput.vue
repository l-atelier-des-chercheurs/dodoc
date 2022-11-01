<template>
  <div>
    <input
      ref="field"
      :id="id"
      :name="label"
      type="checkbox"
      :disabled="disabled"
      :checked="content"
      @change="$emit('update:content', $event.target.checked)"
    />
    <label :for="id">{{ label }}</label>

    <div v-if="current_instruction" class="fieldCaption">
      {{ current_instruction }}
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
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
</style>
