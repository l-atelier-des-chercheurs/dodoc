<template>
  <div class="_documentsCreator">
    <span>
      {{ $t("publier") }}
    </span>
    <!-- <div v-for="letter in alphabet" :key="letter" v-text="letter" /> -->
    <DocumentSpot
      class="_spot"
      v-for="(a, index) in new Array(3).fill(null)"
      :key="index"
      :index="index"
    />
  </div>
</template>
<script>
import DocumentSpot from "@/components/DocumentSpot.vue";

export default {
  props: {},
  components: {
    DocumentSpot,
  },
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
._documentsCreator {
  // position: absolute;
  // top: 0;
  // right: 0;
  height: 100%;
  overflow: auto;
  color: #999;
  background: #222;
  padding: calc(var(--spacing) / 1);
  width: auto;

  > span {
  }
}
</style>
