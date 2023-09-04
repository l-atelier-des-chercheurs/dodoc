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

      <SingleBaseMediaPicker
        :field_name="'base_media_filename'"
        :content="make.base_media_filename"
        :path="make.$path"
        :project_path="project_path"
        :media_type_to_pick="media_type_to_pick"
      />

      <div class="_content">
        <template v-if="base_media">
          <!-- <VideoAssemblage
            v-if="make.type === 'video_assemblage'"
            :make="make"
          /> -->
          <EditImage
            v-if="make.type === 'edit_image'"
            :make="make"
            :project_path="project_path"
            :base_media="base_media"
          />
          <TrimAudioVideo
            v-else-if="make.type === 'trim_video'"
            :make="make"
            :project_path="project_path"
            :base_media="base_media"
          />
          <TrimAudioVideo
            v-else-if="make.type === 'trim_audio'"
            :make="make"
            :project_path="project_path"
            :base_media="base_media"
          />
        </template>
      </div>
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
    // VideoAssemblage: () => import("@/components/makes/VideoAssemblage.vue"),
    EditImage: () => import("@/components/makes/EditImage.vue"),
    TrimAudioVideo: () => import("@/components/makes/TrimAudioVideo.vue"),
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
    media_type_to_pick() {
      if (this.make.type === "edit_image") return "image";
      if (this.make.type === "trim_audio") return "audio";
      if (this.make.type === "trim_video") return "video";
      return undefined;
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
          .log(this.$t("notifications.make_was_removed"));
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

._content {
}
</style>
