<template>
  <div class="_viewPane">
    <!-- // TODO 
      - à l'ouverture d'une vue, afficher sur la carte l'ensemble des
      médias géolocalisés de cette vue
      - utiliser le fond de map indiqué
      - les pins ont la couleur indiqué au niveau de la vue
      - au scroll, zoomer sur la pin correspondante au média 
    -->
    <SectionsList
      :publication="publication"
      :opened_section_meta_filename="opened_view_meta_filename"
      :can_edit="can_edit"
      @toggleSection="$emit('toggleView', $event)"
    />
  </div>
</template>
<script>
import SectionsList from "@/components/publications/story/SectionsList.vue";
// import ViewContent from "@/components/publications/cartography/ViewContent.vue";

export default {
  props: {
    publication: Object,
    opened_view_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    SectionsList,
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
._viewPane {
  position: relative;

  height: 100%;
  // width: 50%;
  // max-width: 420px;
  overflow: auto;
  padding: calc(var(--spacing) / 1);
  background: white;

  // background: var(--panel-color);
  // border: var(--panel-borders);
  // box-shadow: var(--panel-shadows);
  // text-align: left;
}
._viewPreview {
  background: var(--c-gris_clair);
  padding: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 2);

  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  &:hover {
    background: var(--c-gris_fonce);
  }
}
._openedView {
  position: absolute;
  top: calc(var(--spacing) / 4);
  left: calc(var(--spacing) / 4);
  width: calc(100% - calc(var(--spacing) / 2));
  height: 100%;
  overflow: auto;
  background: white;
  padding: calc(var(--spacing) / 2);
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
