<template>
  <div class="_openedLayer">
    <div class="_closeLayerBtn">
      <sl-button variant="default" size="medium" circle @click="$emit('close')">
        <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
      </sl-button>
    </div>

    <div class="_openedLayer--content">
      <div class="_title">
        <span
          v-if="!can_edit"
          class="_colorInd"
          :style="
            'background-color: ' + (layer.section_color || default_layer_color)
          "
        />
        <TitleField
          :field_name="'section_title'"
          :label="can_edit ? $t('layer_title') : ''"
          :content="layer.section_title || $t('untitled')"
          :path="layer.$path"
          :maxlength="120"
          :tag="'h3'"
          :can_edit="can_edit"
        />
        <!-- ({{ layer_modules_list.length }}) -->
      </div>

      <div class="u-spacingBottom _color" v-if="can_edit">
        <ColorInput
          :label="$t('pins_color')"
          :can_toggle="false"
          :default_value="default_layer_color"
          :value="layer.section_color"
          @save="updateOpenedLayer({ field: 'section_color', value: $event })"
        />
      </div>
      <div class="u-spacingBottom" v-if="can_edit">
        <ToggleInput
          :label="$t('link_pins')"
          :content="layer.link_pins"
          @update:content="
            updateOpenedLayer({ field: 'link_pins', value: $event })
          "
        />
      </div>

      <template v-if="can_edit">
        <ModuleCreator
          :publication_path="publication_path"
          :is_collapsed="false"
          :context="'cartography'"
          :types_available="['medias']"
          @addModules="$emit('addModules', $event)"
        />
        <hr />
      </template>
      <div class="">
        <DLabel :str="$t('pins')" />

        <small v-if="layer_modules_list.length === 0">
          {{ $t("nothing_to_show") }}
        </small>
        <template v-else>
          <template
            v-for="({ meta_filename, _module }, index) in layer_modules_list"
          >
            <MapModule
              :key="meta_filename"
              :index="index"
              :meta_filename="meta_filename"
              :mapmodule="_module"
              :module_position="
                layer_modules_list.length === 1
                  ? 'alone'
                  : index === 0
                  ? 'first'
                  : index === layer_modules_list.length - 1
                  ? 'last'
                  : 'inbetween'
              "
              :can_edit="can_edit"
              @repickLocation="$emit('repickLocation', _module.$path)"
              @moveUp="$emit('moveModuleTo', { meta_filename, dir: -1 })"
              @moveDown="$emit('moveModuleTo', { meta_filename, dir: +1 })"
              @duplicate="
                $emit('duplicatePublicationMedia', {
                  source_meta_filename: meta_filename,
                  copy_meta_filename: $event,
                })
              "
              @remove="$emit('removeModule', meta_filename)"
            />
          </template>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import MapModule from "@/components/publications/cartography/MapModule.vue";

export default {
  props: {
    layer: Object,
    layer_modules_list: Array,
    publication_path: String,
    default_layer_color: String,
    can_edit: Boolean,
  },
  components: {
    ModuleCreator,
    MapModule,
  },
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {
        pins_color: "Couleur des épingles",
        link_pins: "Relier les épingles",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async updateOpenedLayer({ field, value }) {
      await this.$api.updateMeta({
        path: this.layer.$path,
        new_meta: {
          [field]: value,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._openedLayer {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;

  backdrop-filter: blur(5px);
  background: rgba(231, 231, 231, 0.7);

  padding: calc(var(--spacing) * 1);
}

._openedLayer--content {
  padding: calc(var(--spacing) * 1);
  height: 100%;
  overflow: auto;
  background: white;

  ._title {
    margin-bottom: calc(var(--spacing) * 1);
    display: flex;
    flex-flow: row wrap;
    align-items: baseline;
    gap: calc(var(--spacing) / 2);
  }
}
._closeLayerBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
