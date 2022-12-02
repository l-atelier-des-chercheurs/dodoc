<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      <ul>
        <li>
          nom de l'instance (par exemple, Documentation du fablab A, do•doc de
          la classe de C) (apparaîtra dans l'onglet du navigateur et sur la page
          d’accueil)
        </li>
        <li>logo/favicon (format carré, 512*512)</li>
        <li>
          choisir un emplacement pour le stockage du dossier des contenus, ou
          utiliser l’emplacement par défaut dans Mes Documents (ou utiliser un
          emplacement masqué, dans le disque dur, pour éviter que des projets
          protégés ne soient modifiés par des gens qui savent ou trouver le
          dossier des contenus ?)
        </li>
        <li>accès et contribution</li>
        <ul>
          <li>limiter l'accès à cette plate-forme avec un mot de passe</li>
          <li>
            tout le monde peut s'inscrire pour créer des projets <br />OU<br />
            un mot de passe général est obligatoire pour créer un compte
          </li>
        </ul>
      </ul>

      {{ $api.store["_admin"] }}

      <TitleField
        :field_name="'name_of_instance'"
        :label="$t('name_of_instance')"
        :content="settings.name_of_instance"
        :path="'_admin'"
        :required="true"
        :maxlength="40"
        :can_edit="true"
      />

      <!-- <TextField
        :label="'Chemin de stockage des contenus'"
        :help_text="'Indiquez ici l’emplacement du dossier de stockage des contenus'"
        :content="new_path_to_content"
      /> -->
      <!-- <br /> -->
      <!-- <button type="button" class="u-button" @click="changeStorage">
        Changer l'emplacement du stockage
      </button>
      <br /> -->
      <button
        type="button"
        class="u-button"
        @click="saveNewPathToContent"
        v-if="new_path_to_content !== path_to_content"
      >
        Valider
      </button>
      <button type="button" class="u-button">Redémarrer</button>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      path_to_content: undefined,
      new_path_to_content: undefined,
      settings: {},
    };
  },
  created() {},
  async mounted() {
    // this.$api.editSettings()
    this.settings = await this.$api.getSettings();
    // this.path_to_content = this.new_path_to_content =
    //   settings.pathToUserContent;
    this.$api.join({ room: "_admin" });
  },
  beforeDestroy() {
    this.$api.leave({ room: "_admin" });
  },
  watch: {},
  computed: {},
  methods: {
    changeStorage() {
      window.electronAPI.send("toMain", {
        type: "get_path",
      });

      window.electronAPI.receive("fromMain", ({ type, path_to_content }) => {
        if (type === "new_path") {
          this.new_path_to_content = path_to_content;
        }
      });
    },
    saveNewPathToContent() {},
  },
};
</script>
<style lang="scss" scoped></style>
