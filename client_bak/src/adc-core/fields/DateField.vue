<template>
  <div class="_dateField">
    <DLabel
      v-if="label"
      class="_label"
      :str="label"
      :instructions="can_edit ? instructions : ''"
    />

    <div v-if="!edit_mode" class="">
      {{ format_date }}
      <EditBtn v-if="can_edit" @click="edit_mode = true" />
    </div>
    <div v-else>
      <input :type="input_type" v-model="local_date" step="1" />
      <div class="_footer" v-if="edit_mode">
        <SaveCancelButtons class="_scb" @save="updateMeta" @cancel="cancel" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    field_name: String,
    label: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      default: "",
    },
    date: String,
    path: String,
    input_type: {
      type: String,
      default: "datetime-local",
    },
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      edit_mode: false,
      is_saving: false,
      local_date: this.date,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    date() {
      this.local_date = this.date;
    },
  },
  computed: {
    format_date() {
      if (!this.date) return "–";

      if (this.input_type === "datetime-local")
        return this.formatDateTimeToHuman(this.date);
      else return this.formatDateToHuman(this.date);
    },
  },
  methods: {
    cancel() {
      this.local_date = this.date;
      this.edit_mode = false;
    },
    async updateMeta() {
      this.is_saving = true;
      const new_meta = {
        [this.field_name]: this.local_date,
      };

      await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });

      this.is_saving = false;
      this.edit_mode = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._dateField {
}
</style>
