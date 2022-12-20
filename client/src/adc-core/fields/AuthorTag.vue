<template>
  <div v-if="author" class="_author">
    <img v-if="author.image" :src="author.image" />
    <span>
      {{ author.name }}
    </span>
    <sl-icon-button
      v-if="edit_mode"
      name="x"
      label="Supprimer"
      @click="$emit('remove', path)"
    />
  </div>
</template>
<script>
export default {
  props: {
    path: String,
    edit_mode: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    author() {
      return this.getAuthor(this.path);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._author {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background: var(--c-bleumarine_clair);
  border-radius: 2em;
  // gap: calc(var(--spacing) / 4);

  img {
    border-radius: 50%;
    width: 1.6em;
    height: 1.6em;
  }
  span {
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  }
}
sl-icon-button::part(base) {
  padding-top: 0;
  padding-bottom: 0;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}
</style>
