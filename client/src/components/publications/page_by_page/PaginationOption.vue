<template>
  <div>
    <fieldset>
      <legend class="u-label">{{ $t("pagination") }}</legend>

      <br />

      <div class="u-sameRow">
        <ToggleInput
          :content.sync="enable_pagination"
          :label="$t('enable')"
          :disabled="!edit_mode"
        />
      </div>
      <br />
      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

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
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      can_edit: true,

      enable_pagination: this.publication.enable_pagination || false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.enable_pagination = this.publication.enable_pagination;
    },
    async updatePagination() {
      this.is_saving = true;

      try {
        const new_meta = {
          enable_pagination: this.enable_pagination,
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
