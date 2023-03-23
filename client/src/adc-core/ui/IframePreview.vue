<template>
  <div class="_iframePreview">
    <small v-if="!transformed_url.type">{{ $t("nothing_to_show") }}</small>
    <iframe
      v-else-if="transformed_url.type === 'peertube'"
      :src="transformed_url.src"
      allowfullscreen=""
      sandbox="allow-same-origin allow-scripts allow-popups"
      frameborder="0"
    />

    <vue-plyr v-else-if="transformed_url.type === 'youtube'">
      <div class="plyr__video-embed">
        <iframe :src="transformed_url.src" allowfullscreen allowtransparency />
      </div>
    </vue-plyr>
    <!-- <iframe
      v-else-if="transformed_url.type === 'youtube'"
      :src="transformed_url.src"
      allowfullscreen=""
      allow="accelerometer; clipboard-write; encrypted-media;"
      frameborder="0"
    /> -->
    <iframe
      v-else
      :src="transformed_url.src"
      allowfullscreen=""
      frameborder="0"
    />

    <!-- peertube -->
    <!-- 
        <iframe
        title="Les Blagues de Tonton 06 avec Artus"
        src="https://peertube.fr/videos/embed/3b09ef10-3f7b-447c-9f2b-4d3bccf11c17"
        allowfullscreen=""
        sandbox="allow-same-origin allow-scripts allow-popups"
        width="560"
        height="315"
        frameborder="0"
      /> -->

    <!-- youtube -->
    <!-- 
        <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/OAxqOR6VRLk"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      /> -->
  </div>
</template>
<script>
export default {
  props: {
    full_url: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    transformed_url() {
      function addhttp(url) {
        if (!/^(?:f|ht)tps?:\/\//.test(url)) {
          url = "http://" + url;
        }
        return url;
      }
      const cleaned_up_url = addhttp(this.full_url);
      function urlContains(url, strings) {
        return strings.some((s) => url.includes(s));
      }

      if (urlContains(cleaned_up_url, ["peertube.fr"]))
        return {
          type: "peertube",
          src: this.getPeertubeEmbedFromUrl(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["youtube.com", "youtu.be"]))
        return {
          type: "youtube",
          src: this.getYoutubeEmbedURLFromURL(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["vimeo.com"]))
        return {
          type: "vimeo",
          src: this.getVimeoEmbedURLFromURL(cleaned_up_url),
        };
      else if (urlContains(cleaned_up_url, ["soundcloud.com"]))
        return {
          type: "soundcloud",
          src: this.getSoundcloudEmbedURLFromURL(this.media.content),
        };

      return {
        type: "any",
        src: cleaned_up_url,
      };
    },
  },
  methods: {
    getPeertubeEmbedFromUrl(url) {
      const video_id = url.split("/").at(-1);
      return "https://peertube.fr/videos/embed/" + video_id;
    },
    getTweetIdFromURL(url) {
      let tweetRegex =
        /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/([0-9]{19})/;
      return url.match(tweetRegex)[3];
    },
    getYoutubeEmbedURLFromURL(url) {
      function getId(url) {
        const regExp =
          /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      }
      const videoId = getId(url);
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&iv_load_policy=3&modestbranding=1&playsinline=1&showinfo=0&rel=0&enablejsapi=1`;
    },
    getVimeoEmbedURLFromURL(url) {
      function getId(url) {
        const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
        const match = url.match(regExp);
        return match ? match[1] : null;
      }
      const videoId = getId(url);
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    },
    getSoundcloudEmbedURLFromURL(url) {
      return `https://w.soundcloud.com/player/?url=${url}&color=0066cc`;
    },
  },
};
</script>
<style lang="scss" scoped>
._iframePreview iframe {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--c-gris);

  background: var(--c-gris_clair);
}
</style>
