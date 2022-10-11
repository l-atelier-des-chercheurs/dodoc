<template>
  <form
    class="m_planningItem"
    :class="{ 'is--editable': edit_mode, 'is--expanded': mode === 'expanded' }"
    @submit.prevent="sendEdits"
  >
    <div class="m_planningItem--topbar">
      <div
        class="m_planningItem--editButtons"
        v-if="!edit_mode && $root.state.mode !== 'export_planning'"
      >
        <button
          type="button"
          class="m_favButton"
          @click="toggleFav"
          :class="{ 'is--active': media.fav }"
        >
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px"
            y="0px"
            width="78.5px"
            height="106.4px"
            viewBox="0 0 78.5 106.4"
            style="enable-background: new 0 0 78.5 106.4"
            xml:space="preserve"
          >
            <polygon
              class="st0"
              points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"
            />
            <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 " />
          </svg>
        </button>

        <button type="button" @click="edit_mode = !edit_mode" title="edit">
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.7px"
            height="101px"
            viewBox="0 0 100.7 101"
            style="enable-background: new 0 0 100.7 101"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
                L19.1,91.5z"
            />
          </svg>
        </button>
        <button type="button" @click="removePlanningMedia" title="remove">
          <svg
            version="1.1"
            class="inline-svg"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="91.6px"
            height="95px"
            viewBox="0 0 91.6 95"
            style="enable-background: new 0 0 91.6 95"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"
            />
          </svg>
        </button>
      </div>
      <button
        type="button"
        v-if="mode === 'expanded' && $root.state.mode !== 'export_planning'"
        @click="closePlanning"
      >
        {{ $t("back") }}
      </button>
      <div class="m_planningItem--name">
        <span
          v-if="!edit_mode"
          v-html="media.name"
          @click="$emit('toggleOpen', media.metaFileName)"
        />
        <input v-else type="text" required v-model="edited_media_infos.name" />
      </div>
    </div>

    <div
      class="m_planningItem--options"
      v-if="edit_mode || media.planning_info_start || media_duration"
      :title="$moment(media.planning_info_start).format('l LTS')"
    >
      <div
        class="m_planningItem--options--keywords"
        v-if="media.keywords || edit_mode"
      >
        <label>{{ $t("keywords") }}</label>
        <template v-if="!edit_mode">
          <div class="m_keywordField">
            <button
              v-for="keyword in media.keywords"
              :key="keyword.text"
              :class="[keyword.classes]"
            >
              {{ keyword.title }}
            </button>
          </div>
        </template>

        <template v-else>
          <TagsInput
            :keywords="media.keywords"
            :read_only="false"
            @tagsChanged="(newTags) => (edited_media_infos.keywords = newTags)"
          />
        </template>
      </div>

      <div
        class="m_planningItem--options--start"
        v-if="media.planning_info_start || edit_mode"
      >
        <label>{{ $t("date") }}</label>
        <span v-if="!edit_mode && media.planning_info_start">
          {{
            $root.format_date_to_human(media.planning_info_start) +
            " " +
            $moment(media.planning_info_start).format("HH:mm:ss")
          }}
        </span>
        <DateTime
          v-else-if="edit_mode"
          v-model="edited_media_infos.planning_info_start"
          :twowaybinding="true"
          :read_only="false"
        />
        <!-- <span v-if="!media.planning_info_start">début</span>
        -->
      </div>
      <!-- <span v-if="(!edit_mode && media_duration) || edit_mode">→</span> -->
      <div
        class="m_planningItem--options--duration"
        v-if="edit_mode || media.planning_info_duration !== '00:00'"
      >
        <label>{{ $t("duration") }}</label>

        <span v-if="!edit_mode && media_duration">
          {{ media_duration }}
          <button
            type="button"
            style="color: var(--c-rouge)"
            @click.stop="
              $eventHub.$emit('countdown.start_timer', {
                duration: media.planning_info_duration,
                attached_to: media.metaFileName,
              })
            "
          >
            {{ $t("start_timer") }}
          </button>
        </span>
        <VueTimepicker
          v-else-if="edit_mode"
          v-model="edited_media_infos.planning_info_duration"
        ></VueTimepicker>
      </div>
    </div>

    <div class="m_planningItem--submitButtons">
      <button
        type="button"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        v-if="edit_mode"
        @click="edit_mode = !edit_mode"
      >
        {{ $t("annuler") }}
      </button>
      <button
        type="submit"
        class="button-small border-circled button-thin padding-verysmall margin-none bg-transparent"
        v-if="edit_mode"
      >
        {{ $t("valider") }}
      </button>
    </div>

    <div class="m_planningItem--notes" v-if="edit_notes">
      <!-- <div class="m_planningItem--notes--topbar">
        <h4>notes</h4>
        <button
          type="button"
          @click="edit_notes = !edit_notes"
          :class="{ 'is--active': edit_notes }"
        >
          <template v-if="edit_notes">×</template>
          edit
        </button>
      </div>-->

      <div
        class="m_planningItem--notes--staticNote"
        v-if="false && !edit_notes"
      >
        <div
          v-html="notes_excerpt"
          class="m_planningItem--notes--staticNote--content"
          :class="{ 'is--excerpt': !show_full_notes }"
        />
        <button type="button" @click="show_full_notes = !show_full_notes">
          <template v-if="!show_full_notes">read the rest</template>
          <template v-else>hide</template>
        </button>
      </div>

      <div class="m_planningItem--notes--editNotes" v-if="edit_notes">
        <CollaborativeEditor
          v-model="media.content"
          :slugFolderName="slugFolderName"
          :enable_collaboration="true"
          :media="media"
        />
      </div>
    </div>

    <!-- <button
      class="m_planningItem--openButton"
      type="button"
      v-if="mode === 'collapsed'"
      @click="$emit('toggleOpen', media.metaFileName)"
    >Ouvrir</button>-->
    <!-- edit_mode : {{ edit_mode }}
    edited_media_infos : {{ edited_media_infos.name }}
    media.name : {{ media.name }}-->
  </form>
</template>
<script>
import DateTime from "./DateTime.vue";
import CollaborativeEditor from "./CollaborativeEditor.vue";
import VueTimepicker from "vue2-timepicker";
import TagsInput from "./TagsInput.vue";

export default {
  props: {
    media: Object,
    slugFolderName: String,
    mode: {
      type: String,
      default: "collapsed",
    },
  },
  components: {
    DateTime,
    CollaborativeEditor,
    VueTimepicker,
    TagsInput,
  },

  data() {
    return {
      edit_mode: false,
      edit_notes: this.mode === "expanded",
      show_full_notes: false,
      duration_picker_data: "00:00",

      edited_media_infos: {
        name: this.media.name,
        planning_info_start: this.media.planning_info_start,
        keywords: this.media.keywords,
        planning_info_duration: !!this.media.planning_info_duration
          ? this.media.planning_info_duration
          : "00:00",
      },
    };
  },
  created() {},
  mounted() {
    if (this.mode === "expanded")
      this.$root.settings.current_planning_media_metaFileName =
        this.media.metaFileName;
  },
  beforeDestroy() {
    if (this.mode === "expanded")
      this.$root.settings.current_planning_media_metaFileName = false;
  },
  watch: {
    edit_mode: function () {
      if (this.edit_mode) {
        this.edited_media_infos = {
          name: this.media.name,
          planning_info_start: this.media.planning_info_start,
          keywords: this.media.keywords,
          planning_info_duration: !!this.media.planning_info_duration
            ? this.media.planning_info_duration
            : "00:00",
        };
      }
    },
  },
  computed: {
    notes_excerpt() {
      return this.media.content;
    },
    media_duration() {
      if (!this.media.planning_info_duration) {
        return false;
      }
      return this.$root.format_duration_to_human({
        duration: this.media.planning_info_duration,
      });
    },
  },
  methods: {
    sendEdits() {
      let data = {};

      // if (!!this.edited_media_infos.planning_info_duration) {
      //   const HH = !!this.edited_media_infos.planning_info_duration.HH
      //     ? this.edited_media_infos.planning_info_duration.HH
      //     : "00";
      //   const mm = !!this.edited_media_infos.planning_info_duration.mm
      //     ? this.edited_media_infos.planning_info_duration.mm
      //     : "00";

      //   this.edited_media_infos.planning_info_duration = HH + "" + mm;
      // }

      // if (!!this.duration_picker_data) {
      //   this.edited_media_infos.planning_info_duration = this.duration_picker_data;
      // }

      const checkIfValueChanged = (key, val) => val !== this.media[key];

      Object.keys(this.edited_media_infos).map((k) => {
        if (checkIfValueChanged(k, this.edited_media_infos[k])) {
          data[k] = this.edited_media_infos[k];
        }
      });

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.media.metaFileName,
        data,
      });
      this.edit_mode = false;
    },
    removePlanningMedia() {
      if (window.state.dev_mode === true)
        console.log(
          `METHODS • PlanningItem: removePlanningMedia / ${this.media.metaFileName}`
        );

      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemovePlanning"),
          () => {
            this.$emit("removePlanningMedia", this.media.metaFileName);
          },
          () => {}
        );
    },
    toggleFav() {
      let fav = true;
      if (this.media.fav) {
        fav = false;
      }

      this.$root.editMedia({
        type: "projects",
        slugFolderName: this.slugFolderName,
        slugMediaName: this.media.metaFileName,
        data: {
          fav,
        },
      });
    },
    closePlanning() {
      if (window.state.dev_mode === true)
        console.log(
          `METHODS • PlanningItem: closePlanning / ${this.media.metaFileName}`
        );
      this.$root.settings.current_planning_media_metaFileName = false;
    },
  },
};
</script>
<style
  src="../../../../node_modules/vue2-timepicker/dist/VueTimepicker.css"
></style>
<style lang="scss">
.vue__time-picker .dropdown ul li:not([disabled]).active,
.vue__time-picker .dropdown ul li:not([disabled]).active:focus,
.vue__time-picker .dropdown ul li:not([disabled]).active:hover {
  background: var(--c-rouge);
}

.m_planningItem {
  position: relative;
  background-color: #fff;

  display: flex;
  flex-flow: column nowrap;
  // align-items: stretch;

  &.is--active {
    color: #999;
  }

  &.is--expanded {
    .m_planningItem--topbar {
      padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
    }
    .m_planningItem--options {
      padding: 0 calc(var(--spacing) / 1);
    }
  }
}

.m_planningItem--topbar {
  flex: 0 0 auto;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}

.m_planningItem--editButtons {
  order: 1;

  body[data-mode="export_planning"] & {
    display: none;
  }

  button {
    svg {
      width: 0.8rem;
      height: 0.8rem;
    }
  }
}

.m_planningItem--name {
  font-size: 150%;
  // font-weight: bold;
  margin: 0;
  font-weight: 500;
  font-family: "Work Sans";
  line-height: 1.4;

  span {
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

.m_planningItem--options {
  // background-color: #eee;
  // color: white;
  // padding: 0.4em;
  // line-height: 1;
  border-radius: 1em;
  font-size: 80%;

  // display: flex;
  // flex-flow: row wrap;
  // align-items: center;

  button {
    margin-top: calc(var(--spacing) / 4);
    // padding: 0;
  }

  > * {
    flex: 0 1 auto;

    display: flex;
    align-items: center;
    // margin-right: calc(var(--spacing) / 2);
  }
  label {
    margin-right: calc(var(--spacing) / 2);
  }

  .m_planningItem--options--keywords {
  }
}

.m_planningItem--options--start {
}
.m_planningItem--options--duration {
  button {
    margin: 0;
    padding: 0;
    &:hover {
      opacity: 0.3;
    }

    body[data-mode="export_planning"] & {
      display: none;
    }
  }
}

.m_planningItem--submitButtons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

.m_planningItem--notes {
  position: relative;
  border-radius: 1px;
  flex: 1 1 auto !important;
  // height: 100%;
  // margin-top: calc(var(--spacing) / 1);
  padding: 0;
  overflow: hidden;
  // margin: 5px;
}

.m_planningItem--openButton {
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;

  text-indent: 1800px;
}

.m_planningItem--notes--staticNote--content {
  overflow: hidden;
  &.is--excerpt {
    max-height: 10em;
  }

  p {
    margin: 0;
  }
}

body:not([data-mode="export_planning"]) .m_planningItem--notes--editNotes {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  height: 100%;
  // overflow: scroll;

  .ql-container {
  }

  .m_collaborativeEditor {
    height: 100%;
  }

  .ql-toolbar {
    z-index: 2;
  }

  .mediaTextContent {
    z-index: 1;
  }
}
</style>
