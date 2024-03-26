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

      <br />

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

      <br />

      <div class="u-sameRow" slot="footer">
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          class="u-button u-button_bleuvert"
          type="submit"
          slot="footer"
          :loading="is_creating_folder"
        >
          {{ $t("create_and_open") }}
        </button>
      </div>

      <template v-if="error_msg">
        <br />
        <br />
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>
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
      } catch (err_code) {
        if (err_code === "unique_field_taken") {
          this.$alertify
            .delay(4000)
            .error(this.$t("notifications.title_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        } else if (err_code === "token_not_allowed_must_be_contributors") {
          this.$alertify
            .delay(4000)
            .error(this.$t("notifications.action_not_allowed"));
        } else {
          this.$alertify.delay(4000).error(err_code);
        }
        this.is_creating_folder = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
