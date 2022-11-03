<template>
  <div v-if="author" class="_author">
    <img :src="author.image" />
    <span>
      {{ author.name }}
    </span>
    <sl-icon-button
      v-if="edit_mode"
      name="x"
      label="Supprimer"
      @click="$emit('remove', slug)"
    />
  </div>
</template>
<script>
export default {
  props: {
    slug: String,
    edit_mode: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      author: false,
    };
  },
  created() {},
  mounted() {
    this.author = this.getAuthor(this.slug);
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
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
</style>
