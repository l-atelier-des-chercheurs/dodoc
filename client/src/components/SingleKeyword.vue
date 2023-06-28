<template>
  <div
    class="_singleKeyword"
    :class="{
      'is--clickable': can_add,
    }"
    :style="kw_styles"
  >
    <div class="">
      <div class="_category" v-if="category">
        {{ category.toUpperCase() }}
      </div>
      <div class="_name">
        {{ name }}
      </div>
    </div>
    <div v-if="count" class="_count">
      {{ count }}
    </div>
    <sl-icon-button
      v-if="can_remove"
      class="_white"
      name="dash-circle"
      @click="$emit('remove')"
    />
    <button
      type="button"
      v-if="can_add"
      class="_addBtn"
      @click="$emit('add')"
    />
  </div>
</template>
<script>
export default {
  props: {
    keyword: String,
    count: Number,
    cat_color: String,
    can_remove: Boolean,
    can_add: Boolean,
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
    category() {
      return this.keyword.includes("/") ? this.keyword.split("/").at(0) : false;
    },
    name() {
      return this.keyword.includes("/")
        ? this.keyword.split("/").at(1)
        : this.keyword;
    },
    kw_styles() {
      let category_color = false;

      if (this.cat_color) category_color = this.cat_color;
      else {
        const category = window.app_infos.custom_suggested_categories.find(
          (c) => c.title === this.category
        );
        category_color = category?.tag_color;
      }
      return category_color ? `--cat-color: ${category_color}` : "";
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._singleKeyword {
  position: relative;
  // background-color: rgba(255, 255, 255, 0.2);
  background-color: rgba(51, 51, 51, 1);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 4px;
  color: white;
  line-height: 1.2;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);

  sl-icon-button::part(base) {
    color: currentColor;
    padding: 0;
  }

  &.is--clickable:hover {
    background-color: rgba(41, 41, 41, 1);
  }
}

._category {
  font-size: 80%;
  color: var(--cat-color);
}
._name {
  font-size: 110%;
}

._addBtn {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: transparent;
}

._count {
  border: 1px solid white;
  border-radius: 10px;
  min-width: 14px;
  height: 14px;
  font-size: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}
</style>
