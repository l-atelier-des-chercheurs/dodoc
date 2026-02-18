<template>
  <BaseModal2 :title="$t('create_list')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createNotesList">
      <div v-if="$slots.instructions" class="u-spacingBottom">
        <slot name="instructions" />
      </div>
      <DLabel :str="$t('title')" />
      <TextInput
        :content.sync="new_list_title"
        :maxlength="60"
        :required="true"
        :autofocus="true"
        ref="titleInput"
        @toggleValidity="($event) => (allow_save = $event)"
        @onEnter="createNotesList"
      />

      <template v-if="error_msg">
        <br />
        <br />
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>

    <template slot="footer">
      <button type="button" class="u-button" @click="$emit('close')">
        <b-icon icon="x-circle" />
        {{ $t("cancel") }}
      </button>
      <button
        class="u-button u-button_bleuvert"
        :loading="is_creating_list"
        @click="createNotesList"
      >
        <b-icon icon="plus-circle" />
        {{ $t("create_and_open") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      new_list_title: "",
      is_creating_list: false,
      allow_save: false,
      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createNotesList() {
      this.is_creating_list = true;
      this.new_list_title = this.cleanUpString(this.new_list_title);

      let additional_meta = {
        title: this.new_list_title,
        requested_slug: this.new_list_title,
        $admins: "parent_contributors",
      };

      try {
        const new_folder_slug = await this.$api.createFolder({
          path: this.path,
          additional_meta,
        });
        this.$emit("openNew", new_folder_slug);
      } catch ({ code }) {
        if (code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("title_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        } else {
          this.$alertify.delay(4000).error(code);
        }
        this.is_creating_list = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
