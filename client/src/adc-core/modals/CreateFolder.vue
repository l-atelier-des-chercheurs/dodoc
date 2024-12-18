<template>
  <BaseModal2 :title="modal_name" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createFolder">
      <DLabel :str="$t('title')" />
      <TextInput
        :content.sync="new_folder_title"
        :maxlength="40"
        :required="true"
        :autofocus="true"
        ref="titleInput"
        @toggleValidity="($event) => (allow_save = $event)"
        @onEnter="createFolder"
      />

      <div class="">
        <ToggleInput
          :content.sync="new_folder_is_private"
          :label="$t('private')"
          :options="{
            true: $t('private_status_explanations'),
            false: $t('public_status_explanations'),
          }"
        />
      </div>

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
        :loading="is_creating_folder"
        @click="createFolder"
      >
        {{ $t("create_and_open") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    modal_name: String,
    path: String,
    default_folder_status: { type: String, default: "public" },
  },
  components: {},
  data() {
    return {
      new_folder_title: "",
      new_folder_is_private: false,

      is_creating_folder: false,
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
    async createFolder() {
      this.is_creating_folder = true;

      const $admins = this.setDefaultContentAdmins();
      this.new_folder_title = this.cleanUpString(this.new_folder_title);

      try {
        const new_folder_slug = await this.$api.createFolder({
          path: this.path,
          additional_meta: {
            title: this.new_folder_title,
            requested_slug: this.new_folder_title,
            $status:
              this.new_folder_is_private === true
                ? "private"
                : this.default_folder_status,
            $admins,
          },
        });
        setTimeout(() => {
          this.$emit("openNew", new_folder_slug);
        }, 50);
      } catch ({ code }) {
        if (code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("title_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        } else {
          this.$alertify.delay(4000).error(code);
        }
        this.is_creating_folder = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
