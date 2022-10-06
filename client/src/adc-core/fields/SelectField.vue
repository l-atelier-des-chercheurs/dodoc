<template>
  <div>
    <template>
      <select v-model="new_content" :disabled="!edit_mode">
        <option
          v-for="(option, index) in options"
          :key="index"
          :value="option"
          v-text="$t(option)"
        />
      </select>
    </template>

    <template v-if="can_edit">
      <sl-button
        v-if="!edit_mode"
        variant="primary"
        class="editBtn"
        size="small"
        circle
        @click="enableEditMode"
      >
        <sl-icon name="pencil-fill" :label="$t('edit')" />
      </sl-button>
      <div class="_footer" v-else>
        <SaveCancelButtons
          class="_scb"
          :is_saving="is_saving"
          @save="updateSelect"
          @cancel="cancel"
        />
      </div>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    content: {
      type: String,
      default: "",
    },
    options: {
      type: Array,
    },
    path: String,
    can_edit: {
      type: Boolean,
    },
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,

      new_content: this.content ? this.content : "draft",
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
    async updateSelect() {
      this.is_saving = true;

      try {
        const new_meta = {
          [this.field_name]: this.new_content,
        };
        await this.$api.updateMeta({
          path: this.path,
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
