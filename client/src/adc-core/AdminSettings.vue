<template>
  <BaseModal2
    :title="$t('admin_settings')"
    size="x-large"
    @close="$emit('close')"
  >
    <div class="_adminSettings">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <div>
          <div class="_selectMenu">
            <SelectField2
              :value="current_tab"
              :options="tabs"
              :can_edit="true"
              :hide_validation="true"
              @change="current_tab = $event"
            />
          </div>
          <hr />
          <div class="u-spacingBottom" />
          <transition name="fade" mode="out-in">
            <div v-if="current_tab === 'informations'">
              <div class="u-spacingBottom">
                <TitleField
                  :field_name="'name_of_instance'"
                  :label="$t('name_of_instance')"
                  :instructions="$t('name_of_instance_instructions')"
                  :content="settings.name_of_instance || ''"
                  :path="settings.$path"
                  tag="h1"
                  :maxlength="40"
                  :can_edit="is_instance_admin"
                />
              </div>

              <div class="u-spacingBottom">
                <TitleField
                  :label="$t('presentation_of_instance')"
                  :field_name="'presentation_of_instance'"
                  :instructions="$t('presentation_of_instance_instructions')"
                  :input_type="'editor'"
                  :custom_formats="['bold', 'italic', 'link', 'emoji']"
                  :content="settings.presentation_of_instance || ''"
                  :path="settings.$path"
                  :can_edit="is_instance_admin"
                />
              </div>

              <div class="u-spacingBottom">
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
              </div>

              <div class="u-instructions">
                <button type="button" class="u-buttonLink" @click="reloadPage">
                  {{ $t("refresh_window_to_see_changes") }}
                </button>
              </div>
            </div>
            <div v-else-if="current_tab === 'logo_and_images'">
              <ImagesPanel
                :settings="settings"
                :can_edit="is_instance_admin"
                @reloadPage="reloadPage"
              />
            </div>
            <div
              v-else-if="current_tab === 'administration_and_access_control'"
            >
              <AdminsAndContributorsField
                :folder="settings"
                :can_edit="is_instance_admin"
                :custom_label="$t('instance_admins_and_admins')"
                :admin_label="$t('admin')"
                :admin_instructions="$t('instance_admin_instructions')"
                :contrib_instructions="$t('instance_contrib_instructions')"
              />

              <div class="u-spacingBottom" />

              <ToggleField
                :label="$t('require_signup_to_contribute')"
                :field_name="'require_signup_to_contribute'"
                :content="settings.require_signup_to_contribute === true"
                :path="settings.$path"
                :can_edit="is_instance_admin"
              />

              <div class="u-spacingBottom" />

              <ToggleField
                :label="$t('require_mail_to_signup')"
                :field_name="'require_mail_to_signup'"
                :content="settings.require_mail_to_signup === true"
                :path="settings.$path"
                :can_edit="is_instance_admin"
              />

              <div class="u-spacingBottom" />

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

              <div class="u-spacingBottom" />

              <TitleField
                :field_name="'signup_password'"
                :label="$t('signup_password')"
                :instructions="$t('signup_password_instructions')"
                :content="settings.signup_password"
                :path="settings.$path"
                :required="false"
                :can_edit="is_instance_admin"
              />

              <div class="u-spacingBottom" />

              <ToggleField
                :label="$t('enable_indexing')"
                :field_name="'enable_indexing'"
                :content="settings.enable_indexing === true"
                :path="settings.$path"
                :can_edit="is_instance_admin"
              />

              <div class="u-spacingBottom" />

              <div class="_setMaxFileSize">
                <TitleField
                  :field_name="'upload_max_file_size_in_mo'"
                  :label="$t('upload_max_file_size_in_mo')"
                  :instructions="$t('umo_instructions')"
                  :content="settings.upload_max_file_size_in_mo || 10_000"
                  :path="settings.$path"
                  :input_type="'number'"
                  :required="false"
                  :can_edit="is_instance_admin"
                />

                <!-- <NumberInput
                :label="$t('upload_max_file_size_in_mo')"
                :value="settings.upload_max_file_size_in_mo || 10000"
                :default_value="10000"
                :min="0"
                :max="10000"
                :suffix="$t('mb')"
                :size="'medium'"
                @save="updateUploadMaxFileSizeInMo($event)"
              /> -->
              </div>

              <div class="u-spacingBottom" />

              <ToggleField
                :label="$t('remove_permanently')"
                :field_name="'remove_permanently'"
                :content="settings.remove_permanently === true"
                :path="settings.$path"
                :options="{
                  true: $t('remove_permanently_true'),
                  false: $t('remove_permanently_false'),
                }"
                :can_edit="is_instance_admin"
              />

              <div class="u-spacingBottom" />

              <div class="u-instructions">
                {{ $t("restart_to_apply") }}
              </div>
            </div>
            <FontsPanel v-else-if="current_tab === 'fonts'" />
            <div v-else-if="current_tab === 'events'">
              <DLabel :str="$t('events')" />
              <ToggleField
                :label="$t('enable_events')"
                :field_name="'enable_events'"
                :content="settings.enable_events === true"
                :path="settings.$path"
                :can_edit="is_instance_admin"
              />
            </div>
            <div v-else-if="current_tab === 'chats'">
              <div class="u-instructions u-spacingBottom">
                {{ $t("enable_chats_instructions") }}
              </div>
              <ToggleField
                :label="$t('enable_chats')"
                :field_name="'enable_chats'"
                :content="settings.enable_chats === true"
                :path="settings.$path"
                :can_edit="is_instance_admin"
              />
              <div class="u-spacingBottom" />
              <button type="button" class="u-buttonLink" @click="reloadPage">
                {{ $t("refresh_window_to_see_changes") }}
              </button>
            </div>
            <TermsPanel
              v-else-if="current_tab === 'terms'"
              :settings="settings"
              @close="$emit('close')"
            />
            <PagesPanel
              v-else-if="current_tab === 'pages'"
              :settings="settings"
              @close="$emit('close')"
            />
            <SuggestedCategories
              v-else-if="current_tab === 'suggested_cat_kw'"
            />
            <PickNativePath
              v-else-if="current_tab === 'storage'"
              :can_edit="is_instance_admin && $root.app_infos.is_electron"
            />
            <LogsPanel v-else-if="current_tab === 'debug_logs'" />
          </transition>
        </div>
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
import ImagesPanel from "@/adc-core/ui/ImagesPanel.vue";
import TermsPanel from "@/adc-core/ui/TermsPanel.vue";
import PagesPanel from "@/adc-core/ui/PagesPanel.vue";
import SuggestedCategories from "@/adc-core/ui/SuggestedCategories.vue";
import LogsPanel from "@/adc-core/ui/LogsPanel.vue";

export default {
  props: {
    starting_tab: String,
  },
  components: {
    FontsPanel,
    ImagesPanel,
    TermsPanel,
    PagesPanel,
    SuggestedCategories,
    LogsPanel,
  },
  data() {
    return {
      path_to_content: undefined,
      new_path_to_content: undefined,
      settings: undefined,
      is_loading: true,

      current_tab: this.starting_tab || "informations",

      tabs: [
        {
          key: "informations",
          text: this.$t("informations"),
        },
        {
          text: this.$t("logo_and_images"),
          key: "logo_and_images",
        },
        {
          text: this.$t("administration_and_access_control"),
          key: "administration_and_access_control",
        },
        {
          text: this.$t("fonts"),
          key: "fonts",
        },
        {
          text: this.$t("chats") + " (experimental)",
          key: "chats",
        },
        {
          text: this.$t("events"),
          key: "events",
        },
        {
          text: this.$t("terms"),
          key: "terms",
        },
        {
          text: this.$t("suggested_cat_kw"),
          key: "suggested_cat_kw",
        },
        {
          text: this.$t("storage"),
          key: "storage",
        },
        {
          text: this.$t("debug_logs"),
          key: "debug_logs",
        },
      ],
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
    this.$api.join({ room: this.settings.$path });
    this.is_loading = false;
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
    reloadPage() {
      window.location.reload();
    },
    saveNewPathToContent() {},
    newTabShown($event) {
      this.current_tab = $event.detail.name;
    },
    updateUploadMaxFileSizeInMo(value) {
      this.$api.updateMeta({
        path: this.settings.$path,
        new_meta: { upload_max_file_size_in_mo: value },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._selectMenu {
  max-width: 320px;
  margin: 0 auto;
}
._adminSettings {
  // margin-top: calc(var(--spacing) / -1);
  // margin-bottom: calc(var(--spacing) / -1);
}
._setMaxFileSize {
  max-width: 40ch;
}
</style>
