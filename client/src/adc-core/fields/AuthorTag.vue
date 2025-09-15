<template>
  <component
    v-if="author"
    :is="component_tag"
    :type="component_tag === 'button' ? 'button' : ''"
    :to="author_url"
    :title="author.name"
    :class="{
      'u-card2': !show_image_only && !!mode,
    }"
    class="_author"
    :data-size="size"
    :data-isself="is_self"
    :data-imageonly="show_image_only"
    :data-connected="is_connected"
    @click="$emit('click')"
  >
    <div class="_cover">
      <CoverField
        :context="'preview'"
        :cover="author.$cover"
        :title="$t('pick_portrait')"
        :path="author.$path"
        :placeholder="author.name.substring(0, 2)"
        :preview_format="'circle'"
        :can_edit="false"
      />
    </div>
    <div v-if="!show_image_only" class="_infos">
      <span class="_name">
        {{ author.name }}
        <b-icon
          v-if="
            authorIsInstance({
              field: '$admins',
              folder_path: author.$path,
            })
          "
          icon="shield-check"
          :title="$t('admin')"
        />
        <div class="_connected" v-if="is_connected && !is_self">
          <b-icon
            icon="people-fill"
            class=""
            :title="$t('connected_currently')"
          />
        </div>
      </span>
    </div>

    <transition name="pagechange" mode="out-in">
      <b-icon
        v-if="mode === 'select'"
        icon="box-arrow-in-right"
        :aria-label="$t('select')"
        :key="'select'"
      />
      <b-icon
        v-else-if="mode === 'add'"
        icon="plus-circle"
        :aria-label="$t('add')"
        :key="'add'"
      />
      <b-icon
        v-else-if="mode === 'remove'"
        icon="x-circle"
        :aria-label="$t('remove')"
        :key="'remove'"
      />
      <b-icon
        v-else-if="mode === 'disable'"
        icon="x-circle-fill"
        :aria-label="$t('disable')"
        :key="'disable'"
      />
    </transition>
  </component>
  <span v-else class="" />
</template>
<script>
export default {
  props: {
    path: String,
    mode: String,
    size: String,
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
    is_self() {
      if (this.connected_as)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
    component_tag() {
      if (this.mode === "link") return "router-link";
      else if (this.$listeners.click) return "button";
      return "div";
    },
    author_url() {
      if (this.mode === "link") return this.createURLFromPath(this.path);
      return false;
    },
    is_connected() {
      return this.$api.other_devices_connected.some(
        (u) => u.meta?.token_path === this.author.$path
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._author {
  display: inline-flex;
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

  &:where(button, a) {
    border: 1px solid var(--c-gris);
  }
  &:where(button) {
    &:hover,
    &:focus-visible {
      font-weight: 600;
      // background-color: var(--c-gris_clair);
    }
  }

  &:where(a) {
    color: var(--c-bleumarine);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;

    &:hover,
    &:focus-visible {
      text-decoration: none;
    }
  }

  // &:where(button) {
  //   box-shadow: 0 2px 6px rgb(0 0 0 / 10%);

  //   &:hover {
  //     box-shadow: var(--panel-shadows);
  //     color: var(--c-bleumarine);
  //   }
  // }

  &:not([data-imageonly]) {
    background-color: white;
  }

  &[data-isself]:not([data-imageonly]) {
    border-color: var(--c-bleumarine);
    background-color: var(--c-bleumarine_clair);
  }

  &[data-connected]:not([data-isself]):not([data-imageonly]) {
    // border-color: var(--c-bleumarine);
    // background-color: var(--c-bleumarine_clair);
  }

  &[data-imageonly] {
    padding: 0;
    box-shadow: none;
    border: none;

    &:where(a) {
      &:hover,
      &:focus-visible {
        opacity: 0.8;
      }
    }
  }

  ._cover {
    position: relative;
    overflow: hidden;
    // border-radius: 50%;
    width: 30px;
    height: 30px;
  }
  &[data-size="small"] ._cover {
    width: 15px;
    height: 15px;
  }

  &[data-imageonly] ._cover {
    border-radius: 50%;
  }
  &[data-imageonly][data-isself] ._cover {
    border: 2px solid var(--c-bleumarine);
  }

  ._infos {
    line-height: 1.2;
    flex: 1;
    // padding: calc(var(--spacing) / 4) 0
    //   calc(var(--spacing) / 4) calc(var(--spacing) / 2);

    ._name {
      font-size: var(--sl-font-size-small);
      font-weight: 500;

      display: flex;
      flex-flow: row nowrap;
      gap: calc(var(--spacing) / 4);
    }
    ._path {
      font-size: var(--sl-font-size-small);
      font-weight: 400;
      // color: var(--c-bleumarine);
    }
  }
}
._connected {
  border-color: var(--c-bleumarine);
  background-color: var(--c-bleumarine_clair);
  padding: 0 calc(var(--spacing) / 8);
  border-radius: 4px;
}

a {
  color: inherit;

  ._path {
    // color: var(--active-color);
    color: var(--label-color);
  }
}
</style>
