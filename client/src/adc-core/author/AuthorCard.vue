<template>
  <div class="_authorCard">
    <TitleField
      :field_name="'name'"
      :label="$t('name')"
      :content="author.name"
      :path="author.$path"
      :required="true"
      :minlength="3"
      :maxlength="40"
      :tag="'h2'"
      :can_edit="is_self"
    />
    <div class="u-instructions" v-if="is_instance_admin">
      <small v-html="$t('admin')" />
    </div>

    <br />

    <RemoveMenu
      v-if="is_self || is_admin"
      :remove_text="$t('remove')"
      @remove="removeAuthor"
    />
  </div>
</template>
<script>
export default {
  props: {
    author: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    is_self() {
      if (this.connected_as)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
    is_instance_admin() {
      return this.authorIsAdmin({ folder_path: this.author.$path });
    },
  },
  methods: {
    async removeAuthor() {
      await this.$api.deleteItem({
        path: this.author.$path,
      });
      if (this.is_self) await this.$api.logoutFromFolder();
    },
  },
};
</script>
<style lang="scss" scoped>
._authorCard {
  // background: var(--c-bleumarine_clair);
  // border-left: 2px solid var(--c-bleumarine);
  padding: calc(var(--spacing) / 2);
}
</style>
