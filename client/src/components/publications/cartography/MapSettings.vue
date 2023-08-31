<template>
  <div class="_mapSettings">
    <div class="">Pick starting point</div>
    <PositionPicker
      :title="'titre'"
      :format="'gps'"
      :start_value="publication.map_initial_location || ''"
      :edit_mode="true"
      @update="updateBasePosition"
    />
  </div>
</template>
<script>
import PositionPicker from "@/components/publications/cartography/PositionPicker.vue";

export default {
  props: {
    publication: Object,
    path: String,
  },
  components: {
    PositionPicker,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async updateBasePosition(val) {
      await this.updatePubli({
        map_initial_location: val,
      });
    },

    async updatePubli(new_meta) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._mapSettings {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: white;
  padding: calc(var(--spacing) / 1);
}
</style>
