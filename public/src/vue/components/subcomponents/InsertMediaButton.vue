<template>
  <div class="m_insertMediaButton" :class="{ 'is--open': show_menu }">
    <button
      type="button"
      class="m_insertMediaButton--toggleButton"
      :class="{ 'is--active': show_menu }"
      @click="show_menu = !show_menu"
      :content="$t('insert_medias_here')"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0],
      }"
    ></button>

    <transition name="fade_fast" :duration="150">
      <div class="m_insertMediaButton--menu" v-if="show_menu">
        <div v-show="$root.state.connected">
          <div class="m_actionbar--buttonBar">
            <button
              type="button"
              class="barButton barButton_capture"
              @click="openCapture"
              :disabled="is_iOS_device"
            >
              <span>{{ $t("capture") }}</span>
            </button>

            <label
              class="barButton barButton_import button"
              :disabled="read_only"
              for="add_file"
            >
              <span>
                {{ $t("import") }}
                <!-- <div v-html="field.svg" /> -->
              </span>
              <input
                type="file"
                multiple
                id="add_file"
                name="file"
                :disabled="read_only || !can_edit_project"
                @change="updateInputFiles($event)"
                accept=""
                style="width: 1px; height: 1px; overflow: hidden;"
              />
            </label>

            <transition name="fade_fast" :duration="150">
              <div
                v-if="!read_only && show_drop_container && can_edit_project"
                @drop="dropHandler($event)"
                class="_drop_indicator"
              >
                <div>
                  <img src="/images/i_importer.svg" draggable="false" />
                  <label>{{ $t("drop_here_to_import") }}</label>
                </div>
              </div>
            </transition>

            <UploadFile
              v-if="selected_files.length > 0"
              @close="selected_files = []"
              :slugFolderName="slugProjectName"
              :type="'projects'"
              :selected_files="selected_files"
            />

            <button
              type="button"
              class="barButton barButton_text"
              @click="createTextMedia"
            >
              <span>{{ $t("create_text") }}</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    is_collapsed: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      show_menu: !this.is_collapsed,
      selected_files: [],

      is_iOS_device:
        !!window.navigator.platform &&
        /iPad|iPhone|iPod/.test(navigator.platform),
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    createTextMedia() {
      this.$emit("addMedia", {
        type: "text",
      });

      this.show_menu = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
