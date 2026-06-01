<template>
  <BaseModal2
    :title="$t('embed')"
    :confirm_before_closing="full_url.length > 0"
    :is_loading="is_inserting_embed"
    @close="$emit('close')"
    @save="insertEmbed"
  >
    <div class="_linkPicker">
      <div class="_urlBox">
        <!-- <DLabel :str="$t('input_url')" :instructions="$t('input_url_instr')" /> -->
        <TextInput
          :label_str="$t('input_url')"
          :instructions="$t('input_url_instr')"
          :content.sync="full_url"
          :placeholder="'https://'"
          :required="true"
          :autofocus="true"
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
              {
                url: 'https://soundcloud.com/larieooo/doidoidoi',
                label: 'SoundCloud',
              },
              {
                url: 'https://scratch.mit.edu/projects/1061783643',
                label: 'Scratch',
              },
              {
                url: 'https://www.tinkercad.com/things/2FggyQfGlI3',
                label: 'Tinkercad',
              },
            ]"
            type="button"
            class="u-buttonLink"
            :class="{ 'is--active': full_url === url.url }"
            @click="full_url = url.url"
            :key="index"
            v-html="url.label"
          />
        </small>
      </div>

      <LoaderSpinner class="_loader" v-if="is_loading" />
      <div v-else-if="url_to_site" class="_previewEmbed" :key="url_to_site.src">
        <template v-if="url_to_site.type === 'any'">
          <iframe
            class="_siteIframe"
            :src="url_to_site.src"
            frameborder="0"
            @load="iframeLoaded"
            @error="iframeError"
          />
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
        @click="insertEmbed"
      >
        <b-icon icon="link" />
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
      is_loading: false,
      full_url: "",
      debounced_full_url: "",
      debounce_timeout: null,

      is_inserting_embed: false,
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {
    full_url(new_url) {
      if (this.debounce_timeout) clearTimeout(this.debounce_timeout);
      this.is_loading = true;
      this.debounce_timeout = setTimeout(() => {
        this.is_loading = false;
        this.debounced_full_url = new_url;
      }, 1000);
    },
  },
  computed: {
    url_to_site() {
      if (!this.debounced_full_url) return false;
      return this.transformURL({
        url: this.debounced_full_url,
        autoplay: false,
      });
    },
  },
  methods: {
    insertEmbed() {
      this.$emit("embed", this.full_url);
      this.is_inserting_embed = true;
    },
    iframeLoaded(arg) {},
    iframeError(arg) {},
  },
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
  display: block;
}

._examples {
  display: inline-flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
}

._loader {
  position: relative;
  margin-top: calc(var(--spacing) * 1);
}

._previewEmbed {
  position: relative;
  margin-top: calc(var(--spacing) * 1);
  border-radius: 2px;
  border: 2px solid var(--c-gris);
}
</style>
