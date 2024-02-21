<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <sl-tab-group ref="tabgroup" @sl-tab-show="newTabShown">
          <sl-tab slot="nav" panel="informations">
            {{ $t("informations") }}
          </sl-tab>
          <sl-tab slot="nav" panel="administration_and_access_control">
            {{ $t("administration_and_access_control") }}
          </sl-tab>
          <sl-tab slot="nav" panel="suggested_cat_kw">
            {{ $t("suggested_cat_kw") }}
          </sl-tab>

          <sl-tab-panel name="informations">
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
              <TitleField
                :field_name="'presentation_of_instance_fr'"
                :label="$t('presentation_of_instance') + ' (en français)'"
                :instructions="$t('presentation_of_instance_instructions')"
                :content="settings.presentation_of_instance_fr"
                :path="settings.$path"
                :required="false"
                :input_type="'markdown'"
                :can_edit="is_instance_admin"
              />
            </div>
            <div class="u-spacingBottom">
              <TitleField
                :field_name="'presentation_of_instance_en'"
                :label="$t('presentation_of_instance') + ' (en anglais)'"
                :instructions="$t('presentation_of_instance_instructions')"
                :content="settings.presentation_of_instance_en"
                :path="settings.$path"
                :required="false"
                :input_type="'markdown'"
                :can_edit="is_instance_admin"
              />
            </div>
          </sl-tab-panel>

          <sl-tab-panel name="administration_and_access_control">
            <AdminsAndContributorsField
              v-if="current_tab === 'administration_and_access_control'"
              :folder="settings"
              :can_edit="true"
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
              :field_name="'contactmail_of_instance'"
              :label="$t('contactmail_of_instance')"
              :instructions="$t('contactmail_of_instance_instructions')"
              :content="settings.contactmail_of_instance"
              :path="settings.$path"
              :required="false"
              :input_type="'email'"
              :can_edit="is_instance_admin"
            />
          </sl-tab-panel>
          <sl-tab-panel name="suggested_cat_kw">
            <SuggestedCategories v-if="current_tab === 'suggested_cat_kw'" />
          </sl-tab-panel>
        </sl-tab-group>
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
