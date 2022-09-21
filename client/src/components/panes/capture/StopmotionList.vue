<template>
  <div class="m_stopmotionList">
    <template v-if="Object.keys(stopmotions).length > 0">
      <ul>
        <li
          v-for="(stopmotion, index) in stopmotions"
          :key="stopmotion.slugFolderName"
          class=""
        >
          <!-- @mouseenter="loadStopmotionMedias(stopmotion.slugFolderName)" -->

          <div
            class="_preview"
            @click="loadStopmotion(stopmotion.slugFolderName)"
          >
            MediaContent
            <!-- <MediaContent
              :context="'preview'"
              :slugFolderName="stopmotion.slugFolderName"
              :media="mediasPreviewed(stopmotion)[0]"
              :folderType="'stopmotions'"
              :preview_size="600"
            /> -->
          </div>

          <label class=""> {{ $t("stopmotion") }} {{ index + 1 }} </label>
          <DateField
            :title="'created'"
            :date="stopmotion.date_created"
            :show_detail_initially="false"
          />

          <div class="m_metaField" @click="show_detail = !show_detail">
            <div class="">
              {{ $t("photos") }}
            </div>
            <div class="">
              {{ Object.values(stopmotion.medias).length }}
            </div>
          </div>

          <div class="_options">
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
          </div>
        </li>
      </ul>
    </template>
    <template v-else>
      {{ $t("no_stopmotion_created_yet") }}
    </template>
  </div>
</template>
<script>
// import MediaContent from "../subcomponents/MediaContent.vue";

export default {
  props: {
    slugFolderName: {
      type: String,
      default: "",
    },
  },
  components: {
    // MediaContent,
  },
  data() {
    return {
      has_loaded_stopmotions_content: false,
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "stopmotions" });
    // this.$eventHub.$once("socketio.stopmotions.medias_listed", () => {});
  },
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

      if (!this.has_loaded_stopmotions_content && stopmotions.length > 0) {
        stopmotions.map((s) => this.loadStopmotionMedias(s.slugFolderName));
        // eslint-disable-next-line
        this.has_loaded_stopmotions_content = true;
      }

      return stopmotions;
    },
  },
  methods: {
    loadStopmotionMedias(slugFolderName) {
      if (this.$root.dev_mode === true)
        console.log(
          `StopmotionList • METHODS : loadStopmotionMedias — load ${slugFolderName}`
        );
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
    mediasPreviewed(stopmotion) {
      if (
        typeof stopmotion.medias === "object" &&
        Object.values(stopmotion.medias).length > 0
      )
        return Object.values(stopmotion.medias).slice(0, 1);
      return [];
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
<style lang="scss" scoped>
.m_stopmotionList {
  position: relative;
  flex: 0 0 250px;
  max-width: 250px;
  background-color: var(--c-bleumarine);

  color: var(--c-bleumarine);
  padding: calc(var(--spacing) / 2);
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 2);

  overflow-y: auto;
  height: 100%;

  // border-left: 4px solid var(--c-bleumarine);
  font-size: var(--font-verysmall);

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
    // border: 2px solid @c-bleumarine;
    border-radius: 4px;
    background-color: white;
    display: block;
    width: 100%;
    padding: 0;
    margin: calc(var(--spacing) / 2) 0;
    overflow: hidden;

    // &:hover {
    //   background-color: var(--c-bleumarine_clair);
    // }

    label {
      color: black;
      // margin: 0;
      margin-top: 4px;
    }

    > *:not(._preview) {
      padding: 0 calc(var(--spacing) / 4);
    }

    > ._preview {
      position: relative;

      .mediaContainer {
      }
    }

    .pictures_cont {
      // padding-left: calc(var(--spacing) / 8);
      // padding-left: calc(var(--spacing) / 8);
    }

    .pictures_list {
      display: flex;
      flex-flow: row wrap;
      background-color: var(--c-bleumarine);
      // justify-content: flex-start;
      // overflow-x: auto;
      // .padding-right-verysmall;
      > * {
        flex: 0 0 50px;
        // .padding-left-verysmall;
        padding-bottom: calc(var(--spacing) / 8);

        &:last-child {
          padding-right: calc(var(--spacing) / 8);
        }

        img {
          max-width: 100%;
          width: auto;
          height: auto;
        }
      }
    }

    &:first-child {
      margin-top: 0;
    }
  }
}
._options {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  background-color: var(--c-bleumarine_clair);
}
</style>
<style lang="scss">
._preview .mediaContainer img {
  // height: 100%;
  max-height: 140px;
  object-fit: contain;
}
</style>
