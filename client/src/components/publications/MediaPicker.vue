<template>
  <div class="_mediaPicker">
    <!-- OPTIONS -->
    <!-- create a text -->
    <!-- <button type="button" @click="createText">
        {{ $t("create_text") }}
      </button> -->
    <!-- select from this or another project library -->
    <PickMediaFromProjects
      :publication_path="publication_path"
      @selectMedia="$emit('selectMedia', $event)"
      @close="$emit('close')"
    />
  </div>
</template>
<script>
import PickMediaFromProjects from "@/components/publications/PickMediaFromProjects.vue";

export default {
  props: {
    publication_path: String,
  },
  components: {
    PickMediaFromProjects,
  },
  data() {
    return {};
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._mediaPicker {
  width: 100%;
  // background: var(--c-gris_clair);
  margin: 0 auto;
}

._addMediaBtn {
  text-align: center;
  padding: calc(var(--spacing) * 1);
}
</style>
