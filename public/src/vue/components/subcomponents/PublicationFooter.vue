<template>
  <footer class="m_storyPublication--content--footer">
    <div v-if="!publication.date_submitted">
      <small>
        {{ $t("notifications.successfully_saved") }}
        <br />
        {{ $root.formatDateToPrecise(publication.date_modified) }}
      </small>
    </div>
    <!-- <div class="" v-if="url_to_publi && !publication.date_submitted">
      <small
        >{{ $t("save_following_address_and_come_back_later") }}<br />
        <a :href="url_to_publi">{{ url_to_publi }}</a>
      </small>
    </div> -->
    <div class="" v-if="model_for_this_publication">
      <template v-if="!publication.archived">
        <small>{{ $t("finished_writing_reply") }}</small>
        <button type="button" class="button-greenthin" @click="lockAndPublish">
          {{ $t("lock_and_publish") }}
        </button>
      </template>
      <small v-else>
        {{ $t("published") }} —
        {{ $root.formatDateToPrecise(publication.date_submitted) }}
      </small>
    </div>
  </footer>
</template>
<script>
export default {
  props: {
    publication: Object,
    model_for_this_publication: [Boolean, Object],
    url_to_publi: [Boolean, URL],
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    lockAndPublish() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToLockAndPublish"),
          () => {
            this.$emit("lockAndPublish");
          },
          () => {}
        );
    },
  },
};
</script>
<style lang="scss" scoped></style>
