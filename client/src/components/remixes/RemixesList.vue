<template>
  <section class="_remixesList">
    <label class="u-label u-colorWhite">
      {{ $t("remixes_list") }}
    </label>

    <div class="_remixes">
      <div class="_remixes--item" v-for="remix in remixes" :key="remix.$path">
        <DateField :date="remix.$date_created" />
        <span>
          {{ $t(remix.type) }}
        </span>
        <button
          type="button"
          class="u-button"
          @click="$emit('open', remix.$path.split('/').at(-1))"
        >
          {{ $t("open") }}
        </button>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  props: {
    project_path: String,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      path: `${this.project_path}/remixes`,
      remixes: [],
    };
  },
  created() {},
  async mounted() {
    this.remixes = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._remixesList {
  max-width: 800px;
  max-width: var(--max-column-width);
  margin: 0 auto;
}

._remixes {
}

._remixes--item {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin-bottom: 2px;
  padding: calc(var(--spacing) * 1);
  gap: calc(var(--spacing) * 1);
}
</style>
