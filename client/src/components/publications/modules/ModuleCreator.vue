<template>
  <div>
    <!-- // TODO : add module or add media -->

    <sl-button
      variant="edit"
      class="default"
      circle
      v-if="!show_media_picker"
      @click="show_media_picker = true"
    >
      <sl-icon name="plus-circle-fill" :label="$t('edit')" />
    </sl-button>
    <div v-else class="_typePicker">
      <div class="">
        <DLabel :str="$t('add_media')" />
        <MediaPicker
          :publication_path="publication_path"
          @selectMedia="selectMedia"
        />
      </div>

      <div class="">
        <button type="button" class="u-button" @click="createText">
          {{ $t("add_text") }}
        </button>
      </div>

      <div class="">
        <DLabel :str="$t('create_a_module')" />
        <select v-model="type_selected">
          <option
            v-for="option in options"
            :key="option.key"
            :value="option.key"
            v-text="$t(option.label)"
          />
        </select>
        <div v-if="selected_option && selected_option.instructions">
          <small v-html="$t(selected_option.instructions)" />
        </div>

        <br />

        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          :save_text="'create'"
          @save="createModule({ module_type: type_selected })"
          @cancel="show_media_picker = false"
        />
      </div>
    </div>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
export default {
  props: {
    publication_path: String,
  },
  components: {
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,

      type_selected: "",
      options: [
        {
          key: "mosaic",
          label: "module.label.mosaic",
          instructions: "module.instructions.mosaic",
        },
        {
          key: "carousel",
          label: "module.label.carousel",
          instructions: "module.instructions.carousel",
        },
      ],

      is_saving: false,
    };
  },
  created() {
    this.type_selected = this.options[0].key;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    selected_option() {
      return this.options.find((o) => o.key === this.type_selected);
    },
  },
  methods: {
    selectMedia({ path_to_source_media }) {
      this.createModule({
        module_type: "single",
        source_medias: [{ path: path_to_source_media }],
      });
    },

    async createText() {
      this.is_saving = true;

      const text_meta_filename = await this.$api.uploadText({
        path: this.publication_path,
        filename: "text.txt",
        content: "",
        additional_meta: {
          caption: "plip",
          module_type: this.module_type,
        },
      });
      const text_meta_path = this.publication_path + "/" + text_meta_filename;
      const source_medias = [{ path: text_meta_path }];

      this.createModule({
        module_type: "text",
        source_medias,
      });
    },

    async createModule({ module_type, source_medias = [] }) {
      const meta_filename = await this.createMetaForModule({
        module_type,
        source_medias,
      });
      this.$emit("appendModuleMetaFilenameToList", { meta_filename });

      this.is_saving = false;
    },

    async createMetaForModule({ module_type, source_medias }) {
      return await this.$api
        .uploadFile({
          path: this.publication_path,
          additional_meta: {
            module_type,
            source_medias,
            requested_slug: "module",
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
._typePicker {
  display: flex;
  gap: calc(var(--spacing) / 2);

  > * {
    padding: calc(var(--spacing) / 2);
    background: var(--c-gris_clair);
  }
}
</style>
