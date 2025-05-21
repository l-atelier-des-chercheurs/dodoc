<template>
  <div class="_homeView" :style="customStyling">
    <HomeTopHero />

    <template v-if="load_whole_page === true">
      <RecentlyEdited v-if="connected_as" class="_recentlyEdited" />

      <!-- <AllContent /> -->
      <!-- <AllPublications /> -->

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
import HomeTopHero from "@/components/home/HomeTopHero.vue";
// import AllPublications from "@/components/home/AllPublications.vue";
// import AllContent from "@/components/home/AllContent.vue";

export default {
  props: {},
  components: {
    HomeTopHero,
    EventsSection: () => import("@/components/event/EventsSection.vue"),
    SpacesList,
    AllProjects,
    DodocLogo,
    RecentlyEdited: () => import("@/components/project/RecentlyEdited.vue"),
    // AllContent,
  },
  data() {
    return {
      load_whole_page: false,
      current_mode: "spaces",
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
  },
};
</script>
<style lang="scss" scoped>
._homeView {
  position: relative;
  min-height: calc(100vh - 60px);
  margin: 0 auto;
  max-height: -webkit-fill-available;
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

  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: calc(var(--spacing) * 2) auto;

  min-height: 80vh;
}
._switch {
  margin-bottom: calc(var(--spacing) * 1);
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
