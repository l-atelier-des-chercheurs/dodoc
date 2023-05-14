<template>
  <div class="_radioCheckboxField">
    <RadioCheckboxInput
      :value.sync="new_content"
      :input_type="input_type"
      :options="options"
      :can_edit="can_edit && edit_mode"
    />
    <EditBtn v-if="can_edit && !edit_mode" @click="enableEditMode" />

    <div class="_footer" v-if="edit_mode">
      <SaveCancelButtons
        class="_scb"
        :is_saving="is_saving"
        @save="updateSelect"
        @cancel="cancel"
      />
    </div>
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
    input_type: {
      type: String,
      default: "radio",
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
      new_content: "",
    };
  },
  created() {
    this.setNewContent();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    content() {
      this.setNewContent();
    },
  },
  computed: {},
  methods: {
    setNewContent() {
      if (this.input_type === "checkbox") {
        if (this.content)
          this.new_content = JSON.parse(JSON.stringify(this.content));
        else this.new_content = [];
      } else this.new_content = this.content || "";
    },
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
      this.setNewContent();
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
<style lang="scss" scoped>
._radioCheckboxField {
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}

._scb {
  width: 100%;
  text-align: center;
  justify-content: center;
}
</style>
