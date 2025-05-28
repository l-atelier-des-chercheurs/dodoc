<template>
  <div>
    <fieldset>
      <legend class="u-label">{{ $t("pagination") }}</legend>
      <div class="u-instructions">
        <small>{{ $t("pagination_instructions") }}</small>
        <small v-if="is_spread"
          >&#32;{{ $t("pagination_instructions_spread") }}</small
        >
      </div>

      <br />

      <EditBtn
        v-if="can_edit && !edit_mode"
        :is_unfolded="true"
        @click="enableEditMode"
      />

      <br />
      <br />

      <ToggleInput
        :content.sync="enable_pagination"
        :label="$t('enable')"
        :disabled="!edit_mode"
      />
      <br />

      <div class="">
        <DLabel :str="$t('pagn_starts_on_page')" />
        <input
          type="number"
          v-model.number="pagn_starts_on_page"
          :disabled="!edit_mode"
        />
      </div>

      <br />
      <div class="u-sameRow">
        <div class="">
          <DLabel
            :str="
              is_spread ? $t('distance_to_outside') : $t('distance_to_right')
            "
          />
          <div class="u-inputGroup">
            <input
              type="number"
              v-model.number="right"
              :disabled="!edit_mode"
            />
            <span class="u-suffix" v-text="unit" />
          </div>
        </div>
        <div class="">
          <DLabel :str="$t('distance_to_bottom')" />
          <div class="u-inputGroup">
            <input
              type="number"
              v-model.number="bottom"
              :disabled="!edit_mode"
            />
            <span class="u-suffix" v-text="unit" />
          </div>
        </div>
      </div>

      <div class="_footer" v-if="edit_mode">
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          @save="updatePagination"
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
    is_spread: Boolean,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      can_edit: true,

      enable_pagination: this.publication.enable_pagination || false,
      pagn_starts_on_page: this.publication.pagn_starts_on_page || 1,
      right: this.publication.pagn_right || 10,
      bottom: this.publication.pagn_bottom || 10,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    unit() {
      if (this.publication.layout_mode === "screen") return "px";
      else return "mm";
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.enable_pagination = this.publication.enable_pagination;
      this.pagn_starts_on_page = this.publication.pagn_starts_on_page;
      this.right = this.publication.pagn_right || 10;
      this.bottom = this.publication.pagn_bottom || 10;
    },
    async updatePagination() {
      this.is_saving = true;

      try {
        const new_meta = {
          enable_pagination: this.enable_pagination,
          pagn_starts_on_page: this.pagn_starts_on_page,
          pagn_right: this.right,
          pagn_bottom: this.bottom,
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
