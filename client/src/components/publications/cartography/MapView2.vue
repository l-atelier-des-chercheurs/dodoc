<template>
  <div>
    <MapView
      :publication="publication"
      :sections="sections"
      :opened_section="opened_section"
      :opened_section_modules_list="opened_section_modules_list"
      :can_edit="can_edit"
      @createSection="$emit('createSection', $event)"
      @openSection="$emit('openSection', $event)"
      @closeSection="$emit('closeSection')"
      @updateOrder="$emit('updateOrder', $event)"
      @addModules="$emit('addModules', $event)"
      @insertModules="$emit('insertModules', $event)"
      @moveModuleTo="$emit('moveModuleTo', $event)"
      @removeModule="$emit('removeModule', $event)"
      @duplicatePublicationMedia="$emit('duplicatePublicationMedia', $event)"
    />
    <PublicationSettings v-if="can_edit">
      <MapSettings :publication="publication" :path="publication.$path" />
    </PublicationSettings>
  </div>
</template>
<script>
import PublicationSettings from "@/components/publications/PublicationSettings.vue";
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
    PublicationSettings,
    MapSettings,
    MapView,
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
._switch {
  margin: calc(var(--spacing) * 1) 0;
}
</style>
