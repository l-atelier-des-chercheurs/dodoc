<template>
  <div>
    <RadioSwitch
      v-if="can_edit"
      class="_switch"
      :content.sync="current_view"
      :options="[
        {
          label: $t('settings'),
          value: 'settings',
        },
        {
          label: $t('map'),
          value: 'map',
        },
      ]"
    />

    <MapSettings
      v-if="current_view === 'settings'"
      :publication="publication"
      :path="publication.$path"
    />
    <MapView v-else :publication="publication" />
  </div>
</template>
<script>
import MapSettings from "@/components/publications/cartography/MapSettings.vue";
import MapView from "@/components/publications/cartography/MapView.vue";

export default {
  props: {
    publication: Object,
    can_edit: Boolean,
  },
  components: {
    MapSettings,
    MapView,
  },
  data() {
    return {
      current_view: "map",
    };
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
._switch {
  margin: calc(var(--spacing) * 1) 0;
}
</style>
