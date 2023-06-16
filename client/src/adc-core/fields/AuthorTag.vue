<template>
  <component
    :is="component_tag"
    :type="component_tag === 'button' ? 'button' : ''"
    v-if="author"
    :to="component_to"
    class="_author"
    :data-imageonly="show_image_only"
    @click="$emit('click')"
  >
    <div class="_cover">
      <CoverField
        :context="'preview'"
        :cover="author.$cover"
        :path="author.$path"
        :placeholder="author.name.substring(0, 2)"
        :can_edit="false"
      />
    </div>
    <div v-if="!show_image_only" class="_infos">
      <div class="_name">{{ author.name }}</div>
      <div
        class="u-instructions"
        v-if="
          authorIsInstance({
            field: '$admins',
            folder_path: author.$path,
          })
        "
      >
        <small v-html="$t('admin')" />
      </div>

      <div class="_path">@{{ getFilename(author.$path) }}</div>
    </div>
    <sl-icon-button
      v-if="edit_mode && $listeners.add"
      name="plus-circle"
      :label="$t('add')"
      @click="$emit('add', path)"
    />
    <sl-icon-button
      v-if="edit_mode && $listeners.remove"
      name="x"
      :label="$t('remove')"
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
    component_tag() {
      if (this.links_to_author_page) return "router-link";
      if (
        this.$listeners.click ||
        this.$listeners.add ||
        this.$listeners.remove
      )
        return "button";
      return "span";
    },
    component_to() {
      if (this.component_tag === "router-link") return this.url_to_author;
      return false;
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
  background: transparent;
  text-align: left;

  border: 1px solid var(--c-gris);
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);

  &[data-imageonly] {
    padding: 0;
    box-shadow: none;
    border: none;
  }

  ._cover {
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    width: 30px;
    height: 30px;
  }
  &[data-imageonly] ._cover {
    outline: 3px solid white;
    margin-right: -0.25em;
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
