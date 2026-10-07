<template>
  <div class="_widthHeightField">
    <fieldset :disabled="is_saving">
      <legend>{{ $t("format") }}</legend>

      <template v-if="!force_layout_mode">
        <DLabel class="_label" :str="$t('document_type')" />
        <div class="_choices">
          <button
            v-for="lmode in ['print', 'screen']"
            :key="lmode"
            type="button"
            class="u-button u-button_small"
            :class="{ 'is--active': layout_mode === lmode }"
            :title="$t(lmode + '_instr')"
            @click="setLayoutMode(lmode)"
          >
            {{ $t(lmode) }}
          </button>
        </div>
        <div v-if="pending_layout_mode" class="_confirmLayoutMode">
          <p class="u-warning">
            {{ $t("change_document_type_warning") }}
          </p>
          <div class="_choices">
            <button
              type="button"
              class="u-button u-button_small"
              @click="pending_layout_mode = false"
            >
              {{ $t("cancel") }}
            </button>
            <button
              type="button"
              class="u-button u-button_small u-button_red"
              @click="applyLayoutMode(pending_layout_mode)"
            >
              {{ $t("switch_to", { type: $t(pending_layout_mode) }) }}
            </button>
          </div>
        </div>
        <div v-else class="u-instructions">
          <small v-html="$t(layout_mode + '_instr')" />
        </div>
      </template>

      <DLabel
        class="_label"
        :str="$t('format')"
        :instructions="$t('format_instructions')"
      />
      <div class="_choices">
        <button
          v-for="format in formats"
          :key="format.key"
          type="button"
          class="u-button u-button_small"
          :class="{ 'is--active': current_format === format.key }"
          :title="format.width + ' × ' + format.height + ' ' + unit"
          @click="setFormat(format)"
        >
          {{ format.label }}
        </button>
        <button
          type="button"
          class="u-button u-button_small"
          :class="{ 'is--active': current_format === 'custom' }"
          @click="$refs.widthInput.focus()"
        >
          {{ $t("custom") }}
        </button>
      </div>

      <DLabel class="_label" :str="$t('orientation')" />
      <div class="_choices">
        <button
          v-for="orientation in ['portrait', 'landscape']"
          :key="orientation"
          type="button"
          class="u-button u-button_small"
          :class="{ 'is--active': current_orientation === orientation }"
          @click="setOrientation(orientation)"
        >
          <b-icon
            icon="file-earmark"
            :rotate="orientation === 'landscape' ? '90' : ''"
          />
          {{ $t(orientation) }}
        </button>
      </div>

      <div class="u-sameRow _dimensions">
        <div>
          <DLabel :str="$t('width')" />
          <div class="u-inputGroup">
            <input
              ref="widthInput"
              type="number"
              min="1"
              v-model.number="new_page_width"
              @change="saveSize({ width: new_page_width })"
            />
            <span class="u-suffix" v-text="unit" />
          </div>
        </div>
        <div>
          <DLabel :str="$t('height')" />
          <div class="u-inputGroup">
            <input
              type="number"
              min="1"
              v-model.number="new_page_height"
              @change="saveSize({ height: new_page_height })"
            />
            <span class="u-suffix" v-text="unit" />
          </div>
        </div>
      </div>
    </fieldset>
  </div>
</template>
<script>
const FORMATS = {
  print: [
    { key: "A3", label: "A3", width: 297, height: 420 },
    { key: "A4", label: "A4", width: 210, height: 297 },
    { key: "A5", label: "A5", width: 148, height: 210 },
    { key: "A6", label: "A6", width: 105, height: 148 },
  ],
  screen: [
    { key: "recommended", width: 960, height: 700 },
    { key: "desktop_1080", width: 1920, height: 1080 },
    { key: "desktop_720", width: 1280, height: 720 },
  ],
};

export default {
  props: {
    publication: Object,
    force_layout_mode: String,
  },
  components: {},
  data() {
    return {
      is_saving: false,
      pending_layout_mode: false,
      new_page_width: undefined,
      new_page_height: undefined,
    };
  },
  created() {
    this.initValues();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    "publication.page_width"() {
      this.initValues();
    },
    "publication.page_height"() {
      this.initValues();
    },
  },
  computed: {
    layout_mode() {
      return this.force_layout_mode || this.publication.layout_mode || "print";
    },
    page_width() {
      return this.publication.page_width || 210;
    },
    page_height() {
      return this.publication.page_height || 297;
    },
    formats() {
      return FORMATS[this.layout_mode].map((f) => ({
        ...f,
        label: f.label || this.$t(f.key),
      }));
    },
    current_format() {
      // presets match whatever the orientation
      const short = Math.min(this.page_width, this.page_height);
      const long = Math.max(this.page_width, this.page_height);
      const format = this.formats.find(
        (f) =>
          Math.min(f.width, f.height) === short &&
          Math.max(f.width, f.height) === long
      );
      return format ? format.key : "custom";
    },
    current_orientation() {
      if (this.page_width === this.page_height) return false;
      return this.page_width > this.page_height ? "landscape" : "portrait";
    },
    unit() {
      return this.layout_mode === "screen" ? "px" : "mm";
    },
  },
  methods: {
    initValues() {
      this.new_page_width = this.page_width;
      this.new_page_height = this.page_height;
    },
    setLayoutMode(layout_mode) {
      if (layout_mode === this.layout_mode)
        return (this.pending_layout_mode = false);
      // modules keep their values but mm and px don't share a scale,
      // so a filled layout ends up shrunk or off the page
      const has_content = (this.publication.$files || []).length > 0;
      if (has_content) this.pending_layout_mode = layout_mode;
      else this.applyLayoutMode(layout_mode);
    },
    applyLayoutMode(layout_mode) {
      this.pending_layout_mode = false;
      // units differ between modes, so start from that mode's first preset
      const { width, height } = FORMATS[layout_mode][0];
      this.updateMeta({ layout_mode, page_width: width, page_height: height });
    },
    setFormat({ width, height }) {
      // keep the current orientation when switching presets
      const landscape_preset = width > height;
      const want_landscape =
        this.current_orientation === false
          ? landscape_preset
          : this.current_orientation === "landscape";
      if (landscape_preset !== want_landscape)
        [width, height] = [height, width];
      this.updateMeta({ page_width: width, page_height: height });
    },
    setOrientation(orientation) {
      if (orientation === this.current_orientation) return;
      const short = Math.min(this.page_width, this.page_height);
      const long = Math.max(this.page_width, this.page_height);
      if (orientation === "portrait")
        this.updateMeta({ page_width: short, page_height: long });
      else this.updateMeta({ page_width: long, page_height: short });
    },
    saveSize({ width, height }) {
      const value = width ?? height;
      if (!(value > 0)) return this.initValues();
      if (width !== undefined) this.updateMeta({ page_width: width });
      else this.updateMeta({ page_height: height });
    },
    async updateMeta(new_meta) {
      if (!this.force_layout_mode && !this.publication.layout_mode)
        new_meta = { layout_mode: this.layout_mode, ...new_meta };

      this.is_saving = true;
      try {
        await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta,
        });
      } catch (e) {
        this.initValues();
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response?.data);
      }
      this.is_saving = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._label {
  margin-top: calc(var(--spacing) / 1);
}
._choices {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}
._confirmLayoutMode {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  margin-top: calc(var(--spacing) / 2);

  .u-warning {
    margin: 0;
  }
}
._dimensions {
  justify-content: flex-start;
  margin-top: calc(var(--spacing) / 1);
}
</style>
