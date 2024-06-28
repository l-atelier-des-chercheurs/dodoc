<template>
  <div class="_make">
    <button
      type="button"
      class="u-buttonLink u-buttonLink_white"
      @click="$emit('close')"
    >
      <b-icon icon="arrow-left-short" />
      {{ $t("back_to_makes_list") }}
    </button>

    <div v-if="fetch_make_error">
      {{ fetch_make_error }}
    </div>
    <div v-if="make">
      <div class="_topbar">
        <TitleField
          :field_name="'title'"
          :tag="'h2'"
          :content="make.title"
          :path="make.$path"
          :required="true"
          :minlength="3"
          :maxlength="40"
          :can_edit="can_edit"
        />

        <RemoveMenu
          v-if="can_edit"
          :remove_text="$t('remove')"
          @remove="removeMake"
        />
      </div>

      <div v-if="make.type === 'video_effects'">
        <div class="_mediaPicker">
          <SingleBaseMediaPicker
            :title="$t('video_to_rework')"
            :field_name="'base_media_filename'"
            :open_modal_if_empty="true"
            :content="make.base_media_filename"
            :path="make.$path"
            :media_type_to_pick="'video'"
          />
        </div>
        <div v-if="base_media" :key="base_media.$path">
          <VideoEffects
            :make="make"
            :project_path="project_path"
            :base_media="base_media"
          />
        </div>
      </div>
      <MixAudioAndImageOrVideo
        v-else-if="
          ['mix_audio_and_image', 'mix_audio_and_video'].includes(make.type)
        "
        :make="make"
      />
      <ImageAndVideoMontage
        v-else-if="make.type === 'video_assemblage'"
        :make="make"
      />
      <QrCode v-else-if="make.type === 'qr_code'" :make="make" />
    </div>
  </div>
</template>
<script>
import SingleBaseMediaPicker from "@/components/makes/SingleBaseMediaPicker.vue"; // eslint-disable-line

export default {
  props: {
    project_path: String,
    make_slug: String,
    can_edit: Boolean,
  },
  components: {
    SingleBaseMediaPicker,
    ImageAndVideoMontage: () =>
      import("@/components/makes/ImageAndVideoMontage.vue"),
    VideoEffects: () => import("@/components/makes/VideoEffects.vue"),
    MixAudioAndImageOrVideo: () =>
      import("@/components/makes/MixAudioAndImageOrVideo.vue"),
    QrCode: () => import("@/components/makes/QrCode.vue"),
  },
  data() {
    return {
      make: null,
      fetch_make_error: false,
    };
  },
  created() {},
  async mounted() {
    await this.listMake();
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.make.$path });
  },
  beforeDestroy() {
    this.$eventHub.$off("folder.removed", this.closeOnRemove);
    this.$api.leave({ room: this.make.$path });
  },
  watch: {},
  computed: {
    base_media() {
      const meta_filename_in_project = this.make.base_media_filename;
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.make.$path,
        });
      return false;
    },
  },
  methods: {
    async listMake() {
      const make = await this.$api
        .getFolder({
          path: `${this.project_path}/makes/${this.make_slug}`,
        })
        .catch((err) => {
          this.fetch_make_error = err.response;
        });
      this.make = make;
    },
    closeOnRemove({ path }) {
      if (path === this.make.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("make_was_removed"));
        this.$emit("close");
      }
    },
    async removeMake() {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const response = await this.$api.deleteItem({
          path: this.make.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
        // this.$alertify.delay(4000).error(err);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._make {
  padding: calc(var(--spacing) / 4);
}
._topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  gap: calc(var(--spacing) * 1);
  align-items: center;
  width: 100%;
  background: white;

  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  // border-radius: 10px;
  margin: calc(var(--spacing) / 2) auto 0;
  box-shadow: 0 1px 4px rgb(0 0 0 / 10%);
  // max-width: 800px;
}

._mediaPicker {
  padding: calc(var(--spacing) / 2);
}
</style>
