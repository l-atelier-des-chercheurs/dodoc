<template>
  <div class="m_tagsAndAuthorFilters flex-wrap bg-blanc rounded">
    <div v-if="has_fav_toggle" class="padding-small">
      <span class="switch switch-xs">
        <input
          type="checkbox"
          class="switch"
          id="favFilter"
          :checked="favFilter"
          @change="$emit('setFavFilter', $event.target.checked)"
          :readonly="read_only"
        />
        <label for="favFilter">
          {{ $t("fav") }}
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px"
            y="0px"
            width="78.5px"
            height="106.4px"
            viewBox="0 0 78.5 106.4"
            style="enable-background: new 0 0 78.5 106.4;"
            xml:space="preserve"
          >
            <polygon
              class="st0"
              points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"
            />
            <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 " />
          </svg>
        </label>
      </span>
    </div>
    <div v-if="allTypes.length > 0" class="padding-sides-small">
      <label>{{ $t("type") }}</label>
      <div class="m_typeField margin-bottom-none font-large">
        <label :for="`type-${type}`" class v-for="type in allTypes" :key="type">
          <input
            type="checkbox"
            :id="`type-${type}`"
            :value="type"
            v-model="enabled_types"
            @change="$emit('setTypeFilter', enabled_types)"
            :readonly="read_only"
          />
          <span>&nbsp;{{ $t(type) }}</span>
        </label>
      </div>
    </div>
    <div v-if="allKeywords.length > 0" class="padding-sides-small">
      <label>{{ $t("keywords") }}</label>
      <div class="m_keywordField margin-bottom-none font-large">
        <button
          v-for="keyword in allKeywords"
          :key="keyword.text"
          :class="[
            keyword.classes,
            { 'is--active': keywordFilter === keyword.text },
          ]"
          @click="$emit('setKeywordFilter', keyword.text)"
        >
          {{ keyword.text }}
        </button>
      </div>
    </div>
    <div v-if="allAuthors.length > 0" class="padding-sides-small">
      <label>{{ $t("authors") }}</label>
      <div class="m_authorField margin-bottom-none">
        <button
          v-for="{ slugFolderName: author_slug } in allAuthors"
          v-if="$root.getAuthor(author_slug)"
          :key="author_slug"
          :class="{ 'is--active': authorFilter === author_slug }"
          @click="$emit('setAuthorFilter', author_slug)"
        >
          {{ $root.getAuthor(author_slug).name }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    keywordFilter: String,
    authorFilter: String,
    favFilter: {
      type: Boolean,
      default: false,
    },
    allKeywords: Array,
    allAuthors: Array,
    allTypes: {
      type: Array,
      default: () => [],
    },
  },
  components: {},
  data() {
    return {
      enabled_types: [],
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {},
  computed: {
    has_fav_toggle() {
      return this.$listeners && this.$listeners.setFavFilter;
    },
  },
  methods: {},
};
</script>
<style></style>
