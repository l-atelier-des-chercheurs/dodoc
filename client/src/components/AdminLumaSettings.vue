<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
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
          <div class="u-spacingBottom" />

          <template v-if="current_tab === 'informations'">
            <div class="u-spacingBottom">
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
            </div>

            <div class="u-spacingBottom">
              <CollaborativeEditor2
                :label="$t('presentation_of_instance') + ' (en français)'"
                :field_to_edit="'presentation_of_instance_fr'"
                :instructions="$t('presentation_of_instance_instructions')"
                :content="settings.presentation_of_instance_fr"
                :path="settings.$path"
                :custom_formats="['bold', 'italic', 'link']"
                :is_collaborative="false"
                :can_edit="is_instance_admin"
              />
            </div>
            <div class="u-spacingBottom">
              <CollaborativeEditor2
                :label="$t('presentation_of_instance') + ' (en anglais)'"
                :field_to_edit="'presentation_of_instance_en'"
                :instructions="$t('presentation_of_instance_instructions')"
                :content="settings.presentation_of_instance_en"
                :path="settings.$path"
                :custom_formats="['bold', 'italic', 'link']"
                :is_collaborative="false"
                :can_edit="is_instance_admin"
              />
            </div>
          </template>
          <template v-if="current_tab === 'administration_and_access_control'">
            <AdminsAndContributorsField
              :folder="settings"
              :can_edit="is_instance_admin"
              :custom_label="$t('instance_admins_and_admins')"
              :admin_label="$t('admin')"
              :admin_instructions="$t('instance_admin_instructions')"
              :contrib_instructions="$t('instance_contrib_instructions')"
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

            <ToggleField
              :label="$t('require_mail_to_signup')"
              :field_name="'require_mail_to_signup'"
              :content="settings.require_mail_to_signup === true"
              :path="settings.$path"
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
          </template>
          <template v-if="current_tab === 'suggested_cat_kw'">
            <SuggestedCategories />
          </template>
        </div>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
import SuggestedCategories from "@/adc-core/ui/SuggestedCategories.vue";

export default {
  props: {
    starting_tab: String,
  },
  components: { SuggestedCategories },
  data() {
    return {
      settings: undefined,
      is_loading: true,

      current_tab: "administration_and_access_control",

      tabs: [
        {
          key: "informations",
          text: this.$t("informations"),
        },
        {
          text: this.$t("administration_and_access_control"),
          key: "administration_and_access_control",
        },
        {
          text: this.$t("suggested_cat_kw"),
          key: "suggested_cat_kw",
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
    this.is_loading = false;

    if (this.starting_tab) {
      setTimeout(() => {
        this.$refs.tabgroup.show(this.starting_tab);
      }, 100);
    }

    this.$api.join({ room: this.settings.$path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.settings.$path });
  },
  watch: {},
  computed: {},
  methods: {
    newTabShown($event) {
      this.current_tab = $event.detail.name;
    },
  },
};
</script>
<style lang="scss" scoped></style>
