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

      <div class="">
        <DLabel :str="$t('template')" />
        <select v-model="new_folder_template">
          <option
            v-for="template in available_templates"
            :value="template.value"
            :key="template.value"
          >
            {{ template.label }}
          </option>
        </select>
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
      new_folder_template: "story_with_sections",

      available_templates: [
        {
          value: "story_with_sections",
          label: this.$t("story_with_sections"),
        },
        {
          value: "agora",
          label: this.$t("agora"),
        },
        {
          value: "edition",
          label: this.$t("edition"),
        },
      ],

      is_creating_folder: false,
      allow_save: false,
      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  i18n: {
    messages: {
      fr: {
        agora: "Agora",
      },
      en: {
        agora: "Agora",
      },
    },
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createFolder() {
      this.is_creating_folder = true;

      const $admins = this.setDefaultContentAdmins();
      this.new_folder_title = this.cleanUpString(this.new_folder_title);

      let additional_meta = {
        title: this.new_folder_title,
        template: this.new_folder_template,
        requested_slug: this.new_folder_title,
        $status:
          this.new_folder_is_private === true
            ? "private"
            : this.default_folder_status,
        $admins,
      };

      if (this.new_folder_template === "agora")
        additional_meta.autoscroll = true;

      try {
        const new_folder_slug = await this.$api.createFolder({
          path: this.path,
          additional_meta,
        });
        setTimeout(() => {
          this.$emit("openNew", new_folder_slug);
        }, 50);
      } catch ({ code }) {
        if (code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("title_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        } else if (code === "token_not_allowed_must_be_contributors") {
          this.$alertify.delay(4000).error(this.$t("action_not_allowed"));
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
