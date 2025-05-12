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
      <div v-if="is_connected && !is_self" class="_connected">
        <b-icon icon="people" />
        {{ $t("connected_currently") }}
      </div>

      <div class="_topbar">
        <div class="_cover">
          <CoverField
            :context="context"
            :cover="author.$cover"
            :title="$t('pick_portrait')"
            :preview_format="'circle'"
            :ratio="'square'"
            :available_options="['import', 'capture']"
            :path="author.$path"
            :placeholder="author.name.substring(0, 2)"
            :can_edit="can_edit"
          />
        </div>
        <b-icon
          v-if="author_has_location && context !== 'full'"
          class="_hasLocation"
          icon="pin-map-fill"
        />
        <div class="_text">
          <div class="">
            <TitleField
              :label="$t('name_or_pseudonym')"
              :show_label="false"
              :field_name="'name'"
              :content="author.name"
              :path="author.$path"
              :required="true"
              :minlength="3"
              :maxlength="40"
              :tag="context === 'full' ? 'h2' : 'h3'"
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

          <div v-if="author.group || can_edit">
            <TagsField
              :label="context === 'full' ? $t('group') : undefined"
              :field_name="'group'"
              :tag_type="'accountgroup'"
              :local_suggestions="group_suggestions"
              :content="author.group"
              :path="author.$path"
              :can_edit="can_edit"
            />
          </div>

          <div v-if="can_edit" class="">
            <TitleField
              :label="$t('email')"
              :show_label="context === 'full'"
              :field_name="'email'"
              :content="author.email"
              :path="author.$path"
              :required="$root.app_infos.instance_meta.require_mail_to_signup"
              :input_type="'email'"
              :autocomplete="'email'"
              :can_edit="can_edit"
            />
          </div>

          <div v-if="context === 'full' && (can_edit || !!author.presentation)">
            <TitleField
              :label="$t('presentation')"
              :field_name="'presentation'"
              :path="author.$path"
              :content="author.presentation"
              :input_type="'editor'"
              :custom_formats="['bold', 'italic', 'link']"
              :can_edit="can_edit"
            />
          </div>
        </div>

        <DetailsPane
          v-if="context === 'full' && (can_edit || !!author.$location)"
          :header="$t('location')"
          :is_open_initially="true"
          :has_items="author_has_location"
          :icon="'map'"
          class="u-spacingBottom"
        >
          <PositionPicker
            :field_name="'$location'"
            :content="author.$location"
            :path="author.$path"
            :can_edit="can_edit"
          />
        </DetailsPane>

        <DetailsPane :header="$t('options')" :icon="'gear'" v-if="can_edit">
          <div
            v-if="
              is_instance_admin &&
              context === 'full' &&
              !authorIsInstance({
                field: '$admins',
                folder_path: author.$path,
              })
            "
            class="u-spacingBottom"
          >
            <button
              type="button"
              class="u-buttonLink"
              @click="show_settings_modal = true"
            >
              {{ $t("add_to_instance_admin") }}
            </button>
            <AdminLumaSettings
              v-if="show_settings_modal"
              :starting_tab="'administration_and_access_control'"
              @close="show_settings_modal = false"
            />
          </div>

          <div class="u-spacingBottom">
            <TitleField
              :label="$t('password')"
              :field_name="'$password'"
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
              :button_text="$t('remove_account')"
              :modal_title="$t('remove_account_name', { name: author.name })"
              :modal_expl="$t('remove_account_expl')"
              @remove="removeAuthor"
            />
          </div>
        </DetailsPane>
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
  components: {
    AdminLumaSettings: () => import("@/components/AdminLumaSettings.vue"),
  },
  data() {
    return {
      show_settings_modal: false,
      group_suggestions: [],
    };
  },
  async created() {
    this.group_suggestions = await this.getAllAuthorsGroup();
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    is_self() {
      if (this.connected_as)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
    is_connected() {
      return this.$api.other_devices_connected.some(
        (u) => u.meta?.token_path === this.author.$path
      );
    },
    can_edit() {
      return (
        (this.is_self || this.is_instance_admin) && this.context === "full"
      );
    },
    author_url() {
      return this.createURLFromPath(this.author.$path);
    },
    author_has_location() {
      return (
        !!this.author.$location?.latitude && !!this.author.$location?.longitude
      );
    },
  },
  methods: {
    async removeAuthor() {
      await this.$api.deleteItem({
        path: this.author.$path,
      });
      this.$router.push("/@");
      if (this.is_self) {
        await this.$api.logoutFromFolder();
        window.location.reload();
      }
    },
    async getAllAuthorsGroup() {
      const authors = await this.$api.getFolders({
        path: "authors",
      });
      return authors
        .reduce((acc, m) => {
          m.group?.map((k) => {
            if (!acc.some((_k) => _k === k)) {
              if (k) acc.push(k);
            }
          });
          return acc;
        }, [])
        .sort((a, b) => {
          return a.localeCompare(b);
        });
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

  &:not([data-context="full"]) {
    background: white;
  }

  ._topbar {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);

    > * {
      flex: 1 1 auto;

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
      gap: calc(var(--spacing) / 1);

      ._cover {
        flex: 0 0 auto;
      }

      ._text {
        gap: calc(var(--spacing) / 1);
      }
    }
  }
}

._linkTo {
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
}

._cover {
  position: relative;
  overflow: hidden;
}

._text {
  // overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  // padding-bottom: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);

  ::v-deep {
    a {
      color: currentColor;
    }

    ._container {
      // line-height: 1;
    }
    ._content {
    }
  }
}

._connected {
  display: flex;
  gap: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background-color: var(--c-bleumarine_clair);
  color: var(--c-bleumarine_fonce);
  border-radius: 3px;

  font-weight: 500;
  justify-content: center;
}

._hasLocation {
  position: absolute;
  top: calc(var(--spacing) / 2);
  right: calc(var(--spacing) / 2);
  color: var(--c-bleumarine_fonce);
  width: 1em;
  height: 1em;
}
</style>
