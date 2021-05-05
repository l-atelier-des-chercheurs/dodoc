<template>
  <div class="m_publicationview" :class="{ 'is--preview': preview_mode }" ref="panel">
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias="medias_in_order"
      :number_of_medias_required="number_of_medias_required"
      @export="show_export_modal = true"
      @close="$root.closePublication"
    />

    <ExportVideoPubliModal
      v-if="show_export_modal"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
      :publication="publication"
      :instructions="$t('export_audio_image_mix_instructions')"
    />

    <div class="m_mixAudioAndImagePublication">
      <div class="margin-medium" v-if="medias_in_order.length === 0">
        <p>
          <small class="c-blanc" v-html="$t('add_sound_image_file')" />
        </p>
      </div>

      <transition-group name="slideFromTop" :duration="300" tag="div">
        <div
          class="m_mixAudioAndImagePublication--media"
          v-for="media in medias_in_order"
          :key="media.metaFileName"
        >
          <MediaMontagePublication
            :available_buttons="['remove']"
            :media="media"
            :preview_mode="false"
            :read_only="read_only"
            @removePubliMedia="$emit('removePubliMedia', $event)"
            @editPubliMedia="$emit('editPubliMedia', $event)"
          />
        </div>
      </transition-group>
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
      required_media_type: ["audio", "image"],
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("publication.addMedia", this.addMedia);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.addMedia", this.addMedia);
  },
  watch: {
    medias_in_order: {
      handler() {
        this.$root.settings.current_publication.accepted_media_type = this.required_media_type.filter(
          (t) =>
            !this.medias_in_order.some(
              (m) => m._linked_media && m._linked_media.type === t
            )
        );
      },
      immediate: true,
    },
  },
  computed: {},
  methods: {
    addMedia(d) {
      this.$emit("addMedia", d);
    },
  },
};
</script>
<style></style>
