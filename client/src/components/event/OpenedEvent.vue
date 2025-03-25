<template>
  <div class="_openedEvent">
    <div class="_openedEvent--cont">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <template v-else>
        <div v-if="!event">
          <router-link :to="'/'" class="u-buttonLink">
            <b-icon icon="arrow-left-short" />
            {{ $t("other_events") }}
          </router-link>
        </div>

        <CoverField
          class="_cover"
          :context="'full'"
          :cover="event.$cover"
          :ratio="'3 / 2'"
          :path="event.$path"
          :can_edit="can_edit_event"
        />
        <div class="_text">
          <div class="_backBtn">
            <router-link :to="'/'" class="u-buttonLink">
              <b-icon icon="arrow-left-short" />
              {{ $t("other_events") }}
            </router-link>
          </div>

          <div v-if="can_edit_event" class="u-spacingBottom" />

          <StatusTag
            v-if="can_edit_event"
            :status="event.$status || 'public'"
            :status_options="['public', 'private']"
            :path="event.$path"
            :can_edit="can_edit_event"
          />

          <div v-if="can_edit_event" class="u-spacingBottom" />

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

          <div class="_eventsDates">
            <div class="u-spacingBottom">
              <DateField
                :field_name="'start_date'"
                :label="$t('start_date')"
                :date="event.start_date"
                :path="event.$path"
                :input_type="'date'"
                :can_edit="can_edit_event"
              />
            </div>
            <div class="u-spacingBottom">
              <DateField
                :field_name="'end_date'"
                :label="$t('end_date')"
                :date="event.end_date"
                :path="event.$path"
                :input_type="'date'"
                :can_edit="can_edit_event"
              />
            </div>
          </div>

          <div class="u-spacingBottom">
            <CollaborativeEditor2
              :label="
                can_edit_event && !event.description ? $t('presentation') : ''
              "
              :field_to_edit="'presentation'"
              :content="event.presentation"
              :path="event.$path"
              :custom_formats="['bold', 'italic', 'link']"
              :is_collaborative="false"
              :maxlength="1280"
              :can_edit="can_edit_event"
            />
          </div>

          <div class="u-mediaOptions" v-if="can_edit_event">
            <RemoveMenu @remove="removeEvent" />
          </div>
        </div>
      </template>
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
    await this.getEvent().catch((err) => {
      if (err.response?.status === 404)
        this.$alertify.delay(4000).error("event_does_not_exit");
      this.$router.replace("/");
    });
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
      this.event = await this.$api.getFolder({
        path: this.event_path,
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
  padding: calc(var(--spacing) * 1);
  // background: var(--c-gris_clair);

  margin: 0 auto;
  max-width: var(--max-column-width);
  overflow: hidden;

  ._openedEvent--cont {
    position: relative;
    display: flex;
    flex-flow: row wrap;
    align-items: center;

    // border-radius: 12px;

    // background: white;

    ._cover {
      position: relative;
      flex: 1 0 300px;
      aspect-ratio: 3/2;
    }

    ._text {
      flex: 1 1 400px;
      padding: calc(var(--spacing) / 1);
    }
  }
}

._backBtn {
  // position: absolute;
  // top: 0;
  // left: 0;
  // z-index: 1;
  // margin-top: var(--spacing);
  // margin-left: var(--spacing);
}
._eventsDates {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) * 1);
}
</style>
