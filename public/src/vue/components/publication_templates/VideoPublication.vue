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

    <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :instructions="$t('export_video_instructions')"
    />

    <div class="m_videoPublication">
      <div class="margin-medium" v-if="medias_in_order.length === 0">
        <p>
          <small class="c-blanc" v-html="$t('add_multiple_videos_files')" />
        </p>
      </div>
      <transition-group name="list-complete" :duration="300">
        <div
          v-for="(media, index) in medias_in_order"
          :key="media.metaFileName"
        >
          <div class="switch switch-xs m_videoPublication--transitionToggle">
            <input
              class="switch"
              :id="'transition_in_' + media.metaFileName"
              type="checkbox"
              :checked="media.transition_in === 'fade'"
              @change="
                toggleTransition({
                  position: 'transition_in',
                  metaFileName: media.metaFileName,
                })
              "
            />
            <label :for="'transition_in_' + media.metaFileName">
              {{ $t("transition_fade") }}
            </label>
            <button
              type="button"
              v-if="media.type !== 'solid_color'"
              class="m_videoPublication--addSolidColor buttonLink bg-noir"
              @click="
                addMedia({
                  values: {
                    type: 'solid_color',
                  },
                  right_after_meta: media.metaFileName,
                })
              "
            >
              {{ $t("add_solid_color") }}
            </button>
          </div>

          <div class="m_videoPublication--media" :data-type="media.type">
            <MediaMontagePublication
              :media="media"
              :preview_mode="false"
              :read_only="read_only"
              :enable_image_timer="true"
              :enable_set_video_volume="true"
              @removePubliMedia="$emit('removePubliMedia', $event)"
              @editPubliMedia="$emit('editPubliMedia', $event)"
            />
            <span class="m_videoPublication--media--mediaNumber">
              {{ index + 1 }}
            </span>
            <div class="m_videoPublication--media--moveItemButtons">
              <button
                type="button"
                class="m_videoPublication--media--moveItemButton--before"
                v-show="index > 0"
                @click="
                  $emit('changeMediaOrder', {
                    metaFileName: media.metaFileName,
                    dir: -1,
                  })
                "
              >
                <img src="/images/i_arrow_left.svg" draggable="false" />
              </button>
              <button
                type="button"
                class="m_videoPublication--media--moveItemButton--after"
                v-show="index < medias_in_order.length - 1"
                @click="
                  $emit('changeMediaOrder', {
                    metaFileName: media.metaFileName,
                    dir: +1,
                  })
                "
              >
                <img src="/images/i_arrow_right.svg" draggable="false" />
              </button>
            </div>
          </div>
          <div
            v-if="index === medias_in_order.length - 1"
            class="switch switch-xs m_videoPublication--transitionToggle margin-bottom-medium"
          >
            <input
              class="switch"
              :id="'transition_out_' + media.metaFileName"
              type="checkbox"
              :checked="media.transition_out === 'fade'"
              @change="
                toggleTransition({
                  position: 'transition_out',
                  metaFileName: media.metaFileName,
                })
              "
            />
            <label :for="'transition_out_' + media.metaFileName">{{
              $t("transition_fade")
            }}</label>
            <button
              type="button"
              class="m_videoPublication--addSolidColor buttonLink bg-noir"
              @click="
                addMedia({
                  values: {
                    type: 'solid_color',
                  },
                })
              "
            >
              {{ $t("add_solid_color") }}
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <div>
      <div>
        <!-- <input type="color" ref="solidColorPicker" /> -->
      </div>
    </div>
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import MediaMontagePublication from "../subcomponents/MediaMontagePublication.vue";
import ExportVideoPubliModal from "../modals/ExportVideoPubliModal.vue";

export default {
  props: {
    slugPubliName: String,
    publication: Object,
    medias_in_order: Array,
    read_only: Boolean,
  },
  components: {
    PublicationHeader,
    MediaMontagePublication,
    ExportVideoPubliModal,
  },
  data() {
    return {
      show_export_modal: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.addMedia", this.addMedia);
    this.$root.settings.current_publication.accepted_media_type = [
      "video",
      "image",
    ];
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
    this.$root.settings.current_publication.accepted_media_type = [];
  },
  watch: {},
  computed: {},
  methods: {
    toggleTransition({ position, metaFileName }) {
      console.log(
        `METHODS • VideoPublication: toggleTransition for metaFileName = ${metaFileName} and position = ${position}`
      );

      let val = {};
      const media = this.medias_in_order.find(
        (m) => m.metaFileName === metaFileName
      );

      if (media.hasOwnProperty(position) && media[position] === "fade") {
        val[position] = "none";
      } else {
        val[position] = "fade";
      }

      this.$emit("editPubliMedia", { metaFileName, val });
    },
    addMedia(d) {
      this.$emit("addMedia", d);
    },
  },
};
</script>
<style></style>
