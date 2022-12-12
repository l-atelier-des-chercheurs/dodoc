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

    <template v-if="show_media_picker">
      <DLabel :str="$t('type_of_module')" />
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
        @save="createModule"
        @cancel="show_media_picker = false"
      />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    publication_path: String,
  },
  components: {},
  data() {
    return {
      show_media_picker: false,

      type_selected: "",
      options: [
        {
          key: "text",
          label: "module.label.text",
          instructions: "module.instructions.text",
        },
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
    async createModule() {
      this.is_saving = true;

      let meta = {
        module_type: this.type_selected,
        source_medias: [],
      };

      if (this.type_selected === "text") {
        const text_meta_filename = await this.createText();
        const text_meta_path = this.publication_path + "/" + text_meta_filename;
        meta.source_medias = [{ path: text_meta_path }];
      }

      const meta_filename = await this.createMetaForModule({
        module_type: meta.module_type,
        source_medias: meta.source_medias,
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
    async createText() {
      return await this.$api.uploadText({
        path: this.publication_path,
        filename: "text.txt",
        content: "",
        additional_meta: {
          caption: "plip",
          module_type: this.module_type,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
