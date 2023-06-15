<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <sl-tab-group @sl-tab-show="newTabShown">
          <sl-tab slot="nav" panel="administration_and_access_control">
            {{ $t("administration_and_access_control") }}
          </sl-tab>
          <sl-tab slot="nav" panel="suggested_cat_kw">
            {{ $t("suggested_cat_kw") }}
          </sl-tab>

          <sl-tab-panel name="administration_and_access_control">
            <AdminsAndContributorsField
              v-if="current_tab === 'administration_and_access_control'"
              :folder="settings"
              :can_edit="true"
              :admin_label="$t('admin')"
              :admin_instructions="$t('instance_admin_instructions')"
              :contrib_instructions="$t('instance_contrib_instructions')"
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
  props: {},
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
