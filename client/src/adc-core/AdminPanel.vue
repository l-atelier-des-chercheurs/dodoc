<template>
  <BaseModal2 :title="$t('settings')" @close="$emit('close')">
    <div class="">
      // TODO REPLACE
      <!-- <TextField
        :label="'Chemin de stockage des contenus'"
        :help_text="'Indiquez ici l’emplacement du dossier de stockage des contenus'"
        :content="new_path_to_content"
      /> -->
      <br />

      <button type="button" class="u-button" @click="changeStorage">
        Changer l'emplacement du stockage
      </button>
      <br />
      <button
        type="button"
        class="u-button"
        @click="saveNewPathToContent"
        v-if="new_path_to_content !== path_to_content"
      >
        Valider
      </button>
      |
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
    };
  },
  created() {},
  async mounted() {
    const settings = await this.$api.getSettings();
    this.path_to_content = this.new_path_to_content =
      settings.pathToUserContent;
  },
  beforeDestroy() {},
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
