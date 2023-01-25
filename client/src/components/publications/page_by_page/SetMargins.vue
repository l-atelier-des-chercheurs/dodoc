<template>
  <div>
    <fieldset>
      <legend class="u-label">{{ $t("margins") }}</legend>
      <div class="u-instructions">
        <small>{{ $t("margins_instructions") }}</small>
      </div>

      <br />

      <div class="u-sameRow">
        <div class="">
          <DLabel :str="$t('top')" />
          <input type="number" v-model.number="top" :disabled="!edit_mode" />
        </div>
        <div class="">
          <DLabel :str="$t('bottom')" />
          <input type="number" v-model.number="bottom" :disabled="!edit_mode" />
        </div>
      </div>
      <br />
      <div class="u-sameRow">
        <div class="">
          <DLabel :str="is_spread ? $t('margins_inside') : $t('left')" />
          <input type="number" v-model.number="left" :disabled="!edit_mode" />
        </div>
        <br />
        <div class="">
          <DLabel :str="is_spread ? $t('margins_outside') : $t('right')" />
          <input type="number" v-model.number="right" :disabled="!edit_mode" />
        </div>
      </div>

      <br />
      <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

      <div class="_footer" v-if="edit_mode">
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          @save="updateMargins"
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

      top: this.publication.page_margin_top
        ? this.publication.page_margin_top
        : 0,
      bottom: this.publication.page_margin_bottom
        ? this.publication.page_margin_bottom
        : 0,
      left: this.publication.page_margin_left
        ? this.publication.page_margin_left
        : 0,
      right: this.publication.page_margin_right
        ? this.publication.page_margin_right
        : 0,
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
      this.new_content = this.content;

      this.$nextTick(() => {
        // this.content = "";
        // this.$nextTick(() => {
        // this.content = this.new_content;
        // });
      });
      // todo interrupt updateMeta
    },
    async updateMargins() {
      this.is_saving = true;

      try {
        const new_meta = {
          page_margin_top: this.top,
          page_margin_bottom: this.bottom,
          page_margin_left: this.left,
          page_margin_right: this.right,
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
