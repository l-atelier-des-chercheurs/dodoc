<template>
  <div class="_makePane">
    <div class="_makePane--content">
      <div v-if="!opened_make_slug">
        <RadioSwitch
          v-if="can_edit"
          :content.sync="current_view"
          :options="[
            {
              label: $t('create'),
              value: 'create',
            },
            {
              label: $t('existing'),
              value: 'existing',
            },
          ]"
        />

        <div class="u-spacingBottom" />

        <section v-if="current_view === 'create'">
          <div class="m_recipes--type--grid">
            <div
              v-for="recipe in recipes"
              :key="recipe.key"
              class="u-card2 m_recipe"
            >
              <div class="m_recipe--icon" v-html="recipe.icon" />

              <div class="m_recipe--text">
                <h2 class>{{ $t(recipe.key) }}</h2>

                <p class="margin-vert-small">
                  <span
                    v-html="$t(recipe.summary)"
                    class="margin-vert-verysmall"
                  />
                  <br />
                </p>

                <button
                  v-if="recipe.instructions"
                  type="button"
                  class="u-buttonLink"
                  :class="{
                    'is--active': recipe.show_instructions,
                  }"
                  @click="recipe.show_instructions = !recipe.show_instructions"
                >
                  {{ $t("more_informations") }}
                </button>

                <template v-if="recipe.show_instructions">
                  <p>
                    <span v-html="$t(recipe.instructions)" />
                  </p>
                </template>
              </div>
              <div class="m_recipe--buttons">
                <button
                  class="u-button u-button_bleumarine"
                  type="button"
                  @click="createMake(recipe.key)"
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

                  <span>{{ $t("create") }}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section v-else-if="current_view === 'existing'">
          <MakesList
            :project_path="project.$path"
            :can_edit="can_edit"
            @open="openMake"
          />
        </section>
      </div>
      <div v-else>
        <MakeOpen
          :project_path="project.$path"
          :make_slug="opened_make_slug"
          :can_edit="can_edit"
          @remove="removeMake"
          @close="$emit('update:opened_make_slug', false)"
        />
      </div>
    </div>
  </div>
</template>
<script>
import MakesList from "@/components/makes/MakesList.vue";
import MakeOpen from "@/components/makes/MakeOpen.vue";

export default {
  props: {
    can_edit: Boolean,
    opened_make_slug: String,
    project: Object,
  },
  components: {
    MakesList,
    MakeOpen,
  },
  data() {
    return {
      current_view: "create",

      recipes: [
        {
          key: "video_assemblage",
          summary: "video_assemblage_summary",
          show_instructions: false,
          instructions: "video_assemblage_instructions",

          icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
                  <g id="Calque_6" data-name="Calque 6">
                    <g>
                      <g>
                        <rect x="68.73" y="12.93" width="63.54" height="72" style="fill: #fff"/>
                        <rect x="73.23" y="17.52" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
                        <rect x="72.36" y="66.15" width="31.66" height="4.99" style="fill: #353535"/>
                        <rect x="72.36" y="73.43" width="23.67" height="4.99" style="fill: #353535"/>
                        <path d="M94.24,47.59c-.7.45-1.28.14-1.28-.69V31.19c0-.83.58-1.14,1.28-.69l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
                      </g>
                      <g>
                        <rect x="68.73" y="114.16" width="63.54" height="72" style="fill: #fff"/>
                        <rect x="73.23" y="118.76" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
                        <rect x="72.36" y="167.38" width="31.66" height="4.99" style="fill: #353535"/>
                        <rect x="72.36" y="174.66" width="23.67" height="4.99" style="fill: #353535"/>
                        <path d="M94.24,148.82c-.7.46-1.28.14-1.28-.69v-15.7c0-.84.58-1.15,1.28-.7l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
                      </g>
                      <path d="M101.87,98.27h4.24v2.54h-4.24v4.33H99.11v-4.33H94.89V98.27h4.22V94h2.76Z" style="fill: #fff"/>
                    </g>
                  </g>
                </svg>
              `,
        },
        {
          key: "video_effects",
          summary: "video_effects_summary",
          show_instructions: false,

          instructions: "video_effects_instructions",

          icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
                  <g id="Calque_6" data-name="Calque 6">
                    <rect y="0.53" width="201" height="201" style="fill: none"/>
                    <g>
                      <g>
                        <rect x="107.44" y="30.53" width="63.54" height="72" style="fill: #fff"/>
                        <rect x="111.93" y="35.12" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121px"/>
                        <rect x="111.07" y="83.75" width="31.66" height="4.99" style="fill: #353535"/>
                        <rect x="111.07" y="91.03" width="23.67" height="4.99" style="fill: #353535"/>
                        <path d="M132.94,65.19c-.7.45-1.27.14-1.27-.69V48.79c0-.83.57-1.14,1.27-.69l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
                      </g>
                      <g>
                        <path d="M79.06,120.65,66.93,132.77,27.07,172.64l5.46,5.46,52-52Z"/>
                        <path d="M79.15,116.75a1.29,1.29,0,0,0,1.29-1.28v-9a1.29,1.29,0,0,0-2.58,0v9A1.29,1.29,0,0,0,79.15,116.75Z"/>
                        <path d="M79.15,134.8a1.29,1.29,0,0,0-1.29,1.29v9a1.29,1.29,0,1,0,2.58,0v-9A1.29,1.29,0,0,0,79.15,134.8Z"/>
                        <path d="M98.48,124.49h-9a1.29,1.29,0,0,0,0,2.58h9a1.29,1.29,0,0,0,0-2.58Z"/>
                        <path d="M59.81,127.07h9a1.29,1.29,0,0,0,0-2.58h-9a1.29,1.29,0,0,0,0,2.58Z"/>
                        <path d="M86.88,119.33a1.35,1.35,0,0,0,.92-.37l6.38-6.38a1.29,1.29,0,1,0-1.82-1.82L86,117.14a1.28,1.28,0,0,0,.9,2.19Z"/>
                        <path d="M87.8,132.59A1.29,1.29,0,0,0,86,134.41l6.38,6.38a1.26,1.26,0,0,0,.91.38,1.31,1.31,0,0,0,.92-.38,1.29,1.29,0,0,0,0-1.82Z"/>
                        <path d="M70.51,119a1.26,1.26,0,0,0,.92.37,1.34,1.34,0,0,0,.91-.37,1.27,1.27,0,0,0,0-1.82L66,110.76a1.28,1.28,0,0,0-1.81,1.82Z"/>
                      </g>
                    </g>
                    <rect x="23.93" y="153.7" width="52.51" height="2.57" transform="translate(-94.89 80.88) rotate(-45)" style="fill: #fff"/>
                    <rect x="68.62" y="128.62" width="13.29" height="2.57" transform="translate(-69.81 91.27) rotate(-45)" style="fill: #fff"/>
                    <rect width="201" height="201" style="fill: none"/>
                  </g>
                </svg>
              `,
        },
        {
          key: "stopmotion_animation",
          summary: "stopmotion_animation_summary",
          show_instructions: false,
          instructions: "stopmotion_animation_instructions",

          icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
                  <g id="Calque_6" data-name="Calque 6">
                    <g>
                      <g>
                        <g>
                          <g>
                            <rect x="25.5" y="9.92" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="29.04" y="13.24" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(46.15 33.42)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">1</text>
                        </g>
                        <g>
                          <g>
                            <rect x="75.5" y="9.92" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="79.04" y="13.24" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(96.15 33.42)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">2</text>
                        </g>
                        <g>
                          <g>
                            <rect x="125.5" y="9.92" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="129.04" y="13.24" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(146.15 33.42)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">3</text>
                        </g>
                      </g>
                      <g>
                        <g>
                          <g>
                            <rect x="25.5" y="77.48" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="29.04" y="80.81" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(46.15 100.99)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">5</text>
                        </g>
                        <g>
                          <g>
                            <rect x="75.5" y="77.48" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="79.04" y="80.81" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(96.15 100.99)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">6</text>
                        </g>
                        <g>
                          <g>
                            <rect x="125.5" y="77.48" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="129.04" y="80.81" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(146.15 100.99)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">7</text>
                        </g>
                      </g>
                      <g>
                        <g>
                          <g>
                            <rect x="25.5" y="145.05" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="29.04" y="148.38" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(46.15 168.55)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">9</text>
                        </g>
                        <g>
                          <g>
                            <rect x="75.5" y="145.05" width="50" height="46.04" style="fill: #fff"/>
                            <rect x="79.04" y="148.38" width="42.45" height="31.19" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 1.6319287679171661px"/>
                          </g>
                          <text transform="translate(91.81 168.55)" style="font-size: 14.490870475769043px;font-family: FiraCode-Medium, Fira Code;font-weight: 500">10</text>
                        </g>
                      </g>
                    </g>
                  </g>
                </svg>
          `,
        },
        {
          key: "mix_audio_and_video",
          summary: "mix_audio_and_video_summary",
          show_instructions: false,

          instructions: "mix_audio_and_video_instructions",

          icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
                  <g id="Calque_6" data-name="Calque 6">
                    <g>
                      <g>
                        <rect x="68.88" y="30.28" width="63.54" height="72" style="fill: #fff"/>
                        <rect x="73.38" y="34.87" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
                        <rect x="72.52" y="83.5" width="31.66" height="4.99" style="fill: #353535"/>
                        <rect x="72.52" y="90.78" width="23.67" height="4.99" style="fill: #353535"/>
                        <path d="M94.39,64.94c-.7.45-1.28.14-1.28-.69V48.54c0-.83.58-1.14,1.28-.69l11.92,7.72a.91.91,0,0,1,0,1.65Z" style="fill: #353535"/>
                      </g>
                      <g>
                        <rect x="68.58" y="134.72" width="63.54" height="36" style="fill: #fff"/>
                        <rect x="72.21" y="153.34" width="31.66" height="4.99" style="fill: #353535"/>
                        <rect x="72.21" y="160.62" width="23.67" height="4.99" style="fill: #353535"/>
                        <g>
                          <line x1="73.38" y1="143.52" x2="127.32" y2="143.52" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.161211202864444px"/>
                          <g>
                            <path d="M94.69,151c-.28.18-.51.06-.51-.28V137c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: #353535"/>
                            <path d="M94.69,151c-.28.18-.51.06-.51-.28V137c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
                          </g>
                          <circle cx="74.38" cy="143.52" r="2.58" style="fill: #353535"/>
                          <circle cx="126.32" cy="143.52" r="2.58" style="fill: #353535"/>
                        </g>
                      </g>
                      <path d="M102,117.63h4.24v2.54H102v4.32H99.27v-4.32H95v-2.54h4.23V113.3H102Z" style="fill: #fff"/>
                    </g>
                  </g>
                </svg>
              `,
        },
        {
          key: "mix_audio_and_image",
          summary: "mix_audio_and_image_summary",
          show_instructions: false,

          instructions: "mix_audio_and_image_instructions",

          icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 201 201">
                  <g id="Calque_6" data-name="Calque 6">
                    <g>
                      <g>
                        <rect x="68.88" y="30.28" width="63.54" height="62" style="fill: #fff"/>
                        <rect x="73.38" y="34.87" width="53.94" height="43.04" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121120286444px"/>
                      </g>
                      <g>
                        <rect x="68.58" y="124.72" width="63.54" height="36" style="fill: #fff"/>
                        <rect x="72.21" y="143.34" width="31.66" height="4.99" style="fill: #353535"/>
                        <rect x="72.21" y="150.62" width="23.67" height="4.99" style="fill: #353535"/>
                        <g>
                          <line x1="73.38" y1="133.52" x2="127.32" y2="133.52" style="fill: none;stroke: #353535;stroke-miterlimit: 10;stroke-width: 2.16121120286444px"/>
                          <g>
                            <path d="M94.69,141c-.28.18-.51.06-.51-.28V127c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: #353535"/>
                            <path d="M94.69,141c-.28.18-.51.06-.51-.28V127c0-.34.23-.46.51-.28l10.56,6.84a.36.36,0,0,1,0,.66Z" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
                          </g>
                          <circle cx="74.38" cy="133.52" r="2.58" style="fill: #353535"/>
                          <circle cx="126.32" cy="133.52" r="2.58" style="fill: #353535"/>
                        </g>
                      </g>
                      <path d="M102,107.63h4.24v2.54H102v4.32H99.27v-4.32H95v-2.54h4.23V103.3H102Z" style="fill: #fff"/>
                    </g>
                  </g>
                </svg>
              `,
        },
        {
          key: "qr_code",
          summary: "qr_code_summary",
          show_instructions: false,

          icon: `
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-8 -8 32 32"
            >
              <rect x="-2" y="-2" width="20" height="20" fill="white"></rect>
              <path d="M2 2h2v2H2V2Z"></path>
              <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"></path>
              <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"></path>
              <path
                d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"
              ></path>
              <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"></path>
            </svg>
          `,
        },
      ],
    };
  },
  created() {
    this.$eventHub.$on("make.open", this.openMake);
  },
  mounted() {},
  beforeDestroy() {
    this.$eventHub.$off("make.open", this.openMake);
  },
  watch: {},
  computed: {},
  methods: {
    async createMake(type) {
      const rnd_suffix = (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 2 + 3);
      const title = this.$t(type) + " - " + rnd_suffix;
      const new_folder_slug = await this.$api.createFolder({
        path: `${this.project.$path}/makes`,
        additional_meta: {
          type,
          title,
          requested_slug: title,
          $admins: "parent_contributors",
        },
      });

      // const path = `${this.project.$path}/makes/${new_folder_slug}`;
      this.openMake(new_folder_slug);
    },
    openMake(new_folder_slug) {
      this.$emit("update:opened_make_slug", new_folder_slug);
    },
    removeMake(path) {
      path;
    },
  },
};
</script>
<style lang="scss" scoped>
._makePane {
  background: var(--color-make);
  height: 100%;
  overflow: auto;
  // --active-color: var(--c-bleumarine);
}
._makePane--content {
  width: 100%;
  margin: 0 auto;
  padding: calc(var(--spacing) * 1);
  padding-bottom: calc(var(--spacing) * 10);
}

.m_recipes--type {
  // background-color: rgba(51, 51, 51, 0.2);
  // border-radius: 8px;
  margin-bottom: calc(var(--spacing) * 1);

  > label {
    // .padding-vert-verysmall;
  }
}

.m_recipes--type--grid {
  // .padding-left-small;
  // border-left: ~"calc(var(--spacing) * .2)" solid white;
  // padding-left: ~"calc(var(--spacing) * .3)";
  // background-color: rgba(255, 255, 255, 0.1);

  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 2);
  align-items: stretch;
}

.m_recipe {
  // background: var(--c-bleumarine);
  border-radius: 8px;
  background: white;
  padding: calc(var(--spacing) / 2);
  border-radius: 10px;

  > *:not(:last-child) {
    margin-bottom: calc(var(--spacing) / 2);
  }
}

.m_recipe--icon {
  border-radius: 6px;
  background: var(--c-bleumarine);
  flex: 0 1 160px;
  min-width: 120px;
  height: 160px;
  // .margin-top-small;
  margin: 0;
  padding: 0;
  // .padding-top-small;
  // align-self: center;
  // .bg-bleuvert_fonce;
  // .bg-blanc;
  // border: 2px solid white;

  ::v-deep svg {
    width: 100%;
    max-width: 160px;
    margin: 0 auto;
  }
}

.m_recipe--text {
  flex-basis: 50%;
  max-width: 44ch;

  color: black;

  h2 {
    // font-family: "Fira Code";
    // margin: 0;
  }

  p {
    line-height: 1.4;
  }

  hr {
    border: none;
    border-top: 2px solid black;
    width: 1em;
  }
}
.m_recipe--buttons {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;

  > button {
    &:last-child {
      // justify-self: flex-end;
    }
  }
}

.u-buttonLink {
  &.is--active {
    color: var(--c-bleumarine);
  }
}
</style>
