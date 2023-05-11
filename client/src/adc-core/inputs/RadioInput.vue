<template>
  <div class="u-radio">
    <label
      v-for="option in options"
      :for="id + '-radioi-option-' + option.key"
      :key="option.key"
    >
      <input
        type="radio"
        :name="id + '-radioi-option-' + option.key"
        :id="id + '-radioi-option-' + option.key"
        :value="option.key"
        :checked="value === option.key"
        :disabled="!can_edit"
        @input="$emit('update:value', $event.target.value)"
      />
      <span>
        <img
          v-if="option.thumb_src"
          :src="option.thumb_src"
          class="_option_preview"
        />
        <component :is="option.key === '' ? 'i' : 'span'">
          {{ option.label }}
        </component>
        <br />
        <div class="u-instructions">
          <small v-html="option.instructions" />
        </div>
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
    return {
      id: `image_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,
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
<style lang="scss" scoped></style>
