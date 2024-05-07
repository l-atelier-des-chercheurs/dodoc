<template>
  <div>
    <div class="u-inputBorder">
      <label for="searchTitles" class="_prefix">
        <b-icon icon="search" />
      </label>
      <input
        type="text"
        name="searchTitles"
        id="searchTitles"
        :value="value"
        :placeholder="search_placeholder"
        @input="$emit('input', $event.target.value)"
      />

      <transition name="pagechange">
        <button
          type="button"
          class="_suffix"
          style="flex: 0 0 auto"
          v-if="value.length > 0"
          @click="$emit('input', '')"
        >
          <b-icon icon="x-lg" />
        </button>
      </transition>
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
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
