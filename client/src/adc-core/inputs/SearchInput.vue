<template>
  <div>
    <DLabel :str="$t('search')" />
    <div class="u-inputGroup">
      <input
        type="text"
        class="_searchInput"
        size="small"
        :value="value"
        @input="$emit('input', $event.target.value)"
        :placeholder="search_placeholder.toLowerCase()"
      />
      <button
        type="button"
        class="u-suffix u-button u-button_bleumarine"
        style="flex: 0 0 auto"
        v-if="value.length > 0"
        @click="$emit('input', '')"
      >
        <b-icon icon="x-lg" />
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: String,
    search_placeholder: String,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
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
._searchInput {
  width: 55ch;
}
</style>
