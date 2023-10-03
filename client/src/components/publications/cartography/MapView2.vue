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
    <MapView
      v-else
      :publication="publication"
      :sections="sections"
      :opened_section="opened_section"
      :opened_section_modules_list="opened_section_modules_list"
      :can_edit="can_edit"
      @createSection="$emit('createSection', $event)"
      @openSection="$emit('openSection', $event)"
      @closeSection="$emit('closeSection')"
      @updateOrder="$emit('updateOrder', $event)"
      @addModule="$emit('addModule', $event)"
      @insertModule="$emit('insertModule', $event)"
      @moveModuleTo="$emit('moveModuleTo', $event)"
      @removeModule="$emit('removeModule', $event)"
      @duplicatePublicationMedia="$emit('duplicatePublicationMedia', $event)"
    />
  </div>
</template>
<script>
import MapSettings from "@/components/publications/cartography/MapSettings.vue";
import MapView from "@/components/publications/cartography/MapView.vue";

export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section: [Boolean, Object],
    opened_section_modules_list: Array,
    modules_list: Array,
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
._switch {
  margin: calc(var(--spacing) * 1) 0;
}
</style>
