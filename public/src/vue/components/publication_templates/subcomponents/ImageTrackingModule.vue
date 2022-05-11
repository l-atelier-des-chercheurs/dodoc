<template>
  <portal to="modal_container">
    <div class="m_imageTrackingModule">
      <!-- currently_visible = {{ currently_visible }}<br />
      audio_to_play =
      {{ audio_to_play }}<br />
      <pre>slideshows = {{ slideshows }}</pre> -->
      <!-- {{ currently_visible[currently_active_target] }} -->
      <!-- is_loading = {{ is_loading }}<br />
      mind_file = {{ mind_file }} <br />
      currently_active_target = {{ currently_active_target }} <br />
      <pre>
        slideshows = {{ slideshows }}  
      </pre> -->

      <template v-if="!is_loading && mind_file">
        <a-scene
          :mindar-image="`imageTargetSrc: ${mind_file}; missTolerance: 2; warmupTolerance: 2; filterMinCF:0.02; filterBeta: 10;`"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          color-space="sRGB"
          renderer="colorManagement: true, physicallyCorrectLights"
          ref="a-scene"
        >
          <a-assets>
            <template v-for="({ visuals }, index) in slideshows">
              <template v-for="(media, _index) in visuals">
                <img
                  v-if="media.type === 'image'"
                  :key="`result-${index}+${_index}`"
                  :id="`result-${index}+${_index}`"
                  :src="media.src"
                />
                <video
                  v-if="media.type === 'video'"
                  :key="`result-${index}+${_index}`"
                  :id="`result-${index}+${_index}`"
                  :src="media.src"
                  preload="auto"
                  autoplay
                  loop="true"
                  muted
                />
              </template>
            </template>
          </a-assets>

          <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>

          <a-entity
            v-for="({ visuals }, index) in slideshows"
            :mindar-image-target="`targetIndex: ${index}`"
            :key="`result-${index}`"
          >
            <a-plane
              :src="`#result-${index}+${currently_visible[index]}`"
              :key="`#result-${index}+${currently_visible[index]}`"
              position="0 0 0"
              :height="visuals[currently_visible[index]].ratio"
              width="1"
              rotation="0 0 0"
            />
          </a-entity>
        </a-scene>

        <div class="_bottomRow">
          <template v-if="audio_to_play !== false">
            <audio ref="audioTrack">
              <source :src="audio_to_play" />
            </audio>
            <button type="button" @click="playAudio">
              <svg
                class
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="169px"
                height="169px"
                viewBox="0 0 169 169"
                style="enable-background: new 0 0 169 169"
                xml:space="preserve"
              >
                <path
                  d="M53.2,138.4c-4.6,3-8.4,0.9-8.4-4.6V30.4c0-5.5,3.8-7.6,8.4-4.6l78.5,50.9c4.6,3,4.6,7.9,0,10.9L53.2,138.4z"
                />
              </svg>
            </button>
          </template>

          <button
            type="button"
            class="_nextBtn"
            @click="nextItem"
            v-if="
              currently_active_target !== false &&
              slideshows[currently_active_target].visuals.length > 1
            "
          >
            {{ $t("next") }}
            <img src="/images/i_arrow_right.svg" draggable="false" />
          </button>
        </div>
      </template>
    </div>
  </portal>
</template>
<script>
export default {
  props: {
    ar_blocks: Array,
    mind: Object,
    slugPubliName: String,
  },
  components: {},
  data() {
    return {
      mindarThree: undefined,
      is_loading: true,
      currently_active_target: false,
      currently_visible: [],
      audio_to_play: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {
    this.mindarThree.stop();
    this.mindarThree.renderer.setAnimationLoop(null);
  },
  watch: {
    slideshows: {
      handler() {
        if (this.slideshows.length > 0) {
          this.slideshows.map((m) => this.currently_visible.push(0));
          this.initAR();
        }
      },
      immediate: true,
    },
  },
  computed: {
    mind_file() {
      if (!this.mind || !this.mind.media_filename) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.missing_mind_file"));
        return false;
      }

      return `/_publications/${this.slugPubliName}/${this.mind.media_filename}`;
    },
    slideshows() {
      return this.ar_blocks.reduce((acc, block, index) => {
        if (block.results && block.results.length > 0) {
          acc[index] = {
            visuals: [],
            audios: [],
          };

          block.results.map((media) => {
            if (media._linked_media) {
              let result = {};

              if (media._linked_media.type === "image") {
                result.src =
                  `/` +
                  media._linked_media.thumbs.find((t) => t.size === 1600).path;
              } else if (
                ["video", "audio"].includes(media._linked_media.type)
              ) {
                result.src = `/${media._linked_media.slugProjectName}/${
                  media._linked_media.media_filename
                }?v=${+this.$moment(media._linked_media.date_created)}`;
              }

              result.type = media._linked_media.type;

              result.ratio = this.$root.getFileMeta({
                type: "ratio",
                media: media,
              });
              result.ratio = result.ratio === false ? 1 : result.ratio;

              if (result.src) {
                if (["image", "video"].includes(result.type))
                  acc[index].visuals.push(result);
                else if (["audio"].includes(result.type))
                  acc[index].audios.push(result);
              }
            }
          });
        }
        return acc;
      }, []);
    },
  },
  methods: {
    initAR() {
      this.$loadScript(
        `https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.4/dist/mindar-image.prod.js`
      )
        .then(() =>
          this.$loadScript(`https://aframe.io/releases/1.2.0/aframe.min.js`)
        )
        .then(() =>
          this.$loadScript(
            `https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.1.4/dist/mindar-image-aframe.prod.js`
          )
        )
        .then(() => {
          if (this.$root.state.dev_mode === "debug")
            console.log(
              `ImageTrackingModule: startImageTracking / mindar has loaded`
            );

          this.is_loading = false;

          setTimeout(() => {
            if (!this.$refs[`a-scene`]) return false;
            this.$refs[`a-scene`]
              .querySelectorAll("a-entity")
              .forEach((target, index) => {
                target.addEventListener("targetFound", (event) => {
                  this.currently_active_target = index;
                  this.startAudioFile();
                });
                target.addEventListener("targetLost", (event) => {
                  if (this.currently_active_target === index)
                    this.currently_active_target = false;
                });
              });
          }, 500);

          // const THREE = window.MINDAR.IMAGE.THREE;
          // this.mindarThree = new window.MINDAR.IMAGE.MindARThree({
          //   container: this.$refs.imInner,
          //   imageTargetSrc: this.mind_and_results[0].mind,
          // });
          // const { renderer, scene, camera } = this.mindarThree;
          // const anchor = this.mindarThree.addAnchor(0);
          // const geometry = new THREE.PlaneGeometry(1, 0.55);
          // const material = new THREE.MeshBasicMaterial({
          //   color: 0x00ffff,
          //   transparent: true,
          //   opacity: 0.5,
          // });
          // const plane = new THREE.Mesh(geometry, material);
          // anchor.group.add(plane);
          // // const start = async () => {
          // this.mindarThree.start().then(() =>
          //   renderer.setAnimationLoop(() => {
          //     renderer.render(scene, camera);
          //   })
          // );
        });
    },
    startAudioFile() {
      if (this.slideshows[this.currently_active_target].audios.length > 0) {
        const audio_media =
          this.slideshows[this.currently_active_target].audios[0];
        this.audio_to_play = audio_media.src;
      }
    },
    playAudio() {
      if (this.$refs.audioTrack.paused) this.$refs.audioTrack.play();
      else this.$refs.audioTrack.pause();
    },
    nextItem() {
      if (this.currently_active_target === false) return false;

      const current_slideshow =
        this.slideshows[this.currently_active_target].visuals;
      const visible_media_index =
        this.currently_visible[this.currently_active_target];
      const new_media_index =
        (visible_media_index + 1) % current_slideshow.length;

      this.$set(
        this.currently_visible,
        this.currently_active_target,
        new_media_index
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.m_imageTrackingModule {
  overflow: hidden;
  position: absolute;
  width: 100vw;
  height: 100vh;
  height: -webkit-fill-available;

  top: 0;
}
._refImg {
  position: absolute;

  width: 50px;
}

._nextBtn {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  // position: absolute;
  // top: 0;
}

._bottomRow {
  position: fixed;
  bottom: 0;
  z-index: 100;
  width: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;

  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 2);
}
</style>
