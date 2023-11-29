<template>
  <div>
    <h1>{{ collection.title }}</h1>
    <button type="button" class="u-buttonLink" @click="$emit('close')">
      <b-icon icon="x-circle" />
      {{ $t("close") }}
    </button>
  </div>
</template>
<script>
export default {
  props: {
    collection: Object,
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
<style lang="scss" scoped></style>
