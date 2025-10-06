<template>
  <div class="_depthInput">
    <DLabel v-if="label" :str="label" :for="label" />
    <!-- {{ list_all_z_index }} <br />
    min_z_index = {{ min_z_index }} <br />
    max_z_index = {{ max_z_index }} <br />
    value = {{ value }}
 -->
    <div class="u-sameRow">
      <button
        type="button"
        class="u-button u-button_black"
        @click="moveToFront"
        :disabled="value === max_z_index"
      >
        <b-icon icon="front" />
        {{ $t("move_to_front") }}
      </button>
      <button
        type="button"
        class="u-button u-button_black"
        @click="moveToBack"
        :disabled="value === min_z_index"
      >
        <b-icon icon="back" />
        {{ $t("move_to_back") }}
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    value: Number,
    page_modules: Array,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    list_all_z_index() {
      return this.page_modules.map((pm) => pm.z_index || 0);
    },
    max_z_index() {
      return Math.max(...this.list_all_z_index);
    },
    min_z_index() {
      return Math.min(...this.list_all_z_index);
    },
  },
  methods: {
    moveToBack() {
      this.$emit("save", this.min_z_index - 1);
    },
    moveToFront() {
      this.$emit("save", this.max_z_index + 1);
    },
  },
};
</script>
<style lang="scss" scoped>
.u-sameRow {
  button {
    padding-left: calc(var(--spacing) / 2);
    padding-right: calc(var(--spacing) / 2);
  }
}
</style>
