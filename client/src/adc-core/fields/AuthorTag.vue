<template>
  <component
    :is="links_to_author_page ? 'a' : 'span'"
    v-if="author"
    :href="links_to_author_page ? url_to_author : false"
    class="_author"
  >
    <img v-if="author.image" :src="author.image" />
    <img
      v-else
      src="https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    />
    <div v-if="!show_image_only" class="_infos">
      <div class="_name">{{ author.name }}</div>
      <div class="_path">
        {{ author.$path }}
      </div>
    </div>
    <sl-icon-button
      v-if="edit_mode"
      name="x"
      label="Supprimer"
      @click="$emit('remove', path)"
    />
  </component>
</template>
<script>
export default {
  props: {
    path: String,
    edit_mode: {
      type: Boolean,
      default: false,
    },
    links_to_author_page: {
      type: Boolean,
      default: false,
    },
    show_image_only: {
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
    url_to_author() {
      return this.createURLFromPath(this.path);
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
  // background: var(--c-bleumarine_clair);
  border-radius: 2em;
  text-decoration: none;
  color: var(--c-noir);

  gap: calc(var(--spacing) / 4);

  img {
    border-radius: 50%;
    width: 2em;
    height: 2em;
  }
  ._infos {
    line-height: 1;
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 1)
      calc(var(--spacing) / 4) calc(var(--spacing) / 2);

    ._name {
      font-size: var(--sl-font-size-normal);
      font-weight: 500;
    }
    ._path {
      font-size: var(--sl-font-size-small);
      font-weight: 400;
    }
  }
}
sl-icon-button::part(base) {
  padding-top: 0;
  padding-bottom: 0;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}
</style>
