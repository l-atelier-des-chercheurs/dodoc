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
          label:
            publication.page_spreads === true
              ? $t('list_of_spreads')
              : $t('list_of_pages'),
          value: 'pages',
        },
      ]"
    />

    <MapSettings v-if="current_view === 'settings'" />
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
      current_view: "settings",
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
<style lang="scss" scoped></style>
