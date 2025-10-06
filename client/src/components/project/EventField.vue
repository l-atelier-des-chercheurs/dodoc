<template>
  <div class="" v-if="can_edit || project.event_linked_slug">
    <DLabel :str="$t('created_during')" />
    <template v-if="!is_loading">
      <RadioCheckboxField
        :field_name="'event_linked_slug'"
        :input_type="'radio'"
        :content="project.event_linked_slug"
        :path="project.$path"
        :can_edit="can_edit"
        :options="events_options"
      />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      // competences,
      events: [],
      is_loading: true,
    };
  },
  async created() {
    // load all events
    // display checkbox
    this.events = await this.loadAllEvents();
    this.is_loading = false;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    events_options() {
      if (!this.events) return [];

      const _events_options = [
        {
          key: "",
          label: "",
        },
      ];

      this.events.map((e) => {
        let instructions = "";
        if (e.start_date) instructions += e.start_date;
        if (e.end_date) instructions += "-" + e.end_date;

        const thumb_src = this.makeRelativeURLFromThumbs({
          $thumbs: e.$cover,
          $type: "image",
          $path: e.$path,
          resolution: 50,
        });

        _events_options.push({
          key: this.getFilename(e.$path),
          label: e.title,
          instructions,
          thumb_src,
        });
      });

      return _events_options;
    },
  },
  methods: {
    async loadAllEvents() {
      return await this.$api
        .getFolders({
          path: "events",
        })
        .catch((err) => {
          this.fetch_events_error = err.response;
          return;
        });
    },
  },
};
</script>
<style lang="scss" scoped></style>
