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
    <transition-group
      class="m_stopmotionAnimationPublication"
      name="slideFromTop"
      :duration="300"
    >
      <div
        class="m_stopmotionAnimationPublication--media"
        v-for="(media, index) in medias_in_order"
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

        <div class="m_stopmotionAnimationPublication--media--move">
          <button
            type="button"
            class="m_stopmotionAnimationPublication--media--move--moveLeft"
            :disabled="index === 0"
            @click.stop="
              $emit('changeMediaOrder', {
                metaFileName: media.metaFileName,
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
                  metaFileName: media.metaFileName,
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
                metaFileName: media.metaFileName,
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
