<template>
  <div class="m_faceMaskModule">
    <div class="m_faceMaskModule--inner" ref="fmInner" />
    <transition name="fade_fast">
      <div v-if="is_loading" class="m_faceMaskModule--curtain" />
    </transition>

    <!-- <div id="container">
      <video
        src="./video.mp4"
        id="video"
        controls
        muted
        loop
        autoplay
        style="position: absolute; opacity: 0"
      />
    </div> -->
    <!-- <pre>
      {{ media_images }}
    </pre> -->

    <div class="_navImageButton" v-if="!is_loading">
      <div class="_navImageButton--inner">
        <div class="flex-nowrap">
          <div class="_navImageButton--inner--audio" v-if="current_audio_src">
            <button type="button" class="play_picto" @click="playAudio">
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
                  v-if="!is_playing"
                  d="M53.2,138.4c-4.6,3-8.4,0.9-8.4-4.6V30.4c0-5.5,3.8-7.6,8.4-4.6l78.5,50.9c4.6,3,4.6,7.9,0,10.9L53.2,138.4z"
                />
                <template v-else>
                  <path
                    id="FOND_3_"
                    style="fill: #ffbe32"
                    d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84
			C168,37.6,130.4,0,84,0z"
                  />
                  <rect
                    id="CENTRE_3_"
                    x="35"
                    y="46.7"
                    style="fill: #ff3e51"
                    width="38"
                    height="76"
                  />
                  <rect
                    id="CENTRE_3_"
                    x="93"
                    y="46.7"
                    style="fill: #ff3e51"
                    width="38"
                    height="76"
                  />
                </template>
              </svg>
            </button>
            <audio ref="audioTrack">
              <source :src="current_audio_src" />
            </audio>
          </div>
          <div
            class="_navImageButton--inner--caption"
            v-if="media_images[curr_image].caption"
            v-html="media_images[curr_image].caption"
          />
        </div>

        <template v-if="play_masks_randomly">
          <button
            v-if="media_images.length > 1"
            type="button"
            class="button-greenthin"
            @click="pickRandomMask"
          >
            {{ $t("show_another_masks") }}
          </button>
        </template>
        <template v-else>
          <button type="button" @click="prevImage" :disabled="curr_image === 0">
            <svg
              class="inline-svg inline-svg_larger"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="70.8px"
              height="65px"
              viewBox="0 0 70.8 65"
              style="overflow: visible; enable-background: new 0 0 70.8 65"
              xml:space="preserve"
            >
              <path
                d="M41.9,10.8l-4.6,5c-2,2.1-3.8,3.8-5.5,5.1c-1.7,1.3-3.6,2.5-5.7,3.6h44.7v15.8H26c2.2,1.1,4.1,2.3,5.7,3.6
		c1.6,1.3,3.5,3,5.5,5.1l4.6,5L29.3,65L0,32.5L29.3,0L41.9,10.8z"
              />
            </svg>
          </button>
          <span class="font-small"
            >{{ $t("mask") }} {{ curr_image + 1 }}/{{
              media_images.length
            }}</span
          >
          <button
            type="button"
            @click="nextImage"
            :disabled="curr_image === media_images.length - 1"
          >
            <svg
              class="inline-svg inline-svg_larger"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="70.8px"
              height="65px"
              viewBox="0 0 70.8 65"
              style="overflow: visible; enable-background: new 0 0 70.8 65"
              xml:space="preserve"
            >
              <path
                d="M29,54.2l4.6-5c2-2.1,3.8-3.8,5.5-5.1c1.7-1.3,3.6-2.5,5.7-3.6L0,40.4l0-15.8l44.8,0c-2.2-1.1-4.1-2.3-5.7-3.6
		c-1.6-1.3-3.5-3-5.5-5.1l-4.6-5L41.5,0l29.3,32.5L41.5,65L29,54.2z"
              />
            </svg>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    images_and_audios: Array,
    play_masks_randomly: Boolean,
  },
  components: {},
  data() {
    return {
      is_loading: true,
      mindarThree: {},
      curr_image: 0,
      faceMesh: undefined,

      is_playing: false,
    };
  },
  created() {},
  mounted() {
    this.startFaceTracking();
  },
  beforeDestroy() {
    this.stopFaceTracking();
  },
  watch: {
    curr_image() {
      const curr_texture = new window.MINDAR.FACE.THREE.TextureLoader().load(
        this.media_images[this.curr_image].thumb
      );
      this.faceMesh.material.map = curr_texture;

      // this.stopFaceTracking();
      // this.startFaceTracking();
    },
  },
  computed: {
    current_audio_src() {
      const audio_src = this.media_images[this.curr_image].audio_src;
      if (audio_src) {
        if (this.is_playing)
          this.$nextTick(() => {
            this.$refs.audioTrack.play();
          });
        return audio_src;
      }
      return false;
    },
    media_images() {
      return this.images_and_audios.reduce((acc, { image, audio }) => {
        if (!image || !image._linked_media || !image._linked_media.thumbs)
          return acc;

        let result = {};

        function endsWithAny(suffixes, string) {
          return suffixes.some(function (suffix) {
            return string.endsWith(suffix);
          });
        }
        if (
          endsWithAny(
            [".gif", ".svg", ".png"],
            image._linked_media.media_filename.toLowerCase()
          )
        ) {
          result.thumb = `/${image._linked_media.slugProjectName}/${
            image._linked_media.media_filename
          }?v=${+this.$moment(image._linked_media.date_created)}`;
        } else {
          result.thumb =
            "/" + image._linked_media.thumbs.find((t) => t.size === 1600).path;
        }

        if (result.thumb) {
          if (audio) {
            result.audio_src = `/${audio._linked_media.slugProjectName}/${
              audio._linked_media.media_filename
            }?v=${+this.$moment(audio._linked_media.date_created)}`;
          }

          if (image._linked_media.caption)
            result.caption = image._linked_media.caption;

          acc.push(result);
        }
        return acc;
      }, []);
    },
  },
  methods: {
    startFaceTracking() {
      this.is_loading = true;
      const path_to_mindar =
        this.$root.state.mode === "export_publication"
          ? "./_libs/ar/mindar-face-three.prod.js"
          : "/libs/ar/mindar-face-three.prod.js";

      this.$loadScript(path_to_mindar).then(() => {
        if (this.$root.state.dev_mode === "debug")
          console.log(`FaceMaskModule: startFaceTracking / mindar has loaded`);

        if (!this.$refs.fmInner) {
          this.is_loading = true;
          return false;
        }

        this.mindarThree = new window.MINDAR.FACE.MindARThree({
          container: this.$refs.fmInner,
        });
        const { renderer, scene, camera } = this.mindarThree;

        const light = new window.MINDAR.FACE.THREE.HemisphereLight(
          0xffffff,
          0xbbbbff,
          1
        );
        scene.add(light);

        this.faceMesh = this.mindarThree.addFaceMesh();
        // const video = document.getElementById("video");
        // const texture = new THREE.VideoTexture(video);

        const curr_texture = new window.MINDAR.FACE.THREE.TextureLoader().load(
          this.media_images[this.curr_image].thumb
        );
        // "./video.mp4"
        // "/canonical_face_model_uv_visualization_bis.png"
        this.faceMesh.material.map = curr_texture;
        this.faceMesh.material.transparent = true;
        this.faceMesh.material.needsUpdate = true;
        scene.add(this.faceMesh);

        // this.mindarThree._resize = function () {};

        this.mindarThree.start().then(() => {
          this.is_loading = false;
          renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
          });
        });
      });
    },
    stopFaceTracking() {
      this.mindarThree.stop();
      return;
    },
    nextImage() {
      this.curr_image++;
    },
    prevImage() {
      this.curr_image--;
    },
    playAudio() {
      if (this.$refs.audioTrack.paused) {
        this.$refs.audioTrack.play();
      } else this.$refs.audioTrack.pause();

      this.is_playing = !this.$refs.audioTrack.paused;
    },
    pickRandomMask() {
      const pickRndInArr = () =>
        Math.floor(this.media_images.length * Math.random());

      let other_mask_index = pickRndInArr();
      while (other_mask_index === this.curr_image)
        other_mask_index = pickRndInArr();
      this.curr_image = other_mask_index;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_faceMaskModule {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  height: 100vh;
  height: -webkit-fill-available;

  position: absolute;
  overflow: hidden;
}
.m_faceMaskModule--inner {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  // background-color: rgba(0, 0, 0, 0.55);
}

.m_faceMaskModule--curtain {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 1);
}

._navImageButton {
  position: absolute;
  bottom: 0;
  width: calc(100% - var(--spacing) * 2);
  z-index: 5;
  pointer-events: none;
  display: flex;
  justify-content: center;
  margin: calc(var(--spacing) * 1);
}

._navImageButton--inner {
  border-radius: 6px;
  background: white;
  // background: var(--c-creme);
  pointer-events: auto;
  padding: calc(var(--spacing) / 4);

  text-align: center;

  .button-greenthin {
    margin: 0;
  }
}

._navImageButton--inner--audio {
  flex: 1 0 auto;

  .play_picto {
    padding: calc(var(--spacing) / 4);

    svg {
      width: 30px;
      height: 30px;
    }
  }
}
._navImageButton--inner--caption {
  padding: calc(var(--spacing) / 4);
  font-family: "Fira Mono";
  font-size: 10pt;
  // margin-top: 0.5em;
  white-space: pre-wrap;
}

> button {
}
</style>
<style lang="scss">
video {
  top: 0% !important;
  max-width: none;
}
</style>
