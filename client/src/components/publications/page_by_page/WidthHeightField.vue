<template>
  <div class="_widthHeightField">
    <fieldset>
      <legend class="u-label">{{ $t("format") }}</legend>

      <select
        @change="setSizeFromFormat"
        :value="predefined_format_from_width"
        :disabled="!edit_mode"
      >
        <option
          v-for="option in format_options"
          :key="option.key"
          :value="option.key"
          v-text="option.text"
        />
      </select>

      <br />

      <div class="u-sameRow">
        <div class="">
          <DLabel :str="$t('width')" />
          <div class="u-inputGroup">
            <input
              type="number"
              :disabled="!edit_mode"
              v-model.number="new_page_width"
            />
            <span class="u-suffix">cm</span>
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
            <span class="u-suffix">cm</span>
          </div>
        </div>
      </div>

      <div class="u-instructions">
        <small>{{ $t("format_instructions") }}</small>
      </div>

      <br />

      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

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
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      can_edit: true,

      new_page_width: this.publication.page_width,
      new_page_height: this.publication.page_height,

      format_options: [
        {
          key: "A4_portrait",
          text: this.$t("A4_portrait"),
          width: 21,
          height: 29.7,
          // instruction: this.$t("A4_portrait_explanations"),
        },
        {
          key: "A4_landscape",
          text: this.$t("A4_landscape"),
          width: 29.7,
          height: 21,
          // instruction: this.$t("A4_landscape_explanations"),
        },
        {
          key: "A5_portrait",
          text: this.$t("A5_portrait"),
          width: 14.8,
          height: 21,
          // instruction: this.$t("A5_portrait_explanations"),
        },
        {
          key: "A5_landscape",
          text: this.$t("A5_landscape"),
          width: 21,
          height: 14.8,
          // instruction: this.$t("A5_landscape_explanations"),
        },
        {
          key: "custom",
          text: this.$t("custom"),
          // instruction: this.$t("custom_format_explanations"),
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    predefined_format_from_width() {
      const format = this.format_options.find(
        (f) =>
          f.width === this.new_page_width && f.height === this.new_page_height
      );

      if (format) return format.key;

      return "custom";
    },
  },
  methods: {
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
      this.new_content = this.content;

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_content;
        // });
      });
      // todo interrupt updateMeta
    },
    async updateSize() {
      this.is_saving = true;

      try {
        const new_meta = {
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
          .error(this.$t("notifications.couldntbesaved"));
        this.$alertify.closeLogOnClick(true).error(e.response.data);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
