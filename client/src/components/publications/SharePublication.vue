<template>
  <QRModal
    :url_to_access="share_url_effective"
    :modal_title="$t('share_link_to_page')"
    @close="$emit('close')"
  >
    <ToggleField
      v-if="needs_public_toggle"
      :label="$t('make_publication_public')"
      :field_name="'$public'"
      :content="is_public === true"
      :path="publication_path"
      :can_edit="can_edit"
    />
  </QRModal>
</template>

<script>
export default {
  name: "SharePublication",
  props: {
    share_url: {
      type: [String],
      required: true,
    },
    publication_path: {
      type: String,
      required: true,
    },
    is_public: {
      type: Boolean,
      default: false,
    },
    can_edit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {};
  },
  computed: {
    needs_public_toggle() {
      return this.$root.app_infos?.instance_meta?.has_general_password === true;
    },
    publication_is_public() {
      if (!this.needs_public_toggle) return true;
      return this.is_public === true;
    },
    share_url_effective() {
      if (!this.publication_is_public) return false;
      return this.share_url;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>
