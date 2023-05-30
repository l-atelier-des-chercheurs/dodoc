<template>
  <BaseModal2 @close="$emit('close')">
    <div class="_linkPicker">
      <div class="_urlBox">
        <DLabel :str="$t('input_url')" :instructions="$t('input_url_instr')" />
        <input type="url" v-model="full_url" placeholder="https://" />
      </div>

      <div class="u-instructions">
        PeerTube, YouTube, Vimeo, etc.
        {{ $t("for_example") }}&nbsp;
        <button
          v-for="(url, index) in [
            'https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde',
            'https://www.youtube.com/watch?v=Bn6zdyCAwJs',
            'https://vimeo.com/447785086',
            'https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas',
          ]"
          type="button"
          class="u-buttonLink"
          @click="full_url = url"
          :key="index"
          v-html="url"
        />
      </div>

      <br />
      <div class="" :key="full_url">
        <template v-if="url_to_site.type === 'any'">
          <iframe class="_siteIframe" :src="url_to_site.src" frameborder="0" />
        </template>
        <vue-plyr v-else>
          <div class="plyr__video-embed">
            <iframe
              :src="url_to_site.src"
              allowfullscreen
              allowtransparency
              allow="autoplay; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups"
              frameborder="0"
            />
          </div>
        </vue-plyr>
      </div>

      <br />

      <div class="_selectBtn" v-if="full_url">
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="$emit('embed', full_url)"
        >
          {{ $t("embed") }}
        </button>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    publication_path: String,
  },
  components: {},
  data() {
    return {
      full_url: "https://",
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    url_to_site() {
      if (!this.full_url) return false;
      return this.transformURL({ url: this.full_url, autoplay: false });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._linkPicker {
  width: 100%;
  // background: var(--c-gris_clair);
  margin: 0 auto;
}
._urlBox {
  // margin-bottom: calc(var(--spacing) * 1);
}

._addMediaBtn {
  text-align: center;
  padding: calc(var(--spacing) * 1);
}

._selectBtn {
  display: flex;
  place-items: center;
  justify-content: center;
  width: 100%;
  gap: calc(var(--spacing) / 1);

  background: white;
}

iframe {
  width: 100%;
  aspect-ratio: 4/3;
}
</style>
