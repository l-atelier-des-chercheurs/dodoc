<template>
  <div class="m_faceMaskModule">
    <div class="m_faceMaskModule--inner" ref="fmInner" :key="curr_image" />
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

    <div class="_navImageButton" v-if="!is_loading">
      <div class="_navImageButton--inner">
        {{ media_images }}
        <div
          class="_navImageButton--inner--caption"
          v-if="media_images[curr_image].caption"
          v-html="media_images[curr_image].caption"
        />
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
    medias: Array,
    play_masks_randomly: Boolean,
  },
  components: {},
  data() {
    return {
      is_loading: true,
      mindarThree: {},
      curr_image: 0,

      curr_texture: undefined,
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
      this.stopFaceTracking();
      this.startFaceTracking();
    },
  },
  computed: {
    media_images() {
      return this.medias.reduce((acc, m) => {
        if (!m._linked_media || !m._linked_media.thumbs) return acc;

        function endsWithAny(suffixes, string) {
          return suffixes.some(function (suffix) {
            return string.endsWith(suffix);
          });
        }
        let thumb;

        if (
          endsWithAny(
            [".gif", ".svg", ".png"],
            m._linked_media.media_filename.toLowerCase()
          )
        ) {
          thumb = `${m._linked_media.slugProjectName}/${
            m._linked_media.media_filename
          }?v=${+this.$moment(m._linked_media.date_created)}`;
        } else {
          thumb = m._linked_media.thumbs.find((t) => t.size === 1600).path;
        }
        if (thumb)
          acc.push({
            thumb,
            caption: m._linked_media.caption ? m._linked_media.caption : "",
          });
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

        const THREE = window.MINDAR.FACE.THREE;
        this.mindarThree = new window.MINDAR.FACE.MindARThree({
          container: this.$refs.fmInner,
        });
        const { renderer, scene, camera } = this.mindarThree;

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        const faceMesh = this.mindarThree.addFaceMesh();

        // const video = document.getElementById("video");
        // const texture = new THREE.VideoTexture(video);

        this.curr_texture = new THREE.TextureLoader().load(
          "/" + this.media_images[this.curr_image].thumb
        );
        // "./video.mp4"
        // "/canonical_face_model_uv_visualization_bis.png"
        faceMesh.material.map = this.curr_texture;
        faceMesh.material.transparent = true;
        faceMesh.material.needsUpdate = true;
        scene.add(faceMesh);

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
  position: absolute;
  overflow: hidden;
}
.m_faceMaskModule--inner {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.55);
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
  width: 100%;
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
