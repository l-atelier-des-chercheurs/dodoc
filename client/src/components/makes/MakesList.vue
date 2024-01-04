<template>
  <section class="_makesList">
    <label class="u-label u-colorWhite">
      {{ $t("makes_list") }}
    </label>

    <div class="_makes">
      <div v-if="sorted_makes.length === 0" class="u-instructions">
        {{ $t("none_f") }}
      </div>
      <template v-else>
        <div
          class="_makes--item"
          v-for="make in sorted_makes"
          :key="make.$path"
        >
          <span>
            <b>
              {{ make.title }}
            </b>
            <br />
            <span>
              <i>
                {{ $t(make.type).toLowerCase() }}
              </i>
            </span>
          </span>
          <DateDisplay :title="$t('date_created')" :date="make.$date_created" />
          <button
            type="button"
            class="u-button"
            @click="$emit('open', make.$path.split('/').at(-1))"
          >
            {{ $t("open") }}
          </button>
        </div>
      </template>
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
      path: `${this.project_path}/makes`,
      makes: [],
    };
  },
  created() {},
  async mounted() {
    this.makes = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    sorted_makes() {
      return this.makes
        .slice()
        .sort(
          (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
        );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._makesList {
  max-width: var(--max-column-width);
  margin: 0 auto;
}

._makes {
}

._makes--item {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  background: white;
  margin-bottom: 2px;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  gap: calc(var(--spacing) * 1);
}
</style>
