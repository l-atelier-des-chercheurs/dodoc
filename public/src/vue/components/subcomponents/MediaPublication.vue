<template>
  <div
    class="m_mediaPublication"
    ref="media"
    :style="mediaStyles"
    :data-media_type="media.type"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
    @mousedown.stop="is_selected = true"
    :class="[
      {
        'is--dragged': is_dragged,
        'is--resized': is_resized,
        'is--rotated': is_rotated,
        'is--selected': is_selected,
        'is--waitingForServerResponse': is_waitingForServer,
        'is--hovered': is_hovered,
        'is--previewed': preview_mode,
        'is--overflowing': is_text_overflowing,
        'is--inline_edited': inline_edit_mode,
      },
      'is--fit_mode_' + fit_mode,
    ]"
  >
    <!-- if media is link -->
    <MediaContent
      v-if="!media.publi_meta.hasOwnProperty('type')"
      :context="mode !== 'contact_sheet' ? 'full' : 'preview'"
      :slugFolderName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      :element_width_for_sizes="mediaSize.width * pixelsPerMillimeters"
      v-model="media.content"
      :style="contentStyles"
    />
    <!-- if not -->
    <div
      class="mediaContainer"
      v-else
      :style="contentStyles"
      :class="`type-${media.publi_meta.type}`"
      :data-context="context"
    >
      <template v-if="media.publi_meta.type === 'text'">
        <CollaborativeEditor
          v-if="inline_edit_mode"
          v-model="htmlForEditor"
          :media="media.publi_meta"
          :theme="'bubble'"
          :slugFolderName="media.publi_meta.slugFolderName"
          ref="textField"
        />
        <div v-else class="mediaTextContent">
          <div v-if="htmlForEditor.length !== 0" v-html="htmlForEditor" />
          <p v-else class="_no_textcontent" v-html="$t('no_text_content')" />
        </div>
      </template>
    </div>

    <div class="m_mediaPublication--floatingSaveButton" v-if="inline_edit_mode">
      <button
        type="button"
        class="button button-bg_rounded bg-orange"
        @click="cancelTextMediaInlineEditing"
      >
        <img src="/images/i_clear.svg" draggable="false" />
        <span class="text-cap font-verysmall">
          {{ $t("cancel") }}
        </span>
      </button>
      <button
        type="button"
        class="button button-bg_rounded bg-bleuvert"
        @click="saveTextMedia"
      >
        <img src="/images/i_enregistre.svg" draggable="false" />
        <span class="text-cap font-verysmall">
          <slot name="submit_button">{{ $t("save") }}</slot>
        </span>
      </button>
    </div>

    <p class="mediaCaption">{{ media.caption }}</p>

    <button
      class="m_mediaPublication--overflowing_sign"
      type="button"
      v-if="is_text_overflowing && !preview_mode"
      @mousedown.stop.prevent="setMediaHeightToContent"
      @touchstart.stop.prevent="setMediaHeightToContent"
      :content="$t('text_overflow')"
      v-tippy="{
        placement: 'top',
        delay: [600, 0],
      }"
    >
      <span>…</span>
    </button>

    <div
      class="m_mediaPublication--edit_styles"
      v-if="
        (is_selected || is_hovered) && !preview_mode && show_custom_css_window
      "
    >
      <button
        type="button"
        class="m_mediaPublication--edit_styles--helpButton"
        :content="$t('write_some_CSS_code_for_example')"
        v-tippy="{
          delay: [600, 0],
        }"
      >
        ?
      </button>
      <PrismEditor
        v-model="custom_css"
        @change="/* setCSSForMedia */"
        language="css"
      />
      <div class="m_mediaPublication--edit_styles--sendButton">
        <button
          type="button"
          class="button-greenthin"
          @click="setCSSForMedia"
          :class="{
            'is--disabled': custom_css === media.publi_meta.custom_css,
          }"
        >
          {{ $t("send") }}
        </button>
      </div>
    </div>

    <!-- <transition name="fade_fast" :duration="150"> -->
    <div
      v-if="!preview_mode && !inline_edit_mode && !read_only"
      class="controlFrame"
      @mousedown.stop.prevent="dragMedia('mouse')"
      @touchstart.stop.prevent="dragMedia('touch')"
    >
      <div
        v-if="is_selected || is_hovered"
        class="handle handle_resizeMedia_bottom"
        @mousedown.stop.prevent="
          (event) => resizeMedia({ event, type: 'mouse', origin: 'bottom' })
        "
        @touchstart.stop.prevent="
          (event) => resizeMedia({ event, type: 'touch', origin: 'bottom' })
        "
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="60px"
          height="106px"
          viewBox="0 0 60 106"
          style="enable-background: new 0 0 60 106;"
          xml:space="preserve"
        >
          <path
            d="M0,77.8l8.6-9.2l6.6,6.5c2,2,3.6,3.6,4.7,5c1.1,1.4,2.2,3,3.2,4.8l0-64.1c-1,1.8-2.1,3.4-3.2,4.8c-1.1,1.4-2.7,3.1-4.7,5
		l-6.6,6.6L0,28.2L30,0l30,28.2l-8.6,9.2l-6.7-6.7c-2-2-3.6-3.7-4.7-5.1c-1.1-1.4-2.1-2.9-3-4.5l0,63.9c0.9-1.6,1.9-3.2,3-4.5
		c1.1-1.4,2.7-3.1,4.7-5.1l6.7-6.6l8.6,9.2L30,106L0,77.8z"
          />
        </svg>
      </div>
      <div
        v-if="is_selected || is_hovered"
        class="handle handle_resizeMedia_right"
        @mousedown.stop.prevent="
          (event) => resizeMedia({ event, type: 'mouse', origin: 'right' })
        "
        @touchstart.stop.prevent="
          (event) => resizeMedia({ event, type: 'touch', origin: 'right' })
        "
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="106px"
          height="60px"
          viewBox="0 0 106 60"
          style="enable-background: new 0 0 106 60;"
          xml:space="preserve"
        >
          <path
            d="M28.1,0l9.2,8.6l-6.5,6.6c-2,2-3.6,3.6-5,4.7c-1.4,1.1-3,2.2-4.8,3.2l64.1,0c-1.8-1-3.4-2.1-4.8-3.2 c-1.4-1.1-3.1-2.7-5-4.7l-6.6-6.6L77.7,0L106,30L77.7,60l-9.2-8.6l6.7-6.7c2-2,3.7-3.6,5.1-4.7c1.4-1.1,2.9-2.1,4.5-3l-63.9,0 c1.6,0.9,3.2,1.9,4.5,3c1.4,1.1,3.1,2.7,5.1,4.7l6.6,6.7L28.1,60L0,30L28.1,0z"
          />
        </svg>
      </div>
      <div
        v-if="
          media.type !== 'text' &&
          media.publi_meta.type !== 'text' &&
          (is_selected || is_hovered) &&
          media.hasOwnProperty('ratio')
        "
        class="handle handle_resizeMedia"
        @mousedown.stop.prevent="
          (event) =>
            resizeMedia({ event, type: 'mouse', origin: 'bottomright' })
        "
        @touchstart.stop.prevent="
          (event) =>
            resizeMedia({ event, type: 'touch', origin: 'bottomright' })
        "
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px"
          y="0px"
          width="106px"
          height="60px"
          viewBox="-10 -10 100 100"
          style="enable-background: new 0 0 77.5 77.5;"
          xml:space="preserve"
        >
          <path
            d="M42.5,0l0.4,12.6l-9.3,0.1c-2.8,0-5.1,0-6.9-0.2c-1.8-0.2-3.6-0.6-5.7-1.2l45.3,45.3c-0.6-2-1-3.9-1.2-5.7
              c-0.2-1.8-0.3-4-0.2-6.9v-9.4l12.6,0.4l-1.3,41.2l-41.2,1.3l-0.4-12.6l9.5,0c2.9,0,5.2,0.1,7,0.3c1.8,0.2,3.6,0.5,5.4,1.1
            L11.3,21.1c0.5,1.8,0.9,3.6,1.1,5.4c0.2,1.8,0.3,4.1,0.3,7l-0.1,9.4L0,42.5L1.3,1.3L42.5,0z"
          />
        </svg>
      </div>
      <div
        class="handle handle_rotateMedia"
        v-if="is_selected || is_hovered"
        @mousedown.stop.prevent="rotateMedia('mouse', 'bottomright')"
        @touchstart.stop.prevent="rotateMedia('touch', 'bottomright')"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="98.7px"
          height="132.2px"
          viewBox="0 0 98.7 132.2"
          style="enable-background: new 0 0 98.7 132.2;"
          xml:space="preserve"
        >
          <defs></defs>
          <path
            d="M80.1,117.7c-3.1-0.2-5.6-0.3-7.6-0.2c-1.4,0.1-2.9,0.3-4.5,0.5c14.7-13.7,36.9-42.4,29.1-63.4S71.6,27,24.8,24.6
    c1.1-0.8,2.2-1.6,3.1-2.4c1.5-1.3,3.2-3.1,5.3-5.5L40,9L29.3,0L0,34.9l32.9,31.5l9.7-10.1l-7.7-7c-2.4-2.1-4.3-3.8-5.9-4.9
    c-1.6-1.2-3.3-2.2-5.2-3.1l-0.1-1.2c29.3,1.4,52.5,6.6,56.5,20.7s-15.9,39.7-23.5,46.5l-0.5-0.6c0.7-1.9,1.2-3.9,1.6-5.9
    c0.3-2,0.6-4.5,0.8-7.7l0.7-10.5l-14-0.4L43.7,128l45.5,4.2l1.3-13.9L80.1,117.7z"
          />
        </svg>
      </div>
    </div>
    <!-- </transition> -->

    <transition name="fade_fast" :duration="150">
      <div
        class="m_mediaPublication--textStyleBar"
        v-if="
          (is_selected || is_hovered) &&
          !preview_mode &&
          !inline_edit_mode &&
          !read_only &&
          (media.type === 'text' || media.publi_meta.type === 'text')
        "
      >
        <div class="m_mediaPublication--textStyleBar--container">
          <div>
            <label>{{ $t("font_size") }} {{ font_size_percent }}%</label>
            <div>
              <input
                type="range"
                min="10"
                max="300"
                v-model="font_size_percent"
                @change="
                  updateMediaPubliMeta({
                    font_size_percent,
                  })
                "
              />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade_fast" :duration="150">
      <div
        v-if="
          (is_selected || is_hovered) &&
          !preview_mode &&
          !inline_edit_mode &&
          !read_only
        "
        class="m_mediaPublication--buttons"
      >
        <button
          type="button"
          v-if="!media.slugProjectName"
          class="buttonLink _no_underline"
          @mousedown.stop.prevent="editButtonClicked"
          @touchstart.stop.prevent="editButtonClicked"
          :content="$t('edit_content')"
          v-tippy="{
            placement: 'top',
            delay: [600, 0],
          }"
        >
          <svg
            version="1.1"
            class="inline-svg inline-svg-larger"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="90.7px"
            height="91px"
            viewBox="0 0 90 120"
            style="enable-background: new 0 0 100.7 101;"
            xml:space="preserve"
          >
            <path
              class="st0"
              d="M100.7,23.2L77.5,0l-66,66.2l0,0L0,101l34.7-11.6l0,0L100.7,23.2z M19.1,91.5l-9.4-9.7l4-12.4l18,17.8
              L19.1,91.5z"
            />
          </svg>
        </button>

        <button
          type="button"
          class="_advanced_menu_button _no_underline"
          :class="{ 'is--active': show_advanced_menu }"
          @mousedown.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
            is_selected = true;
          "
          @touchstart.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
            is_selected = true;
          "
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="168px"
            height="168px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168;"
            xml:space="preserve"
          >
            <rect x="73.5" y="37" class="st0" width="21" height="21" />
            <rect x="73.5" y="73.5" class="st0" width="21" height="21" />
            <rect x="73.5" y="110" class="st0" width="21" height="21" />
          </svg>
        </button>

        <div v-if="show_advanced_menu" class="_advanced_menu" @click.stop>
          <button
            type="button"
            class="buttonLink _no_underline"
            @mousedown.stop.prevent="editZIndex(+1)"
            @touchstart.stop.prevent="editZIndex(+1)"
            :content="
              $t('move_to_foreground') +
              '<br>' +
              $t('layer:') +
              ' ' +
              mediaZIndex
            "
            v-tippy="{
              placement: 'top',
              delay: [600, 0],
            }"
          >
            <svg
              version="1.1"
              class="inline-svg"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="40.3px"
              height="59.6px"
              viewBox="0 0 40.3 59.6"
              style="enable-background: new 0 0 40.3 59.6;"
              xml:space="preserve"
            >
              <path
                class="st0"
                d="M35,24.4l-4.6-4.2c-2.7-2.5-4.8-4.7-6.4-7.3l0,46.7l-7.7,0l0-46.6c-1.7,2.5-3.8,4.7-6.4,7.1l-4.6,4.2L0,18.1
              L20.2,0l20.2,18.1L35,24.4z"
              />
            </svg>
          </button>

          <button
            type="button"
            class="buttonLink _no_underline"
            @mousedown.stop.prevent="editZIndex(-1)"
            @touchstart.stop.prevent="editZIndex(-1)"
            :content="
              $t('move_to_background') +
              '<br>' +
              $t('layer:') +
              ' ' +
              mediaZIndex
            "
            v-tippy="{
              placement: 'top',
              delay: [600, 0],
            }"
          >
            <svg
              version="1.1"
              class="inline-svg"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="40.3px"
              height="59.6px"
              viewBox="0 0 40.3 59.6"
              style="enable-background: new 0 0 40.3 59.6;"
              xml:space="preserve"
            >
              <path
                class="st0"
                d="M5.3,35.2l4.6,4.2c2.7,2.5,4.8,4.7,6.4,7.3l0-46.7L24,0l0,46.6c1.7-2.5,3.8-4.7,6.4-7.1l4.6-4.2l5.3,6.2
              L20.2,59.6L0,41.5L5.3,35.2z"
              />
            </svg>
          </button>

          <button
            type="button"
            class="buttonLink _no_underline"
            @mousedown.stop.prevent="toggleEditWindow()"
            @touchstart.stop.prevent="toggleEditWindow()"
            :class="{ 'is--active': show_custom_css_window }"
            :content="$t('css_settings')"
            v-tippy="{
              placement: 'top',
              delay: [600, 0],
            }"
          >
            {{ $t("css") }}
            <sup v-if="custom_css">*</sup>
          </button>

          <button
            type="button"
            v-if="media.slugProjectName"
            class="buttonLink _no_underline"
            @mousedown.stop.prevent="editButtonClicked"
            @touchstart.stop.prevent="editButtonClicked"
            :content="$t('edit_original_media')"
            v-tippy="{
              placement: 'top',
              delay: [600, 0],
            }"
          >
            <svg
              version="1.1"
              class="inline-svg inline-svg-larger"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="113.5px"
              height="113.5px"
              viewBox="0 0 113.5 113.5"
              style="enable-background: new 0 0 113.5 113.5;"
              xml:space="preserve"
            >
              <path
                d="M8.9,104.6c11.8,11.8,31,11.8,42.8,0l16.9-16.9c-1.3,0.1-2.7,0.2-4,0.2c-4.3,0-8.4-0.7-12.4-2l-9.6,9.6
		c-3.3,3.3-7.7,5.1-12.3,5.1c-4.6,0-9-1.8-12.3-5.1c-3.3-3.3-5.1-7.6-5.1-12.3c0-4.6,1.8-9,5.1-12.3l18.7-18.7
		c3.3-3.3,7.7-5.1,12.3-5.1c4.7,0,9,1.8,12.3,5.1c1.6,1.6,2.8,3.4,3.7,5.5c2.1-0.1,10.6-7.5,10.6-7.5c-1.4-2.5-3.1-4.9-5.3-7.1
		c-11.8-11.8-31-11.8-42.8,0L8.9,61.8C-3,73.6-3,92.8,8.9,104.6z"
              />
              <path
                d="M48.8,25.5c4.3,0,8.5,0.7,12.5,2.1l9.6-9.6c3.3-3.3,7.7-5.1,12.3-5.1s9,1.8,12.3,5.1c3.3,3.3,5.1,7.7,5.1,12.3
		s-1.8,9-5.1,12.3L76.8,61.3c-3.3,3.3-7.7,5.1-12.3,5.1c-4.7,0-9-1.8-12.3-5.1c-1.6-1.6-2.9-3.5-3.7-5.5c-2.1,0.1-4.1,1-5.7,2.5
		l-5,5c1.4,2.5,3.1,4.9,5.3,7.1c11.8,11.8,31,11.8,42.8,0l18.7-18.7c11.8-11.8,11.8-31,0-42.8C92.8-3,73.7-3,61.8,8.9L45,25.7
		C46.2,25.6,47.5,25.5,48.8,25.5L48.8,25.5L48.8,25.5z"
              />
            </svg>
            <!-- {{ $t('edit') }} -->
          </button>

          <!-- <button
          v-if="!!media.ratio && !lock_original_ratio"
          type="button"
          class="buttonLink _no_underline"
          @click.stop.prevent="toggleImageFitMode"
          :content="$t('switch_fit_mode')"
          v-tippy="{
            placement: 'top',
            delay: [600, 0]
          }"
        >
          <svg
            class="inline-svg inline-svg-larger"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="130.4px"
            height="130.4px"
            viewBox="0 0 130.4 130.4"
            style="enable-background:new 0 0 130.4 130.4;"
            xml:space="preserve"
          >
            <defs />
            <g>
              <path
                d="M100.3,130.4H30.1c-2.4,0-4.4-2.2-4.4-5V5c0-2.8,2-5,4.4-5h70.1c2.4,0,4.4,2.2,4.4,5v120.4
		C104.7,128.2,102.7,130.4,100.3,130.4z M34.5,120.4h61.3V10H34.5V120.4z"
              />
            </g>
            <g>
              <path
                d="M125.4,106.4h-12v-9.2h7v-6.4h10v11C130.4,104.3,128.2,106.4,125.4,106.4z"
              />
              <path
                d="M93.8,106.4H75v-9.2h18.8V106.4z M55.4,106.4H36.6v-9.2h18.8V106.4z"
              />
              <path d="M17,106.4H5c-2.8,0-5-2.1-5-4.6v-11h10v6.4h7V106.4z" />
              <rect y="56.9" width="10" height="16.6" />
              <path d="M10,39.6H0v-11C0,26.1,2.2,24,5,24h12v9.2h-7V39.6z" />
              <path
                d="M93.8,33.2H75V24h18.8V33.2z M55.4,33.2H36.6V24h18.8V33.2z"
              />
              <path d="M130.4,39.6h-10v-6.4h-7V24h12c2.8,0,5,2.1,5,4.6V39.6z" />
              <rect x="120.4" y="56.9" width="10" height="16.6" />
            </g>
          </svg>
          </button>-->

          <button
            type="button"
            class="buttonLink _no_underline"
            @click.stop.prevent="removePubliMedia()"
            :content="$t('withdraw')"
            v-tippy="{
              placement: 'top',
              delay: [600, 0],
            }"
          >
            <!-- <svg
              version="1.1"
              class="inline-svg"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="37.2px"
              height="37.2px"
              viewBox="0 0 37.2 37.2"
              style="enable-background:new 0 0 37.2 37.2;"
              xml:space="preserve"
            >
              <polygon
                class="st0"
                points="37.2,30.6 30.6,37.2 18.6,25.2 6.6,37.2 0,30.6 12,18.6 0,6.6 6.6,0 18.6,12 30.6,0 37.2,6.6 
            25.2,18.6 "
              />
            </svg>-->
            {{ $t("withdraw") }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import PrismEditor from "vue-prism-editor";
import debounce from "debounce";
import CollaborativeEditor from "./CollaborativeEditor.vue";

export default {
  props: {
    media: Object,
    mode: String,
    page: Object,
    read_only: Boolean,
    preview_mode: Boolean,
    lowdef: Boolean,
    pixelsPerMillimeters: Number,
  },
  components: {
    MediaContent,
    PrismEditor,
    CollaborativeEditor,
  },
  data() {
    return {
      is_dragged: false,
      is_resized: false,
      is_rotated: false,
      is_waitingForServer: false,
      is_hovered: false,
      is_selected: false,
      is_touch: Modernizr.touchevents,
      is_text_overflowing: false,

      inline_edit_mode: false,
      show_advanced_menu: false,

      custom_css: this.media.publi_meta.hasOwnProperty("custom_css")
        ? this.media.publi_meta.custom_css
        : "",
      show_custom_css_window: false,

      limit_media_to_page: true,
      htmlForEditor: this.media.publi_meta.content
        ? this.media.publi_meta.content
        : "",

      mediaID: `${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 5
      )}`,

      dragOffset: {
        x: 0,
        y: 0,
      },
      mediaPos: {
        x: 0,
        y: 0,
        px: 0,
        py: 0,
      },

      resizeOffset: {
        x: 0,
        y: 0,
      },
      resize_origin: "",

      rotateOffset: {
        x: 0,
        y: 0,
        angle: 0,
      },
      rotate: 0,
      debounce_setCSSForMedia: undefined,

      font_size_percent: 100,

      mediaSize: {
        width: 0,
        height: 0,
        pwidth: 0,
        pheight: 0,
      },

      mediaZIndex: 0,

      fit_mode: "cover",
      lock_original_ratio: false,
    };
  },

  created() {},
  mounted() {
    this.updateMediaStyles();
    this.$eventHub.$on("publication.newMediaSelected", this.newMediaSelected);
    this.$eventHub.$on(
      "publication.set_media_to_edit_mode",
      this.setMediaToEditMode
    );
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.newMediaSelected", this.newMediaSelected);
    this.$eventHub.$off(
      "publication.set_media_to_edit_mode",
      this.setMediaToEditMode
    );
  },

  watch: {
    "media.publi_meta": {
      handler: function () {
        this.updateMediaStyles();
        this.htmlForEditor = this.media.publi_meta.content
          ? this.media.publi_meta.content
          : "";
      },
      deep: true,
    },
    is_selected: function () {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`WATCH • MediaPublication: is_selected`);
      }
      if (this.is_selected) {
        window.addEventListener("mousedown", this.deselectMedia);
        window.addEventListener("touchstart", this.deselectMedia);
        this.$eventHub.$emit("publication.newMediaSelected", this.mediaID);
      } else {
        window.removeEventListener("mousedown", this.deselectMedia);
        window.removeEventListener("touchstart", this.deselectMedia);

        this.show_advanced_menu = false;
        this.show_custom_css_window = false;
      }
    },
  },
  computed: {
    mediaStyles() {
      const set_z_index = this.is_selected
        ? 100000
        : this.media.publi_meta.z_index;

      return `
        transform: translate(${this.mediaPos.x}mm, ${this.mediaPos.y}mm) rotate(${this.rotate}deg);
        width: ${this.mediaSize.width}mm;
        height: ${this.mediaSize.height}mm;
        z-index: ${set_z_index};
      `;
    },
    contentStyles() {
      let css = " ";

      css += `font-size: ${this.font_size_percent}%; `;

      if (this.media.publi_meta.custom_css)
        css += this.media.publi_meta.custom_css;

      return css;
    },
    text_is_overflowing() {
      const el = this.$refs.media;
      return el.offsetHeight + 15 < el.scrollHeight;
    },
  },
  methods: {
    newMediaSelected(mediaID) {
      if (mediaID !== this.mediaID) {
        this.is_selected = false;
      }
    },
    setMediaToEditMode(metaFileName) {
      if (this.media.publi_meta.metaFileName === metaFileName) {
        this.editButtonClicked();
      }
    },
    saveTextMedia() {
      const val = {
        content: this.htmlForEditor,
      };

      this.$emit("editPubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName,
        val,
      });

      this.inline_edit_mode = false;
    },
    cancelTextMediaInlineEditing() {
      this.htmlForEditor = this.media.publi_meta.content;
      this.inline_edit_mode = false;
    },
    editButtonClicked() {
      if (this.media.slugProjectName)
        this.$root.openMedia({
          slugProjectName: this.media.slugProjectName,
          metaFileName: this.media.metaFileName,
        });
      else {
        this.inline_edit_mode = true;
        this.$nextTick(() => {
          this.$refs.textField.$el.querySelector(".ql-editor").focus();
        });
      }
    },
    editZIndex(val) {
      this.updateMediaPubliMeta({
        z_index: this.mediaZIndex + val,
      });
    },
    setMediaHeightToContent() {
      const el = this.$refs.media;
      let contentHeight =
        el.firstElementChild.firstElementChild.firstElementChild.offsetHeight;
      contentHeight = contentHeight / this.pixelsPerMillimeters;
      if (this.page.snap_to_grid) {
        contentHeight += this.page.gridstep;
      }
      contentHeight = this.roundMediaVal(contentHeight);
      contentHeight = this.limitMediaHeight(contentHeight);
      this.mediaSize.height = contentHeight;

      this.updateMediaPubliMeta({
        height: this.mediaSize.height,
      });
    },
    toggleEditWindow() {
      this.show_custom_css_window = !this.show_custom_css_window;
    },
    setCSSForMedia(event) {
      const val = {
        custom_css: this.custom_css,
      };
      this.$emit("editPubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName,
        val,
      });
      // if (this.debounce_setCSSForMedia)
      //   clearTimeout(this.debounce_setCSSForMedia);
      // this.debounce_setCSSForMedia = setTimeout(() => {
      //   const val = {
      //     custom_css: this.custom_css,
      //   };
      //   this.$emit("editPubliMedia", {
      //     slugMediaName: this.media.publi_meta.metaFileName,
      //     val,
      //   });
      // }, 0);
    },
    toggleImageFitMode() {
      if (this.fit_mode === "cover") this.fit_mode = "contain";
      else if (this.fit_mode === "contain") this.fit_mode = "cover";

      this.updateMediaPubliMeta({
        fit_mode: this.fit_mode,
      });
    },
    updateMediaStyles() {
      this.rotate = this.media.publi_meta.hasOwnProperty("rotate")
        ? this.media.publi_meta.rotate
        : 0;
      this.mediaSize.width =
        this.media.publi_meta.hasOwnProperty("width") &&
        !!Number.parseFloat(this.media.publi_meta.width)
          ? this.limitMediaWidth(Number.parseFloat(this.media.publi_meta.width))
          : 100;
      this.mediaSize.height =
        this.media.publi_meta.hasOwnProperty("height") &&
        !!Number.parseFloat(this.media.publi_meta.height)
          ? this.limitMediaHeight(
              Number.parseFloat(this.media.publi_meta.height)
            )
          : this.media.hasOwnProperty("ratio")
          ? this.mediaSize.width * this.media.ratio
          : 100;
      this.mediaPos.x =
        this.media.publi_meta.hasOwnProperty("x") &&
        !!Number.parseFloat(this.media.publi_meta.x)
          ? this.limitMediaXPos(Number.parseFloat(this.media.publi_meta.x))
          : this.page.margin_left;
      this.mediaPos.y =
        this.media.publi_meta.hasOwnProperty("y") &&
        !!Number.parseFloat(this.media.publi_meta.y)
          ? this.limitMediaYPos(Number.parseFloat(this.media.publi_meta.y))
          : this.page.margin_top;
      this.custom_css = this.media.publi_meta.hasOwnProperty("custom_css")
        ? this.media.publi_meta.custom_css
        : this.custom_css;
      this.mediaZIndex = this.media.publi_meta.hasOwnProperty("z_index")
        ? this.media.publi_meta.z_index
        : 0;
      this.fit_mode = this.media.publi_meta.hasOwnProperty("fit_mode")
        ? this.media.publi_meta.fit_mode
        : "cover";

      if (this.media.type === "text" || this.media.publi_meta.type === "text") {
        this.font_size_percent =
          this.media.publi_meta.hasOwnProperty("font_size_percent") &&
          !!Number.parseFloat(this.media.publi_meta.font_size_percent)
            ? Number.parseFloat(this.media.publi_meta.font_size_percent)
            : 100;

        this.$nextTick(() => {
          const el = this.$refs.media;
          this.is_text_overflowing =
            el.offsetHeight <
            el.firstElementChild.firstElementChild.firstElementChild
              .offsetHeight;
        });
      }
    },
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaPublication: updateMediaPubliMeta`);
      }
      this.$emit("editPubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName,
        val,
      });
    },
    limitMediaXPos(xPos) {
      if (!this.limit_media_to_page) {
        return xPos;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaXPos / xPos = ${xPos}`);
      // }
      return Math.max(
        this.page.margin_left,
        Math.min(
          this.page.width - this.page.margin_right - this.mediaSize.width,
          xPos
        )
      );
    },
    roundMediaVal(val) {
      if (this.page.snap_to_grid) {
        return Math.round(val / this.page.gridstep) * this.page.gridstep;
      }
      return +val.toFixed(1);
    },

    limitMediaYPos(yPos) {
      if (!this.limit_media_to_page) {
        return yPos;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaYPos / yPos = ${yPos}`);
      // }
      yPos = Math.max(
        this.page.margin_top,
        Math.min(
          this.page.height - this.page.margin_bottom - this.mediaSize.height,
          yPos
        )
      );
      return yPos;
    },

    limitMediaWidth(w) {
      if (!this.limit_media_to_page) {
        return w;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaWidth / w = ${w}`);
      // }
      return Math.max(
        20,
        Math.min(this.page.width - this.page.margin_right - this.mediaPos.x, w)
      );
    },
    limitMediaHeight(h) {
      if (!this.limit_media_to_page) {
        return h;
      }
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaHeight / h = ${h}`);
      // }
      return Math.max(
        20,
        Math.min(
          this.page.height - this.page.margin_bottom - this.mediaPos.y,
          h
        )
      );
    },

    removePubliMedia() {
      this.$emit("removePubliMedia", {
        slugMediaName: this.media.publi_meta.metaFileName,
      });
    },
    resizeMedia({ event, type, origin }) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: resizeMedia with is_resized = ${this.is_resized}`
        );
      }

      if (this.read_only) return;

      this.resize_origin = origin;

      if (this.resize_origin === "bottomright") this.enableLock();
      else if (this.resize_origin !== "bottomright") this.disableLock();

      if (type === "mouse") {
        window.addEventListener("mousemove", this.resizeMove);
        window.addEventListener("mouseup", this.resizeUp);
      } else if (type === "touch") {
        window.addEventListener("touchmove", this.resizeMove);
        window.addEventListener("touchend", this.resizeUp);
      }
    },
    rotateMedia(type, origin) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: rotateMedia with is_resized = ${this.is_resized}`
        );
      }
      if (!this.read_only) {
        if (type === "mouse") {
          window.addEventListener("mousemove", this.rotateMove);
          window.addEventListener("mouseup", this.rotateUp);
        } else if (type === "touch") {
          window.addEventListener("touchmove", this.rotateMove);
          window.addEventListener("touchend", this.rotateUp);
        }
      }
    },
    resizeMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: resizeMove with is_resized = ${this.is_resized}`
        );
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_resized) {
        this.is_resized = true;
        this.is_selected = true;
        this.resizeOffset.x = pageX_mm;
        this.resizeOffset.y = pageY_mm;
        this.mediaSize.pwidth = Number.parseFloat(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseFloat(this.mediaSize.height);
      } else {
        const deltaX =
          (pageX_mm - this.resizeOffset.x) / this.$root.settings.publi_zoom;
        let newWidth = this.mediaSize.pwidth + deltaX;

        if (
          this.resize_origin === "right" ||
          this.resize_origin === "bottomright"
        )
          this.mediaSize.width = this.limitMediaWidth(newWidth);

        let new_height;
        if (this.lock_original_ratio)
          new_height = this.mediaSize.width * this.media.ratio;
        else {
          const deltaY =
            (pageY_mm - this.resizeOffset.y) / this.$root.settings.publi_zoom;
          new_height = this.mediaSize.pheight + deltaY;
        }

        if (
          this.resize_origin === "bottom" ||
          this.resize_origin === "bottomright"
        )
          this.mediaSize.height = this.limitMediaHeight(new_height);
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: resizeUp with is_resized = ${this.is_resized}`
        );

      if (this.is_resized) {
        this.mediaSize.width = this.roundMediaVal(this.mediaSize.width);
        if (this.lock_original_ratio && this.media.hasOwnProperty("ratio"))
          this.mediaSize.height = this.mediaSize.width * this.media.ratio;
        else this.mediaSize.height = this.roundMediaVal(this.mediaSize.height);

        this.updateMediaPubliMeta({
          width: this.mediaSize.width,
          height: this.mediaSize.height,
        });
        this.is_resized = false;
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.resizeMove);
      window.removeEventListener("mouseup", this.resizeUp);
      window.removeEventListener("touchmove", this.resizeMove);
      window.removeEventListener("touchend", this.resizeUp);

      return false;
    },

    rotateMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: rotateMove with is_rotated = ${this.is_rotated}`
        );
      }

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      const center_of_block = {
        x:
          this.$refs.media.getBoundingClientRect().x +
          this.$refs.media.getBoundingClientRect().width / 2,
        y:
          this.$refs.media.getBoundingClientRect().y +
          this.$refs.media.getBoundingClientRect().height / 2,
      };

      function angle(cx, cy, ex, ey) {
        var dy = ey - cy;
        var dx = ex - cx;
        var theta = Math.atan2(dy, dx); // range (-PI, PI]
        theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
        //if (theta < 0) theta = 360 + theta; // range [0, 360)
        return theta;
      }

      if (!this.is_rotated) {
        this.is_rotated = true;
        this.is_selected = true;

        // this.rotateOffset.x = pageX;
        // this.rotateOffset.y = pageY;

        const initial_angle = angle(
          center_of_block.x,
          center_of_block.y,
          pageX,
          pageY
        );

        this.rotateOffset.angle = this.rotate - initial_angle;
      } else {
        const current_angle = angle(
          center_of_block.x,
          center_of_block.y,
          pageX,
          pageY
        );

        this.rotate = this.rotateOffset.angle + current_angle;

        console.log("this.rotate = " + this.rotate);

        const angle_on_90pos = Math.abs(this.rotate % 90);
        if (angle_on_90pos < 5 || angle_on_90pos > 85)
          this.rotate = Math.round(this.rotate / 90) * 90;
      }
    },
    rotateUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: rotateUp with is_rotated = ${this.is_rotated}`
        );
      }

      if (this.is_rotated) {
        this.updateMediaPubliMeta({
          rotate: this.rotate,
        });
        this.is_rotated = false;
      }

      event.stopPropagation();
      window.removeEventListener("mousemove", this.rotateMove);
      window.removeEventListener("mouseup", this.rotateUp);
      window.removeEventListener("touchmove", this.rotateMove);
      window.removeEventListener("touchend", this.rotateUp);

      return false;
    },

    dragMedia(type) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: dragMedia with is_dragged = ${this.is_dragged}`
        );
      }

      if (this.read_only) return;

      if (type === "mouse") {
        this.is_selected = true;
        window.addEventListener("mousemove", this.dragMove);
        window.addEventListener("mouseup", this.dragUp);
      } else if (type === "touch") {
        window.addEventListener("touchmove", this.dragMove);
        window.addEventListener("touchend", this.dragUp);
      }
    },
    dragMove(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: dragMove with is_dragged = ${this.is_dragged}`
        );
      }

      const pageX = !!event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = !!event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_dragged) {
        this.is_dragged = true;
        this.is_selected = true;

        this.dragOffset.x = pageX_mm;
        this.dragOffset.y = pageY_mm;

        this.mediaPos.px = Number.parseFloat(this.mediaPos.x);
        this.mediaPos.py = Number.parseFloat(this.mediaPos.y);
      } else {
        const deltaX =
          (pageX_mm - this.dragOffset.x) / this.$root.settings.publi_zoom;
        let newX = this.mediaPos.px + deltaX;
        this.mediaPos.x = this.limitMediaXPos(newX);

        const deltaY =
          (pageY_mm - this.dragOffset.y) / this.$root.settings.publi_zoom;
        let newY = this.mediaPos.py + deltaY;
        this.mediaPos.y = this.limitMediaYPos(newY);
      }
    },
    dragUp(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(
          `METHODS • MediaPublication: dragUp with is_dragged = ${this.is_dragged}`
        );
      }
      if (this.is_dragged) {
        this.mediaPos.x =
          this.roundMediaVal(this.mediaPos.x - this.page.margin_left) +
          this.page.margin_left;
        this.mediaPos.y =
          this.roundMediaVal(this.mediaPos.y - this.page.margin_top) +
          this.page.margin_top;

        this.updateMediaPubliMeta({
          x: this.mediaPos.x,
          y: this.mediaPos.y,
        });
        this.is_dragged = false;
      }

      window.removeEventListener("mousemove", this.dragMove);
      window.removeEventListener("mouseup", this.dragUp);
      window.removeEventListener("touchmove", this.dragMove);
      window.removeEventListener("touchend", this.dragUp);

      return false;
    },
    deselectMedia(event) {
      if (this.$root.state.dev_mode === "debug") {
        console.log(`METHODS • MediaPublication: deselectMedia`);
      }
      this.is_selected = false;
      this.$emit("unselected");
    },
    mouseOver() {
      if (!this.is_touch) {
        this.is_hovered = true;
      }
    },
    mouseLeave() {
      if (!this.is_touch) {
        this.is_hovered = false;
      }
    },
    enableLock() {
      this.lock_original_ratio = true;
    },
    disableLock() {
      this.lock_original_ratio = false;
    },
  },
};
</script>
