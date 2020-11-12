<template>
  <div class="m_panel--previewCard--live--stopmotionlist">
    <div class="margin-bottom-small">
      <template v-if="Object.keys(stopmotions).length > 0">
        <ul>
          <li
            v-for="stopmotion in stopmotions"
            :key="stopmotion.slugFolderName"
          >
            <button
              type="button"
              @mouseenter="loadStopmotionMedias(stopmotion.slugFolderName)"
              @click="loadStopmotion(stopmotion.slugFolderName)"
            >
              <div class="padding-verysmall">
                {{ stopmotion.date_created }}
              </div>
              <template v-if="Object.values(stopmotion.medias).length > 0">
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
              </template>
            </button>
          </li>
        </ul>
      </template>
      <template v-else>
        {{ $t("no_stopmotion_created_yet") }}
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
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
  },
};
</script>
<style lang="scss" scoped></style>
