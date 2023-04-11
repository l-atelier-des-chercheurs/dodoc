<template>
  <div class="_homeView">
    <!-- <div class="_floatinProjectBtn">
      <router-link
        class="u-button u-button_red u-button_big u-button_floating"
        to="/projects"
      >
        {{ $t("show_projects") }}&nbsp;<sl-icon name="arrow-up-right" />
      </router-link>
    </div> -->

    <div class="_homeView--content">
      <AdminSettings
        v-if="show_settings_modal"
        @close="show_settings_modal = false"
      />

      <!-- <img :src="`${$root.publicPath}logo-je-fabrique.svg`" class="_logo" /> -->

      <h1 v-html="name || $t('welcome_to_dodoc')" />
      <p v-html="description || $t('admins_edit_text_here')" />

      <p v-if="$root.app_infos.contactmail_of_instance">
        {{ $t("contactmail_of_instance") }}
        <a
          :href="'mailto:' + $root.app_infos.contactmail_of_instance"
          target="_blank"
        >
          {{ $root.app_infos.contactmail_of_instance }}
        </a>
      </p>

      <!-- <img
        :src="`${$root.publicPath}bandeau-logos-jefabrique.png`"
        class="_bandeau"
      /> -->
    </div>

    <!-- <div class="_modeSel">
      <button type="button" class="u-button" v-if="">{{ $t("spaces") }}</button> /
      <button type="button" class="u-button">{{ $t("projects") }}</button>
    </div> -->

    <div class="_bottomCont">
      <RadioSwitch
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

      <br />

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

    <div class="">
      <small class="_versionNumber">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          v-if="is_admin"
          @click="show_settings_modal = !show_settings_modal"
        >
          <sl-icon name="gear-fill" />
          &nbsp;{{ $t("settings") }}
        </button>
        <template v-if="is_admin"> – </template>
        version {{ $root.app_infos.version }}
      </small>
    </div>
  </div>
</template>

<script>
// import SocketStatus from "@/components/.vue";
import AdminSettings from "@/adc-core/AdminSettings.vue";
import SpacesList from "@/components/space/SpacesList.vue";
import AllProjects from "@/components/project/AllProjects.vue";

export default {
  props: {},
  components: {
    AdminSettings,
    SpacesList,
    AllProjects,
  },
  data() {
    return {
      show_settings_modal: false,
      // current_mode: "spaces",
      current_mode: "spaces",
    };
  },
  computed: {
    name() {
      return this.$root.app_infos.name_of_instance;
    },
    description() {
      return this.$root.app_infos.presentation_of_instance.replace(
        /(?:\r\n|\r|\n)/g,
        "<br />"
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._logo,
._bandeau {
  width: 100%;
  max-width: 500px;
  margin-bottom: calc(var(--spacing) * 2);
}

._homeView {
  min-height: calc(100vh - 60px);
  max-height: -webkit-fill-available;

  // display: flex;
  // flex-flow: column nowrap;
  // justify-content: center;
  // align-items: center;

  // padding-bottom: 150px;
}

._homeView--content {
  max-width: 600px;
  width: 100%;
  min-height: 40vh;
  min-height: calc(60vh - 60px);
  margin: 0 auto;
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}

._content {
  max-width: 86ch;
  margin: 0 auto;
  width: 100%;
  padding: 0 calc(var(--spacing) * 1);
  text-align: center;
}

._panesLeft {
}

._versionNumber {
  display: block;
  // position: absolute;
  // bottom: 0;
  // left: 0;
  margin: 0 auto;
  text-align: center;
  padding: calc(var(--spacing) * 4) 0;
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

._bottomCont {
  min-height: 70vh;
}
</style>
