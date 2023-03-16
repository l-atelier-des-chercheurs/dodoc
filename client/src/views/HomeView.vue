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
      <!-- <img :src="`${$root.publicPath}i_logo.svg`" class="_dodoclogo" /> -->

      <AdminSettings
        v-if="show_settings_modal"
        @close="show_settings_modal = false"
      />

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
    </div>

    <SpacesList />

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

export default {
  props: {},
  components: {
    AdminSettings,
    SpacesList,
  },
  data() {
    return {
      show_settings_modal: false,
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
<style lang="scss">
._dodoclogo {
  max-width: 300px;
}

._homeView {
  padding: var(--spacing);

  min-height: calc(100vh - 60px);
  max-height: -webkit-fill-available;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  padding-bottom: 150px;
}

._homeView--content {
  max-width: 600px;
  width: 100%;
  min-height: 60vh;
  margin: 0 auto;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
}

._panesLeft {
}

._versionNumber {
  display: block;
  // position: absolute;
  // bottom: 0;
  // left: 0;
  margin-top: calc(var(--spacing) * 4);
  text-align: center;
  padding: calc(var(--spacing) / 4);
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
</style>
