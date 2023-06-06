<template>
  <ChutierPane @close="$emit('close')">
    <div class="_fields">
      <input
        type="text"
        class="is--dark"
        autofocus
        required
        v-model="note_title"
        placeholder="Titre de la note"
      />

      <TextInput
        class="is--dark"
        :content.sync="note_content"
        :required="true"
        :input_type="'markdown'"
        :minlength="1"
        @toggleValidity="($event) => (allow_save = $event)"
      />
    </div>

    <div class="_publierBtn">
      <button
        type="button"
        :key="allow_save"
        class="u-buttonLink"
        :disabled="!allow_save"
        @click="createOrUpdateNote({ destination: 'chutier' })"
      >
        Enregistrer
      </button>
      <button
        type="button"
        :key="allow_save"
        class="u-buttonLink"
        :disabled="!allow_save"
        @click="createOrUpdateNote({ destination: 'shared_space' })"
      >
        Publier&nbsp;
        <sl-icon name="arrow-right-square" style="font-size: 1rem" circle />
      </button>
    </div>
  </ChutierPane>
</template>
<script>
import ChutierPane from "@/components/chutier/ChutierPane.vue";

export default {
  props: {
    author_path: String,
    shared_space_path: String,
  },
  components: {
    ChutierPane,
  },
  data() {
    return {
      note_content: "",
      note_title: "",
      keywords: [],
      allow_save: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createOrUpdateNote({ destination }) {
      let obj = {
        filename: "note.txt",
        content: this.note_content,
        additional_meta: {
          title: this.note_title,
          keywords: this.keywords,
        },
      };

      if (destination === "shared_space") {
        obj.path = this.shared_space_path;
      } else if (destination === "chutier") {
        obj.path = this.author_path;
      }

      await this.$api.uploadText(obj);

      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._editNote {
  background: var(--chutier-bg);
  padding: calc(var(--spacing) / 2);
}

._fields {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
  justify-content: center;
  padding: calc(var(--spacing) / 2);
}
</style>
