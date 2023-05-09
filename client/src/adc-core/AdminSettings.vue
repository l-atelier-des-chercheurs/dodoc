<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
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
              :path="settings.$path"
              tag="h1"
              :required="true"
              :minlength="3"
              :maxlength="40"
              :can_edit="is_instance_admin"
            />

            <br />

            <TitleField
              :field_name="'presentation_of_instance'"
              :label="$t('presentation_of_instance')"
              :instructions="$t('presentation_of_instance_instructions')"
              :content="settings.presentation_of_instance"
              :path="settings.$path"
              :required="false"
              :markdown="true"
              :can_edit="is_instance_admin"
            />

            <br />

            <TitleField
              :field_name="'contactmail_of_instance'"
              :label="$t('contactmail_of_instance')"
              :instructions="$t('contactmail_of_instance_instructions')"
              :content="settings.contactmail_of_instance"
              :path="settings.$path"
              :required="false"
              :input_type="'email'"
              :can_edit="is_instance_admin"
            />

            <br />

            <DLabel :str="$t('logo')" />
            <div class="_cover">
              <CoverField
                :context="'full'"
                :cover="settings.$cover"
                :path="settings.$path"
                :can_edit="is_instance_admin"
              />
            </div>
            <div class="u-instructions">
              {{ $t("logo_instr") }}
            </div>

            <br />

            <ColorInput
              class="u-spacingBottom"
              :label="$t('hero_background_color')"
              :value="settings.hero_background_color"
              @save="saveNewHeroBgColor"
            />

            <br />

            <div class="u-instructions">
              {{ $t("refresh_window_to_apply") }}
            </div>
          </sl-tab-panel>
          <sl-tab-panel name="administration_and_access_control">
            <AdminsAndContributorsField
              :folder="settings"
              :can_edit="is_instance_admin"
              :admin_label="$t('admin')"
              :admin_instructions="$t('instance_admin_instructions')"
              :contrib_instructions="$t('instance_contrib_instructions')"
            />
            <br />

            <ToggleField
              :label="$t('require_signup_to_contribute')"
              :field_name="'require_signup_to_contribute'"
              :content="settings.require_signup_to_contribute === true"
              :path="settings.$path"
              :can_edit="is_instance_admin"
            />
            <br />

            <ToggleField
              :label="$t('require_mail_to_signup')"
              :field_name="'require_mail_to_signup'"
              :content="settings.require_mail_to_signup === true"
              :path="settings.$path"
              :can_edit="is_instance_admin"
            />
            <br />

            <TitleField
              :field_name="'general_password'"
              :label="$t('general_password')"
              :instructions="$t('general_password_instructions')"
              :content="settings.general_password"
              :path="settings.$path"
              :input_type="'password'"
              :required="false"
              :can_edit="is_instance_admin"
            />
            <br />

            <TitleField
              :field_name="'signup_password'"
              :label="$t('signup_password')"
              :instructions="$t('signup_password_instructions')"
              :content="settings.signup_password"
              :path="settings.$path"
              :required="false"
              :can_edit="is_instance_admin"
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
            <PickNativePath
              :can_edit="is_instance_admin && $root.app_infos.is_electron"
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
      path_to_content: undefined,
      new_path_to_content: undefined,
      settings: undefined,
      is_loading: true,
    };
  },
  created() {},
  async mounted() {
    this.settings = await this.$api
      .getFolder({
        path: "",
      })
      .catch((err) => {
        this.is_loading = false;
        return err;
      });
    this.is_loading = false;
    this.$api.join({ room: this.settings.$path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.settings.$path });
  },
  watch: {},
  computed: {},
  methods: {
    restartDodoc() {
      this.$api.restartDodoc();
    },
    saveNewPathToContent() {},
    async saveNewHeroBgColor($event) {
      await this.$api.updateMeta({
        path: this.settings.$path,
        new_meta: {
          hero_background_color: $event || "",
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._cover {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
  border: 2px solid var(--c-gris);

  ::v-deep img {
    object-fit: scale-down;
  }
}
</style>
