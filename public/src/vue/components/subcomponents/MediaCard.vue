<template>
  <div
    class="m_media"
    :class="{
      'is--inPubli': is_media_in_publi,
      'is--fav': media.fav,
      'is--ownMedia': media_made_by_current_author,
      'is--selected': is_selected,
    }"
  >
    <div>
      <figure
        @click.stop.exact="openMediaModal()"
        @click.shift.left.exact="$emit('toggleSelect')"
        @click.meta.left.exact="$emit('toggleSelect')"
        @mouseover="is_hovered = true"
        @mouseleave="is_hovered = false"
        :class="{ 'is--hovered': is_hovered }"
      >
        <div>
          <div class="m_media--topbar m_metaField padding-sides-verysmall">
            <div>
              <svg
                v-if="media.fav"
                version="1.1"
                class="inline-svg"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
                x="0px"
                y="0px"
                width="78.5px"
                height="106.4px"
                viewBox="0 0 78.5 106.4"
                style="enable-background: new 0 0 78.5 106.4;"
                xml:space="preserve"
              >
                <polygon
                  class="st0"
                  points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"
                />
                <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 " />
              </svg>
              <span v-if="!!media.type" :class="{ 'c-rouge': media.fav }">
                {{ $t(media.type) }}
              </span>
              <label
                :for="is_selected + id"
                class="input-selector"
                @click.stop
                v-if="is_hovered || is_selected"
              >
                <input
                  :id="is_selected + id"
                  type="checkbox"
                  v-model="local_is_selected"
                  @change="$emit('toggleSelect')"
                />
              </label>
            </div>
          </div>
          <MediaContent
            v-model="media.content"
            :context="'preview'"
            :slugFolderName="slugProjectName"
            :media="media"
            :preview_size="preview_size"
          />
          <figcaption class="m_media--caption" v-if="!!media.caption">
            <span>{{ media.caption }}</span>
          </figcaption>

          <transition name="fade_fast" :duration="400">
            <div
              v-if="
                $root.settings.current_publication.slug &&
                $root.settings.current_publication.accepted_media_type.includes(
                  media.type
                )
              "
              class="m_media--add_to_recipe"
              @click.stop="addToCurrentPubli()"
            >
              <button
                type="button"
                class="button_addToPubli button-greenthin button-square"
                :content="instructions_depending_on_media_in_publi"
                @click.stop="addToCurrentPubli()"
                v-tippy="{
                  placement: 'left',
                  delay: [600, 0],
                }"
              >
                <template v-if="!is_media_in_publi">→</template>
                <template v-else>→</template>
              </button>
            </div>
          </transition>
        </div>

        <figcaption v-if="is_hovered && false">
          <div class="m_metaField" v-if="!!media.type">
            <div>{{ $t("type") }}</div>
            <div>{{ $t(media.type) }}</div>
          </div>
          <div class="m_metaField" v-if="!!media.authors">
            <div>{{ $t("author") }}</div>
            <div>{{ media.authors }}</div>
          </div>
          <DateField :title="'created'" :date="media.date_created" />
          <DateField :title="'edited'" :date="media.date_modified" />
        </figcaption>
        <!-- <nav>
          <button 
            type="button" 
            class="button-redthin "
            @click.stop="openMediaModal()"
          >
            {{ $t('open') }}
          </button>
        </nav>-->
      </figure>
    </div>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import { setTimeout } from "timers";

export default {
  props: {
    media: Object,
    slugProjectName: String,
    metaFileName: String,
    preview_size: Number,
    is_selected: Boolean,
  },
  components: {
    MediaContent,
  },
  data() {
    return {
      is_hovered: false,
      mediaTypeIcon: {
        image: "/images/i_icone-dodoc_image.svg",
        video: "/images/i_icone-dodoc_video.svg",
        stopmotion: "/images/i_icone-dodoc_anim.svg",
        audio: "/images/i_icone-dodoc_audio.svg",
      },
      local_is_selected: false,
      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    is_selected: function () {
      this.local_is_selected = this.is_selected;
    },
  },
  computed: {
    is_media_in_publi() {
      return (
        Object.values(this.$root.current_publication_medias).findIndex(
          (s) => s.slugMediaName === this.metaFileName
        ) > -1
      );

      // if(this.$root.settings.current_publication.slug) {
      //   if(this.$root.store.publications.hasOwnProperty(this.$root.settings.current_publication.slug)) {
      //     const currentPubli = this.$root.store.publications[this.$root.settings.current_publication.slug];
      //     if(currentPubli.hasOwnProperty('medias') && Object.keys(currentPubli.medias).length > 0) {
      //       const media_in_publi = Object.values(currentPubli.medias).filter(s => s.slugMediaName === this.metaFileName);
      //       if(media_in_publi.length > 0) {
      //         this.media_is_in_current_publi = true;
      //       } else {
      //         this.media_is_in_current_publi = false;
      //       }
      //     }
      //   }
      // }
    },
    instructions_depending_on_media_in_publi() {
      if (this.is_media_in_publi) {
        return this.$t("add_to_recipe");
      }
      return this.$t("add_to_recipe");
    },
    media_made_by_current_author() {
      if (!this.media.authors || typeof this.media.authors !== "object") {
        return false;
      }
      if (!this.$root.current_author) {
        return false;
      }
      return (
        this.media.authors.filter(
          (a) => a.slugFolderName === this.$root.current_author.slugFolderName
        ).length > 0
      );
    },
  },
  methods: {
    openMediaModal() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaCard: openMediaModal = ${this.metaFileName}`
        );
      }
      this.$root.openMedia({
        slugProjectName: this.slugProjectName,
        metaFileName: this.metaFileName,
      });
    },
    removeMedia() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaCard: removeMedia");
      }

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveMedia"),
          () => {
            this.$root.removeMedia(this.slugProjectName, this.metaFileName);
          },
          () => {}
        );
    },
    addToCurrentPubli() {
      if (this.$root.state.dev_mode === "debug") {
        console.log("METHODS • MediaCard: addToPubli");
      }
      this.$eventHub.$emit("publication.addMedia", {
        slugProjectName: this.slugProjectName,
        metaFileName: this.metaFileName,
      });
    },
  },
};
</script>
<style></style>
