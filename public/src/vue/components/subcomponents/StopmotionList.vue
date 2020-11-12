<template>
  <div class="m_panel--previewCard--live--stopmotionlist">
    <template v-if="Object.keys(stopmotions).length > 0">
      <ul>
        <li
          v-for="stopmotion in stopmotions"
          :key="stopmotion.slugFolderName"
          @mouseenter="loadStopmotionMedias(stopmotion.slugFolderName)"
        >
          <div class="padding-verysmall">
            {{ $root.formatDateToHuman(stopmotion.date_created) }}
          </div>
          <div
            v-if="Object.values(stopmotion.medias).length > 0"
            class="pictures_cont"
          >
            <div class="padding-bottom-verysmall">
              {{ Object.values(stopmotion.medias).length }}
              photos
            </div>
            <div class="pictures_list">
              <div
                v-for="media in Object.values(stopmotion.medias)"
                :key="media.slugMediaName"
              >
                <!-- v-if="index <= 5" -->
                <MediaContent
                  :context="'preview'"
                  :slugFolderName="stopmotion.slugFolderName"
                  :media="media"
                  :folderType="'stopmotions'"
                  :preview_size="150"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            class="buttonLink"
            @click="loadStopmotion(stopmotion.slugFolderName)"
          >
            {{ $t("load") }}
          </button>
          <button
            type="button"
            class="buttonLink"
            @click="removeStopmotion(stopmotion.slugFolderName)"
          >
            {{ $t("remove") }}
          </button>
        </li>
      </ul>
    </template>
    <template v-else>
      {{ $t("no_stopmotion_created_yet") }}
    </template>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";

export default {
  props: {
    slugFolderName: {
      type: String,
      default: false,
    },
  },
  components: {
    MediaContent,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    stopmotions() {
      let stopmotions = Object.values(this.$root.store.stopmotions);
      stopmotions = this.$_.sortBy(stopmotions, function (o) {
        return o.date_created;
      }).reverse();

      stopmotions = stopmotions.filter((s) => {
        if (!s.linked_project || s.linked_project === this.slugFolderName)
          return true;
      });
      return stopmotions;
    },
  },
  methods: {
    loadStopmotionMedias(slugFolderName) {
      if (
        Object.values(this.$root.store.stopmotions[slugFolderName].medias)
          .length === 0
      ) {
        this.$socketio.listMedias({
          type: "stopmotions",
          slugFolderName,
        });
      }
    },
    loadStopmotion(slugFolderName) {
      this.$emit("loadStopmotion", slugFolderName);
    },
    removeStopmotion(slugFolderName) {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_remove_stopmotion"),
          () => {
            this.$root.removeFolder({
              type: "stopmotions",
              slugFolderName: slugFolderName,
            });
          },
          () => {}
        );
    },
  },
};
</script>
<style lang="scss" scoped></style>
