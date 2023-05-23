<template>
  <component
    :is="links_to_author_page ? 'router-link' : 'span'"
    v-if="author"
    :to="links_to_author_page ? url_to_author : false"
    class="_author"
  >
    <div class="_cover">
      <CoverField
        :context="'preview'"
        :cover="author.$cover"
        :path="author.$path"
        :can_edit="false"
      />
    </div>
    <div v-if="!show_image_only" class="_infos">
      <div class="_name">{{ author.name }}</div>
      <div class="_path">@{{ getFilename(author.$path) }}</div>
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
  border-radius: 4px;
  text-decoration: none;
  color: var(--c-noir);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);
  border: 1px solid var(--c-gris);

  ._cover {
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    width: 2em;
    height: 2em;
  }

  ._infos {
    line-height: 1.2;
    // padding: calc(var(--spacing) / 4) 0
    //   calc(var(--spacing) / 4) calc(var(--spacing) / 2);

    ._name {
      font-size: var(--sl-font-size-normal);
      font-weight: 500;
    }
    ._path {
      font-size: var(--sl-font-size-small);
      font-weight: 400;
      // color: var(--c-bleumarine);
    }
  }
}

a {
  ._path {
    // color: var(--active-color);
    color: var(--label-color);
  }
}

a:hover {
  box-shadow: var(--panel-shadows);
  color: var(--c-bleumarine);
}

sl-icon-button::part(base) {
  padding-top: 0;
  padding-bottom: 0;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
}
</style>
