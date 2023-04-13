<template>
  <div
    class="_fontItem"
    :class="{
      'is--preview': context === 'preview',
    }"
  >
    <div class="_topContent">
      <TitleField
        class="_title"
        :field_name="'title'"
        :content="font.title"
        :path="font.$path"
        tag="h3"
        :can_edit="context === 'full'"
      />

      <button
        type="button"
        class="u-buttonLink"
        @click="$emit('toggle')"
        v-text="context === 'preview' ? $t('open') : $t('close')"
      />
    </div>

    <div v-if="context === 'full'">
      <br />
      <div class="u-instructions">
        <small>
          {{ $t("font_instr") }}
        </small>
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
          :selected_files="selected_files"
          :path="font.$path"
          @close="selected_files = []"
        />
      </div>

      <br />

      <div class="" v-if="uploaded_files && uploaded_files.length > 0">
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
                v-for="file in uploaded_files"
                :key="file.$path"
                v-text="file.$media_filename"
              />
            </select>
          </div>
        </div>

        <template
          v-if="JSON.stringify(font_files) !== JSON.stringify(new_font_files)"
        >
          <br />
          <SaveCancelButtons class="_scb" @save="updateFont" @cancel="cancel" />
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
</template>
<script>
export default {
  props: {
    font: Object,
    context: String,
  },
  components: {},
  data() {
    return {
      selected_files: [],
      id: `font_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      uploaded_files: false,

      font_files: {},
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
    if (this.context === "full") {
      const font = await this.$api.getFolder({
        path: this.font.$path,
      });
      this.uploaded_files = font.$files;

      this.font_files = font.font_files || {};
      this.initFF();
      this.$api.join({ room: this.font.$path });
    }
  },
  beforeDestroy() {},
  watch: {
    font_files() {
      this.initFF();
    },
  },
  computed: {},
  methods: {
    initFF() {
      this.new_font_files = JSON.parse(JSON.stringify(this.font_files));
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    async updateFont() {
      await this.$api.updateMeta({
        path: this.font.$path,
        new_meta: {
          font_files: this.new_font_files,
        },
      });
      this.$emit("toggle");
    },
    cancel() {
      this.initFF();
    },
  },
};
</script>
<style lang="scss" scoped>
._fontItem {
  padding: calc(var(--spacing) / 2) 0;

  &.is--preview {
    border-bottom: 2px solid var(--c-gris);
  }
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
