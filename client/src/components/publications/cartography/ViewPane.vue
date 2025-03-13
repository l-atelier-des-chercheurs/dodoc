<template>
  <div class="_viewPane">
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

export default {
  props: {
    publication: Object,
    pins: Array,
    opened_view_meta_filename: String,
    default_view_color: String,
    opened_pin_path: String,
    can_edit: Boolean,
  },
  components: {
    SectionsList,
  },
  provide() {
    return {
      $getMapOptions: () => ({
        opened_pin_path: this.opened_pin_path,
        pins_infos: this.pins.map(
          ({ path, index, color, pin_preview, pin_preview_src }) => ({
            path,
            index,
            color,
            pin_preview,
            pin_preview_src,
          })
        ),
        // default_view_color: "#FF00FF",
        default_view_color: this.default_view_color,
      }),
    };
  },
  data() {
    return {};
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
  // padding: calc(var(--spacing) / 1);
  padding-bottom: 70vh;
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
