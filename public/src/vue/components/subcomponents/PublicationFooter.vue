<template>
  <footer class="m_publicationFooter">
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
      <template v-if="can_edit_publi">
        <small>{{ $t("finished_writing_reply") }}</small>
        <button type="button" class="button-greenthin" @click="lockAndPublish">
          {{ $t("lock_and_publish") }}
        </button>
      </template>
      <small v-else-if="publication.date_submitted">
        {{ $t("published") }} —
        {{ $root.formatDateToPrecise(publication.date_submitted) }}
      </small>
    </div>

    <div
      v-if="
        ['export_publication', 'link_publication'].includes($root.state.mode)
      "
    >
      <a
        class="js--openInBrowser c-noir"
        target="_blank"
        href="https://dodoc.fr/"
      >
        {{ $t("made_with_dodoc") }}
        <img
          :src="
            this.$root.state.mode === 'export_publication'
              ? './_images/i_logo.svg'
              : '/images/i_logo.svg'
          "
          @click="goHome()"
          draggable="false"
        />
      </a>
    </div>
  </footer>
</template>
<script>
export default {
  props: {
    publication: Object,
    model_for_this_publication: [Boolean, Object],
    url_to_publi: [Boolean, URL],
    can_edit_publi: Boolean,
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
