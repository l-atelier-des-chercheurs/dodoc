<template>
  <div
    class="m_publicationview"
    :class="{ 'is--preview': preview_mode }"
    ref="panel"
  >
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias="medias_in_order"
      @export="show_export_modal = true"
      @close="$root.closePublication"
    />

    <ExportFaceMasksPubliModal
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <PublicationDisplayButtons
      :preview_mode="preview_mode"
      @togglePreviewMode="$emit('togglePreviewMode')"
    />

    <template v-if="!preview_mode">
      <div
        class="m_publicationNavMenu"
        v-if="
          ![
            'export_publication',
            'print_publication',
            'link_publication',
          ].includes($root.state.mode)
        "
      >
        <div class="m_publicationNavMenu--settings">
          <div class="">
            <label for="play_masks_randomly">{{
              $t("play_masks_randomly")
            }}</label>
            <input
              id="play_masks_randomly"
              type="checkbox"
              v-model="play_masks_randomly"
              @change="updatePlayMasks"
            />
          </div>
        </div>
      </div>

      <!-- Preview mode: add/remove/reorder images -->
      <div class="margin-medium" v-if="medias_in_order.length === 0">
        <p>
          <small class="c-blanc" v-html="$t('add_multiple_images')" />
        </p>
      </div>
      <transition-group
        class="m_stopmotionAnimationPublication"
        name="slideFromTop"
        :duration="300"
      >
        <div
          class="m_stopmotionAnimationPublication--media"
          :class="{
            'is--active': enable_add_audio_for === image.metaFileName,
          }"
          v-for="({ image, audio }, index) in images_and_audios"
          :key="image.metaFileName"
        >
          <MediaMontagePublication
            :media="image"
            :preview_mode="false"
            :read_only="read_only"
            @removePubliMedia="$emit('removePubliMedia', $event)"
            @editPubliMedia="$emit('editPubliMedia', $event)"
            @duplicateMedia="$emit('duplicateMedia', $event)"
          />

          <div class="m_stopmotionAnimationPublication--media--move">
            <button
              type="button"
              class="m_stopmotionAnimationPublication--media--move--moveLeft"
              :disabled="index === 0"
              @click.stop="
                $emit('changeMediaOrder', {
                  metaFileName: image.metaFileName,
                  dir: -1,
                })
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                <path
                  d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
                  style="fill: currentColor"
                />
              </svg>
            </button>
            <span class="">
              <select
                class="select-xs"
                @change="
                  $emit('changeMediaOrder', {
                    metaFileName: image.metaFileName,
                    new_index_in_slugs: $event.target.value - 1,
                  })
                "
                :value="index + 1"
              >
                <option
                  v-for="pos in medias_in_order.length"
                  :key="pos"
                  v-html="pos"
                />
              </select>
            </span>

            <button
              type="button"
              :disabled="index === medias_in_order.length - 1"
              class="m_stopmotionAnimationPublication--media--move--moveRight"
              @click.stop="
                $emit('changeMediaOrder', {
                  metaFileName: image.metaFileName,
                  dir: +1,
                })
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                <path
                  d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
                  style="fill: currentColor"
                />
              </svg>
            </button>
          </div>
          <div class="m_stopmotionAnimationPublication--media--audio">
            <button
              v-if="!audio"
              type="button"
              class="button-bluethin"
              :class="{
                'is--active': enable_add_audio_for === image.metaFileName,
              }"
              :disabled="
                enable_add_audio_for &&
                enable_add_audio_for !== image.metaFileName
              "
              @click="
                enable_add_audio_for === image.metaFileName
                  ? (enable_add_audio_for = false)
                  : (enable_add_audio_for = image.metaFileName)
              "
            >
              {{ $t("add_audio") }}
            </button>
            <MediaMontagePublication
              v-else
              :media="audio"
              :preview_mode="false"
              :read_only="read_only"
              @removePubliMedia="$emit('removePubliMedia', $event)"
              @editPubliMedia="$emit('editPubliMedia', $event)"
              @duplicateMedia="$emit('duplicateMedia', $event)"
            />
          </div>

          <!-- <div class="m_metaField">
          <div>
            {{ $t('project') }}
          </div>
          <div>
            {{ $root.store.projects[media.slugProjectName].name }}
          </div>
        </div>
        <div class="m_metaField">
          <div>
            {{ $t('duration') }}
          </div>
          <div>
            {{ media.duration }}
          </div>
        </div>-->
        </div>
      </transition-group>
    </template>
    <template v-else>
      <FaceMaskModule
        :images_and_audios="images_and_audios"
        :play_masks_randomly="play_masks_randomly"
      />
    </template>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import PublicationDisplayButtons from "../subcomponents/PublicationDisplayButtons.vue";
import MediaMontagePublication from "../subcomponents/MediaMontagePublication.vue";
import ExportFaceMasksPubliModal from "../modals/ExportFaceMasksPubliModal.vue";
import FaceMaskModule from "./subcomponents/FaceMaskModule.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    medias_in_order: Array,
    read_only: Boolean,
    preview_mode: Boolean,
  },
  components: {
    PublicationHeader,
    PublicationDisplayButtons,
    MediaMontagePublication,
    ExportFaceMasksPubliModal,
    FaceMaskModule,
  },
  data() {
    return {
      show_export_modal: false,
      play_masks_randomly: this.publication.play_masks_randomly
        ? this.publication.play_masks_randomly
        : false,

      enable_add_audio_for: false,
    };
  },
  created() {},
  mounted() {
    this.$root.settings.current_publication.accepted_media_type = ["image"];
    this.$eventHub.$on("publication.addMedia", this.addMedia);
  },
  beforeDestroy() {
    this.$root.settings.current_publication.accepted_media_type = [];
    this.$eventHub.$off("publication.addMedia", this.addMedia);
  },
  watch: {
    "publication.play_masks_randomly"() {
      this.$nextTick(() => {
        this.play_masks_randomly = this.publication.play_masks_randomly;
      });
    },
    enable_add_audio_for() {
      if (this.enable_add_audio_for === false)
        this.$root.settings.current_publication.accepted_media_type = ["image"];
      else
        this.$root.settings.current_publication.accepted_media_type = ["audio"];
    },
  },
  computed: {
    images_and_audios() {
      // [
      //   {
      //     image: {},
      //     audio: {}
      //   }
      // ]

      const all_images = this.medias_in_order.filter(
        (media) => media._linked_media.type === "image"
      );
      return all_images.reduce((acc, image) => {
        let obj = { image };

        const audio = this.medias_in_order.find(
          (m) => m.is_audio_of === image.metaFileName
        );
        if (audio) obj.audio = audio;

        acc.push(obj);
        // if (media.type === "audio" && media.hasOwnProperty("is_audio_of")) {
        //   const image = all_images.find(i => i.metaFileName === media.is_audio_of);
        //   acc.push

        return acc;
      }, []);
    },
  },
  methods: {
    addMedia(d) {
      if (this.enable_add_audio_for)
        d.values.is_audio_of = this.enable_add_audio_for;
      this.$emit("addMedia", d);
      this.enable_add_audio_for = false;
    },
    updatePlayMasks() {
      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data: {
          play_masks_randomly: this.play_masks_randomly,
        },
      });
    },
  },
};
</script>
<style scoped lang="scss">
.m_stopmotionAnimationPublication {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.m_stopmotionAnimationPublication--media {
  &.is--active {
    border: 4px dashed var(--c-bleumarine);
  }
}

.m_stopmotionAnimationPublication--media--audio {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
}
</style>
