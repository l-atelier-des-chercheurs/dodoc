<template>
  <div class="_statusTag" :data-status="[new_status]">
    <div v-if="!can_edit" class="_tag">
      {{ $t(status) }}
    </div>
    <select v-else size="small" v-model="new_status">
      <option
        v-for="opt in status_options"
        :key="opt"
        :value="opt"
        v-text="$t(opt)"
      />
    </select>
    <!-- <sl-badge variant="neutral" v-if="project.$status === 'invisible'">
      {{ $t("invisible") }}
    </sl-badge> -->
    <!-- <sl-badge variant="success" v-if="project.$status === 'finished'">
        {{ $t("finished") }}
      </sl-badge>
      <sl-badge
        variant="warning"
        v-if="project.$status !== 'finished' && project.$status !== 'invisible'"
      >
        {{ $t("draft") }}
      </sl-badge> -->
  </div>
</template>
<script>
export default {
  props: {
    status: {
      type: String,
      default: "draft",
    },
    path: String,
    can_edit: Boolean,
    status_options: {
      type: Array,
      default: () => ["draft", "finished", "private"],
    },
  },
  components: {},
  data() {
    return {
      new_status: this.status,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    status() {
      this.new_status = this.status;
    },
    new_status() {
      this.updateMeta({ $status: this.new_status });
    },
  },
  computed: {},
  methods: {
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
._statusTag {
  font-variant: small-caps;
  text-transform: uppercase;
  font-weight: 500;

  --bg-color: var(--c-gris);
  --c-color: black;

  &[data-status="private"] {
    --c-color: white;
    --bg-color: var(--c-noir);
  }
  &[data-status="finished"] {
    --bg-color: var(--c-bleuvert);
  }

  ._tag,
  select {
    background-color: var(--bg-color);
    color: var(--c-color);
  }
  ._tag {
    display: inline-block;
    height: var(--input-height-small);
    padding: calc(var(--spacing) / 4);
    border-radius: var(--input-border-radius);
    font-size: var(--sl-font-size-small);
  }
  select {
    max-width: 13ch;
    background-image: url("data:image/svg+xml,%3C%3Fxml version=%271.0%27 encoding=%27UTF-8%27%3F%3E%3Csvg width=%2741px%27 height=%2726px%27 viewBox=%270 0 41 26%27 version=%271.1%27 xmlns=%27http://www.w3.org/2000/svg%27 xmlns:xlink=%27http://www.w3.org/1999/xlink%27%3E%3Cdefs%3E%3C/defs%3E%3Cg id=%27Page-1%27 stroke=%27none%27 stroke-width=%271%27 fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cpolygon id=%27Path-3%27 fill=%27%23ffffff%27 points=%270 5.38215461 19.9830489 25.3652035 40.1398855 5.20836689 34.9315186 0 19.8691842 15.0623344 4.83971338 0.0328636246%27%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E%0A");
  }
}
</style>
