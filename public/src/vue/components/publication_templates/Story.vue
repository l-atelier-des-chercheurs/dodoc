<template>
  <section
    class="m_publicationview"
    :class="{
      'is--preview': preview_mode,
      'is--survey': $root.store.request.display === 'survey',
      'has--model': model_for_this_publication,
    }"
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
      @togglePreviewMode="$emit('togglePreviewMode')"
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
          :url_to_publi="url_to_publi"
          :model_for_this_publication="model_for_this_publication"
          @export="show_export_modal = true"
          @close="$root.closePublication"
        />

        <div class="margin-sides-medium padding-sides-small _summaryButton">
          <button
            type="button"
            class="buttonLink"
            :class="{
              'is--active': show_summary,
            }"
            @click="show_summary = !show_summary"
          >
            {{ $t("summary") }}
          </button>
          <div v-if="show_summary" class="_summary">
            <div v-for="(title, index) in summary" :key="index">
              <button
                type="button"
                class="button-nostyle _summary--item"
                @click="goToNode(title.node)"
              >
                <span :class="`_summary${title.tag}`">
                  {{ title.text }}
                </span>
              </button>
            </div>
          </div>
        </div>

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
            :is_currently_active="
              el_index_currently_visible.insert_button === 0
            "
            :slugPubliName="slugPubliName"
            :publi_is_model="publication.is_model"
            :read_only="read_only"
            @addMedia="
              (values) => $emit('addMedia', { values, in_position: 'start' })
            "
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
            <!-- <div :key="'index_' + media.metaFileName">
              {{ el_index_currently_visible.insert_button }}
              {{ media.metaFileName }}
              {{ current_scroll }}
            </div> -->
            <MediaPlaceholder
              v-if="media.type === 'placeholder' && model_for_this_publication"
              :key="`placeholder_${media.metaFileName}`"
              :data-metafilename="media.metaFileName"
              :model_placeholder_media="media"
              :slugPubliName="slugPubliName"
              :publi_is_model="publication.is_model"
              :publication_is_submitted="publication_is_submitted"
              :preview_mode="preview_mode"
              :is_currently_active="
                el_index_currently_visible.media_placeholder ===
                media.metaFileName
              "
              :read_only="read_only || !can_edit_publi"
              @editPubliMedia="$emit('editPubliMedia', $event)"
            />

            <MediaStory
              v-else
              :key="`mediaStory_${media.metaFileName}`"
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
              @duplicateMedia="$emit('duplicateMedia', $event)"
            />

            <!-- :is_collapsed="mediaPosition(index) !== 'last'" -->
            <div class="_story_insert_placeholders" :key="`insert_${index}`">
              <InsertMediaButton
                v-if="
                  can_edit_publi &&
                  !read_only &&
                  !preview_mode &&
                  !model_for_this_publication
                "
                :slugPubliName="slugPubliName"
                :is_currently_active="
                  el_index_currently_visible.insert_button === index + 1
                "
                :publi_is_model="publication.is_model"
                :read_only="read_only"
                @addMedia="
                  (values) =>
                    $emit('addMedia', {
                      values,
                      right_after_meta: media.metaFileName,
                    })
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

        <PublicationFooter
          :publication="publication"
          :url_to_publi="url_to_publi"
          :model_for_this_publication="model_for_this_publication"
          :can_edit_publi="can_edit_publi"
          @openPublishModal="$emit('openPublishModal')"
        />
      </div>
    </div>
  </section>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PublicationFooter from "../subcomponents/PublicationFooter.vue";
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
    model_for_this_publication: [Boolean, Object],
  },
  components: {
    PublicationHeader,
    PublicationFooter,
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

      show_summary: false,

      el_index_currently_visible: {
        insert_button: 0,
        media_placeholder: 0,
      },
    };
  },
  created() {},
  mounted() {
    const getCurrentScroll = () => {
      if (
        this.$refs.publi &&
        this.current_scroll !== this.$refs.publi.scrollTop
      )
        this.current_scroll = this.$refs.publi.scrollTop;
      setTimeout(getCurrentScroll, 400);
    };
    getCurrentScroll();

    window.addEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
  },
  watch: {
    current_scroll() {
      if (!this.$refs.publi) return 0;

      const insertMediaButtons = this.$refs.publi.querySelectorAll(
        ".m_insertMediaButton"
      );
      const mediaPlaceholders = this.$refs.publi.querySelectorAll(
        ".m_mediaPlaceholder"
      );

      // if pane is scrolled all the way, we should adjust
      let elHeight = this.getPaneHeight();

      if (
        this.current_scroll / (elHeight - this.$refs.publi.offsetHeight) >
        0.9
      ) {
        if (insertMediaButtons.length > 0)
          this.el_index_currently_visible.insert_button =
            insertMediaButtons.length - 1;
        if (mediaPlaceholders.length > 0)
          this.el_index_currently_visible.media_placeholder =
            mediaPlaceholders[
              mediaPlaceholders.length - 1
            ].dataset.metafilename;
      }

      let index = 0;
      for (const insert of insertMediaButtons) {
        // loop until we get insert.offsetTop > this.current_scroll;
        if (insert.offsetTop + insert.offsetHeight > this.current_scroll + 120)
          break;
        index++;
      }
      this.el_index_currently_visible.insert_button = index;

      index = 0;
      for (const insert of mediaPlaceholders) {
        // loop until we get insert.offsetTop > this.current_scroll;
        if (insert.offsetTop + insert.offsetHeight > this.current_scroll + 120)
          break;
        index++;
      }

      if (index >= 0 && mediaPlaceholders.length > 0)
        this.el_index_currently_visible.media_placeholder =
          mediaPlaceholders[index].dataset.metafilename;
    },
  },
  computed: {
    publication_is_submitted() {
      if (!!this.publication.date_submitted) return true;
      return false;
    },
    url_to_publi() {
      let url = this.$root.getURL();
      if (!url) return false;
      url.pathname = `_publications/survey/${this.publication.slugFolderName}`;
      return url;
    },
    summary() {
      if (!this.$el) return [];
      this.medias_in_order;

      return [...this.$el.querySelectorAll("h1, h2, h3")].reduce(
        (acc, node) => {
          acc.push({
            text: node.innerText,
            node,
            tag: node.tagName,
          });
          return acc;
        },
        []
      );
      // const text_medias = this.medias_in_order.filter((m) => m.type === "text");

      // this.medias_in_order
      //   .filter((m) => m.type === "text")
      //   .reduce((acc, media) => {
      //     if(media.content) {

      //       // find all h1 and h2 in content
      //       var div=document.createElement('div');
      //       div.innerHTML=data;

      //       acc.push()
      //     }
      //     return acc;
      //   }, []);
      // return [
      //   {
      //     title: "Titre 1",
      //   },
      //   {
      //     title: "Titre 2",
      //   },
      // ];
    },
  },
  methods: {
    getPaneHeight() {
      let el = this.$refs.publi.firstElementChild;
      let elHeight = el.offsetHeight;
      elHeight += parseInt(
        window.getComputedStyle(el).getPropertyValue("margin-top")
      );
      elHeight += parseInt(
        window.getComputedStyle(el).getPropertyValue("margin-bottom")
      );
      return elHeight;
    },

    handlePaste(e) {
      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        if (this.$root.state.dev_mode === "debug")
          console.log(
            `Story — METHODS • handlePaste: for files.length = ${e.clipboardData.files.length} with size ${e.clipboardData.files[0].size}`
          );

        this.$eventHub.$emit("importMedia.paste", e.clipboardData.files);
      }
    },
    toggleTransition({ position, metaFileName }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • VideoPublication: toggleTransition for metaFileName = ${metaFileName} and position = ${position}`
        );
      this.$emit("editPubliMedia", { metaFileName, val });
    },
    mediaPosition(index) {
      if (index === 0) return "first";
      if (index === this.medias_in_order.length - 1) return "last";
      return "";
    },
    goToNode(node) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    },
  },
};
</script>
<style lang="scss">
._summary {
  background-color: var(--c-gris-tresclair);
  margin: 0 calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 4) 0 calc(var(--spacing) / 2);
  border-radius: var(--input-border-radius);
}
._summary--item {
  padding: 0 calc(var(--spacing) / 2);

  margin: 0;
}

._summaryH1 {
  font-weight: 700;
  // font-size: 1.5em;
}
._summaryH2 {
  padding-left: calc(var(--spacing));
  // font-size: 1.25em;
  // font-weight: 700;
}
._summaryH3 {
  padding-left: calc(var(--spacing) * 2);
  // font-weight: 500;

  &::before {
    content: "•";
  }
}
</style>
