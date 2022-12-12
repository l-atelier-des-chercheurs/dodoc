<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <sl-tab-group>
        <sl-tab slot="nav" panel="informations">
          {{ $t("informations") }}
        </sl-tab>
        <sl-tab slot="nav" panel="access_control">
          {{ $t("access_control") }}
        </sl-tab>
        <sl-tab slot="nav" panel="storage">
          {{ $t("storage") }}
        </sl-tab>

        <sl-tab-panel name="informations">
          <TitleField
            :field_name="'name_of_instance'"
            :label="$t('name_of_instance')"
            :instructions="$t('name_of_instance_instructions')"
            :content="settings.name_of_instance"
            :path="'_admin'"
            tag="h1"
            :required="true"
            :maxlength="40"
            :can_edit="true"
          />

          <br />

          <TitleField
            :field_name="'presentation_of_instance'"
            :label="$t('presentation_of_instance')"
            :instructions="$t('presentation_of_instance_instructions')"
            :content="settings.presentation_of_instance"
            :path="'_admin'"
            :required="false"
            :can_edit="true"
          />

          <br />

          <TitleField
            :field_name="'contactmail_of_instance'"
            :label="$t('contactmail_of_instance')"
            :instructions="$t('contactmail_of_instance_instructions')"
            :content="settings.contactmail_of_instance"
            :path="'_admin'"
            :required="false"
            :input_type="'email'"
            :can_edit="true"
          />

          <br />

          <DLabel :str="$t('logo')" />
          // à venir
          <CoverField :cover="settings.logo" :path="'_admin'" />

          <br />

          <div class="u-instructions">
            {{ $t("restart_to_apply") }}
          </div>
        </sl-tab-panel>
        <sl-tab-panel name="access_control">
          <TitleField
            :field_name="'general_password'"
            :label="$t('general_password')"
            :instructions="$t('general_password_instructions')"
            :content="settings.general_password"
            :path="'_admin'"
            :input_type="'password'"
            :required="false"
            :can_edit="true"
          />

          <br />

          <TitleField
            :field_name="'signup_password'"
            :label="$t('signup_password')"
            :instructions="$t('signup_password_instructions')"
            :content="settings.signup_password"
            :path="'_admin'"
            :required="false"
            :can_edit="true"
          />

          <br />

          <div class="u-instructions">
            {{ $t("restart_to_apply") }}
          </div>
        </sl-tab-panel>
        <sl-tab-panel name="storage">
          <PickNativePath
            :field_name="'pathToUserContent'"
            :label="$t('path_to_content')"
            :instructions="$t('path_to_content_instructions')"
            :content="settings.pathToUserContent"
            :path="'_admin'"
            :required="true"
            :can_edit="$root.is_electron"
          />
          <br />
          <div class="u-instructions">
            {{ $t("restart_to_apply") }}
          </div>
        </sl-tab-panel>
      </sl-tab-group>

      <!-- seulement modifiable dans la version appli/electron (à configurer côté code source par le dev dans la version server) -->

      <!-- <button type="button" class="u-button" @click="restartDodoc">
        {{ $t("restart") }}
      </button> -->
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      path_to_content: undefined,
      new_path_to_content: undefined,
      settings: {},
    };
  },
  created() {},
  async mounted() {
    this.settings = await this.$api.getSettings();
    this.$api.join({ room: "_admin" });
  },
  beforeDestroy() {
    this.$api.leave({ room: "_admin" });
  },
  watch: {},
  computed: {},
  methods: {
    restartDodoc() {
      this.$api.restartDodoc();
    },
    saveNewPathToContent() {},
  },
};
</script>
<style lang="scss" scoped></style>
