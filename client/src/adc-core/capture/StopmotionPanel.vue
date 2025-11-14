<template>
  <div
    class="m_stopmotionpanel"
    :class="{ 'is--showing_video_validation': validating_video_preview }"
  >
    <LoaderSpinner v-if="!stopmotion" />
    <div v-else-if="fetch_stopmotion_error">
      {{ fetch_stopmotion_error }}
    </div>
    <template v-else>
      <template v-if="!validating_video_preview">
        <div class="m_stopmotionpanel--toprowbuttons">
          <button
            type="button"
            class="u-button u-button_black"
            @click="firstImage"
            :disabled="image_index_currently_shown === 0 && !show_live_feed"
          >
            <b-icon
              icon="chevron-double-left"
              :aria-label="$t('first_image')"
            />
          </button>
          <button
            type="button"
            class="u-button u-button_black"
            @click="prevImage"
            :disabled="image_index_currently_shown === 0 && !show_live_feed"
          >
            <b-icon icon="chevron-left" :aria-label="$t('previous_image')" />
          </button>

          <div class="">
            <template v-if="!preview_playing_event">
              <button
                type="button"
                class="u-button u-button_black"
                :disabled="medias.length <= 1"
                @click="previewPlay"
              >
                <b-icon icon="play-fill" />
                &nbsp;
                {{ $t("play") }}
              </button>
              <button
                type="button"
                class="u-button u-button_black"
                :disabled="medias.length <= 1"
                @click="previewPlay({ loop: true })"
              >
                <b-icon icon="play-circle-fill" />
                &nbsp;
                {{ $t("loop") }}
              </button>
            </template>
            <button
              v-else
              type="button"
              class="u-button u-button_black"
              :disabled="show_live_feed"
              @click="pausePreview"
            >
              <b-icon icon="pause-fill" />
              &nbsp;
              {{ $t("pause") }}
            </button>
          </div>
          <button
            type="button"
            class="u-button u-button_black"
            @click="nextImage"
            :disabled="show_live_feed"
          >
            <b-icon icon="chevron-right" :aria-label="$t('next_image')" />
          </button>
          <button
            type="button"
            class="u-button u-button_black"
            @click="lastImage"
            :disabled="show_live_feed"
          >
            <b-icon
              icon="chevron-double-right"
              :aria-label="$t('last_image')"
            />
          </button>

          <!-- <div class="m_stopmotionpanel--toprowbuttons--counter">
          <button
            type="button"
            class=""
            @click="prevImage"
            :disabled="image_index_currently_shown === 0"
          >
            ←
          </button>
          <label class="c-blanc u-label">
            {{ $t("image") }} {{ image_index_currently_shown + 1 }}/{{
              medias.length
            }}
          </label>
          <button type="button" class="" @click="nextImage">→</button>
        </div>
 -->
        </div>
        <div class="m_stopmotionpanel--medias">
          <transition-group
            class="m_stopmotionpanel--medias--list"
            name="listComplete"
            ref="mediaPreviews"
          >
            <div
              v-for="({ media, duration }, index) in medias"
              :key="media.$path"
              @click="
                previous_photo_to_show = media;
                $emit('update:show_live_feed', false);
              "
              class="m_stopmotionpanel--medias--list--items"
              :class="{
                'is--current_single':
                  previous_photo_to_show &&
                  previous_photo_to_show.$path === media.$path &&
                  !show_live_feed,
              }"
            >
              <MediaContent :file="media" :resolution="240" />

              <div class="_optionBtns">
                <button
                  type="button"
                  v-if="duration > 1 || photoIsActive(media.$path)"
                  @click="show_duration_menu = !show_duration_menu"
                  class="u-button u-button_small u-button_bleumarine"
                  :title="$t('duration')"
                >
                  <b-icon icon="clock" />{{ duration }}
                </button>
                <ImageDurationPicker
                  v-if="show_duration_menu && photoIsActive(media.$path)"
                  :value="current_photo_duration"
                  :frame_rate="stopmotion_frame_rate"
                  @close="show_duration_menu = false"
                  @save="
                    updateMediaDurationForCurrentPreviousPhoto($event, index)
                  "
                />
                <template v-if="photoIsActive(media.$path)">
                  <RemoveMenu
                    ref="removeMediaMenu"
                    :modal_title="$t('remove_this_image')"
                    @remove="removeMedia(media.$path)"
                  >
                    <button
                      slot="trigger"
                      type="button"
                      class="u-button u-button_small u-button_red"
                      :title="$t('remove_this_image')"
                    >
                      <b-icon icon="trash" />
                    </button>
                  </RemoveMenu>
                  <button
                    type="button"
                    class="u-button u-button_small"
                    @click="show_options_menu = !show_options_menu"
                  >
                    <b-icon icon="three-dots" />
                  </button>
                  <BaseModal2
                    v-if="show_options_menu"
                    :title="$t('photo') + ' ' + (index + 1)"
                    @close="show_options_menu = false"
                  >
                    <MediaContent
                      class="_previewImage"
                      :file="media"
                      :resolution="1600"
                    />
                    <div class="u-spacingBottom" />
                    <div class="u-sameRow _options">
                      <DownloadFile :file="media">
                        <b-icon icon="file-earmark-arrow-down" />
                        {{ $t("download") }}
                        <template v-if="media.$infos?.size">
                          ({{ formatBytes(media.$infos.size) }})
                        </template>
                      </DownloadFile>
                    </div>

                    <div></div>

                    <template slot="footer">
                      <button
                        type="button"
                        class="u-button"
                        @click="show_options_menu = false"
                      >
                        <b-icon icon="x-circle" />
                        {{ $t("cancel") }}
                      </button>

                      <button
                        type="button"
                        class="u-button u-button_orange"
                        @click="saveToProject(media.$path)"
                      >
                        <span class="u-icon" v-html="dodoc_icon_collect" />
                        {{ $t("save_to_project") }}
                      </button>

                      <div v-if="status_saving_to_project" class="_saveNotice">
                        <div v-if="status_saving_to_project === 'saving'">
                          <LoaderSpinner />
                          {{ $t("saving") }}
                        </div>
                        <div v-else-if="status_saving_to_project === 'saved'">
                          {{ $t("media_was_saved_to_project") }}
                        </div>
                      </div>
                    </template>
                  </BaseModal2>
                </template>
              </div>
            </div>

            <!-- <div key="separator" class="_separator" /> -->

            <div
              class="m_stopmotionpanel--medias--list--items"
              :class="{ 'is--current_single': show_live_feed }"
              @click="showVideoFeed"
              :key="'live_feed'"
              :data-content="$t('live')"
            >
              <video
                ref="videoElement"
                autoplay
                playsinline
                muted
                :srcObject.prop="stream"
              />

              <div
                class="_onion_skin"
                :key="'_onion_skin'"
                v-if="show_live_feed"
              >
                <label class="">
                  <span>{{ $t("onion_skin").toLowerCase() }}</span>
                  <input
                    class="_onion_skin_range"
                    type="range"
                    min="0"
                    max=".9"
                    step="0.01"
                    :value="onion_skin_opacity"
                    @input="
                      $emit('update:onion_skin_opacity', +$event.target.value)
                    "
                    data-use="onionskin"
                  />
                </label>
              </div>
            </div>
          </transition-group>
        </div>
      </template>
      <div v-else class="m_stopmotionpanel--videopreview" ref="videoPreview">
        <PreviewStopmotion
          :medias="medias"
          :frame_rate.sync="frame_rate"
          :output_format.sync="output_format"
          :created_stopmotion="created_stopmotion"
        />
        <transition name="fade_fast" :duration="150" mode="out-in">
          <LoaderSpinner v-if="compilation_in_progress" />
        </transition>
      </div>

      <MediaValidationButtons
        v-if="validating_video_preview"
        :media_is_being_sent="media_is_being_sent"
        :can_add_to_fav="true"
        :cancelButtonIsBackButton="true"
        @cancel="backToStopmotion"
        @save="exportStopmotion()"
        @save_and_fav="exportStopmotion({ fav: true })"
      />

      <div class="_loader" v-if="media_is_being_sent">
        <LoaderSpinner />
      </div>
    </template>
  </div>
</template>
<script>
import MediaValidationButtons from "./MediaValidationButtons.vue";
import PreviewStopmotion from "./PreviewStopmotion.vue";
import ImageDurationPicker from "./ImageDurationPicker.vue";
import BaseModal2 from "../modals/BaseModal2.vue";

export default {
  props: {
    current_stopmotion_path: String,
    stream: MediaStream,
    show_live_feed: Boolean,
    is_validating_stopmotion_video: Boolean,
    onion_skin_opacity: Number,
    stopmotion_frame_rate: Number,
  },
  components: {
    MediaValidationButtons,
    PreviewStopmotion,
    ImageDurationPicker,
  },
  data() {
    return {
      stopmotion: null,

      fetch_stopmotion_error: undefined,

      show_options_menu: false,

      frame_rate: this.stopmotion_frame_rate,
      output_format: "mp4",
      validating_video_preview: false,
      previous_photo_to_show: false,
      media_is_being_sent: false,
      show_advanced_menu: false,

      compilation_in_progress: false,
      created_stopmotion: false,

      preview_playing_event: undefined,

      show_duration_menu: false,

      status_saving_to_project: false,
    };
  },

  created() {},
  async mounted() {
    this.$eventHub.$on("stopmotion.addImage", this.appendToStopMotion);
    this.$eventHub.$on("stopmotion.test", this.testStopmotion);
    this.$eventHub.$on("capture.navigate.next", this.nextImage);
    this.$eventHub.$on("capture.navigate.previous", this.prevImage);
    this.$eventHub.$on("capture.remove", this.openRemoveImageMenu);

    const stopmotion = await this.$api
      .getFolder({
        path: this.current_stopmotion_path,
      })
      .catch((err) => {
        this.fetch_stopmotion_error = err.response;
      });
    this.stopmotion = stopmotion;
    this.$api.join({ room: this.current_stopmotion_path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.current_stopmotion_path });
    this.$eventHub.$off("stopmotion.addImage", this.appendToStopMotion);
    this.$eventHub.$off("capture.navigate.next", this.nextImage);
    this.$eventHub.$off("capture.navigate.previous", this.prevImage);
    this.$eventHub.$off("capture.remove", this.openRemoveImageMenu);
  },

  watch: {
    frame_rate() {
      this.$emit("update:stopmotion_frame_rate", this.frame_rate);
    },
    stopmotion_frame_rate() {
      this.frame_rate = this.stopmotion_frame_rate;
    },
    medias() {
      if (this.medias.length > 0) {
        if (this.show_live_feed) {
          this.previous_photo_to_show =
            this.medias[this.medias.length - 1].media;
          this.$nextTick(() => {
            this.$nextTick(() => {
              this.$refs.mediaPreviews.$el.scrollLeft = 1000000;
            });
          });
        }
      }
    },
    stream: {
      handler() {
        // if (this.stream && this.$refs.videoElement) {
        //   if ("srcObject" in this.$refs.videoElement)
        //     this.$refs.videoElement.srcObject = this.stream;
        //   // Avoid using this in new browsers, as it is going away.
        //   else
        //     this.$refs.videoElement.src = window.URL.createObjectURL(
        //       this.stream
        //     );
        // }
      },
      immediate: true,
    },
    previous_photo_to_show() {
      this.$emit("showPreviousImage", this.previous_photo_to_show);

      this.$nextTick(() => {
        const active = document.querySelector(
          ".m_stopmotionpanel--medias--list--items.is--current_single"
        );
        if (active)
          active.scrollIntoView({
            behavior: "smooth",
            inline: "nearest",
          });
      });
    },
    validating_video_preview() {
      this.$emit(
        "update:is_validating_stopmotion_video",
        this.validating_video_preview
      );
    },
  },
  computed: {
    medias() {
      if (this.stopmotion?.images_list && this.stopmotion?.$files?.length > 0) {
        const medias = this.stopmotion.images_list.reduce((acc, il) => {
          const meta_filename = il.m || il;
          const duration = il.d ? Number(il.d) : 1;

          const media = this.stopmotion.$files.find((f) =>
            f.$path.endsWith(meta_filename)
          );
          if (media)
            acc.push({
              media,
              duration,
            });
          return acc;
        }, []);
        return medias;
      }
      return [];
    },
    images_list() {
      return this.medias.map((m) => {
        return {
          m: this.getFilename(m.media.$path),
          d: m.duration,
        };
      });
    },
    image_index_currently_shown() {
      if (!this.previous_photo_to_show) return false;
      return this.medias.findIndex(
        (m) => m.media.$path === this.previous_photo_to_show.$path
      );
    },
    current_photo_duration() {
      return this.medias.find(
        (m) => m.media.$path === this.previous_photo_to_show.$path
      )?.duration;
    },
  },
  methods: {
    openRemoveImageMenu() {
      if (this.$refs.removeMediaMenu?.[0])
        this.$refs.removeMediaMenu[0].show_confirm_delete = true;
    },
    async appendToStopMotion({ imageData }) {
      const additional_meta = {};
      additional_meta.$origin = "capture";
      const { meta_filename } = await this.$api
        .uploadFile({
          path: this.current_stopmotion_path,
          filename: +new Date() + ".jpeg",
          file: imageData,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      let images_list = this.images_list.slice();
      images_list.push({
        m: meta_filename,
        d: 1,
      });

      await this.$api.updateMeta({
        path: this.current_stopmotion_path,
        new_meta: {
          images_list,
        },
      });
    },
    previewPlay({ loop = false } = {}) {
      if (
        this.show_live_feed ||
        this.image_index_currently_shown === this.medias.length - 1
      )
        this.firstImage();

      const playPreview = (index) => {
        if (index > this.medias.length - 1) {
          if (loop) return playPreview(0);
          return this.pausePreview();
        }
        this.previous_photo_to_show = this.medias[index].media;
        const duration = this.medias[index].duration;
        this.preview_playing_event = window.setTimeout(
          () => playPreview(index + 1),
          (1000 / this.frame_rate) * duration
        );
      };
      playPreview(this.image_index_currently_shown);
    },
    pausePreview() {
      window.clearTimeout(this.preview_playing_event);
      this.preview_playing_event = undefined;
    },
    testStopmotion() {
      this.validating_video_preview = true;
      this.$nextTick(() => {
        this.$nextTick(() => {
          // strange bug where the window would scroll halfway up on click
          // this.$el.scrollIntoView({ behavior: "auto", block: "end" });
        });
      });
    },
    photoIsActive(path) {
      return (
        this.previous_photo_to_show?.$path === path && !this.show_live_feed
      );
    },
    showVideoFeed() {
      this.previous_photo_to_show = this.medias[this.medias.length - 1].media;
      this.$emit("update:show_live_feed", true);
    },
    firstImage() {
      this.previous_photo_to_show = this.medias[0].media;
      this.$emit("update:show_live_feed", false);
    },
    prevImage() {
      if (this.show_live_feed) {
        this.previous_photo_to_show = this.medias.at(-1).media;
        this.$emit("update:show_live_feed", false);
        return;
      }
      this.previous_photo_to_show =
        this.medias[this.image_index_currently_shown - 1].media;
    },
    nextImage() {
      if (this.image_index_currently_shown === this.medias.length - 1)
        return this.showVideoFeed();

      this.previous_photo_to_show =
        this.medias[this.image_index_currently_shown + 1].media;
    },
    lastImage() {
      this.showVideoFeed();
    },
    async updateMediaDurationForCurrentPreviousPhoto(duration) {
      const images_list = this.images_list.slice();
      images_list[this.image_index_currently_shown].d = duration;
      await this.$api.updateMeta({
        path: this.current_stopmotion_path,
        new_meta: { images_list },
      });
      this.show_duration_menu = false;
    },
    backToStopmotion() {
      console.log("METHODS • StopmotionPanel: backToStopmotion");
      this.validating_video_preview = false;
      this.created_stopmotion = false;
      this.$emit("update:show_live_feed", true);
    },
    async exportStopmotion({ fav = false } = {}) {
      this.compilation_in_progress = true;

      const additional_meta = {
        fav,
        $origin: "capture",
      };
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      const current_task_id = await this.$api.exportFolder({
        path: this.current_stopmotion_path,
        instructions: {
          recipe: "stopmotion",
          field: "images_list",
          frame_rate: this.frame_rate,
          output_format: this.output_format,
          additional_meta,
        },
      });

      this.$alertify.delay(4000).log(this.$t("compilation_started"));
      this.backToStopmotion();

      const checkIfEnded = ({ task_id, event, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);

        this.compilation_in_progress = false;

        if (event === "completed") {
          const meta_filename = this.getFilename(message.file?.$path);
          if (meta_filename) this.$emit("insertMedia", meta_filename);
          this.$emit("close");
          // works, but not that useful
          // this.created_stopmotion = this.getSourceMedia({
          //   source_media: {
          //     meta_filename_in_project: this.getFilename(message.path),
          //   },
          //   folder_path: this.current_stopmotion_path,
          // });
        } else {
          this.$alertify.delay(4000).error(message);
        }
      };
      this.$eventHub.$on("task.ended", checkIfEnded);

      // this.previous_photo_to_show = false;
      // this.validating_video_preview = false;
      // this.$nextTick(() => {
      //   this.$emit("close");
      // });
    },
    async saveToProject(path) {
      let { space_slug, project_slug } = this.decomposePath(path);
      const parent_project_path = this.createPath({
        space_slug,
        project_slug,
      });

      this.status_saving_to_project = "saving";

      const copy_file_meta = await this.$api
        .copyFile({
          path: path,
          path_to_destination_folder: parent_project_path,
          new_meta: {
            $origin: "capture",
          },
        })
        .catch((err_code) => {
          this.$alertify.delay(4000).error(err_code);
        });

      this.status_saving_to_project = "saved";

      setTimeout(() => {
        this.status_saving_to_project = false;
      }, 3000);
    },
    async removeMedia(path) {
      // remove from stopmotion list
      let images_list = this.images_list.slice();
      images_list = images_list.filter((i) => !path.endsWith(i.m));

      this.nextImage();

      await this.$api.updateMeta({
        path: this.current_stopmotion_path,
        new_meta: { images_list },
      });

      await this.$api.deleteItem({
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.m_stopmotionpanel {
  --img-width: 125px;

  position: relative;
  // height: 100%;
  display: flex;
  // .bg-noir;
  flex-flow: column nowrap;
  flex: 0 0 auto;

  &.is--showing_video_validation {
    flex-grow: 1;
  }

  > * {
    // transition: all 0.4s;
  }
}

.m_stopmotionpanel--toprowbuttons {
  position: relative;
  width: 100%;

  background-color: var(--c-noir);

  pointer-events: none;

  display: flex;
  justify-content: center;
  align-items: center;
  // padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);

  > * {
    pointer-events: auto;
    margin: calc(var(--spacing) / 4);
  }

  > .m_stopmotionpanel--toprowbuttons--counter {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) / 2);

    background-color: var(--c-noir);

    margin: 0;
    padding: 0;

    label {
      margin-bottom: 0;
    }
  }
}

.m_stopmotionpanel--medias {
  // .bg-noir;
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;

  // border-top: 2px solid black;
  background-color: black;
  padding: 1px;
  color: white;

  // max-height: 120px;
  // justify-content: flex-end;

  // .m_stopmotionpanel--medias--single {
  //   position: relative;
  //   flex: 1 1 auto;
  //   .bg-noir;

  //   .mediaContainer {
  //     position: absolute;
  //     height: 100%;
  //     width: 100%;
  //     img {
  //       height: 100%;
  //       width: 100%;
  //       margin: 0;
  //       object-fit: contain;
  //       object-position: center;
  //     }
  //   }

  //   .m_stopmotionpanel--medias--single--removeMedia {
  //     position: absolute;
  //     bottom: 0;right: 0;
  //   }
  // }

  .m_stopmotionpanel--medias--list {
    display: block;
    flex: 1 1 200px;
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;

    overflow-x: auto;
    overflow-y: hidden;

    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
    // .padding-verysmall;

    padding: 0;
    gap: 1px;
    // margin-bottom: calc(var(--spacing) / 8);

    // .margin-verysmall;
    scroll-behavior: smooth;

    // for some strange reason this prevents stopmotion thumbs
    // from showing in story publi
    // border-radius: 6px;

    // .custom_scrollbar(4px, 4px, 2px, rgba(255, 255, 255, 0), white);

    --c-thumbcolor: var(--c-noir);
    --scrollbar-height: 4px;
    --scrollbar-padding: 4px;
    --scrollbar-border: 4px;
    --c-barbgcolor: rgba(255, 255, 255, 0);
    --c-thumbcolor: white;

    &::-webkit-scrollbar {
      height: calc((var(--scrollbar-padding) * 2) + var(--scrollbar-height));
      width: calc((var(--scrollbar-padding) * 2) + var(--scrollbar-height));
      background-color: var(--c-barbgcolor);
    }

    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-thumb {
      border: var(--scrollbar-border) solid rgba(255, 255, 255, 0);
      border-radius: calc(var(--scrollbar-border) * 4);
      background-clip: padding-box;

      transition: all 0.4s;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--c-thumbcolor);
      &:hover {
        background-color: var(--c-gris);
        border: var(--scrollbar-border) solid rgba(255, 255, 255, 0);
      }
    }
  }

  counter-reset: compteListe;

  &::before,
  &::after {
    // content: '';
    // height: 100%;
    // padding-left: 2px;
  }

  .m_stopmotionpanel--medias--list--items {
    position: relative;
    // overflow: hidden;
    width: auto;
    flex: 0 0 auto;
    width: var(--img-width);
    height: auto;

    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &::before {
      counter-increment: compteListe 1;
      content: counter(compteListe) " ";
      position: absolute;
      left: 0;
      bottom: 0;
      padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4)
        calc(var(--spacing) / 16);
      margin: calc(var(--spacing) / 16);
      text-transform: uppercase;
      font-weight: 500;
      letter-spacing: 0.06em;
      font-size: var(--font-verysmall);
      // font-weight: 600;
      background-color: white;
      color: var(--c-noir);
      border-radius: 2px;
      line-height: 1;
      z-index: 1;
    }

    ::v-deep {
      img,
      video {
        position: relative;
        width: 100%;
        height: 100%;
        margin: 0;
        object-fit: contain;
      }
    }

    &:last-child {
      flex-basis: auto;
      // padding-right: 50px;
      width: auto;
      // border-radius: 4px;
      overflow: hidden;

      video {
        width: var(--img-width);
        height: auto;
      }
      &::before {
        content: attr(data-content);
        // .bg-bleuvert;
      }
      // &::after {
      //   content:'';
      //   display: block;
      //   width: 100px;
      //   height: 1px;
      // }
    }

    &.is--current_single::before {
      // .c-rouge;
      color: white;
      background-color: var(--c-rouge);
    }

    .mediaContainer {
      width: 100%;
      height: 100%;
      width: auto;
    }
  }
}

.m_stopmotionpanel--videopreview {
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;

  .mediaContainer {
    position: absolute;
    height: 100%;
    width: 100%;

    ::v-deep {
      > * {
        width: 100%;
        height: 100%;
      }

      video {
        height: 100%;
        width: 100%;
        background-color: var(--c-noir);
      }
    }
  }
}

.m_stopmotionpanel--buttons {
  flex: 0 0 auto;
  width: 100%;
  // min-height: 50px;
  color: var(--c-noir);

  > * {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
    padding: calc(var(--spacing) / 2);

    // .bg-noir;

    &:nth-child(1) {
    }
    &:nth-child(2) {
      border-top: 2px solid white;
      justify-content: center;
      background-color: var(--c-noir);
    }
  }

  label {
    // color: white;
  }
  input[type="number"] {
    width: 50px;
  }
}

._optionBtns {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: calc(var(--spacing) / 8);
  display: flex;
  gap: calc(var(--spacing) / 4);
  justify-content: space-between;
  align-items: flex-start;

  color: var(--c-noir);
}

.m_stopmotionpanel--loader {
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: fade(#fff, 90%);
  display: flex;
  justify-content: center;
  align-items: center;
}
._loader {
  background: rgba(0, 0, 0, 0.95);
  color: var(--color-capture);
}

._separator {
  position: relative;
  flex: 0 0 1px;
  height: 100%;
  z-index: -1;
  // background: var(--c-noir);
  // margin: calc(var(--spacing) / 4);
}

._onion_skin {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  backdrop-filter: blur(2px);
  background: rgba(0, 0, 0, 0.25);
  // background: rgba(255, 255, 255, 0.05);

  padding: calc(var(--spacing) / 4);
  text-align: center;

  font-variant: small-caps;

  input {
    width: 100%;
    margin: 0;
  }
}
._onion_skin_range {
  direction: rtl;
}
._saveNotice {
  position: absolute;
  inset: -2px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}
._options {
  justify-content: space-between;
}
._previewImage {
  // border-radius: 2px;
  // overflow: hidden;
}
</style>
