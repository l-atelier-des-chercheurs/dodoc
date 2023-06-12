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
    </div>

    <CollaborativeEditor2
      :path="note.$path"
      :content="note.$content"
      :line_selected="false"
      :can_edit="true"
    />

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
    note: Object,
  },
  components: {
    ChutierPane,
  },
  data() {
    return {
      note_title: this.note.title,
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
      // todo save or copy
      destination;

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
