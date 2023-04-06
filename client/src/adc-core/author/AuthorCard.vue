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

    <div v-if="!is_self">
      {{ author.role }}
    </div>
    <SelectField
      v-else
      :field_name="'role'"
      :content="author.role"
      :path="author.$path"
      :can_edit="true"
      :options="[
        {
          key: 'contributor',
          text: $t('contributor'),
        },
        {
          key: 'admin',
          text: $t('admin'),
        },
      ]"
    />

    <!-- {{ author.role }} -->
    <!-- <br /> -->
    <!-- {{ author.email }} -->
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
