<template>
  <div class="_formats">
    <FormatsList
      :opened_format_slug="opened_format_slug"
      @toggleFormat="toggleFormat"
    />
    <OpenedFormat
      v-if="opened_format_slug"
      :opened_format_slug="opened_format_slug"
      @close="toggleFormat"
    />
  </div>
</template>
<script>
import FormatsList from "@/components/formats/FormatsList.vue";
import OpenedFormat from "@/components/formats/OpenedFormat.vue";

export default {
  props: {},
  components: { FormatsList, OpenedFormat },
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
  computed: {
    opened_format_slug() {
      if (!this.$route.query?.format) return undefined;
      return this.$route.query.format;
    },
  },
  methods: {
    toggleFormat(slug) {
      let query = Object.assign({}, this.$route.query) || {};
      if (slug) query.format = slug;
      else delete query.format;
      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._formats {
  margin: calc(var(--spacing) / 2);
}
</style>
