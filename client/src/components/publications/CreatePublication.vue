<template>
  <BaseModal2 :title="$t('create_a_publication')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createPublication">
      <DLabel :str="$t('title')" />
      <TextInput
        :content.sync="new_publication_title"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="">
        <ToggleInput
          :content.sync="new_publication_is_private"
          :label="$t('private')"
          :options="{
            true: $t('private_status_explanations'),
            false: $t('public_status_explanations'),
          }"
        />
      </div>

      <br />

      <div class="_templates">
        <!-- <select v-model="new_publication_template">
          <option
            v-for="option in template_options"
            :key="option.key"
            :value="option.key"
            v-text="option.label"
            :disabled="option.disabled"
          />
        </select> -->
        <div
          class="_templates--item"
          v-for="template in template_options"
          :class="{
            'is--active': new_publication_template === template.key,
          }"
          :key="template.key"
        >
          {{ $t(template.label) }}
          <!-- <DLabel class="_label" :str="$t(template.label)" /> -->
          <div class="" v-html="template.icon" />
          <button
            type="submit"
            class="u-button u-button_bleuvert_fonce"
            name="action"
            :disabled="template.disabled === true"
            @click="new_publication_template = template.key"
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
              <polygon
                style="fill: white"
                points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
              />
            </svg>

            <span>
              {{ $t("create") }}
            </span>
          </button>
        </div>
      </div>

      <!-- <button
        class="u-button u-button_bleuvert"
        type="submit"
        slot="footer"
        :loading="is_creating_publication"
      >
        {{ $t("create_and_open") }}
      </button> -->

      <template v-if="error_msg">
        <br />
        <br />
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    project_path: String,
  },
  components: {},
  data() {
    return {
      new_publication_title: "",
      new_publication_is_private: true,
      new_publication_template: "page_by_page",

      is_creating_publication: false,

      allow_save: false,

      template_options: [
        {
          key: "page_by_page",
          label: this.$t("page_by_page"),
          icon: `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="201px"
        	 height="201px" viewBox="0 0 201 201" style="overflow:visible;enable-background:new 0 0 201 201;" xml:space="preserve">
          <g id="Calque_6" data-name="Calque 6">
            <g>
              <rect x="35.68" y="8.83" width="129.64" height="183.35" style="fill: #fff"/>
              <rect x="46.15" y="31.82" width="39.07" height="27.55" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.0944702326735385px"/>
              <rect x="118.95" y="68.62" width="35.9" height="53.44" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.9170289512680598px"/>
              <rect x="46.15" y="68.62" width="63.37" height="53.44" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
              <rect x="73.36" y="136.54" width="54.27" height="4.99" style="fill: #353535"/>
              <rect x="73.36" y="153.02" width="54.27" height="4.99" style="fill: #353535"/>
              <rect x="73.36" y="144.78" width="54.27" height="4.99" style="fill: #353535"/>
              <rect x="73.36" y="161.26" width="54.27" height="4.99" style="fill: #353535"/>
              <line x1="46.15" y1="22.57" x2="154.85" y2="22.57" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.8953584524134504px"/>
            </g>
          </g>
        </svg>
                  `,
        },
        {
          key: "story",
          label: this.$t("story"),
          icon: `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="201px"
        	 height="201px" viewBox="0 0 201 201" style="overflow:visible;enable-background:new 0 0 201 201;" xml:space="preserve">
        	<g id="Calque_6_2_">
        		<g>
        			<rect x="35.7" y="8.8" class="st1" width="129.6" height="183.4" style="fill: #fff;" />
        		</g>
        	</g>
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
          disabled: true,
          icon: `
                  `,
        },
      ],

      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createPublication() {
      this.is_creating_publication = true;

      let additional_meta = {
        title: this.new_publication_title,
        template: this.new_publication_template,
        requested_slug: this.new_publication_title,
        $status:
          this.new_publication_is_private === true ? "private" : "public",
        $admins: "everyone",
      };

      if (this.new_publication_template === "page_by_page") {
        additional_meta.layout_mode = "print";
        additional_meta.page_width = 210;
        additional_meta.page_height = 297;
        additional_meta.pages = [{ id: "first_page" }];
      }

      try {
        const new_folder_slug = await this.$api.createFolder({
          path: `${this.project_path}/publications`,
          additional_meta,
        });
        this.$emit("openPubli", new_folder_slug);
      } catch (err) {
        this.error_msg = "Error: " + err.message;
        setTimeout(() => {
          this.error_msg = "";
        }, 5000);
        this.is_creating_publication = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._templates {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 4);
  align-items: stretch;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}

._templates--item {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  text-align: center;
  align-items: center;

  background: var(--c-bleuvert);
  border-radius: 4px;
  padding: calc(var(--spacing) / 2);

  &.is--active {
    border: 2px solid white;
    outline: 2px solid var(--c-bleuvert_fonce);
  }
}
._label ::v-deep label {
  color: black !important;
}
</style>
