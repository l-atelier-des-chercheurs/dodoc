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
            <span v-if="getMakeType(make.type)">
              <i v-if="make.type">
                {{ getMakeType(make.type) }}
              </i>
            </span>
          </span>
          <DateDisplay :title="$t('date_created')" :date="make.$date_created" />
          <button
            type="button"
            v-if="make.$path"
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
        .filter(
          (make) => make.$path && make.type && typeof make.type === "string"
        )
        .sort(
          (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
        );
    },
  },
  methods: {
    getMakeType(type) {
      if (typeof type === "string") {
        return this.$t(type).toLowerCase();
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped>
._makesList {
}

._makes {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) * 1);
  align-items: end;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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
