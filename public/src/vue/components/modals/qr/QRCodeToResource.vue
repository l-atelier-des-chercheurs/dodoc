<template>
  <div>
    <div class="hide_on_print padding-sides-small">
      <p>
        <small v-html="$t('toconnectwithanotherdevice')" />
      </p>
    </div>

    <div
      v-for="(ip, index) in $root.state.localNetworkInfos.ip"
      class="m_qrSnippet"
      :key="index"
    >
      <div class="m_qrSnippet--motif">
        <qrcode
          ref="qr_canvas"
          :value="getURLToApp(ip)"
          :options="{
            size: 400,
            foreground: '#333',
            background: 'transparent',
          }"
        ></qrcode>
      </div>
      <div class="m_qrSnippet--text">
        <a
          class="break-long-lines js--openInBrowser text-lc"
          :href="getURLToApp(ip)"
          target="_blank"
        >
          <!-- <template v-if="nameOfProject">
            • {{ nameOfProject }} •<br><br>
          </template>-->

          <div class="margin-bottom-small font-verysmall">
            {{ getURLToApp(ip) }}
          </div>
        </a>

        <div class="margin-bottom-small hide_on_print" v-if="media">
          <span class="switch switch-xs">
            <input
              type="checkbox"
              class="switch"
              id="open_in_dodoc"
              v-model="open_in_dodoc"
            />
            <label for="open_in_dodoc">{{ $t("open_in_dodoc") }}</label>
          </span>
        </div>

        <!-- <hr class="margin-vert-verysmall" /> -->

        <button
          type="button"
          class="buttonLink"
          @click="doCopy(ip)"
          :disabled="!can_copy_url"
        >
          {{ $t("copy") }}
        </button>

        <!-- <img
          class="m_qrSnippet--text--dodoclogo"
          :src="'/images/i_logo.svg'"
          draggable="false"
        /> -->
      </div>
    </div>
  </div>
</template>
<script>
import qrcode from "@xkeshi/vue-qrcode";

export default {
  props: {
    slugFolderName: String,
    media: Object,
    type: {
      type: String,
      default: "projects",
    },
  },
  components: {
    qrcode,
  },
  data() {
    return {
      open_in_dodoc: true,
      can_copy_url: true,
    };
  },
  created() {},
  mounted() {
    this.$root.updateNetworkInfos();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    nameOfProject() {
      if (
        !this.slugFolderName ||
        this.type !== "projects" ||
        !this.$root.store.projects[this.slugFolderName].hasOwnProperty("name")
      ) {
        return false;
      }
      return this.$root.store.projects[this.slugFolderName].name;
    },
  },
  methods: {
    getURLToApp(ip) {
      let url = new URL(window.location);

      function isIP(address) {
        const r = RegExp(
          "((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
        );
        return r.test(address);
      }

      // si on est en localhost (cas de electron et navigateur connecté à electron)
      // alors on remplace localhost par l’IP
      if (url.hostname === "localhost") {
        url.hostname = ip;
      }
      // si on est sur une ip (cas d’un hébergement en ligne, ou d’un navigateur connecté à electron)
      // alors on remplace par l’IP
      else if (isIP(url.hostname)) {
        url.hostname = ip;
      }
      // et si on est sur un nom de domaine alors on ne fait rien

      if (this.slugFolderName) {
        if (this.type === "projects") {
          url.pathname = this.slugFolderName;
        } else {
          url.pathname = "_" + this.type + "/" + this.slugFolderName;
        }

        if (this.media) {
          const urlSafe_metaFileName = this.media.metaFileName.replace(
            /\./g,
            "*"
          );
          url.pathname += `/media/${urlSafe_metaFileName}`;
          if (!this.open_in_dodoc) {
            url.search += `display=standalone`;
          }
        }
      }
      return url;
    },
    doCopy(ip) {
      this.$copyText(this.getURLToApp(ip)).then(
        (e) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(8000)
            .success(this.$t("notifications.copied_with_success"));

          this.can_copy_url = false;
          setTimeout(() => {
            this.can_copy_url = true;
          }, 1000);
        },
        (e) => {
          alert("Can not copy");
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.cant_copy") + "<br>" + e);
        }
      );
    },
  },
};
</script>
<style></style>
