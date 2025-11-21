<template>
  <component
    :is="tag_type"
    :type="tag_type === 'button' ? 'button' : ''"
    class="_statusTag"
    :data-status="[new_status]"
    @click="$emit('click')"
  >
    <div v-if="!can_edit" class="_tag" :data-nolabel="!show_label">
      <b-icon
        v-if="status === 'finished'"
        icon="check"
        scale="1.5"
        :title="$t('finished')"
      />
      <b-icon
        v-else-if="status === 'private'"
        icon="file-lock2-fill"
        :title="$t('private')"
      />
      <template v-if="show_label">{{ $t(status) }}</template>
      <b-icon v-if="mode === 'disable'" icon="x-circle-fill" :key="mode" />
    </div>
    <select v-else size="small" v-model="new_status">
      <option
        v-for="opt in status_options"
        :key="opt"
        :value="opt"
        v-text="$t(opt)"
      />
    </select>
  </component>
</template>
<script>
export default {
  props: {
    status: {
      type: String,
      default: "draft",
    },
    mode: String,
    show_label: { type: Boolean, default: true },
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
  computed: {
    tag_type() {
      return this.mode === "active" || this.mode === "disable"
        ? "button"
        : "div";
    },
  },
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
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  font-variant: small-caps;
  text-transform: uppercase;
  font-weight: 500;

  padding: 0;
  background: transparent;

  --bg-color: var(--c-gris_clair);
  // --bg-color: transparent;
  --c-color: black;
  --select-caret: url("data:image/svg+xml,%3C%3Fxml version=%271.0%27 encoding=%27UTF-8%27%3F%3E%3Csvg width=%2741px%27 height=%2726px%27 viewBox=%270 0 41 26%27 version=%271.1%27 xmlns=%27http://www.w3.org/2000/svg%27 xmlns:xlink=%27http://www.w3.org/1999/xlink%27%3E%3Cdefs%3E%3C/defs%3E%3Cg id=%27Page-1%27 stroke=%27none%27 stroke-width=%271%27 fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cpolygon id=%27Path-3%27 fill=%27%23000000%27 points=%270 5.38215461 19.9830489 25.3652035 40.1398855 5.20836689 34.9315186 0 19.8691842 15.0623344 4.83971338 0.0328636246%27%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E%0A");

  &[data-status="private"],
  &[data-status="finished"] {
    --c-color: white;
    --bg-color: var(--c-noir);
    --select-caret: url("data:image/svg+xml,%3C%3Fxml version=%271.0%27 encoding=%27UTF-8%27%3F%3E%3Csvg width=%2741px%27 height=%2726px%27 viewBox=%270 0 41 26%27 version=%271.1%27 xmlns=%27http://www.w3.org/2000/svg%27 xmlns:xlink=%27http://www.w3.org/1999/xlink%27%3E%3Cdefs%3E%3C/defs%3E%3Cg id=%27Page-1%27 stroke=%27none%27 stroke-width=%271%27 fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cpolygon id=%27Path-3%27 fill=%27%23ffffff%27 points=%270 5.38215461 19.9830489 25.3652035 40.1398855 5.20836689 34.9315186 0 19.8691842 15.0623344 4.83971338 0.0328636246%27%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E%0A");
  }
  &[data-status="finished"] {
    --bg-color: var(--c-bleuvert);
  }

  ._tag,
  select {
    background-color: var(--bg-color);
    color: var(--c-color);
  }

  &:where(button) {
    ._tag {
      &:hover,
      &:focus-visible {
        opacity: 0.8;
      }
    }
  }

  ._tag {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;

    gap: calc(var(--spacing) / 4);
    height: var(--input-height-small);
    padding: calc(var(--spacing) / 4);
    border-radius: var(--input-border-radius);
    font-size: var(--sl-font-size-small);

    &[data-nolabel] {
      width: var(--input-height-small);
      border-radius: 50%;
    }
  }
  select {
    max-width: 15ch;
    background-image: var(--select-caret);
  }
}
</style>
