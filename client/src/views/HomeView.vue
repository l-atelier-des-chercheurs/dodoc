<template>
  <div class="_homeView">
    <div class="_floatinProjectBtn">
      <router-link class="u-button u-button_red u-button_big" to="/projects">
        {{ $t("show_projects") }}&nbsp;<sl-icon name="arrow-up-right" />
      </router-link>
    </div>

    <div class="_homeView--content">
      <img :src="`${$root.publicPath}i_logo.svg`" class="" />

      <button
        type="button"
        v-if="is_admin"
        class="u-button u-button_bleuvert"
        @click="show_settings_modal = !show_settings_modal"
      >
        <sl-icon name="gear-fill" />&nbsp;{{ $t("settings") }}
      </button>

      <AdminSettings v-if="show_settings_modal" />

      <p>La Plate-forme de documentation pour fablab à l'école.</p>
      <p v-html="desc" />
      <EditBtn />
    </div>
    <small class="_versionNumber">version {{ $root.app_infos.version }}</small>
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
      desc: `
<i>
  Le projet « FabLab à l’école » offre aux établissements scolaires
  bénéficiaires la possibilité́ de disposer d’un FabLab clé en main et prêt
  à l’emploi. <br /><br />

  « FabLab à l’école » repose en effet non seulement sur la fourniture
  d’un parc de machines adaptées (imprimante 3D, scie à chantourner,
  découpeuse vinyle, machine à coudre, fraiseuse graveuse…), mais aussi
  sur la mise à disposition de nombreuses ressources et de scénarios
  d’usages adossés aux programmes scolaires, et sur la réalisation de
  prestations de formation à destination des enseignants. UNE INITIATIVE
  D’UNIVERSCIENCE PORTÉE PAR RÉSEAU CANOPÉ, OPÉRATEUR DU MINISTÈRE DE
  L’ÉDUCATION NATIONALE, DE LA JEUNESSE ET DES SPORTS "
</i>
      `,

      show_settings_modal: true,
    };
  },
};
</script>
<style lang="scss">
._homeView {
  padding: var(--spacing);

  min-height: 100vh;
  max-height: -webkit-fill-available;

  display: flex;
  align-items: center;
}

._homeView--content {
  max-width: 600px;
  margin: 0 auto;
}

._panesLeft {
}

._versionNumber {
  display: block;
  position: absolute;
  bottom: 0;
  left: 0;
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
