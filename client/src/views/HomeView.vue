<template>
  <div class="_homeView" :style="customStyling">
    <section class="_homeView--container">
      <div class="_homeView--content" :data-layout="text_image_layout">
        <template v-for="layout in custom_layout">
          <div v-if="layout === 'text'" :key="layout" class="_textBlock">
            <h1 class="_sessionTitle" v-text="name || $t('welcome_to_dodoc')" />
            <div class="">
              <CollaborativeEditor2 v-if="description" :content="description" />
              <template v-else>
                <template v-if="!is_instance_admin">
                  <p v-html="$t('admins_edit_text_here')" />
                </template>
                <template v-else>
                  <p v-html="$t('admins_edit_text_below')" />
                </template>
              </template>
            </div>
            <template v-if="$root.app_infos.instance_meta.contactmail">
              <div class="u-spacingBottom" />
              <p>
                <b>{{ $t("contactmail_of_instance") }}</b
                >&nbsp;
                <a
                  :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
                  target="_blank"
                  >{{ $root.app_infos.instance_meta.contactmail }}</a
                >
              </p>
            </template>
            <EditBtn
              v-if="is_instance_admin"
              class="_editAdminText"
              @click="editPresentationText"
            />
          </div>
          <div
            v-if="layout === 'image' && hero_thumb"
            :key="layout"
            class="_imageBlock"
          >
            <img :src="hero_thumb" role="presentation" />
          </div>
        </template>
        <EditBtn
          v-if="is_instance_admin"
          class="_editAdminImg"
          :label_position="'left'"
          @click="editHeroImage"
        />
      </div>
    </section>

    <AdminSettings
      v-if="show_settings_modal"
      :starting_tab="settings_modal_starting_tab"
      @close="closeAdminSettings"
    />

    <template v-if="load_whole_page === true">
      <RecentlyEdited v-if="connected_as" class="_recentlyEdited" />

      <section v-if="$root.app_infos.instance_meta.enable_events">
        <EventsSection />
      </section>

      <transition name="pagechange" mode="out-in">
        <div class="_bottomCont" :key="opened_event">
          <RadioSwitch
            v-if="!opened_event"
            class="_switch"
            :content.sync="current_mode"
            :options="available_radioswitch_modes"
          />

          <transition name="pagechange" mode="out-in">
            <div :key="current_mode">
              <template v-if="current_mode === 'spaces'">
                <div class="u-instructions _content">
                  <small v-html="$t('spaces_instr')" />
                </div>

                <SpacesList />
              </template>
              <template v-else-if="current_mode === 'projects'">
                <div class="u-instructions _content">
                  <template v-if="opened_event">
                    <h2>{{ $t("list_of_projects") }}</h2>
                  </template>
                  <small v-else v-html="$t('all_projects_instr')" />
                </div>
                <AllProjects />
              </template>
              <template v-else-if="current_mode === 'my_projects'">
                <div class="u-instructions _content">
                  <small v-html="$t('my_projects_instr')" />
                </div>
                <AllProjects :show_only_my_projects="true" />
              </template>
            </div>
          </transition>
        </div>
      </transition>

      <footer class="_bottomFooter">
        <div class="_bottomFooter--cont">
          <div
            v-if="
              $root.app_infos.instance_meta.terms_in_footer ||
              $root.app_infos.instance_meta.confidentiality_in_footer
            "
            class="u-spacingBottom _links"
          >
            <router-link
              v-if="$root.app_infos.instance_meta.terms_in_footer"
              :to="createURLFromPath('pages/terms')"
              class="u-buttonLink"
            >
              {{ $t("terms") }}
            </router-link>
            <router-link
              v-if="$root.app_infos.instance_meta.confidentiality_in_footer"
              :to="createURLFromPath('pages/confidentiality')"
              class="u-buttonLink"
            >
              {{ $t("confidentiality") }}
            </router-link>
          </div>

          <div class="_logoText">
            <DodocLogo class="_logo" />
            <div class="_version">
              {{ $t("version") }} {{ $root.app_infos.version }}
            </div>
          </div>

          <p v-html="$t('a_foss_made_by')" />

          <button
            type="button"
            class="u-buttonLink u-button_small"
            @click="showCredits"
          >
            <span v-html="$t('more_informations')" />
          </button>
          <!-- &nbsp;
            <a
              href="https://dodoc.fr"
              :title="$t('open_website_new_tab')"
              target="_blank"
              >dodoc.fr</a
            > -->
        </div>
      </footer>
    </template>
  </div>
</template>

<script>
// import SocketStatus from "@/components/.vue";
import SpacesList from "@/components/space/SpacesList.vue";
import AllProjects from "@/components/project/AllProjects.vue";
import DodocLogo from "@/components/nav/DodocLogo.vue";

export default {
  props: {},
  components: {
    EventsSection: () => import("@/components/event/EventsSection.vue"),
    SpacesList,
    AllProjects,
    DodocLogo,
    AdminSettings: () => import("@/adc-core/AdminSettings.vue"),
    RecentlyEdited: () => import("@/components/project/RecentlyEdited.vue"),
  },
  data() {
    return {
      load_whole_page: false,
      current_mode: "spaces",

      settings_modal_starting_tab: undefined,
      show_settings_modal: false,
    };
  },
  created() {
    if (this.$route.query?.pfilters || this.opened_event)
      this.current_mode = "projects";
    this.$api.updateSelfPath("/");
  },
  mounted() {
    setTimeout(() => {
      this.load_whole_page = true;
    }, 100);
  },
  beforeDestroy() {},

  watch: {
    current_mode() {
      if (this.current_mode === "spaces") {
        if (this.$route.query?.pfilters) {
          let query = JSON.parse(JSON.stringify(this.$route.query));
          delete query.pfilters;
          this.$router.push({ query });
        }
      }
    },
    opened_event: {
      handler() {
        if (this.opened_event) this.current_mode = "projects";
      },
    },
  },

  computed: {
    opened_event() {
      return this.$route.hash.substring(1) || false;
    },
    available_radioswitch_modes() {
      let modes = [
        {
          label: this.$t("spaces"),
          value: "spaces",
        },
        {
          label: this.$t("all_projects"),
          value: "projects",
        },
      ];
      if (this.connected_as)
        modes.push({
          label: this.$t("my_projects"),
          value: "my_projects",
        });
      return modes;
    },
    name() {
      return this.$root.app_infos.instance_meta.name;
    },
    description() {
      return this.$root.app_infos.instance_meta.presentation;
      // return this.$root.app_infos.instance_meta.presentation.replace(
      //   /(?:\r\n|\r|\n)/g,
      //   "<br />"
      // );
    },
    hero_thumb() {
      return this.$root.app_infos.instance_meta.hero_thumb || false;
    },
    customStyling() {
      let obj = {};
      if (this.$root.app_infos.instance_meta.hero_background_color)
        obj["--hero-bg"] =
          this.$root.app_infos.instance_meta.hero_background_color;
      if (this.$root.app_infos.instance_meta.text_background_color)
        obj["--text-bg"] =
          this.$root.app_infos.instance_meta.text_background_color;
      return obj;
    },
    text_image_layout() {
      return (
        this.$root.app_infos.instance_meta.text_image_layout || "image_text"
      );
    },
    custom_layout() {
      if (this.text_image_layout === "text_image") return ["text", "image"];
      else if (this.text_image_layout === "image_text")
        return ["image", "text"];
      return ["text", "image"];
    },
  },
  methods: {
    showCredits() {
      this.$eventHub.$emit(`toolbar.openCredits`);
    },
    editHeroImage() {
      this.settings_modal_starting_tab = "logo_and_images";
      this.show_settings_modal = true;
    },
    editPresentationText() {
      this.settings_modal_starting_tab = "informations";
      this.show_settings_modal = true;
    },
    closeAdminSettings() {
      this.show_settings_modal = false;
      this.settings_modal_starting_tab = undefined;
    },
  },
};
</script>
<style lang="scss" scoped>
._homeView {
  position: relative;
  min-height: calc(100vh - 60px);
  max-height: -webkit-fill-available;
}

._homeView--container {
  // position: sticky;
  // top: 60px;
  width: 100%;
  background: var(--hero-bg, var(--c-gris_clair));

  ._homeCover {
    background: white;

    ::v-deep img {
      object-fit: scale-down !important;
    }
  }
}

._homeView--content {
  position: relative;
  width: 100%;
  margin: 0 auto;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--c-gris);

  > * {
    flex: 1 1 320px;
  }

  &[data-layout="image_text_overlay"] {
    min-height: 50vh;
    justify-content: flex-start;
  }

  ._textBlock {
    position: relative;
    z-index: 1;
    flex: 1 1 250px;
    max-width: 350px;
    margin: 0 auto;

    border-radius: var(--panel-radius);
    box-shadow: var(--panel-shadows);
    padding: calc(var(--spacing) / 1);
    margin: 5%;

    background: var(--text-bg, white);
  }
  &[data-layout="image_text_overlay"] ._textBlock {
  }
  ._imageBlock {
    position: relative;
    flex: 4 1 620px;
    width: 100%;

    img {
      width: auto;
      max-height: 90vh;
    }
  }
  &[data-layout="image_text_overlay"] ._imageBlock {
    position: absolute;
    height: 100%;
    img {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-height: none;
    }
  }
}

._content {
  max-width: 86ch;
  width: 100%;
  margin: calc(var(--spacing) * 1) auto;
  padding: 0 calc(var(--spacing) * 1);
  text-align: center;
}

._bottomFooter {
  display: block;
  text-align: center;
  padding: calc(var(--spacing) * 2) 0 calc(var(--spacing) * 3);
  font-size: var(--sl-font-size-x-small);
  // background: white;
}
._bottomFooter--cont {
  max-width: 68ch;
  margin: 0 auto;
  padding: 0 calc(var(--spacing) * 1);

  ._links {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    gap: calc(var(--spacing) * 1);
  }
}

._floatinProjectBtn {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10vh 20vw;
  pointer-events: none;

  display: flex;
  justify-content: center;

  > * {
    pointer-events: auto;
  }
}

._settingBtn {
}

._logoText {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  max-width: 240px;
  margin: 0 auto;
  padding: 0 calc(var(--spacing) * 1);
  > * {
    flex: 0 0 50%;

    &._logo {
    }
    &._version {
      text-align: left;
      font-weight: 500;
      padding-bottom: 3px;
    }
  }
}

._sessionTitle {
  display: block;
  font-weight: 500;
  // text-align: center;
  letter-spacing: -0.015em;
  margin-bottom: calc(var(--spacing) * 1);
}

._bottomCont {
  position: relative;
  // background: white;
  z-index: 1;
  flex: 1;

  max-width: var(--max-column-width);
  margin: calc(var(--spacing) * 2) auto;

  min-height: 80vh;
}
._switch {
  margin-bottom: calc(var(--spacing) * 1);
}

._recentlyEdited {
  max-width: var(--max-column-width);
  margin: calc(var(--spacing) * 2) auto;
}

._editAdminText {
  position: absolute;
  top: calc(var(--spacing) / 2);
  right: calc(var(--spacing) / 2);
}
._editAdminImg {
  position: absolute;
  bottom: calc(var(--spacing) / 2);
  right: calc(var(--spacing) / 2);
}
</style>
