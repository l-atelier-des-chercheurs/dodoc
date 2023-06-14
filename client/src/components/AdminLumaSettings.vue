<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <div class="u-spacingBottom">
          <AdminsAndContributorsField
            :folder="settings"
            :can_edit="true"
            :admin_label="$t('admin')"
            :admin_instructions="$t('instance_admin_instructions')"
            :contrib_instructions="$t('instance_contrib_instructions')"
          />
        </div>

        <div class="u-spacingBottom">
          <AdminSuggestedKeywords :settings="settings" />
        </div>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
import AdminSuggestedKeywords from "@/components/AdminSuggestedKeywords.vue";

export default {
  props: {},
  components: { AdminSuggestedKeywords },
  data() {
    return {
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
  methods: {},
};
</script>
<style lang="scss" scoped></style>
