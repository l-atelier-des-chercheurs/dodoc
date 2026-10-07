<template>
  <div>
    <fieldset :disabled="is_saving">
      <legend>{{ $t("pagination") }}</legend>
      <div class="u-instructions">
        <small>{{ $t("pagination_instructions") }}</small>
        <small v-if="is_spread"
          >&#32;{{ $t("pagination_instructions_spread") }}</small
        >
      </div>

      <div class="u-spacingBottom" />

      <ToggleInput
        :content="publication.enable_pagination === true"
        :label="$t('enable')"
        @update:content="updateMeta({ enable_pagination: $event })"
      />

      <template v-if="publication.enable_pagination === true">
        <div class="_inputs">
          <DLabel :str="$t('pagn_starts_on_page')" />
          <input
            type="number"
            min="1"
            v-model.number="pagn_starts_on_page"
            @change="saveNumber('pagn_starts_on_page', pagn_starts_on_page, 1)"
          />
        </div>

        <div class="u-sameRow _inputs">
          <div>
            <DLabel
              :str="
                is_spread ? $t('distance_to_outside') : $t('distance_to_right')
              "
            />
            <div class="u-inputGroup">
              <input
                type="number"
                min="0"
                v-model.number="right"
                @change="saveNumber('pagn_right', right, 0)"
              />
              <span class="u-suffix" v-text="unit" />
            </div>
          </div>
          <div>
            <DLabel :str="$t('distance_to_bottom')" />
            <div class="u-inputGroup">
              <input
                type="number"
                min="0"
                v-model.number="bottom"
                @change="saveNumber('pagn_bottom', bottom, 0)"
              />
              <span class="u-suffix" v-text="unit" />
            </div>
          </div>
        </div>
      </template>
    </fieldset>
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
    is_spread: Boolean,
  },
  components: {},
  data() {
    return {
      is_saving: false,

      pagn_starts_on_page: undefined,
      right: undefined,
      bottom: undefined,
    };
  },
  created() {
    this.initValues();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    "publication.pagn_starts_on_page"() {
      this.initValues();
    },
    "publication.pagn_right"() {
      this.initValues();
    },
    "publication.pagn_bottom"() {
      this.initValues();
    },
  },
  computed: {
    unit() {
      if (this.publication.layout_mode === "screen") return "px";
      else return "mm";
    },
  },
  methods: {
    initValues() {
      this.pagn_starts_on_page = this.publication.pagn_starts_on_page || 1;
      this.right = this.publication.pagn_right || 10;
      this.bottom = this.publication.pagn_bottom || 10;
    },
    saveNumber(field, value, min) {
      if (typeof value !== "number" || value < min) return this.initValues();
      this.updateMeta({ [field]: value });
    },
    async updateMeta(new_meta) {
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
._inputs {
  justify-content: flex-start;
  margin-top: calc(var(--spacing) / 2);
}
</style>
