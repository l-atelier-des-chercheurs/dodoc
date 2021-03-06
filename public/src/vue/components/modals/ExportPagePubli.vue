<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'EditMeta'"
  >
    <template slot="header">
      <span class>{{ $t("export_creation") }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <div class>
          <div class="margin-bottom-small">
            <div v-html="$t('get_pdf')" />
          </div>
          <div class="">
            <label>{{ $t("type") }}</label>

            <div class="">
              <label for="pdf">
                <div>
                  <input
                    type="radio"
                    id="pdf"
                    value="pdf"
                    v-model="export_type"
                  />
                  <span>
                    {{ $t("multipage_pdf") }}
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label for="png">
                <div>
                  <input
                    type="radio"
                    id="png"
                    value="png"
                    v-model="export_type"
                  />
                  <span> {{ $t("singlepage_image") }} </span>
                </div>
              </label>
            </div>
            <small>
              <template v-if="export_type === 'pdf'">
                {{ $t("multipage_pdf_instructions") }}
              </template>
              <template v-if="export_type === 'png'">
                {{ $t("singlepage_image_instructions") }}
              </template>
            </small>
          </div>

          <div
            v-if="export_type === 'png' && Array.isArray(publication.pages)"
            class="margin-bottom-small"
          >
            <label>{{ $t("page") }}</label>
            <input
              type="number"
              step="1"
              min="1"
              :max="publication.pages.length"
              v-model="pagenumber_to_export"
            />
          </div>

          <button
            type="button"
            class="margin-small margin-left-none bg-bleuvert c-blanc button-allwide"
            :disabled="doc_request_status !== false"
            @click="downloadDoc"
          >
            <template v-if="!doc_request_status">{{ $t("create") }}</template>
            <template v-else-if="doc_request_status === 'waiting_for_server'">
              <span class="loader loader-xs" />
              {{ $t("notifications.creation_in_progress") }}
            </template>
            <template v-else-if="doc_request_status === 'generated'">
              {{ $t("notifications.doc_created") }}
            </template>
          </button>

          <div v-if="doc_request_status === 'generated'">
            <a
              v-if="link_to_doc !== false"
              class="buttonLink margin-left-none"
              :href="link_to_doc"
              target="_blank"
              download
              >{{ $t("download") }}</a
            >
            <!-- <a 
              v-if="path_to_doc !== false && $root.state.is_electron"
              :href="path_to_doc" target="_blank" 
              class="buttonLink margin-left-none js--openInNativeApp"
            >
              {{ $t('open_in_app') }}
            </a>-->
            <template v-if="link_to_doc !== false">
              <!-- <img :src="link_to_doc" /> -->

              <a
                v-if="$root.state.is_electron"
                :href="link_to_doc"
                target="_blank"
                class="buttonLink margin-left-none"
                >{{ $t("open_in_app") }}</a
              >

              <AddCreationToProject
                :publication="publication"
                :media_filename="exported_doc_name"
                @close="$emit('close')"
              />
            </template>
          </div>
        </div>

        <hr />

        <div class>
          <div v-html="$t('get_website')" />
          <button
            type="button"
            class="margin-small margin-left-none bg-bleumarine c-blanc button-allwide"
            @click="downloadWeb"
            :disabled="web_export_started"
          >
            <template v-if="web_export_started">
              <span class="loader loader-xs" />
            </template>
            {{ $t("download_website") }}
          </button>
        </div>

        <hr />

        <div class>
          <div v-html="$t('get_a_link')" />
          <button
            type="button"
            class="margin-small margin-left-none bg-bleumarine c-blanc button-allwide"
            @click="getLink"
            v-if="!show_link_infos"
            :disabled="
              publication.hasOwnProperty('editing_limited_to') &&
              publication.editing_limited_to !== 'everybody' &&
              publication.hasOwnProperty('viewing_limited_to') &&
              publication.viewing_limited_to !== 'everybody'
            "
          >
            {{ $t("share") }}
          </button>

          <small
            v-if="
              publication.hasOwnProperty('viewing_limited_to') &&
              publication.viewing_limited_to !== 'everybody'
            "
            >{{ $t("set_visibility_to_everybody") }}</small
          >

          <QRCodeToResource
            v-if="show_link_infos"
            :type="'publications'"
            :slugFolderName="slugPubliName"
          />
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import { setTimeout } from "timers";
import AddCreationToProject from "../subcomponents/AddCreationToProject.vue";
import QRCodeToResource from "./qr/QRCodeToResource.vue";

export default {
  props: {
    publication: Object,
    slugPubliName: String,
  },
  components: {
    AddCreationToProject,
    QRCodeToResource,
  },
  data() {
    return {
      doc_request_status: false,
      link_to_doc: false,
      path_to_doc: false,
      web_export_started: false,
      exported_doc_name: "",
      show_link_infos: false,

      link_to_page_zip: false,

      export_type: "pdf",
      pagenumber_to_export: 1,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},

  watch: {
    export_type: function () {
      this.doc_request_status = false;
    },
    pagenumber_to_export: function () {
      this.doc_request_status = false;
    },
  },
  computed: {},
  methods: {
    downloadDoc() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • ExportPagePubli: downloadDoc`);
      }

      this.link_to_doc = false;
      this.path_to_doc = false;

      this.$eventHub.$on(
        "socketio.publication.pdfIsGenerated",
        this.publiIsGenerated
      );

      let options = {
        type: this.export_type,
      };

      if (options.type === "png") {
        options.page_to_export = this.pagenumber_to_export;
      }

      this.$socketio.downloadPubliPDF({
        slugPubliName: this.slugPubliName,
        options,
      });
      this.doc_request_status = "waiting_for_server";
    },
    publiIsGenerated({ pdfName, docPath, imageName }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: publiIsGenerated`);
      }
      this.$eventHub.$off(
        "socketio.publication.pdfIsGenerated",
        this.publiIsGenerated
      );

      this.doc_request_status = "generated";
      this.exported_doc_name = pdfName ? pdfName : imageName;
      this.link_to_doc =
        window.location.origin +
        "/_publications/print/doc/" +
        this.exported_doc_name;
    },
    downloadWeb() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: downloadWeb`);
      }
      this.web_export_started = true;
      setTimeout(() => {
        this.web_export_started = false;
      }, 2000);

      const query_url =
        window.location.origin +
        "/_publications/web/" +
        this.slugPubliName +
        `?socketid=${this.$root.$socketio.socket.id}`;

      if (this.$root.state.dev_mode === "debug")
        console.log(`Project • METHODS: downloadWeb with query ${query_url}`);

      window.open(query_url, "_blank");
    },
    getLink() {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • Publication: getLink`);
      }

      this.show_link_infos = true;
    },
  },
};
</script>
