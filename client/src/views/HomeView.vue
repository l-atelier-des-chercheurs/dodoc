<template>
  <div class="_homeView">
    <div class="_floatinProjectBtn">
      <router-link
        class="u-button u-button_red u-button_big u-button_floating"
        to="/projects"
      >
        {{ $t("show_projects") }}&nbsp;<sl-icon name="arrow-up-right" />
      </router-link>
    </div>

    <div class="_homeView--content">
      <img :src="`${$root.publicPath}i_logo.svg`" class="_dodoclogo" />

      <AdminSettings
        v-if="show_settings_modal"
        @close="show_settings_modal = false"
      />

      <h1 v-html="name" />

      <p v-html="description" />

      <p>
        {{ $t("contactmail_of_instance") }}
        <a :href="'mailto:' + contact_email" target="_blank">
          {{ contact_email }}
        </a>
      </p>

      <small class="_versionNumber">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="show_settings_modal = !show_settings_modal"
        >
          <sl-icon name="gear-fill" />&nbsp;{{ $t("settings") }}
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

export default {
  props: {},
  components: {
    AdminSettings,
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
    contact_email() {
      return this.$root.app_infos.contactmail_of_instance;
    },
  },
};
</script>
<style lang="scss">
._dodoclogo {
  max-width: 300px;
}

._homeView {
  padding: var(--spacing);

  min-height: 100vh;
  max-height: -webkit-fill-available;

  display: flex;
  align-items: center;
}

._homeView--content {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
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
