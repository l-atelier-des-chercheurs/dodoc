<template>
  <div>
    <!-- <TitleField
      :content="local_value"
      :input_type="input_type"
      :maxlength="60"
      :can_edit="can_edit"
      @save="save"
      @cancel="cancel"
    /> -->
    <CollaborativeEditor2
      :content="local_value"
      :custom_formats="['bold', 'italic', 'link']"
      :is_collaborative="false"
      :can_edit="can_edit"
      @save="save"
      @cancel="cancel"
    />
    <!-- <TextInput :content.sync="local_value" :disabled="!edit_mode" /> -->
    <!-- <EditBtn
      key="editbtn"
      v-if="can_edit && !edit_mode"
      @click="enableEditMode"
    />
    <SaveCancelButtons
      v-if="local_value !== value"
      @save="update"
      @cancel="cancel"
    /> -->
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    can_edit: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      local_value: this.value,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value(newVal) {
      this.local_value = newVal;
    },
  },
  computed: {},
  methods: {
    save(new_val) {
      this.$emit("update", new_val);
    },
    cancel() {
      this.local_value = this.value;
    },
  },
};
</script>
<style lang="scss" scoped></style>
