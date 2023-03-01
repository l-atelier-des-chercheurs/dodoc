<template>
  <div class="_mediaModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />

    <div class="_mediaModal--content">
      <sl-icon-button
        name="x-circle-fill"
        class="_mediaModal--closeButton"
        @click="$emit('close')"
      />
      <div class="_preview">
        <!-- <DebugBtn :content="file" /> -->
        <MediaContent :file="file" :resolution="1600" :context="'full'" />
      </div>
      <div class="_meta" v-if="!select_mode">
        <h3>{{ $t("informations") }}</h3>
        <small>{{ file.$media_filename }}</small>
        <hr />

        <div class="u-mediaOptions">
          <div>
            <DownloadFile :file="file" />
          </div>
          <div class="">
            <button type="button" class="u-buttonLink" @click="duplicateMedia">
              <sl-icon name="file-plus" />
              {{ $t("duplicate") }}
            </button>
          </div>

          <RemoveMenu
            :remove_text="$t('remove_media')"
            @remove="$emit('remove')"
          />
        </div>
        <br />

        <TitleField
          :label="$t('caption')"
          :field_name="'caption'"
          :content="file.caption"
          :path="file.$path"
          :can_edit="true"
        />
        <br />
        <DateField :title="$t('date_uploaded')" :date="file.$date_uploaded" />
        <br />
        <DateField :title="$t('date_modified')" :date="file.$date_modified" />
      </div>
      <div class="_selectBtn" v-else>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="$emit('select')"
        >
          {{ $t("select") }}
        </button>
      </div>
    </div>

    <div class="_navBtns" v-if="position_in_list !== 'alone'">
      <span>
        <button
          type="button"
          class="u-button"
          v-if="position_in_list !== 'first'"
          @click="$emit('prevMedia')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <path
              d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
              style="fill: var(--c-noir)"
            />
          </svg>
        </button>
      </span>
      <span>
        <button
          type="button"
          class="u-button u-button_transparent"
          v-show="position_in_list !== 'last'"
          @click="$emit('nextMedia')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <path
              d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
              style="fill: #353535"
            />
          </svg>
        </button>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    project_path: String,
    select_mode: Boolean,
    position_in_list: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    window.addEventListener("keyup", this.handleKeyPress);
  },
  beforeDestroy() {
    window.addEventListener("keyup", this.handleKeyPress);
  },
  watch: {},
  computed: {},
  methods: {
    handleKeyPress($event) {
      if ($event.key === "Escape") this.$emit("close");
    },
    duplicateMedia() {
      this.$emit("duplicate");
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaModal {
  position: absolute;
  // padding: 1px;
  inset: 0;
  padding: calc(var(--spacing) / 2);

  ._mediaModal--overlay {
    background: var(--c-orange);
    position: absolute;
    inset: 0;
    opacity: 0.6;
    cursor: pointer;
  }

  ._mediaModal--content {
    background: var(--c-noir);
    border-radius: var(--border-radius);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  ::v-deep {
    ._mediaContent {
      // position: absolute;
      // width: 100%;
      // height: 100%;
      // pointer-events: auto;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;

      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }
}

._meta {
  padding: calc(var(--spacing) / 1);
}

._selectBtn {
  display: flex;
  place-items: center;
  justify-content: center;
  width: 100%;
  gap: calc(var(--spacing) / 1);

  background: white;
}

._mediaModal--content {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-flow: row wrap;

  > * {
    &._preview {
      position: relative;
      flex: 10 1 320px;
      color: white;

      // height: 50%;
    }
    &._meta {
      background: white;
      flex: 1 0 240px;
    }
  }
}

._mediaModal--closeButton {
  position: absolute;
  top: 0em;
  right: 0em;
  color: currentColor;
  font-size: 200%;

  &::part(base) {
    color: currentColor;
  }
}

._navBtns {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: calc(var(--spacing) / 4);
  pointer-events: none;

  display: flex;
  justify-content: space-between;

  button {
    padding: calc(var(--spacing) / 2);
    background: rgba(255, 255, 255, 0.6);
    pointer-events: auto;
  }
}
</style>
