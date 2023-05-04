<template>
  <div class="u-radio">
    <label
      v-for="option in options"
      :for="'radioi-option-' + option.key"
      :key="option.key"
    >
      <input
        type="radio"
        :name="option.key"
        :id="'radioi-option-' + option.key"
        :value="option.key"
        :checked="value === option.key"
        :disabled="!can_edit"
        @input="$emit('update:value', $event.target.value)"
      />

      <span>
        {{ option.label }}<br />
        <small class="u-instructions" v-html="option.instructions" />
      </span>
    </label>
  </div>
</template>
<script>
export default {
  props: {
    value: String,
    options: Array,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
