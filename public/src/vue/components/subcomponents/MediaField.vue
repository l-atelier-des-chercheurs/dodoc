<template>
  <div class="m_mediaField" :class="{ 'is--beingEdited': edit_mode }">
    <template v-if="!edit_mode">
      <div v-if="value" v-html="value" />
      <button
        type="button"
        class="buttonLink"
        v-if="show_edit_button"
        v-html="!!value ? edit_instructions : add_instructions"
        @click="edit_mode = true"
      />
    </template>
    <template v-else-if="edit_mode">
      <CollaborativeEditor
        :specific_toolbar="[
          ['bold', 'italic', 'underline', 'link', 'blockquote'],
          ['clean'],
        ]"
        v-model="new_value"
        ref="textField"
      />
      <div class="m_mediaField--buttonRow">
        <button type="button" class="button-redthin" @click="edit_mode = false">
          {{ $t("cancel") }}
        </button>
        <button type="button" class="button-greenthin" @click="updateValue()">
          {{ $t("send") }}
        </button>
      </div>
    </template>
  </div>
</template>
<script>
import CollaborativeEditor from "./CollaborativeEditor.vue";

export default {
  props: {
    value: {
      type: String,
      default: "",
    },
    add_instructions: String,
    edit_instructions: String,
    show_edit_button: Boolean,
  },
  components: {
    CollaborativeEditor,
  },
  data() {
    return {
      new_value: this.value ? this.value : "",
      edit_mode: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    edit_mode() {
      if (this.edit_mode) {
        this.new_value = this.value;
      }
    },
  },
  computed: {},
  methods: {
    updateValue() {
      this.$emit("updateField", this.new_value);
      this.edit_mode = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
