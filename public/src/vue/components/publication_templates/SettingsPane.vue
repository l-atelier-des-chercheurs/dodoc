<template>
  <div class="_settings_pane">
    <nav class="_settings_pane--tabs">
      <div class="tab">
        <input type="radio" id="header" value="header" v-model="active_tab" />
        <label for="header">{{ $t("header") }}</label>
      </div>

      <div class="tab">
        <input type="radio" id="sizes" value="sizes" v-model="active_tab" />
        <label for="sizes">{{ $t("sizes_and_margins") }}</label>
      </div>
    </nav>

    <div v-if="active_tab === 'header'" class="_settings_pane--content">
      <div class="margin-bottom-small">
        <label>{{ $t("header_left") }}</label>
        <input
          class="input-large"
          type="text"
          v-model="new_header_left"
          @change="updatePublicationOption($event, 'header_left')"
          :readonly="read_only"
        />
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t("header_right") }}</label>
        <input
          class="input-large"
          type="text"
          v-model="new_header_right"
          @change="updatePublicationOption($event, 'header_right')"
          :readonly="read_only"
        />
      </div>

      <hr />

      <div class="margin-bottom-small">
        <label for="show_page_number">{{ $t("show_page_numbers") }}</label>
        <input
          id="show_page_number"
          type="checkbox"
          v-model="new_show_page_number"
          @change="
            updatePublicationOption(new_show_page_number, 'show_page_number')
          "
        />
      </div>
    </div>

    <div v-if="active_tab === 'sizes'" class="_settings_pane--content">
      <div class="margin-bottom-small">
        <label>{{ $t("format") }}</label>

        <select name="format" v-model="page_format" id="format">
          <option value="custom">
            {{ $t("custom") }}
          </option>
          <option value="A4_portrait">
            A4 {{ $t("image_ratio_portrait") }}
          </option>
          <option value="A4_landscape">
            A4 {{ $t("image_ratio_landscape") }}
          </option>
          <option value="A5_portrait">
            A5 {{ $t("image_ratio_portrait") }}
          </option>
          <option value="A5_landscape">
            A5 {{ $t("image_ratio_landscape") }}
          </option>
        </select>
      </div>
      <hr />

      <div class="margin-bottom-small">
        <label>{{ $t("width") }}(mm)</label>
        <input
          type="number"
          min="1"
          max="1000"
          step="1"
          v-model="new_width"
          @input="updatePublicationOption($event, 'width')"
        />
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t("height") }}(mm)</label>
        <input
          type="number"
          min="1"
          max="1000"
          step="1"
          v-model="new_height"
          @input="updatePublicationOption($event, 'height')"
        />
      </div>

      <div class="margin-bottom-small">
        <label>{{ $t("gridstep") }}(mm)</label>
        <input
          type="number"
          min="1"
          max="100"
          step="1"
          v-model="new_gridstep"
          @input="updatePublicationOption($event, 'gridstep')"
        />
        <span class="switch switch-xs">
          <input
            type="checkbox"
            class="switch"
            id="favFilter"
            v-model="new_snap_to_grid"
            @change="updatePublicationOption(new_snap_to_grid, 'snap_to_grid')"
            :readonly="read_only"
          />
          <label for="favFilter">{{ $t("snap_to_grid") }}</label>
        </span>
      </div>

      <hr />

      <div class="margin-bottom-small">
        <label>{{ $t("margin_top") }}(mm)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          v-model="new_margin_top"
          @input="updatePublicationOption($event, 'margin_top')"
        />
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t("margin_bottom") }}(mm)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          v-model="new_margin_bottom"
          @input="updatePublicationOption($event, 'margin_bottom')"
        />
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t("margin_left") }}(mm)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          v-model="new_margin_left"
          @input="updatePublicationOption($event, 'margin_left')"
        />
      </div>
      <div class="margin-bottom-small">
        <label>{{ $t("margin_right") }}(mm)</label>
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          v-model="new_margin_right"
          @input="updatePublicationOption($event, 'margin_right')"
        />
      </div>

      <hr />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    slugPubliName: String,
    publication: Object,
    publications_options: Object
  },
  components: {},
  data() {
    return {
      new_width: 0,
      new_height: 0,
      new_template: "",
      new_style: "",
      new_gridstep: 0,
      new_snap_to_grid: false,
      new_margin_left: 0,
      new_margin_top: 0,
      new_margin_right: 0,
      new_margin_bottom: 0,
      new_header_left: "",
      new_header_right: "",
      new_show_page_number: false,

      active_tab: "header"
    };
  },
  created() {},
  mounted() {
    this.updatePubliOptionsInFields();
  },
  beforeDestroy() {},
  watch: {
    publications_options: {
      handler() {
        if (this.$root.state.dev_mode === "debug") {
          console.log(`WATCH • Publication: publications_options`);
        }
        this.updatePubliOptionsInFields();
        document.getElementsByTagName("body")[0].style = `
          --page-width: ${this.publications_options.width}mm;
          --page-height: ${this.publications_options.height}mm
        `;
      },
      deep: true
    }
  },
  computed: {
    page_format: {
      get: function() {
        if (this.new_width === 210 && this.new_height === 297)
          return "A4_portrait";
        else if (this.new_width === 297 && this.new_height === 210)
          return "A4_landscape";
        else if (this.new_width === 148 && this.new_height === 210)
          return "A5_portrait";
        else if (this.new_width === 210 && this.new_height === 148)
          return "A5_landscape";
        else return "custom";
      },
      set: function(val) {
        if (val === "A4_portrait") {
          this.setPropVal({ width: 210, height: 297 });
        } else if (val === "A4_landscape") {
          this.setPropVal({ width: 297, height: 210 });
        } else if (val === "A5_portrait") {
          this.setPropVal({ width: 148, height: 210 });
        } else if (val === "A5_landscape") {
          this.setPropVal({ width: 210, height: 148 });
        }
        // } else if (val === "custom") return "custom";
      }
    }
  },
  methods: {
    updatePubliOptionsInFields() {
      this.new_width = this.publications_options.width;
      this.new_height = this.publications_options.height;

      this.new_template = this.publication.template;
      this.new_style = this.publications_options.style;

      this.new_gridstep = this.publications_options.gridstep;
      this.new_snap_to_grid = this.publications_options.snap_to_grid;
      this.new_margin_left = this.publications_options.margin_left;
      this.new_margin_right = this.publications_options.margin_right;
      this.new_margin_top = this.publications_options.margin_top;
      this.new_margin_bottom = this.publications_options.margin_bottom;
      this.new_header_left = this.publications_options.header_left;
      this.new_header_right = this.publications_options.header_right;
      this.new_show_page_number = this.publications_options.show_page_number;
    },
    updatePublicationOption(event, type) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • Publication: updatePublicationOption with type = ${type} and value = ${event}`
        );
      }

      let val = "";
      if (typeof event === "object") {
        val = event.target.value;
      } else {
        val = event;
      }

      this.setPropVal({
        [type]: val
      });
    },
    setPropVal(data) {
      this.$root.editFolder({
        type: "publications",
        slugFolderName: this.slugPubliName,
        data
      });
    },
    handleClick(newTab) {
      this.currentTab = newTab;
    }
  }
};
</script>
//
<style lang="scss" scoped>
// .tabs {
//   position: relative;
//   margin: 0 auto;

//   &__active-line {
//     position: absolute;
//     bottom: 0;
//     left: 0;
//     height: 2px;
//     background-color: black;
//     transition: transform 0.4s ease, width 0.4s ease;
//   }

//   &__item {
//     display: inline-block;
//     margin: 0 5px;
//     padding: 10px;
//     padding-bottom: 8px;
//     font-size: 16px;
//     letter-spacing: 0.8px;
//     color: gray;
//     text-decoration: none;
//     border: none;
//     background-color: transparent;
//     border-bottom: 2px solid transparent;
//     cursor: pointer;
//     transition: all 0.25s;

//     &_active {
//       color: black;
//     }

//     &:hover {
//       border-bottom: 2px solid gray;
//       color: black;
//     }

//     &:focus {
//       outline: none;
//       border-bottom: 2px solid gray;
//       color: black;
//     }

//     &:first-child {
//       margin-left: 0;
//     }

//     &:last-child {
//       margin-right: 0;
//     }
//   }
// }
//
</style>
