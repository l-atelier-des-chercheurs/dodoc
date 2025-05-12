<template>
  <BaseModal2
    :title="modal_title || $t('share_link_to_page')"
    @close="$emit('close')"
  >
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <div class="_txt" v-else>
      <slot />

      <DetailsPane
        :header="$t('advanced_options')"
        :icon="'link'"
        :is_open_initially="false"
        v-if="!urls_to_page.domain"
      >
        <RadioCheckboxInput
          :value.sync="current_opt"
          :options="network_options"
          :can_edit="true"
        />
      </DetailsPane>

      <!-- <hr class="_hr" /> -->

      <transition name="pagechange" mode="out-in">
        <div class="_qrAndLinks" :key="current_opt">
          <template v-if="!qr_urls">
            <template v-if="current_opt === 'domain'">
              {{ $t("no_domain_set") }}
            </template>
            <template v-else-if="current_opt === 'local_network'">
              {{ $t("no_local_network_set") }}
            </template>
          </template>
          <template v-else>
            <QRCodeWithLink
              v-for="qr_url of qr_urls"
              :key="qr_url"
              :url="qr_url"
            />
          </template>
        </div>
      </transition>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    url_to_access: String,
    modal_title: String,
  },
  components: {
    QRCodeWithLink: () => import("@/adc-core/ui/QRCodeWithLink.vue"),
  },
  data() {
    return {
      network_infos: undefined,
      current_opt: this.$root.app_infos.is_electron ? "local" : "domain",
      is_loading: true,
    };
  },
  async created() {
    this.network_infos = await this.$api.getLocalNetworkInfos();
    this.is_loading = false;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    urls_to_page: {
      handler() {
        if (this.urls_to_page.domain) this.current_opt = "domain";
        else if (this.urls_to_page.local_network)
          this.current_opt = "local_network";
        else this.current_opt = "local";
      },
      deep: true,
    },
  },
  computed: {
    urls_to_page() {
      let current_url = new URL(this.url_to_access.trim());

      let _urls_to_page = {};

      // this.network_infos.local_ips;

      // si localhost + pas d'autre IP dispo, renvoyer uniquement l'url locale

      if (current_url.hostname === "localhost") {
        _urls_to_page.local = [current_url.href];
      } else if (this.isIP(current_url.hostname)) {
        // _urls_to_page.local_network = current_url;
      } else {
        _urls_to_page.domain = [current_url.href];
        return _urls_to_page;
      }

      if (this.network_infos?.local_ips.length > 0) {
        _urls_to_page.local_network = [];
        this.network_infos.local_ips.map((ip) => {
          let url = new URL(this.url_to_access);
          url.hostname = ip;
          _urls_to_page.local_network.push(url.href);
        });
      }

      return _urls_to_page;
    },
    qr_urls() {
      return this.urls_to_page[this.current_opt];
    },
    canvas_dataurl() {
      this.qr_url;
      if (this.$refs.qrCode) return this.$refs.qrCode.toDataURL();
      return false;
    },

    network_options() {
      let options = [];
      if (this.urls_to_page["domain"]?.length > 0) {
        options.push({
          key: "domain",
          label: this.$t("domain"),
          instructions: this.$t("domain_instr"),
        });
      }

      if (this.urls_to_page["local_network"]?.length > 0) {
        options.push({
          key: "local_network",
          label: this.$t("local_network"),
          instructions: this.$t("local_network_instr"),
        });
      }

      if (this.urls_to_page["local"]?.length > 0) {
        options.push({
          key: "local",
          label: this.$t("local_machine"),
          instructions: this.$t("local_machine_instr"),
        });
      }

      return options;
    },

    // dodoc 9 code
    // url_to_page() {
    //   let url = new URL(this.url_to_access);
    //   function isIP(address) {
    //     const r = RegExp(
    //       "((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
    //     );
    //     return r.test(address);
    //   }
    //   // si on est en localhost (cas de electron et navigateur connecté à electron)
    //   // alors on remplace localhost par l’IP
    //   if (url.hostname === "localhost") {
    //     url.hostname = ip;
    //   }
    //   // si on est sur une ip (cas d’un hébergement en ligne, ou d’un navigateur connecté à electron)
    //   // alors on remplace par l’IP
    //   else if (isIP(url.hostname)) {
    //     url.hostname = ip;
    //   }
    //   // et si on est sur un nom de domaine alors on ne fait rien
    //   if (this.slugFolderName) {
    //     if (this.type === "projects") {
    //       url.pathname = this.slugFolderName;
    //     } else {
    //       url.pathname = "_" + this.type + "/" + this.slugFolderName;
    //     }
    //     if (this.media) {
    //       const urlSafe_metaFileName = this.media.metaFileName.replace(
    //         /\./g,
    //         "*"
    //       );
    //       url.pathname += `/media/${urlSafe_metaFileName}`;
    //       if (!this.open_in_dodoc) {
    //         url.search += `display=standalone`;
    //       }
    //     }
    //   }
    //   return url;
    // },
  },
  methods: {
    isIP(address) {
      const r = RegExp(
        "((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
      );
      return r.test(address);
    },
  },
};
</script>
<style lang="scss" scoped>
._hr {
  margin: calc(var(--spacing) / 1) auto;
}

._txt {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
}

._qrAndLinks {
}
</style>
