<template>
  <BaseModal2 :title="modal_name || $t('create')" @close="$emit('close')">
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

      <div class="u-spacingBottom" />
      <!-- 
      <AuthorField
        :label="$t('admin')"
        :can_edit="true"
        :authors_paths="admins"
        :instructions="admin_instructions"
        @save="($event) => (admins = $event)"
      />

      <div class="u-spacingBottom" />

      <AuthorField
        :label="$t('contributors')"
        :can_edit="true"
        :authors_paths="contributors"
        :instructions="contrib_instructions"
        @save="($event) => (contributors = $event)"
      />

      <div class="u-spacingBottom" /> -->

      <ToggleInput
        :content.sync="new_folder_is_private"
        :label="$t('private')"
        :options="{
          true:
            private_status_explanations || $t('private_status_explanations'),
          false: public_status_explanations || $t('public_status_explanations'),
        }"
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
        :loading="is_creating_folder"
        @click="createFolder"
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
    modal_name: String,
    path: String,
    private_status_explanations: String,
    public_status_explanations: String,
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

      admins: "noone",
      contributors: "noone",
    };
  },
  created() {
    this.admins = this.setDefaultContentAdmins();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    // modal_name() {
    //   if (this.type_of_folder === "space") return this.$t("create_a_space");
    //   else if (this.type_of_folder === "project")
    //     return this.$t("create_a_project");
    //   return undefined;
    // },
    // admin_instructions() {
    //   if (this.type_of_folder === "space")
    //     return this.$t("space_admin_instructions");
    //   else if (this.type_of_folder === "project")
    //     return this.$t("project_admin_instructions");
    //   return undefined;
    // },
    // contrib_instructions() {
    //   if (this.type_of_folder === "space")
    //     return this.$t("space_contrib_instructions");
    //   else if (this.type_of_folder === "project")
    //     return this.$t("project_contrib_instructions");
    //   return undefined;
    // },
  },
  methods: {
    async createFolder() {
      this.is_creating_folder = true;

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
            $admins: this.admins,
            $contributors: this.contributors,
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
