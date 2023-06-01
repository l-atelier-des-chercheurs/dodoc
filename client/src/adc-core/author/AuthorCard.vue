<template>
  <div class="_authorCard">
    <div class="_topbar">
      <div class="_cover">
        <CoverField
          :context="context"
          :cover="author.$cover"
          :path="author.$path"
          :can_edit="can_edit"
        />
      </div>

      <div class="_text">
        <!-- :label="$t('name')" -->
        <TitleField
          :field_name="'name'"
          :content="author.name"
          :path="author.$path"
          :required="true"
          :minlength="3"
          :maxlength="40"
          :tag="'h2'"
          :can_edit="can_edit"
        />
        <div class="_path">@{{ getFilename(author.$path) }}</div>
        <div v-if="is_instance_admin">
          <span v-text="author.email" />
        </div>
        <div
          class="u-instructions"
          v-if="
            authorIsInstance({
              field: '$admins',
              folder_path: author.$path,
            })
          "
        >
          <small v-html="$t('admin')" />
        </div>

        <TitleField
          :field_name="'$password'"
          :label="can_edit ? $t('password') : ''"
          :content="''"
          :path="author.$path"
          :required="true"
          :minlength="3"
          :maxlength="20"
          :input_type="'password'"
          :can_edit="can_edit"
        />
      </div>
    </div>
    <div class="u-mediaOptions" v-if="can_edit">
      <RemoveMenu :remove_text="$t('remove')" @remove="removeAuthor" />
    </div>
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
    context() {
      return this.can_edit ? "full" : "preview";
    },
    is_self() {
      if (this.connected_as)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
    can_edit() {
      return this.is_self || this.is_instance_admin;
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
}

._topbar {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 1);

  > * {
    flex: 1 1 0;

    &._cover {
      flex: 0 0 100px;
      aspect-ratio: 1/1;
      border-radius: 50%;
    }
  }
}

._cover {
  position: relative;
  overflow: hidden;
}

._text {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
}
</style>
