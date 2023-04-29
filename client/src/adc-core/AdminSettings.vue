<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <sl-tab-group>
        <sl-tab slot="nav" panel="informations">
          {{ $t("informations") }}
        </sl-tab>
        <sl-tab slot="nav" panel="administration_and_access_control">
          {{ $t("administration_and_access_control") }}
        </sl-tab>
        <sl-tab slot="nav" panel="fonts">
          {{ $t("fonts") }}
        </sl-tab>
        <sl-tab slot="nav" panel="storage">
          {{ $t("storage") }}
        </sl-tab>

        <sl-tab-panel name="informations">
          <TitleField
            :field_name="'name_of_instance'"
            :label="$t('name_of_instance')"
            :instructions="$t('name_of_instance_instructions')"
            :content="settings.name_of_instance || ''"
            :path="path"
            tag="h1"
            :required="true"
            :minlength="3"
            :maxlength="40"
            :can_edit="is_admin"
          />

          <br />

          <TitleField
            :field_name="'presentation_of_instance'"
            :label="$t('presentation_of_instance')"
            :instructions="$t('presentation_of_instance_instructions')"
            :content="settings.presentation_of_instance"
            :path="path"
            :required="false"
            :can_edit="is_admin"
          />

          <br />

          <TitleField
            :field_name="'contactmail_of_instance'"
            :label="$t('contactmail_of_instance')"
            :instructions="$t('contactmail_of_instance_instructions')"
            :content="settings.contactmail_of_instance"
            :path="path"
            :required="false"
            :input_type="'email'"
            :can_edit="is_admin"
          />

          <br />

          <DLabel :str="$t('logo')" />
          <div class="u-wips" />

          <!-- <CoverField
            class="_coverPicker"
            :context="context"
            :cover="settings.logo"
            :path="path"
            :can_edit="is_admin"
          /> -->
          <!-- <CoverField :cover="settings.logo" :path="path" /> -->

          <br />

          <div class="u-instructions">
            {{ $t("restart_to_apply") }}
          </div>
        </sl-tab-panel>
        <sl-tab-panel name="administration_and_access_control">
          <AuthorField
            :label="$t('admins')"
            :field="'$admins'"
            :authors_paths="settings.$admins"
            :path="path"
            :can_edit="is_admin"
            :instructions="$t('instance_admins_instr')"
          />
          <AuthorField
            :label="$t('contributors')"
            :field="'$contributors'"
            :authors_paths="settings.$contributors"
            :path="path"
            :can_edit="is_admin"
            :instructions="$t('instance_contributors_instr')"
          />

          <TitleField
            :field_name="'general_password'"
            :label="$t('general_password')"
            :instructions="$t('general_password_instructions')"
            :content="settings.general_password"
            :path="path"
            :input_type="'password'"
            :required="false"
            :can_edit="is_admin"
          />

          <br />

          <TitleField
            :field_name="'signup_password'"
            :label="$t('signup_password')"
            :instructions="$t('signup_password_instructions')"
            :content="settings.signup_password"
            :path="path"
            :required="false"
            :can_edit="is_admin"
          />

          <br />

          <div class="u-instructions">
            {{ $t("restart_to_apply") }}
          </div>
        </sl-tab-panel>
        <sl-tab-panel name="fonts">
          <FontsPanel />
        </sl-tab-panel>
        <sl-tab-panel name="storage">
          <PickNativePath :can_edit="is_admin && $root.is_electron" />
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
import FontsPanel from "@/adc-core/ui/FontsPanel.vue";

export default {
  props: {},
  components: {
    FontsPanel,
  },
  data() {
    return {
      path: "",
      path_to_content: undefined,
      new_path_to_content: undefined,
      settings: undefined,
    };
  },
  created() {},
  async mounted() {
    this.settings = await this.$api
      .getFolder({
        path: this.path,
      })
      .catch((err) => {
        err;
        // this.fetch_spaces_error = err.response;
        // this.is_loading = false;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
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
