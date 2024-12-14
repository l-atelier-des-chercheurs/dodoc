<template>
  <BaseModal2 :title="$t('embed')" @close="$emit('close')">
    <div class="_linkPicker">
      <div class="_urlBox">
        <!-- <DLabel :str="$t('input_url')" :instructions="$t('input_url_instr')" /> -->
        <TextInput
          :label_str="$t('input_url')"
          :instructions="$t('input_url_instr')"
          :content.sync="full_url"
          :placeholder="'https://'"
          :required="true"
          :input_type="'url'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

        <!-- <input type="url" v-model="full_url" placeholder="https://" /> -->
      </div>

      <div class="u-instructions">
        <small class="_examples">
          {{ $t("for_example") }}
          <button
            v-for="(url, index) in [
              {
                url: 'https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde',
                label: 'PeerTube',
              },
              {
                url: 'https://www.youtube.com/watch?v=Bn6zdyCAwJs',
                label: 'Youtube',
              },
              {
                url: 'https://vimeo.com/447785086',
                label: 'Vimeo',
              },
              {
                url: 'https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas',
                label: 'Observable',
              },
            ]"
            type="button"
            class="u-buttonLink"
            @click="full_url = url.url"
            :key="index"
            v-html="url.label"
          />
        </small>
      </div>

      <div v-if="full_url" class="" :key="full_url">
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
    </div>
    <template slot="footer">
      <button type="button" class="u-button" @click="$emit('close')">
        <b-icon icon="x-circle" />
        {{ $t("cancel") }}
      </button>
      <button
        type="button"
        class="u-button u-button_bleuvert"
        :disabled="!full_url"
        @click="$emit('embed', full_url)"
      >
        {{ $t("embed") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      full_url: "",
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

iframe {
  width: 100%;
  aspect-ratio: 4/3;
}

._examples {
  display: inline-flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
}
</style>
