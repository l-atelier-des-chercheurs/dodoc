<template>
  <div class="_publicationsList">
    <div class="u-sameRow _topBtn">
      <DLabel :str="$t('publications')" :tag="'h2'" />
      <button
        type="button"
        class="u-button u-button_bleuvert"
        v-if="can_edit"
        @click="show_create_publication = true"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 168 168"
          style="enable-background: new 0 0 168 168"
          xml:space="preserve"
        >
          <path
            style="fill: var(--color-publish)"
            d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
          />
          <polygon
            style="fill: #ffffff"
            points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
          />
        </svg>
        &nbsp;
        {{ $t("create") }}
      </button>
    </div>
    <CreatePublication
      v-if="show_create_publication"
      :project_path="project.$path"
      :template_options="template_options"
      @close="show_create_publication = false"
      @openPubli="$emit('togglePubli', $event)"
    />
    <br />

    <div class="_publications">
      <div
        v-if="sorted_publications.length === 0"
        class="u-instructions"
        :key="'nopublis'"
      >
        {{ $t("no_publications") }}
      </div>
      <PinnedNonpinnedFolder
        v-else
        :field_name="'publications_pinned'"
        :label="$t('publications_pinned')"
        :content="project.publications_pinned"
        :path="project.$path"
        :folders="sorted_publications"
        :can_edit="can_edit_project"
        v-slot="slotProps"
      >
        <PublicationPreview
          :publication="slotProps.item"
          :template_options="template_options"
          :can_edit="can_edit"
          @open="openEntry(slotProps.item.$path)"
        />
      </PinnedNonpinnedFolder>

      <template v-if="can_edit">
        <button
          type="button"
          class="u-buttonLink"
          @click="show_bin_modal = true"
        >
          <b-icon icon="recycle" />
          {{ $t("bin") }}
        </button>
        <BinFolder
          v-if="show_bin_modal"
          :modal_title="$t('restore_publications')"
          :path="project.$path"
          :subfolders_type="'publications'"
          @close="show_bin_modal = false"
        />
      </template>
    </div>
  </div>
</template>
<script>
import CreatePublication from "@/components/publications/CreatePublication.vue";
import PublicationPreview from "@/components/publications/PublicationPreview.vue";
import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";
import BinFolder from "@/adc-core/fields/BinFolder.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    CreatePublication,
    PublicationPreview,
    PinnedNonpinnedFolder,
    BinFolder,
  },
  data() {
    return {
      path: `${this.project.$path}/publications`,
      show_create_publication: false,
      publications: [],
      show_bin_modal: false,
      template_options: [
        {
          key: "page_by_page",
          label: this.$t("page_by_page"),
          icon: `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="201px" height="201px" viewBox="0 0 201 201" style="overflow:visible;enable-background:new 0 0 201 201;" xml:space="preserve">
          <rect x="35.68" y="8.83" width="129.64" height="183.35" style="fill: #fff"/>
          <rect x="46.15" y="31.82" width="39.07" height="27.55" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.0944702326735385px"/>
          <rect x="118.95" y="68.62" width="35.9" height="53.44" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.9170289512680598px"/>
          <rect x="46.15" y="68.62" width="63.37" height="53.44" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
          <rect x="73.36" y="136.54" width="54.27" height="4.99" style="fill: #353535"/>
          <rect x="73.36" y="153.02" width="54.27" height="4.99" style="fill: #353535"/>
          <rect x="73.36" y="144.78" width="54.27" height="4.99" style="fill: #353535"/>
          <rect x="73.36" y="161.26" width="54.27" height="4.99" style="fill: #353535"/>
          <line x1="46.15" y1="22.57" x2="154.85" y2="22.57" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8953584524134504px"/>
        </svg>
        `,
        },
        {
          key: "story_with_sections",
          label: this.$t("story_with_sections"),
          icon: `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="201px" height="201px" viewBox="0 0 201 201" style="overflow:visible;enable-background:new 0 0 201 201;" xml:space="preserve">
            <rect x="35.7" y="8.8" class="st1" width="129.6" height="183.4" style="fill: #fff;" />
            <rect x="64.9" y="46.8" width="71.2" height="53.6" style="fill:none;stroke:#353535;stroke-width:1.917;stroke-miterlimit:10;" />
            <rect x="64.9" y="145.2" width="71.2" height="39.8" style="fill:none;stroke:#353535;stroke-width:1.917;stroke-miterlimit:10;" />
            <rect x="65" y="108" width="71.1" height="5" style="fill:#353535;" />
            <rect x="65" y="124.5" class="st3" width="71.1" height="5"  style="fill:#353535;"/>
            <rect x="65" y="116.2" class="st3" width="71.1" height="5" style="fill:#353535;"/>
            <rect x="65" y="132.7" class="st3" width="71.1" height="5" style="fill:#353535;"/>
            <rect x="64.9" y="25.9" class="st3" width="71.1" height="5" style="fill:#353535;"/>
            <rect x="64.9" y="17.6" class="st3" width="71.1" height="5" style="fill:#353535;"/>
            <rect x="64.9" y="34.1" class="st3" width="71.1" height="5" style="fill:#353535;"/>
          </svg>
          `,
        },
        {
          key: "cartography",
          label: this.$t("cartography"),
          icon: `
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" style="overflow:visible;enable-background:new 0 0 101 101;" xml:space="preserve">
            <path fill="white" fill-rule="evenodd" clip-rule="evenodd" d="M79.257,21.725c2.267,3.934,3.667,8.167,4.2,12.7  c0.567,4.767,0.133,9.583-1.3,14.45c-1.767,5.967-4.6,12.167-8.5,18.6c-5.133,8.5-11.35,16.7-18.65,24.601  c-1.7,1.833-3.367,2.75-5,2.75c-1.6,0-3.25-0.917-4.95-2.75c-5.434-5.967-10.05-11.667-13.85-17.101  c-4.433-6.366-8.05-12.75-10.85-19.149c-2.8-6.5-4.15-12.567-4.05-18.2c0.133-8.133,3-15.316,8.6-21.55  c3.8-4.233,8.183-7.267,13.15-9.101c0.4-0.166,0.816-0.316,1.25-0.449c6.7-1.801,13.767-1.801,21.2,0  c3.667,1.166,7.05,2.967,10.15,5.399C74.157,14.625,77.024,17.892,79.257,21.725z M50.107,16.075c-6.2,0-11.517,2.183-15.95,6.55  c-4.4,4.367-6.6,9.633-6.6,15.8c-0.033,6.2,2.133,11.517,6.5,15.95c4.367,4.4,9.633,6.617,15.8,6.65  c6.233,0.033,11.567-2.134,16-6.5c4.4-4.4,6.617-9.717,6.65-15.95c0-6.2-2.183-11.5-6.55-15.9  C61.557,18.309,56.274,16.108,50.107,16.075z M57.907,46.525c-2.233,2.199-4.9,3.283-8,3.25c-3.034,0-5.65-1.101-7.85-3.301  c-2.167-2.199-3.25-4.833-3.25-7.899c0-3.101,1.1-5.75,3.3-7.95c2.2-2.2,4.85-3.3,7.95-3.3c3.066,0,5.7,1.1,7.9,3.3  c2.2,2.233,3.3,4.9,3.3,8C61.224,41.725,60.107,44.358,57.907,46.525z"/>
          </svg>
          `,
        },
        {
          key: "edition",
          label: this.$t("edition"),
          icon: `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="201px" height="201px" viewBox="0 0 201 201" style="overflow:visible;enable-background:new 0 0 201 201;" xml:space="preserve">
          <!-- Top Left Page -->
          <rect x="15" y="8.83" width="80" height="90" style="fill: #fff"/>
          <rect x="20" y="20" width="25" height="15" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="20" y="40" width="70" height="25" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="25" y="70" width="60" height="3" style="fill: #353535"/>
          <rect x="25" y="77" width="60" height="3" style="fill: #353535"/>
          <rect x="25" y="84" width="60" height="3" style="fill: #353535"/>
          <line x1="20" y1="15" x2="90" y2="15" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8px"/>

          <!-- Top Right Page -->
          <rect x="105" y="8.83" width="80" height="90" style="fill: #fff"/>
          <rect x="110" y="20" width="25" height="15" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="110" y="40" width="70" height="25" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="115" y="70" width="60" height="3" style="fill: #353535"/>
          <rect x="115" y="77" width="60" height="3" style="fill: #353535"/>
          <rect x="115" y="84" width="60" height="3" style="fill: #353535"/>
          <line x1="110" y1="15" x2="180" y2="15" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8px"/>

          <!-- Bottom Left Page -->
          <rect x="15" y="108.83" width="80" height="90" style="fill: #fff"/>
          <rect x="20" y="120" width="25" height="15" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="20" y="140" width="70" height="25" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="25" y="170" width="60" height="3" style="fill: #353535"/>
          <rect x="25" y="177" width="60" height="3" style="fill: #353535"/>
          <rect x="25" y="184" width="60" height="3" style="fill: #353535"/>
          <line x1="20" y1="115" x2="90" y2="115" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8px"/>

          <!-- Bottom Right Page -->
          <rect x="105" y="108.83" width="80" height="90" style="fill: #fff"/>
          <rect x="110" y="120" width="25" height="15" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="110" y="140" width="70" height="25" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2px"/>
          <rect x="115" y="170" width="60" height="3" style="fill: #353535"/>
          <rect x="115" y="177" width="60" height="3" style="fill: #353535"/>
          <rect x="115" y="184" width="60" height="3" style="fill: #353535"/>
          <line x1="110" y1="115" x2="180" y2="115" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8px"/>
        </svg>
          `,
        },
        // {
        //   key: "face_masks",
        //   label: this.$t("face_masks") + " (EXPERIMENTAL)",
        //   disabled: true,
        //   icon: `
        //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
        //     <rect x="67" y="67" width="67" height="67" style="fill: #fff"/>
        //   </svg>
        //       `,
        // },
        // {
        //   key: "image_tracking",
        //   label: this.$t("image_tracking") + " (EXPERIMENTAL)",
        //   disabled: true,
        //   icon: `
        //   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
        //     <rect x="67" y="67" width="67" height="67" style="fill: #fff"/>
        //   </svg>
        //       `,
        // },
        // {
        //   key: "carreau",
        //   summary: "carreau_summary",
        //   show_instructions: false,
        //   instructions: "carreau_instructions",
        //   show_all_recipes: false,
        //   icon: `

        //   `
        // }
      ],
    };
  },
  created() {},
  async mounted() {
    this.publications = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    sorted_publications() {
      return this.publications
        .slice()
        .filter((f) => {
          if (this.can_edit) return true;
          if (f.$status !== "invisible" && f.$status !== "private") return true;
          return false;
        })
        .sort(
          (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
        );
    },
    can_edit_project() {
      return this.canLoggedinEditFolder({ folder: this.project.$path });
    },
  },
  methods: {
    openEntry(path) {
      const publication_slug = path.split("/").at(-1);
      this.$emit("togglePubli", publication_slug);
    },
    closeEntry() {
      this.$emit("togglePubli", false);
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationsList {
  --item-width: 140px;
  --item-gap: calc(var(--spacing) * 2);

  width: 100%;
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;
  padding-top: calc(var(--spacing) * 1);
}

._topBtn {
  margin-top: calc(var(--spacing) * 1);
}
</style>
