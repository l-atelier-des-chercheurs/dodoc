<template>
  <div class="m_publicationview" :class="{ 'is--preview': preview_mode }" ref="panel">
    <PublicationHeader
      :slugPubliName="slugPubliName"
      :publication="publication"
      :medias="medias_in_order"
      @export="show_export_modal = true"
      @close="$root.closePublication"
    />

    <ExportStopmotionPubliModal
      v-if="show_export_modal"
      :publication="publication"
      @close="show_export_modal = false"
      :slugPubliName="slugPubliName"
    />

    <div class="margin-medium" v-if="medias_in_order.length === 0">
      <p>
        <small class="c-blanc" v-html="$t('add_multiple_images')" />
      </p>
    </div>
    <transition-group class="m_stopmotionAnimationPublication" name="slideFromTop" :duration="300">
      <div
        class="m_stopmotionAnimationPublication--media"
        v-for="media in medias_in_order"
        :key="media.metaFileName"
      >
        <MediaMontagePublication
          :media="media"
          :preview_mode="false"
          :read_only="read_only"
          @removePubliMedia="$emit('removePubliMedia', $event)"
          @editPubliMedia="$emit('editPubliMedia', $event)"
          @duplicateMedia="$emit('duplicateMedia', $event)"
        />
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
  </div>
</template>
<script>
import PublicationHeader from "../subcomponents/PublicationHeader.vue";
import MediaMontagePublication from "../subcomponents/MediaMontagePublication.vue";
import ExportStopmotionPubliModal from "../modals/ExportStopmotionPubliModal.vue";

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
    ExportStopmotionPubliModal,
  },
  data() {
    return {
      show_export_modal: false,
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
  watch: {},
  computed: {},
  methods: {
    addMedia(d) {
      this.$emit("addMedia", d);
    },
  },
};
</script>
<style></style>
