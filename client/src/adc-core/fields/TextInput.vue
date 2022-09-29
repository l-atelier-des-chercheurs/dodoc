<template>
  <div>
    <input
      type="text"
      class=""
      required
      :placeholder="'…'"
      :maxlength="maxlength"
      @input="$emit('input', $event.target.value)"
    />

    <div
      v-if="maxlength"
      class="_maxlength"
      :class="{
        'is--invalid': !validity,
      }"
    >
      {{ value.length }} ≤ {{ maxlength }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: true,
    },
    maxlength: {
      type: Number,
      default: -1,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    validity() {
      this.$emit("toggleValidity", this.validity);
    },
  },
  computed: {
    validity() {
      if (this.required && this.value.length === 0) return false;
      return true;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._maxlength {
  flex: 0 0 auto;
  font-weight: 500;
  font-size: var(--sl-font-size-x-small);

  &.is--invalid {
    color: var(--c-rouge);
  }
}
</style>
