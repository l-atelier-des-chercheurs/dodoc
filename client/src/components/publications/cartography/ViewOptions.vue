<template>
  <div class="_viewSettings">
    <div class="_viewSettings--content">
      <div class="">
        <strong>
          {{ view.section_title }}
        </strong>
      </div>
      <div class="_color">
        <ColorInput
          :label="$t('pins_color')"
          :can_toggle="false"
          :default_value="'#333333'"
          :value="view.section_color"
          @save="updateView({ field: 'section_color', value: $event })"
        />
      </div>
      <div class="">
        <ToggleInput
          :label="$t('link_pins')"
          :content="view.link_pins"
          @update:content="updateView({ field: 'link_pins', value: $event })"
        />
      </div>
      <div class="">
        <DLabel :str="$t('pin_icons')" />
        <RadioCheckboxField
          :field_name="'all_pins_icon'"
          :input_type="'radio'"
          :content="view.all_pins_icon || 'circle'"
          :path="view.$path"
          :options="icon_options"
          :can_edit="true"
        />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    view: Object,
  },
  components: {},
  data() {
    return {
      icon_options: [
        {
          key: "",
          label: this.$t("circle"),
        },
        {
          key: "media_preview",
          label: this.$t("media_preview"),
        },
      ],
    };
  },
  i18n: {
    messages: {
      fr: {
        pins_color: "Couleur des épingles",
        link_pins: "Relier les épingles",
        pin_icons: "Apparence des épingles",
        media_preview: "Image sur la carte",
        remove_layer: "Supprimer ce calque et son contenu",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async updateView({ field, value }) {
      await this.$api.updateMeta({
        path: this.view.$path,
        new_meta: {
          [field]: value,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._viewSettings {
  position: absolute;
  margin: 0 auto;
  width: 100%;
  bottom: 0;

  pointer-events: none;
}
._viewSettings--content {
  width: 320px;
  margin: 0 auto;
  background: white;
  pointer-events: auto;

  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  // border: 4px solid var(--c-bleuvert);
  // border-bottom: none;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
</style>
