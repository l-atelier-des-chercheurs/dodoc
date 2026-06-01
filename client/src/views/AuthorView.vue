<template>
  <div class="_authorView">
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div class="_error" v-else-if="fetch_author_error">
      <div class="_errorMessage">
        <template v-if="fetch_author_error === 'not_found'">
          {{ $t("page_not_found") }}
        </template>
        <template v-else>
          {{ $t(fetch_author_error) }}
        </template>
      </div>
    </div>
    <template v-else-if="author">
      <div class="_authorFull">
        <div class="u-spacingBottom">
          <router-link to="/@" class="u-buttonLink">
            <b-icon icon="arrow-left-short" />
            {{ $t("list_of_accounts") }}
          </router-link>
        </div>
        <div class="_topbar">
          <div class="_cover">
            <CoverField
              :context="'full'"
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
                :tag="'h1'"
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
              <div class="_connected" v-if="is_connected && !is_self">
                <b-icon
                  :title="$t('connected_currently')"
                  class=""
                  icon="people-fill"
                />
                {{ $t("connected_currently") }}
              </div>
            </div>

            <div v-if="author.group || can_edit">
              <TagsField
                :label="$t('group')"
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
                :show_label="true"
                :field_name="'email'"
                :content="author.email"
                :path="author.$path"
                :required="$root.app_infos.instance_meta.require_mail_to_signup"
                :input_type="'email'"
                :autocomplete="'email'"
                :instructions="$t('email_instr')"
                :can_edit="can_edit"
              />
            </div>

            <div v-if="can_edit || !!author.presentation">
              <TitleField
                :label="$t('presentation')"
                :field_name="'presentation'"
                :path="author.$path"
                :content="author.presentation"
                :input_type="'editor'"
                :custom_formats="['bold', 'italic', 'link', 'emoji']"
                :can_edit="can_edit"
              />
            </div>
          </div>

          <DetailsPane
            v-if="can_edit || !!author.$location"
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
              <AdminSettings
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
      </div>
    </template>
  </div>
</template>
<script>
import DynamicTitle from "@/mixins/DynamicTitle.js";

export default {
  props: {},
  mixins: [DynamicTitle],
  components: {
    AdminSettings: () => import("@/adc-core/AdminSettings.vue"),
    PositionPicker: () => import("@/adc-core/inputs/PositionPicker.vue"),
  },
  data() {
    return {
      author: undefined,
      is_loading: true,
      fetch_author_error: false,
      show_settings_modal: false,
      group_suggestions: [],
    };
  },
  async created() {
    this.group_suggestions = await this.getAllAuthorsGroup();
  },
  async mounted() {
    this.$api.updateSelfPath(this.author_path);
    await this.listAuthor();
    this.$api.join({ room: this.author_path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.author_path });
  },
  watch: {},
  computed: {
    author_path() {
      return this.createPath({
        author_slug: this.$route.params.author_slug,
      });
    },
    is_self() {
      if (this.connected_as && this.author)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
    is_connected() {
      if (!this.author) return false;
      return this.$api.other_devices_connected.some(
        (u) => u.meta?.token_path === this.author.$path
      );
    },
    can_edit() {
      return this.is_self || this.is_instance_admin;
    },
    author_has_location() {
      return (
        !!this.author?.$location?.latitude &&
        !!this.author?.$location?.longitude
      );
    },
  },
  methods: {
    async listAuthor() {
      const author = await this.$api
        .getFolder({
          path: this.author_path,
        })
        .catch((err) => {
          this.is_loading = false;
          this.fetch_author_error = err.code;
          return;
        });

      this.is_loading = false;
      this.author = author;

      this.updateDocumentTitle(this.author.name);
      this.$eventHub.$emit("received.author", this.author);
    },
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
._authorView {
  padding-bottom: calc(var(--spacing) * 6);
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: calc(var(--spacing) * 2) auto calc(var(--spacing) * 4);
}

._authorFull {
  max-width: 400px;
  margin: 0 auto;

  ._topbar {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    gap: calc(var(--spacing) / 1);
    padding: 0;

    ._cover {
      position: relative;
      overflow: hidden;
      flex: 0 0 auto;
      width: 100%;
      aspect-ratio: 1/1;
    }

    ._text {
      display: flex;
      flex-flow: column nowrap;
      gap: calc(var(--spacing) / 1);

      ::v-deep {
        a {
          color: currentColor;
        }
      }
    }
  }
}

._connected {
  display: inline-flex;
  gap: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background-color: var(--c-bleumarine_clair);
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 2);
  color: var(--c-bleumarine_fonce);
  border-radius: 3px;

  font-weight: 500;
  justify-content: center;
}
</style>
