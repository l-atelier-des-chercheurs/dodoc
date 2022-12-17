<template>
  <div class="_mediaModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />
    <div class="_mediaModal--content">
      <div
        class="_preview"
        :draggable="true"
        @dragstart="startMediaDrag($event)"
        @dragend="endMediaDrag()"
      >
        <!-- <DebugBtn :content="file" /> -->
        <MediaContent :file="file" :resolution="1600" :context="'full'" />
      </div>
      <div class="_meta" v-if="!select_mode">
        <h3>{{ $t("informations") }}</h3>
        <small>{{ file.$media_filename }}</small>
        <hr />
        <TitleField
          :label="$t('caption')"
          :field_name="'caption'"
          :content="file.caption"
          :path="file.$path"
          :can_edit="true"
        />
        <br />
        <DateField :title="'date_uploaded'" :date="file.$date_uploaded" />
        <br />
        <DateField :title="'date_modified'" :date="file.$date_modified" />
        <br />
        <sl-button-group class="_focusBtns">
          <sl-button size="small" @click="$emit('close')">Fermer</sl-button>
          <sl-button size="small" @click="$emit('remove')">Supprimer</sl-button>
        </sl-button-group>
      </div>
      <div class="_selectBtn" v-else>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("cancel") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert u-button_big"
          @click="$emit('select')"
        >
          {{ $t("select") }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    project_path: String,
    select_mode: Boolean,
  },
  components: {},
  data() {
    return {
      is_dragged: false,
    };
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
    startMediaDrag($event) {
      console.log(`MediaFocus / startMediaDrag`);

      this.is_dragged = true;

      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "move";
      this.$eventHub.$emit(`mediadrag.start`);
    },
    endMediaDrag() {
      this.is_dragged = false;
      console.log(`MediaFocus / endMediaDrag`);
      this.$eventHub.$emit(`mediadrag.end`);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaModal {
  position: absolute;
  // padding: 1px;
  inset: 0;
  padding: 4%;
  // background: rgba(253, 253, 253, 0.7);

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
  }

  ::v-deep {
    ._mediaContent {
      // position: absolute;
      // width: 100%;
      // height: 100%;
      // pointer-events: auto;

      img {
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
      // height: 50%;
    }
    &._meta {
      background: white;
      flex: 1 0 240px;
    }
  }
}
</style>
