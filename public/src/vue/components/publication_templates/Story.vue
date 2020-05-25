<template>
  <section
    class="m_publicationview"
    :class="{
      'is--preview': preview_mode,
      'is--survey': $root.store.request.display === 'survey' || fullscreen_mode,
      'has--model': model_for_this_publication,
    }"
    ref="panel"
    @mousedown.self="$root.settings.current_publication.selected_medias = []"
    @touchstart.self="$root.settings.current_publication.selected_medias = []"
  >
    <ExportPagePubli
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <PublicationDisplayButtons
      v-if="$root.store.request.display !== 'survey'"
      :preview_mode="preview_mode"
      :fullscreen_mode="fullscreen_mode"
      @togglePreviewMode="$emit('togglePreviewMode')"
      @toggleFullScreen="toggleFullScreen"
    />

    <div
      class="m_storyPublication"
      ref="publi"
      @mousedown.self="$root.settings.current_publication.selected_medias = []"
      @touchstart.self="$root.settings.current_publication.selected_medias = []"
    >
      <div class="m_storyPublication--content">
        <PublicationHeader
          :slugPubliName="slugPubliName"
          :publication="publication"
          :medias="medias_in_order"
          :model_for_this_publication="model_for_this_publication"
          @export="show_export_modal = true"
          @close="$root.closePublication"
        />

        <div class="_story_insert_placeholders">
          <InsertMediaButton
            v-if="
              can_edit_publi &&
              !read_only &&
              !preview_mode &&
              !model_for_this_publication
            "
            :is_collapsed="
              !(
                !Array.isArray(publication.medias_slugs) ||
                publication.medias_slugs.length === 0
              )
            "
            :is_currently_active="(index_currently_visible === 0)"
            :slugPubliName="slugPubliName"
            :publi_is_model="publication.is_model"
            :read_only="read_only"
            @addMedia="(values) => addMedia({ values, in_position: 'start' })"
            @insertMedias="
              ({ metaFileNames }) =>
                $emit('insertMediasInList', {
                  metaFileNames,
                  in_position: 'start',
                })
            "
          />
        </div>

        <transition-group tag="div" name="StoryModules" appear :duration="700">
          <template v-for="(media, index) in medias_in_order">
            <MediaPlaceholder
              v-if="media.type === 'placeholder' && model_for_this_publication"
              :key="media.metaFileName"
              :model_placeholder_media="media"
              :slugPubliName="slugPubliName"
              :publication="publication"
              :preview_mode="preview_mode"
              :read_only="read_only"
              @addMedia="(values) => addMedia({ values })"
              @editPubliMedia="$emit('editPubliMedia', $event)"
            />

            <MediaStory
              v-else
              :key="media.metaFileName"
              :media="media"
              :media_position="mediaPosition(index)"
              :preview_mode="preview_mode"
              :slugPubliName="
                !model_for_this_publication
                  ? slugPubliName
                  : model_for_this_publication.slugFolderName
              "
              :read_only="read_only || !!model_for_this_publication"
              @removePubliMedia="$emit('removePubliMedia', $event)"
              @changeMediaOrder="$emit('changeMediaOrder', $event)"
              @editPubliMedia="$emit('editPubliMedia', $event)"
            />

            <!-- :is_collapsed="mediaPosition(index) !== 'last'" -->
            <div
              class="_story_insert_placeholders"
              :key="`insert_${media.metaFileName}`"
            >
              <InsertMediaButton
                v-if="
                  can_edit_publi &&
                  !read_only &&
                  !preview_mode &&
                  !model_for_this_publication
                "
                :slugPubliName="slugPubliName"
                :is_currently_active="(index_currently_visible === index + 1)"
                :publi_is_model="publication.is_model"
                :read_only="read_only"
                @addMedia="
                  (values) =>
                    addMedia({ values, right_after_meta: media.metaFileName })
                "
                @insertMedias="
                  ({ metaFileNames }) =>
                    $emit('insertMediasInList', {
                      metaFileNames,
                      right_after_meta: media.metaFileName,
                    })
                "
              />
            </div>
          </template>
        </transition-group>

        <footer class="m_storyPublication--content--footer">
          <div>
            <small>
              {{ $t("notifications.successfully_saved") }}
              <br />
              {{ $root.formatDateToPrecise(publication.date_modified) }}
            </small>
          </div>
          <div class="" v-if="url_to_publi">
            <small
              >{{ $t("save_following_address_and_come_back_later") }}<br />
              <a :href="url_to_publi">{{ url_to_publi }}</a>
            </small>
          </div>
          <div class="" v-if="model_for_this_publication">
            <template v-if="!publication.date_submitted">
              <small>{{ $t("finished_writing_reply") }}</small>
              <button
                type="button"
                class="button-greenthin"
                @click="lockAndPublish"
              >
                {{ $t("lock_and_publish") }}
              </button>
            </template>
            <small v-else>
              {{ $t("published") }} —
              {{ $root.formatDateToPrecise(publication.date_submitted) }}
            </small>
          </div>
        </footer>
      </div>
    </div>
  </section>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PublicationDisplayButtons from "../subcomponents/PublicationDisplayButtons.vue";
import ExportPagePubli from "../modals/ExportPagePubli.vue";
import MediaStory from "../subcomponents/MediaStory.vue";
import MediaPlaceholder from "../subcomponents/MediaPlaceholder.vue";
import InsertMediaButton from "../subcomponents/InsertMediaButton.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    medias_in_order: Array,
    can_edit_publi: Boolean,
    can_see_publi: Boolean,
    read_only: Boolean,
    preview_mode: Boolean,
    fullscreen_mode: Boolean,
    model_for_this_publication: [Boolean, Object],
  },
  components: {
    PublicationHeader,
    PublicationDisplayButtons,
    ExportPagePubli,
    MediaStory,
    MediaPlaceholder,
    InsertMediaButton,
  },
  data() {
    return {
      show_export_modal: false,
      show_media_options: false,
      current_scroll: 0,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.addMedia", this.addMediaAtIndex);
    this.$root.settings.current_publication.accepted_media_type = [
      "image",
      "video",
      "audio",
      "text",
      "stl",
      "document",
      "other",
    ];

    const getCurrentScroll = () => {
      if (
        this.$refs.publi &&
        this.current_scroll !== this.$refs.publi.scrollTop
      )
        this.current_scroll = this.$refs.publi.scrollTop;
      setTimeout(getCurrentScroll, 400);
    };
    getCurrentScroll();
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMediaAtIndex);
    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {},
  computed: {
    index_currently_visible() {
      this.current_scroll;
      if (!this.$refs.publi) return 0;

      const insertMediaButtons = this.$refs.publi.querySelectorAll(
        ".m_insertMediaButton"
      );

      // if pane is scrolled all the way, we should adjust
      var el = this.$refs.publi.firstElementChild;
      var elHeight = el.offsetHeight;
      elHeight += parseInt(
        window.getComputedStyle(el).getPropertyValue("margin-top")
      );
      elHeight += parseInt(
        window.getComputedStyle(el).getPropertyValue("margin-bottom")
      );

      if (
        this.current_scroll / (elHeight - this.$refs.publi.offsetHeight) >
        0.9
      ) {
        return insertMediaButtons.length - 1;
      }

      let index = 0;
      for (const insert of insertMediaButtons) {
        // loop until we get insert.offsetTop > this.current_scroll;
        if (insert.offsetTop > this.current_scroll + 80) break;

        index++;
      }
      return index;
    },
    url_to_publi() {
      if (!this.$root.state.localNetworkInfos.ip) return false;

      const ip = this.$root.state.localNetworkInfos.ip[0];
      let url = new URL(window.location);

      function isIP(address) {
        const r = RegExp(
          "((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
        );
        return r.test(address);
      }

      // si on est en localhost (cas de electron et navigateur connecté à electron)
      // alors on remplace localhost par l’IP
      if (url.hostname === "localhost") {
        url.hostname = ip;
      }
      // si on est sur une ip (cas d’un hébergement en ligne, ou d’un navigateur connecté à electron)
      // alors on remplace par l’IP
      else if (isIP(url.hostname)) {
        url.hostname = ip;
      }

      url.pathname = `_publications/survey/${this.publication.slugFolderName}`;

      return url;
    },
  },
  methods: {
    toggleTransition({ position, metaFileName }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • VideoPublication: toggleTransition for metaFileName = ${metaFileName} and position = ${position}`
        );
      this.$emit("editPubliMedia", { metaFileName, val });
    },
    toggleFullScreen() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • PagePublication: toggleFullScreen`);

      const docElem = this.$refs.panel;

      if (this.fullscreen_mode === false) {
        if (!!docElem.requestFullscreen) {
          // W3C API
          docElem.requestFullscreen();
        } else if (!!docElem.mozRequestFullScreen) {
          // Mozilla current API
          docElem.mozRequestFullScreen();
        } else if (!!docElem.webkitRequestFullScreen) {
          // Webkit current API
          docElem.webkitRequestFullScreen();
        } // Maybe other prefixed APIs?
      } else {
        if (!!document.exitFullscreen) {
          // W3C API
          document.exitFullscreen();
        } else if (!!document.mozExitFullscreen) {
          // Mozilla current API
          document.mozExitFullscreen();
        } else if (!!document.webkitExitFullscreen) {
          // Webkit current API
          document.webkitExitFullscreen();
        } // Maybe other prefixed APIs?
      }
    },
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
    addMediaAtIndex(d) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `Story • METHODS: addMediaAtIndex with this.index_currently_visible = ${this.index_currently_visible}`
        );

      if (this.index_currently_visible === 0) {
        d.in_position = "start";
      } else if (
        this.index_currently_visible > 0 &&
        this.index_currently_visible <= this.medias_in_order.length
      ) {
        d.right_after_meta = this.medias_in_order[
          this.index_currently_visible - 1
        ].metaFileName;
      }
      this.addMedia(d);
    },
    addMedia(d) {
      this.$emit("addMedia", d);
    },
    mediaPosition(index) {
      if (index === 0) return "first";
      if (index === this.medias_in_order.length - 1) return "last";
      return "";
    },
  },
};
</script>
<style></style>
