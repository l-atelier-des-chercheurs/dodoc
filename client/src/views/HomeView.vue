<template>
  <div class="_homeView" :style="customStyling">
    <!-- <div class="_floatinProjectBtn">
      <router-link
        class="u-button u-button_red u-button_big u-button_floating"
        to="/projects"
      >
        {{ $t("show_projects") }}&nbsp;<sl-icon name="arrow-up-right" />
      </router-link>
    </div> -->
    <template v-if="is_instance_admin">
      <div class="_editSettingsBtn--cont">
        <button
          type="button"
          class="u-button u-button_bleuvert _editSettingsBtn"
          @click="show_settings_modal = !show_settings_modal"
        >
          <sl-icon name="gear-fill" />
          &nbsp;{{ $t("settings") }}
        </button>
      </div>
      <AdminSettings
        v-if="show_settings_modal"
        @close="show_settings_modal = false"
      />
    </template>

    <section class="_homeView--container">
      <div class="_homeView--content">
        <div v-if="hero_thumb" class="_imageBlock">
          <img :src="hero_thumb" />
        </div>
        <div class="_textBlock">
          <h1 class="_sessionTitle" v-text="name || $t('welcome_to_dodoc')" />
          <div class="u-spacingBottom">
            <template v-if="description">
              <MarkdownField :text="description" />
            </template>
            <template v-else>
              <template v-if="!is_instance_admin">
                <p v-html="$t('admins_edit_text_here')" />
              </template>
              <template v-else>
                <p v-html="$t('admins_edit_text_below')" />
              </template>
            </template>
          </div>
          <p v-if="$root.app_infos.instance_meta.contactmail">
            <b>{{ $t("contactmail_of_instance") }}</b
            >&nbsp;
            <a
              :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
              target="_blank"
              >{{ $root.app_infos.instance_meta.contactmail }}</a
            >
          </p>
        </div>
      </div>
    </section>

    <!-- <div class="_modeSel">
      <button type="button" class="u-button" v-if="">{{ $t("spaces") }}</button> /
      <button type="button" class="u-button">{{ $t("projects") }}</button>
    </div> -->

    <div class="_bottomCont">
      <RadioSwitch
        class="_switch"
        :content.sync="current_mode"
        :options="[
          {
            label: $t('spaces'),
            value: 'spaces',
          },
          {
            label: $t('all_projects'),
            value: 'projects',
          },
        ]"
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
              <small v-html="$t('all_projects_instr')" />
            </div>
            <AllProjects />
          </template>
        </div>
      </transition>
    </div>

    <footer class="_bottomFooter">
      <div class="_logoText">
        <DodocLogo class="_logo" />
        <div class="_version">
          {{ $t("version") }} {{ $root.app_infos.version }}
        </div>
      </div>
      {{ $t("a_foss_made_by") }} <br />
      {{ $t("more_informations") }} :
      <a href="https://dodoc.fr" target="_blank">dodoc.fr</a>
    </footer>
  </div>
</template>

<script>
// import SocketStatus from "@/components/.vue";
import AdminSettings from "@/adc-core/AdminSettings.vue";
import SpacesList from "@/components/space/SpacesList.vue";
import AllProjects from "@/components/project/AllProjects.vue";
import DodocLogo from "@/components/nav/DodocLogo.vue";

export default {
  props: {},
  components: {
    AdminSettings,
    SpacesList,
    AllProjects,
    DodocLogo,
  },
  data() {
    return {
      show_settings_modal: false,
      // current_mode: "spaces",
      current_mode: "spaces",
    };
  },
  created() {
    if (this.$route.query?.pfilters) this.current_mode = "projects";
  },
  mounted() {},
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
  },

  computed: {
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
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._homeView {
  position: relative;
  min-height: calc(100vh - 60px);
  max-height: -webkit-fill-available;

  display: flex;
  flex-direction: column;

  // display: flex;
  // flex-flow: column nowrap;
  // justify-content: center;
  // align-items: center;

  // padding-bottom: 150px;
}

._homeView--container {
  position: relative;
  width: 100%;

  background-color: var(--c-gris_clair);
  margin-bottom: calc(var(--spacing) * 3);
  background: var(--hero-bg, white);

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
  border: 2px solid var(--c-gris_clair);

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) * 1);
  gap: calc(var(--spacing) * 2);

  > * {
    flex: 1 1 320px;
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
    margin: calc(var(--spacing) / 1);

    background: var(--text-bg, white);
  }
  ._imageBlock {
    position: relative;
    flex: 4 1 620px;

    img {
      width: auto;
      max-height: 80vh;
      // transform: rotate(-5deg);

      // border-radius: var(--panel-radius);
      // box-shadow: var(--panel-shadows);
      // background: white;
    }
  }
}

._content {
  max-width: 86ch;
  margin: 0 auto;
  width: 100%;
  padding: 0 calc(var(--spacing) * 1);
  text-align: center;
}

._bottomFooter {
  display: block;
  margin: 0 auto;
  text-align: center;
  padding: calc(var(--spacing) * 4) 0;
  font-size: var(--sl-font-size-x-small);
  max-width: 65ch;
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
  flex: 1;
  // min-height: 80vh;
}
._switch {
  margin-bottom: calc(var(--spacing) * 1);
}

._editSettingsBtn--cont {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  text-align: center;
}
._editSettingsBtn {
  // position: absolute;
  // top: 0;
  margin: calc(var(--spacing) / 2);
}
</style>
