<template>
  <div>
    RemixesList
    <div class="u-colorWhite">
      {{ remixes.map((r) => r.type) }}
    </div>
  </div>
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
<style lang="scss" scoped></style>
