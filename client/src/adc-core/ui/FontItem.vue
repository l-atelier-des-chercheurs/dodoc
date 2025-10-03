<template>
  <div class="_fontItem">
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        <b-icon icon="arrow-left-short" />
        {{ $t("back") }}
      </button>

      <div class="_topContent">
        <TitleField
          class="_title"
          :field_name="'title'"
          :content="font.title"
          :path="font_path"
          tag="h3"
          :can_edit="true"
        />
      </div>

      <div>
        <br />
        <div class="u-instructions">
          <small v-html="$t('font_instr')" />
        </div>

        <br />
        <div>
          <DLabel :str="'1.' + $t('import')" />
          <input
            type="file"
            multiple="multiple"
            :id="id + '-add_file'"
            name="file"
            accept=".woff2"
            class="inputfile-2"
            @change="updateInputFiles($event)"
          />
          <label :for="id + '-add_file'">
            <svg width="20" height="17" viewBox="0 0 20 17">
              <path
                d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
              />
            </svg>
            {{ $t("import") }}
          </label>
          <UploadFiles
            v-if="selected_files.length > 0"
            :files_to_import="selected_files"
            :path="font_path"
            @close="selected_files = []"
          />
        </div>

        <br />

        <div class="" v-if="font.$files && font.$files.length > 0">
          <DLabel :str="'2.' + $t('select')" />

          <div class="_fileList">
            <div
              class="_file"
              v-for="(font_option, index) in font_options"
              :key="index"
              :value="font_option.key"
            >
              {{ font_option.text }}
              <select v-model="new_font_files[font_option.key]">
                <!-- :value="" @change="new_font_files[font_option.key] = $event.target.value" -->
                <option value="" v-text="'–'" />
                <option
                  v-for="file in font.$files"
                  :key="file.$path"
                  v-text="file.$media_filename"
                />
              </select>
            </div>
          </div>

          <template
            v-if="
              JSON.stringify(font.font_files) !== JSON.stringify(new_font_files)
            "
          >
            <br />
            <SaveCancelButtons
              class="_scb"
              @save="updateFont"
              @cancel="cancel"
            />
          </template>
        </div>

        <!--
      <pre>
        font_files = {{ font_files }}
        new_font_files = {{ new_font_files }}
      </pre> -->

        <!-- <div class="_file" v-for="file in uploaded_files" :key="file.$path">
        <div class="">
          {{ file.$media_filename }}
        </div>
        <div class="">
          <select>
            <option
              v-for="(font_option, index) in font_options"
              :key="index"
              :value="font_option.key"
              v-text="font_option.text"
            />
          </select>
        </div>
      </div> -->
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    font_path: String,
  },
  components: {},
  data() {
    return {
      selected_files: [],
      id: `fonts_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      is_loading: true,

      font: undefined,
      new_font_files: {},

      font_options: [
        {
          key: "regular-normal",
          text: this.$t("font_regular") + "/" + this.$t("font_normal"),
        },
        {
          key: "regular-italic",
          text: this.$t("font_regular") + "/" + this.$t("font_italic"),
        },
        {
          key: "bold-normal",
          text: this.$t("font_bold") + "/" + this.$t("font_normal"),
        },
        {
          key: "bold-italic",
          text: this.$t("font_bold") + "/" + this.$t("font_italic"),
        },
      ],
    };
  },
  created() {},
  async mounted() {
    this.font = await this.$api.getFolder({
      path: this.font_path,
    });

    this.new_font_files = this.font.font_files || {};

    this.is_loading = false;
    this.$api.join({ room: this.font_path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.font_path });
  },
  watch: {
    "font.font_files"() {
      this.initFF();
    },
  },
  computed: {},
  methods: {
    initFF() {
      this.new_font_files = JSON.parse(JSON.stringify(this.font.font_files));
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    async updateFont() {
      await this.$api.updateMeta({
        path: this.font_path,
        new_meta: {
          font_files: this.new_font_files,
        },
      });
      this.$emit("toggle");
    },
    cancel() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._fontItem {
  padding: calc(var(--spacing) / 2) 0;
}
._topContent {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  ._title {
    width: auto;
  }
}

._fileList {
  display: flex;
  flex-flow: column nowrap;
  padding: calc(var(--spacing) / 2) 0;
  gap: calc(var(--spacing) / 2);
}
._file {
  // display: flex;
  // flex-flow: row wrap;
  // align-items: center;
  // padding: calc(var(--spacing) / 2) 0;

  > * {
    flex: 0 0 50%;
  }
}
</style>
