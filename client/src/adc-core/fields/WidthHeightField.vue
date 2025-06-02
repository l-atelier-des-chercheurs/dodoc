<template>
  <div class="_widthHeightField">
    <fieldset>
      <legend class="u-label">{{ $t("format") }}</legend>

      <EditBtn
        v-if="can_edit && !edit_mode"
        :is_unfolded="true"
        @click="enableEditMode"
      />

      <br />
      <br />

      <template v-if="!force_layout_mode">
        <DLabel class="_label" :str="$t('document_type')" :tag="'H3'" />

        <div
          v-for="lmode in [
            {
              key: 'print',
              label: $t('print'),
              instructions: $t('print_instr'),
            },
            {
              key: 'screen',
              label: $t('screen'),
              instructions: $t('screen_instr'),
            },
          ]"
          :key="lmode.key"
        >
          <div>
            <input
              type="radio"
              v-model="new_layout_mode"
              :name="lmode.key"
              :id="'radioi-lmode-' + lmode.key"
              :value="lmode.key"
              :disabled="!edit_mode"
            />
            <label :for="'radioi-lmode-' + lmode.key">
              {{ lmode.label }}<br />
              <small v-html="lmode.instructions" />
            </label>
          </div>
        </div>
      </template>

      <br />

      <transition name="fade" mode="out-in">
        <div :key="new_layout_mode">
          <DLabel
            class="_label"
            :str="$t('format')"
            :tag="'h3'"
            :instructions="$t('format_instructions')"
          />

          <template>
            <select
              :value="predefined_format_from_width"
              :disabled="!edit_mode"
              @change="setSizeFromFormat"
            >
              <option
                v-for="option in format_options"
                :key="option.key"
                :value="option.key"
                v-text="option.text"
              />
            </select>
          </template>

          <div class="u-sameRow">
            <div class="">
              <DLabel :str="$t('width')" />
              <div class="u-inputGroup">
                <input
                  type="number"
                  :disabled="!edit_mode"
                  v-model.number="new_page_width"
                />
                <span class="u-suffix" v-text="unit" />
              </div>
            </div>
            <div class="">
              <DLabel :str="$t('height')" />
              <div class="u-inputGroup">
                <input
                  type="number"
                  :disabled="!edit_mode"
                  v-model.number="new_page_height"
                />
                <span class="u-suffix" v-text="unit" />
              </div>
            </div>
          </div>
        </div>
      </transition>

      <div class="_footer" v-if="edit_mode">
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          @save="updateSize"
          @cancel="cancel"
        />
      </div>
    </fieldset>
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
    force_layout_mode: String,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      can_edit: true,

      new_layout_mode: undefined,
      new_page_width: undefined,
      new_page_height: undefined,
    };
  },
  created() {},
  mounted() {
    this.initValues();
  },
  beforeDestroy() {},
  watch: {
    new_layout_mode() {
      const { width, height } = this.format_options[0];
      if (!this.new_page_width) this.new_page_width = width;
      if (!this.new_page_height) this.new_page_height = height;
    },
  },
  computed: {
    format_options() {
      if (this.new_layout_mode === "print")
        return [
          {
            key: "A4_portrait",
            text: this.$t("A4_portrait"),
            width: 210,
            height: 297,
            // instruction: this.$t("A4_portrait_explanations"),
          },
          {
            key: "A4_landscape",
            text: this.$t("A4_landscape"),
            width: 297,
            height: 210,
            // instruction: this.$t("A4_landscape_explanations"),
          },
          {
            key: "A5_portrait",
            text: this.$t("A5_portrait"),
            width: 148,
            height: 210,
            // instruction: this.$t("A5_portrait_explanations"),
          },
          {
            key: "A5_landscape",
            text: this.$t("A5_landscape"),
            width: 210,
            height: 148,
            // instruction: this.$t("A5_landscape_explanations"),
          },
          {
            key: "custom",
            text: this.$t("custom"),
            // instruction: this.$t("custom_format_explanations"),
          },
        ];
      // else if (this.new_layout_mode === "screen")
      return [
        {
          key: "recommended",
          text: this.$t("recommended"),
          width: 960,
          height: 700,
        },
        {
          key: "desktop1080",
          text: this.$t("desktop_1080"),
          width: 1920,
          height: 1080,
        },
        {
          key: "desktop720",
          text: this.$t("desktop_720"),
          width: 1280,
          height: 720,
        },
        {
          key: "custom",
          text: this.$t("custom"),
        },
      ];
    },
    predefined_format_from_width() {
      const format = this.format_options.find(
        (f) =>
          f.width === this.new_page_width && f.height === this.new_page_height
      );
      if (format) return format.key;
      return "custom";
    },
    unit() {
      if (this.new_layout_mode === "screen") return "px";
      else return "mm";
    },
  },
  methods: {
    initValues() {
      if (this.force_layout_mode) this.new_layout_mode = this.force_layout_mode;
      else this.new_layout_mode = this.publication.layout_mode || "print";

      this.new_page_width = this.publication.page_width || 210;
      this.new_page_height = this.publication.page_height || 297;
    },
    enableEditMode() {
      this.edit_mode = true;
    },
    setSizeFromFormat($event) {
      const key = $event.target.value;
      if (key === "custom") return;

      const format = this.format_options.find((f) => f.key === key);

      this.new_page_width = format.width;
      this.new_page_height = format.height;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.initValues();
      // todo interrupt updateMeta
    },
    async updateSize() {
      this.is_saving = true;

      try {
        const new_meta = {
          layout_mode: this.new_layout_mode,
          page_width: this.new_page_width,
          page_height: this.new_page_height,
        };
        await this.$api.updateMeta({
          path: this.publication.$path,
          new_meta,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;
        this.edit_mode = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
