<template>
  <div class="_openedLayer">
    <div class="_closeLayerBtn">
      <sl-button variant="default" size="medium" circle @click="$emit('close')">
        <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
      </sl-button>
    </div>

    <div class="_openedLayer--content" v-if="layer">
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

      <fieldset v-if="can_edit" class="_options">
        <legend class="u-label">{{ $t("options") }}</legend>

        <div class="_color">
          <ColorInput
            :label="$t('pins_color')"
            :can_toggle="false"
            :default_value="default_layer_color"
            :value="layer.section_color"
            @save="updateOpenedLayer({ field: 'section_color', value: $event })"
          />
        </div>
        <div class="">
          <ToggleInput
            :label="$t('link_pins')"
            :content="layer.link_pins"
            @update:content="
              updateOpenedLayer({ field: 'link_pins', value: $event })
            "
          />
        </div>
        <div class="">
          <DLabel :str="$t('pin_icons')" />
          <RadioCheckboxField
            :field_name="'all_pins_icon'"
            :input_type="'radio'"
            :content="layer.all_pins_icon || ''"
            :path="layer.$path"
            :can_edit="can_edit"
            :options="icon_options"
          />
        </div>
      </fieldset>

      <hr />

      <div class="_pinContainer">
        <DLabel :str="$t('pins')" />

        <small v-if="layer_modules_list.length === 0">
          {{ $t("nothing_to_show") }}
        </small>
        <template v-else>
          <ReorderedList
            :field_name="'modules_list'"
            :store_type="'plain_array'"
            :items="layer_modules_list"
            :show_index="layer.link_pins === true"
            :active_item_path="opened_pin_path"
            :path="layer.$path"
            :can_edit="can_edit"
            v-slot="slotProps"
          >
            <MapModule
              :key="slotProps.item.$path"
              :publication="publication"
              :layer="layer"
              :mapmodule="slotProps.item"
              :ref="'module_' + slotProps.item.$path"
              :is_opened="slotProps.item.$path === opened_pin_path"
              :can_edit="can_edit"
              @repickLocation="$emit('repickLocation', slotProps.item.$path)"
              @toggle="$emit('togglePin', slotProps.item.$path)"
            />

            <!-- <div class="">
              Praesent non feugiat nulla. Sed id sapien vel erat fringilla
              iaculis. Vivamus et libero at dui fermentum sollicitudin. Aliquam
              placerat tortor at felis cursus, nec tincidunt risus convallis.
              Nunc efficitur bibendum leo. Proin nec nulla semper lacus dapibus
              suscipit posuere ac nisl. Etiam tristique, sem nec finibus
              feugiat, nisi quam ullamcorper dolor, eget imperdiet dolor diam eu
              nisl. Nunc id tellus lorem. Donec ultrices nisi vitae risus tempus
              laoreet non in mi. Curabitur interdum sem a posuere bibendum.
              Nulla facilisi. Praesent metus nisi, sagittis nec elementum
              feugiat, tincidunt sit amet nunc. Nunc commodo et elit eget
              facilisis. Pellentesque bibendum iaculis fermentum. Nulla at
              consectetur nisl.
            </div> -->

            <!-- <span v-if="slotProps.item.section_title">
              {{ slotProps.item.section_title }}
            </span>
            <span v-else v-html="`<i>${$t('untitled')}</i>`" /> -->
          </ReorderedList>
        </template>
      </div>

      <div v-if="can_edit" class="_bottomBar">
        <ModuleCreator
          :publication_path="publication.$path"
          :start_collapsed="false"
          :context="'cartography'"
          :types_available="['medias']"
          @addModules="addModules"
        />
      </div>

      <hr />

      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove_layer')"
        @remove="removeLayer"
      />
    </div>
  </div>
</template>
<script>
import ModuleCreator from "@/components/publications/modules/ModuleCreator.vue";
import MapModule from "@/components/publications/cartography/MapModule.vue";

export default {
  props: {
    layer: Object,
    publication: Object,
    opened_pin_path: String,
    default_layer_color: String,
    can_edit: Boolean,
  },
  components: {
    ModuleCreator,
    MapModule,
  },
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
  watch: {
    opened_pin_path() {
      // scrollto
      const module_in_list = this.$refs["module_" + this.opened_pin_path];
      if (module_in_list)
        module_in_list.$el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
    },
  },
  computed: {
    layer_modules_list() {
      return this.getModulesForSection({
        publication: this.publication,
        section: this.layer,
      }).map(({ _module }) => _module);
    },
  },
  methods: {
    async updateOpenedLayer({ field, value }) {
      await this.$api.updateMeta({
        path: this.layer.$path,
        new_meta: {
          [field]: value,
        },
      });
    },
    async removeLayer() {
      await this.removeSection2({
        publication: this.publication,
        group: "layers_list",
        path: this.layer.$path,
      });
      this.$emit("close");
    },
    async addModules({ meta_filenames }) {
      await this.insertModuleMetaFilenamesToList2({
        publication: this.publication,
        section: this.layer,
        meta_filenames,
      });
      // todo scroll to last meta_filename
      const meta_filename = meta_filenames.at(-1);
      const pin_path = this.publication.$path + "/" + meta_filename;
      setTimeout(() => {
        this.$emit("togglePin", pin_path);
      }, 150);
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

  // backdrop-filter: blur(5px);
  // background: rgba(231, 231, 231, 0.7);

  // padding: calc(var(--spacing) * 1);
}

._openedLayer--content {
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1) 0;
  // height: 100%;
  // overflow: auto;
  background: white;
  display: flex;
  flex-flow: column nowrap;

  ._title {
    margin-bottom: calc(var(--spacing) * 1);
    display: flex;
    flex-flow: row wrap;
    align-items: baseline;
    gap: calc(var(--spacing) / 2);
  }

  ._pinContainer {
    flex: 1 1 auto;
    // overflow: auto;
  }
}
._closeLayerBtn {
  position: absolute;
  top: 0;
  right: 0;
}

._options {
  // background: var(--c-gris);
  display: grid;
  grid-template-columns: 1fr 1fr;
  // grid-gap: 1px; /* size of the line between cells */
  // padding: 1px; /* size of the line around the grid */

  > div {
    padding: calc(var(--spacing) / 2);
    background-color: #fff; /* cells need a bg color for this to work */
  }
}

._bottomBar {
  position: sticky;
  z-index: 10;
  bottom: 0;
  width: 100%;
  background: white;
  padding: calc(var(--spacing) * 1);
  border-top: 1px solid var(--c-gris);
}
</style>
