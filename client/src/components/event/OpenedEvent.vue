<template>
  <div class="_openedEvent">
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else>
      <div class="_backBtn">
        <router-link :to="'/'" class="u-buttonLink">
          <sl-icon name="arrow-left-short" />
          {{ $t("close") }}
        </router-link>
      </div>

      <div class="u-spacingBottom">
        <TitleField
          :field_name="'title'"
          :label="can_edit_event && !event.title ? $t('title') : ''"
          class="_title"
          :content="event.title"
          :path="event.$path"
          :required="true"
          :maxlength="40"
          :tag="'h1'"
          :can_edit="can_edit_event"
        />
      </div>
      <div class="u-spacingBottom">
        <TitleField
          :field_name="'presentation'"
          :label="
            can_edit_event && !event.description ? $t('presentation') : ''
          "
          class="_presentation"
          :content="event.presentation"
          :path="event.$path"
          :maxlength="1280"
          :input_type="'markdown'"
          :can_edit="can_edit_event"
        />
      </div>

      <div class="u-mediaOptions" v-if="can_edit_event">
        <RemoveMenu :remove_text="$t('remove')" @remove="removeEvent" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    event_slug: String,
  },
  components: {},
  data() {
    return {
      event: undefined,
      is_loading: true,
    };
  },
  async created() {
    await this.getEvent();
    this.$api.join({ room: this.event_path });
    // await new Promise((r) => setTimeout(r, 1200));
    this.is_loading = false;
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.event_path });
  },
  watch: {},
  computed: {
    event_path() {
      return this.createPath({ event_slug: this.event_slug });
    },
    can_edit_event() {
      return this.canLoggedinEditFolder({ folder: this.event });
    },
  },
  methods: {
    async getEvent() {
      this.event = await this.$api
        .getFolder({
          path: this.event_path,
        })
        .catch(() => {
          return;
        });
    },
    async removeEvent() {
      await this.$api.deleteItem({
        path: this.event_path,
      });
      this.$router.push("/");
    },
  },
};
</script>
<style lang="scss" scoped>
._openedEvent {
  width: 100%;
  position: relative;

  min-height: 5em;
  margin: 0 auto;
  max-width: var(--max-column-width);
  padding: calc(var(--spacing) * 1);
}

._backBtn {
  margin-top: var(--spacing);
  margin-left: var(--spacing);
}
</style>
