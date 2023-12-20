<template>
  <div
    class="_authorCard"
    :class="{
      'u-card2': context !== 'full',
    }"
    :data-context="context"
    :data-isself="is_self"
  >
    <component
      class="_linkTo"
      :is="context !== 'full' ? 'router-link' : 'span'"
      :to="author_url"
      @click.native="context !== 'full' ? $emit('navToPage') : ''"
    >
      <div class="_topbar">
        <div class="_cover">
          <CoverField
            :context="context"
            :cover="author.$cover"
            :title="$t('pick_portrait')"
            :preview_format="'circle'"
            :path="author.$path"
            :can_edit="can_edit"
          />
        </div>

        <div class="_text">
          <!-- :label="$t('name')" -->
          <div class="">
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
                <b-icon icon="shield-check" :aria-label="$t('admin')" />
                {{ $t("admin") }}
              </small>
            </div>
          </div>

          <!-- <div class="_path">@{{ getFilename(author.$path) }}</div> -->
          <div v-if="is_instance_admin || is_self">
            <TitleField
              :field_name="'email'"
              :label="context === 'full' ? $t('email') : undefined"
              :content="author.email"
              :path="author.$path"
              :required="$root.app_infos.instance_meta.require_mail_to_signup"
              :input_type="'email'"
              :autocomplete="'email'"
              :can_edit="can_edit"
            />
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

      <DetailsPane :header="$t('options')" :icon="'gear'" v-if="can_edit">
        <div class="u-spacingBottom">
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
        </div>
        <div class="">
          <RemoveMenu
            :remove_text="$t('remove_author')"
            :remove_expl="$t('remove_author_expl')"
            @remove="removeAuthor"
          />
        </div>
      </DetailsPane>
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
      this.$router.push("/@");
    },
  },
};
</script>
<style lang="scss" scoped>
._authorCard {
  border-radius: 3px;

  &[data-isself]:not([data-context="full"]) {
    border: 1px solid var(--c-bleumarine);
    background-color: var(--c-bleumarine_clair);
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

  &[data-context="full"] {
    ._topbar {
      flex-flow: column nowrap;
      align-items: stretch;

      ._cover {
        flex: 0 0 auto;
      }
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
  padding-bottom: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);

  ::v-deep a {
    color: currentColor;
    ._content {
      // text-decoration: underline;
    }
  }
}
</style>
