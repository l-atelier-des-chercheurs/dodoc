<template>
  <div
    class="_formatView"
    :class="{
      'is--serversidepreview': is_serversidepreview,
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="$root.is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else key="format" ref="fsContainer">
        <div
          v-if="!format.template || format.template === '`story_with_sections`'"
        >
          <SectionWithPrint :publication="format" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {},
  components: {
    SectionWithPrint: () =>
      import("@/components/publications/story/SectionWithPrint.vue"),
    // MapForPrint: () =>
    //   import("@/components/publications/cartography/MapForPrint.vue"),
  },
  data() {
    return {
      format: null,

      is_fullscreen: false,
      is_serversidepreview: false,
    };
  },
  created() {
    console.log("Loading FormatView");
  },
  async mounted() {
    if (this.$route.query?.make_preview === "true")
      this.is_serversidepreview = true;

    let superadmintoken = undefined;
    if (this.$route.query?.sat) superadmintoken = this.$route.query.sat;

    this.format = await this.$api
      .getPublicFolder({
        path: this.format_path,
        superadmintoken,
      })
      .catch((err) => {
        this.fetch_format_error = err.response;
        this.$root.is_loading = false;
      });

    // not pushing changes to presentation for performance reasons – though this could be useful at some point?
    // this.$api.join({ room: this.project.$path });
    // this.$api.join({ room: this.format_path });

    this.$root.is_loading = false;
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
    // this.$api.leave({ room: this.format_path });
  },
  watch: {
    is_fullscreen() {
      // this.$nextTick(() => {
      // this.fitZoomToPage();
      // });
    },
  },
  computed: {
    format_path() {
      return `formats/${this.$route.params.format_slug}`;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._formatView {
  background: white;
  min-height: 100%;
}
</style>
