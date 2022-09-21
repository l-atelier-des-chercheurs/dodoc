<template>
  <sl-dialog ref="createModal" label="Règlages admin" class="" open>
    <div class="">
      <TextField
        :label="'Chemin de stockage des contenus'"
        :help_text="'Indiquez ici l’emplacement du dossier de stockage des contenus'"
        :content="new_path_to_content"
      />
      <br />

      <button type="button" @click="changeStorage">
        Changer l'emplacement du stockage
      </button>
      |
      <button
        type="button"
        @click="saveNewPathToContent"
        v-if="new_path_to_content !== path_to_content"
      >
        Valider
      </button>
      |
      <button type="button">Redémarrer</button>
    </div>
  </sl-dialog>
</template>
<script>
import TextField from "@/adc-core/fields/TextField.vue";

export default {
  props: {},
  components: { TextField },
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
