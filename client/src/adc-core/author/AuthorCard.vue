<template>
  <div
    class="_authorCard"
    :class="{
      'u-card2': context !== 'full',
    }"
  >
    <component
      class="_linkTo"
      :is="context !== 'full' ? 'router-link' : 'span'"
      :to="author_url"
      @click.native="context !== 'full' ? $emit('navToPage') : ''"
    >
      <div class="_topbar">
        <div class="u-spacingBottom _cover">
          <CoverField
            :context="context"
            :cover="author.$cover"
            :is_round="true"
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

          <!-- <div class="_path">@{{ getFilename(author.$path) }}</div> -->
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
            <small>
              <b-icon icon="gear" :aria-label="$t('admin')" />
              {{ $t("admin") }}
            </small>
          </div>

          <TitleField
            v-if="context === 'full'"
            :field_name="'presentation'"
            class="_presentation"
            :label="can_edit && !author.presentation ? $t('presentation') : ''"
            :content="author.presentation"
            :path="author.$path"
            :maxlength="1280"
            :input_type="'markdown'"
            :can_edit="can_edit"
          />
        </div>
      </div>
      <div class="u-mediaOptions" v-if="can_edit">
        <TitleField
          :field_name="'$password'"
          :label="$t('password')"
          :content="''"
          :path="author.$path"
          :required="true"
          :minlength="3"
          :maxlength="20"
          :input_type="'password'"
          :can_edit="can_edit"
        />
        <RemoveMenu :remove_text="$t('remove')" @remove="removeAuthor" />
      </div>
    </component>
  </div>
</template>
<script>
export default {
  props: {
    author: Object,
    context: String,
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
    can_edit() {
      return (
        (this.is_self || this.is_instance_admin) && this.context === "full"
      );
    },
    author_url() {
      return this.createURLFromPath(this.author.$path);
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
  &.is--linkTo {
  }
}

._topbar {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);

  > * {
    flex: 1 1 0;

    &._cover {
      flex: 0 0 100px;
      aspect-ratio: 1/1;
    }
  }
}

._linkTo {
  text-decoration: none;
  color: inherit;
}

._cover {
  position: relative;
  overflow: hidden;
}

._text {
  display: flex;
  flex-flow: column nowrap;
  // gap: calc(var(--spacing) / 4);

  ::v-deep a {
    color: currentColor;
    ._content {
      // text-decoration: underline;
    }
  }
}
</style>
