<template>
  <div class="_favSwitch">
    <button
      type="button"
      class="u-button u-button_icon u-button_transparent"
      :title="local_fav ? $t('remove_from_fav') : $t('add_to_fav')"
      :disabled="!can_edit"
      @click="toggleFav"
    >
      <b-icon :icon="local_fav ? 'star-fill' : 'star'" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    fav: Boolean,
    path: String,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      local_fav: this.fav === true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    fav() {
      this.local_fav = this.fav === true;
    },
  },
  computed: {},
  methods: {
    toggleFav() {
      this.local_fav = !this.local_fav;
      this.updateMeta({
        fav: this.local_fav,
      });
    },
    async updateMeta(new_meta) {
      await this.$api.updateMeta({
        path: this.path,
        new_meta,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._favSwitch {
  color: var(--c-rouge);
  pointer-events: none;

  .u-button_icon {
    padding: calc(var(--spacing) / 4);
    pointer-events: auto;
  }
}
</style>
