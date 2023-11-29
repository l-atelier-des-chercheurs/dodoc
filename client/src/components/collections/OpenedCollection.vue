<template>
  <div class="_openedCollection">
    <button type="button" class="u-buttonLink" @click="$emit('close')">
      <b-icon icon="arrow-left" />
      {{ $t("back") }}
    </button>
    <h2>{{ collection.title }}</h2>
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
<style lang="scss" scoped>
._openedCollection {
  text-align: left;
}
</style>
