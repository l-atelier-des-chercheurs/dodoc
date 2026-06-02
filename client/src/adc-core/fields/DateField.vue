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
      <input
        :type="input_type"
        :value="input_value"
        step="1"
        @input="onInput"
      />
      <div class="_footer" v-if="edit_mode">
        <SaveCancelButtons class="_scb" @save="updateMeta" @cancel="cancel" />
      </div>
    </div>
  </div>
</template>
<script>
import { toDateInputValue } from "@/utils/date_input.js";

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
      local_date: toDateInputValue(this.date),
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    date() {
      this.local_date = toDateInputValue(this.date);
    },
  },
  computed: {
    input_value() {
      if (this.input_type === "date") {
        return toDateInputValue(this.local_date);
      }
      return this.local_date;
    },
    format_date() {
      if (!this.date) return "–";

      if (this.input_type === "datetime-local")
        return this.formatDateTimeToHuman(this.date);
      else return this.formatDateToHuman(this.date);
    },
  },
  methods: {
    onInput(event) {
      this.local_date =
        event && event.target ? String(event.target.value || "") : "";
    },
    cancel() {
      this.local_date = toDateInputValue(this.date);
      this.edit_mode = false;
    },
    async updateMeta() {
      this.is_saving = true;
      const field_value =
        this.input_type === "date"
          ? toDateInputValue(this.local_date)
          : this.local_date;
      const new_meta = {
        [this.field_name]: field_value,
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
