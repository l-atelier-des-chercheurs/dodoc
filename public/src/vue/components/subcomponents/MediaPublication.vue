<template>
  <div
    class="m_mediaPublication"
    ref="media"
    :style="mediaStyles"
    @mouseover="mouseOver"
    @mouseleave="mouseLeave"
    @mousedown.stop="selectMedia"
    :class="[
      'type-' + media.type,
      'is--fit_mode_' + fit_mode,
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
        'is--locked': locked_in_place && !model_for_this_publication,
        'is--copy_mode': copy_mode_enabled,
        'has--basic_player': media.basic_player === true,
      },
    ]"
  >
    <template v-if="media.hasOwnProperty('_linked_media')">
      <div v-if="media._linked_media.hasOwnProperty('_isAbsent')">
        {{ $t("linked_media_wasnt_found") }}
        <br />
        <small>
          {{ media._linked_media.slugProjectName }}/{{
            media._linked_media.slugMediaName
          }}
        </small>
      </div>
      <!-- if media is link -->
      <MediaContent
        v-else
        :context="mode !== 'contact_sheet' ? 'full' : 'preview'"
        :slugFolderName="media._linked_media.slugProjectName"
        :media="media._linked_media"
        :read_only="read_only"
        v-model="media._linked_media.content"
        :style="contentStyles"
        :loop="media.loop_play"
        :plyr_controls="plyr_controls"
      />
    </template>
    <!-- if not -->
    <template v-else>
      <!-- if not -->
      <MediaContent
        v-if="
          [
            'image',
            'video',
            'audio',
            'code',
            'stl',
            'document',
            'other',
          ].includes(media.type)
        "
        :context="'full'"
        :slugFolderName="
          model_for_this_publication
            ? model_for_this_publication.slugFolderName
            : slugPubliName
        "
        :folderType="'publications'"
        :media="media"
        :read_only="read_only"
        v-model="media.content"
        :style="contentStyles"
        :loop="media.loop_play"
        :plyr_controls="plyr_controls"
      />

      <div
        class="mediaContainer"
        v-else
        :style="contentStyles"
        :class="`type-${media.type}`"
      >
        <template v-if="media.type === 'text'">
          <CollaborativeEditor
            v-if="inline_edit_mode"
            v-model="htmlForEditor"
            class="fixedPanel"
            :enable_collaboration="true"
            :media="media"
            :theme="'bubble'"
            :type="'publications'"
            :slugFolderName="slugPubliName"
            :show_cursors="false"
            ref="textField"
          />
          <div v-else class="mediaTextContent">
            <div v-if="htmlForEditor.length !== 0" v-html="htmlForEditor" />
            <p v-else class="_no_textcontent" v-html="$t('no_text_content')" />
          </div>
        </template>
        <template
          v-else-if="
            ['ellipsis', 'rectangle', 'line', 'arrow'].includes(media.type)
          "
        >
          <svg
            viewBox="0 0 100 100"
            :width="`${mediaSize.width}mm`"
            :height="`${mediaSize.height}mm`"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              v-if="media.type === 'ellipsis'"
              cx="50"
              cy="50"
              r="50"
              vector-effect="non-scaling-stroke"
            />
            <rect
              v-if="media.type === 'rectangle'"
              width="100"
              height="100"
              vector-effect="non-scaling-stroke"
            />
            <line
              v-if="media.type === 'line'"
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              vector-effect="non-scaling-stroke"
            />
            <g v-if="media.type === 'arrow'">
              <line
                x1="0"
                y1="50"
                x2="100"
                y2="50"
                vector-effect="non-scaling-stroke"
              />
              <g
                transform="
                translate(100, 50)"
                preserveAspectRatio
              >
                <line
                  x1="0"
                  y1="0"
                  x2="-10"
                  y2="-10"
                  vector-effect="non-scaling-stroke"
                />

                <line
                  x1="0"
                  y1="0"
                  x2="-10"
                  y2="10"
                  vector-effect="non-scaling-stroke"
                />
              </g>
            </g>
          </svg>
        </template>
        <template v-else-if="media.type === 'free_drawing'">
          <MediaFreeDrawing
            :inline_edit_mode="inline_edit_mode"
            :slugPubliName="slugPubliName"
            :media="media"
            :mediaSize="mediaSize"
          />
        </template>

        <template v-else-if="media.type === 'placeholder'">
          <EditPlaceholderModal
            v-if="inline_edit_mode"
            :media="media"
            @updateMediaPubliMeta="(values) => updateMediaPubliMeta({ values })"
            @close="inline_edit_mode = false"
          />
          <MediaPlaceholder
            :key="media.metaFileName"
            :model_placeholder_media="media"
            :slugPubliName="slugPubliName"
            :publication_is_submitted="publication_is_submitted"
            :publi_is_model="publi_is_model"
            :preview_mode="preview_mode"
            :read_only="read_only"
            :captureview_in_modal="true"
            :paged_mode="true"
            @addMedia="(values) => addMedia({ values })"
            @editPubliMedia="$emit('editPubliMedia', $event)"
          />
        </template>
      </div>
    </template>

    <div
      class="m_mediaPublication--floatingSaveButton"
      v-if="inline_edit_mode && media.type !== 'placeholder'"
    >
      <button
        type="button"
        class="button button-bg_rounded bg-orange"
        @click="cancelMediaInlineEditing"
      >
        <!-- <img src="/images/i_clear.svg" draggable="false" /> -->
        <span class="text-cap font-verysmall">{{ $t("cancel") }}</span>
      </button>
      <button
        type="button"
        class="button button-bg_rounded bg-bleuvert"
        @click="saveMedia"
      >
        <img src="/images/i_enregistre.svg" draggable="false" />
        <span class="text-cap font-verysmall">
          <slot name="submit_button">{{ $t("save") }}</slot>
        </span>
      </button>
    </div>

    <p
      class="mediaCaption"
      v-if="
        media.hasOwnProperty('_linked_media') && !!media._linked_media.caption
      "
    >
      {{ media._linked_media.caption }}
    </p>

    <button
      class="m_mediaPublication--overflowing_sign"
      type="button"
      v-if="
        is_text_overflowing &&
        !preview_mode &&
        !locked_in_place &&
        !model_for_this_publication &&
        (is_selected || is_hovered)
      "
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

    <!-- <transition name="fade_fast" :duration="150"> -->
    <div
      v-if="
        !preview_mode &&
        !inline_edit_mode &&
        !read_only &&
        !locked_in_place &&
        (is_selected || is_hovered) &&
        !model_for_this_publication
      "
      class="controlFrame"
      @click="copy_mode_enabled ? duplicateMedia() : false"
      @mousedown.stop.prevent="!copy_mode_enabled ? dragMedia('mouse') : false"
      @touchstart.stop.prevent="!copy_mode_enabled ? dragMedia('touch') : false"
    >
      <!-- <svg class="dashed-vector" viewBox="0 0 300 100" preserveAspectRatio="none">
        <path d="M0,0 300,0 300,100 0,100z" vector-effect="non-scaling-stroke" />
      </svg>-->
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
          style="enable-background: new 0 0 60 106"
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
          style="enable-background: new 0 0 106 60"
          xml:space="preserve"
        >
          <path
            d="M28.1,0l9.2,8.6l-6.5,6.6c-2,2-3.6,3.6-5,4.7c-1.4,1.1-3,2.2-4.8,3.2l64.1,0c-1.8-1-3.4-2.1-4.8-3.2 c-1.4-1.1-3.1-2.7-5-4.7l-6.6-6.6L77.7,0L106,30L77.7,60l-9.2-8.6l6.7-6.7c2-2,3.7-3.6,5.1-4.7c1.4-1.1,2.9-2.1,4.5-3l-63.9,0 c1.6,0.9,3.2,1.9,4.5,3c1.4,1.1,3.1,2.7,5.1,4.7l6.6,6.7L28.1,60L0,30L28.1,0z"
          />
        </svg>
      </div>
      <div
        v-if="ratio && (is_selected || is_hovered)"
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
          style="enable-background: new 0 0 77.5 77.5"
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
          style="enable-background: new 0 0 98.7 132.2"
          xml:space="preserve"
        >
          <defs />
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
    <transition name="fadeOnLeave">
      <div v-if="show_zindex_number" class="m_mediaPublication--zIndex">
        <svg viewBox="0 0 20 18">
          <text text-anchor="middle" x="10" y="15">{{ mediaZIndex }}</text>
        </svg>
      </div>
    </transition>

    <transition name="fade_fast" :duration="150">
      <div
        v-if="
          (((is_selected || is_hovered) &&
            !preview_mode &&
            !inline_edit_mode &&
            !read_only) ||
            (!preview_mode &&
              !inline_edit_mode &&
              !read_only &&
              locked_in_place)) &&
          !model_for_this_publication
        "
      >
        <button
          type="button"
          class="_lock_button _no_underline"
          :class="{ 'is--active': locked_in_place }"
          @mousedown.stop.prevent="toggleLock()"
          @touchstart.stop.prevent="toggleLock()"
          :content="!locked_in_place ? $t('lock_in_place') : $t('unlock')"
          v-tippy="{
            placement: 'bottom',
            delay: [600, 0],
          }"
        >
          <svg
            v-if="locked_in_place"
            version="1.1"
            class="inline-svg"
            style="padding-top: 6px"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="66.9px"
            height="88.3px"
            viewBox="0 0 66.9 88.3"
            xml:space="preserve"
          >
            <path
              style="fill: currentColor"
              d="M61.7,34.4h-1V24.3c0-11.7-7.5-19.2-16.9-22.7C40.6,0.6,36.7,0,33.1,0C29.5,0,26,0.6,22.4,1.6
		C13.3,4.9,6.2,12.3,6.2,24.3v10.1h-1c-2.9,0-5.2,2.3-5.2,5.2v43.5c0,2.9,2.3,5.2,5.2,5.2h56.5c2.9,0,5.2-2.3,5.2-5.2V39.6
		C66.9,36.7,64.6,34.4,61.7,34.4z M33.4,70.1c-4.5,0-8.4-3.6-8.4-8.1c0-4.5,3.9-8.4,8.4-8.4s8.1,3.9,8.1,8.4
		C41.5,66.5,38,70.1,33.4,70.1z M49,34.4H17.9V24.3c0-6.2,3.6-10.1,8.4-11.7c2.3-0.6,4.5-1.3,6.8-1.3c2.3,0,4.9,0.6,6.8,1.3
		c5.2,1.6,9.1,5.8,9.1,11.7V34.4z"
            />
          </svg>
          <svg
            class="inline-svg"
            v-else
            style="padding-top: 6px"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width="100.3px"
            height="87.3px"
            viewBox="0 0 100.3 87.3"
            xml:space="preserve"
          >
            <path
              class="st1"
              d="M84.1,1.6C80.5,0.6,76.9,0,73.3,0c-3.6,0-7.5,0.6-10.7,1.6c-9.4,3.6-16.9,11-16.9,22.7v9.1H17.9H6.2h-1
				c-2.9,0-5.2,2.3-5.2,5.2v43.5c0,2.9,2.3,5.2,5.2,5.2h56.5c2.9,0,5.2-2.3,5.2-5.2V38.6c0-2.9-2.3-5.2-5.2-5.2h-1h-3.3v-9.1
				c0-5.8,3.9-10.1,9.1-11.7c1.9-0.6,4.5-1.3,6.8-1.3c2.3,0,4.5,0.6,6.8,1.3c4.9,1.6,8.4,5.5,8.4,11.7v10.7h11.7V24.3
				C100.3,12.3,93.1,4.9,84.1,1.6z M40.9,64.2c-0.3,0.7-0.7,1.4-1.2,2c-0.3,0.4-0.7,0.8-1.1,1.1c-0.4,0.3-0.8,0.6-1.3,0.9
				c-1.2,0.6-2.5,1-3.9,1s-2.8-0.3-4-1c-0.5-0.2-0.9-0.5-1.3-0.9c-0.4-0.3-0.8-0.7-1.2-1.1c-0.5-0.6-1-1.3-1.3-2
				c-0.4-1-0.7-2-0.7-3.2c0-1.4,0.4-2.8,1-4c0.3-0.5,0.6-0.9,0.9-1.3s0.7-0.8,1.2-1.2c0.4-0.3,0.9-0.7,1.3-0.9c1.2-0.7,2.6-1,4-1
				s2.7,0.4,3.9,1c0.5,0.3,0.9,0.6,1.3,0.9s0.8,0.7,1.1,1.2s0.6,0.9,0.9,1.3c0.6,1.2,1,2.6,1,4C41.5,62.1,41.3,63.2,40.9,64.2z"
            />
          </svg>
        </button>
      </div>
    </transition>

    <transition name="fade_fast" :duration="150">
      <div
        v-if="
          (is_selected || is_hovered) &&
          !preview_mode &&
          !inline_edit_mode &&
          !read_only &&
          !locked_in_place &&
          !model_for_this_publication
        "
        class="m_mediaPublication--buttons"
      >
        <button
          type="button"
          v-if="
            media.type === 'text' ||
            media.type === 'placeholder' ||
            media.type === 'free_drawing'
          "
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

        <button
          type="button"
          class="_advanced_menu_button _no_underline"
          :class="{ 'is--active': show_advanced_menu }"
          @mousedown.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
            selectMedia();
          "
          @touchstart.stop.prevent="
            show_advanced_menu = !show_advanced_menu;
            selectMedia();
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
            style="enable-background: new 0 0 168 168"
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
            v-if="media.hasOwnProperty('_linked_media')"
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
              style="enable-background: new 0 0 113.5 113.5"
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
            @click.stop.prevent="duplicateMedia()"
          >
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
              <polygon
                class="st0"
                points="39.5,11.8 83,11.8 83,55.4 72.7,55.4 72.7,67.2 94.8,67.2 94.8,0 27.7,0 27.7,22.2 39.5,22.2 	"
              />
              <path
                class="st0"
                d="M67.2,27.7L0,27.7l0,67.2l67.2,0L67.2,27.7z M55.4,83l-43.6,0l0-43.6l43.6,0L55.4,83z"
              />
            </svg>
            <span class>{{ $t("duplicate") }}</span>
          </button>

          <button
            type="button"
            class="buttonLink _no_underline"
            @click.stop.prevent="removePubliMedia()"
          >
            <svg
              version="1.1"
              class="inline-svg"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="37.2px"
              height="37.2px"
              viewBox="0 0 37.2 37.2"
              style="enable-background: new 0 0 37.2 37.2"
              xml:space="preserve"
            >
              <polygon
                class="st0"
                points="37.2,30.6 30.6,37.2 18.6,25.2 6.6,37.2 0,30.6 12,18.6 0,6.6 6.6,0 18.6,12 30.6,0 37.2,6.6 
            25.2,18.6 "
              />
            </svg>
            {{ $t("withdraw") }}
          </button>
        </div>
      </div>
    </transition>

    <transition name="scaleIn" :duration="400">
      <Loader v-if="is_saving" />
    </transition>
  </div>
</template>
<script>
import MediaContent from "./MediaContent.vue";
import debounce from "debounce";
import CollaborativeEditor from "./CollaborativeEditor.vue";
import EditPlaceholderModal from "../modals/EditPlaceholderModal.vue";
import MediaPlaceholder from "./MediaPlaceholder.vue";
import MediaFreeDrawing from "./MediaFreeDrawing.vue";

export default {
  props: {
    media: Object,
    slugPubliName: String,
    mode: String,
    page: Object,
    read_only: Boolean,
    preview_mode: Boolean,
    publication_is_submitted: Boolean,
    pixelsPerMillimeters: Number,
    zoom: Number,
    model_for_this_publication: [Boolean, Object],
  },
  components: {
    MediaContent,
    CollaborativeEditor,
    EditPlaceholderModal,
    MediaPlaceholder,
    MediaFreeDrawing,
  },
  data() {
    return {
      is_dragged: false,
      is_resized: false,
      is_rotated: false,
      is_waitingForServer: false,
      is_hovered: false,
      is_touch: Modernizr.touchevents,
      is_text_overflowing: false,
      is_saving: false,

      copy_mode_enabled: false,

      inline_edit_mode: false,
      show_advanced_menu: false,
      show_zindex_number: false,

      limit_media_to_page: true,
      htmlForEditor: this.media.content ? this.media.content : "",

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

      ratio: undefined,

      font_size_percent: 100,
      opacity: 1,
      fill_color: "transparent",
      stroke_color: "transparent",
      stroke_width: 4,

      margin: 0,

      mediaSize: {
        width: 0,
        height: 0,
        pwidth: 0,
        pheight: 0,
      },

      custom_css: "",
      mediaZIndex: 0,

      fit_mode: "cover",
      locked_in_place: false,
      lock_original_ratio: false,
    };
  },

  created() {},
  mounted() {
    this.updateMediaStyles();
    this.$eventHub.$on("publication.selectNewMedia", this.selectNewMedia);
    this.$eventHub.$on(
      "publication.set_media_to_edit_mode",
      this.setMediaToEditMode
    );
    this.$eventHub.$on("publication.flashZIndex", this.flashZIndex);
    this.$eventHub.$on(
      "publication.selected.triggerAction",
      this.triggerAction
    );

    window.addEventListener("keydown", this.keyIsPressed);
    window.addEventListener("keyup", this.keyIsUnpressed);
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.selectNewMedia", this.selectNewMedia);
    this.$eventHub.$off(
      "publication.set_media_to_edit_mode",
      this.setMediaToEditMode
    );
    this.$eventHub.$off("publication.flashZIndex", this.flashZIndex);
    this.$eventHub.$off(
      "publication.selected.triggerAction",
      this.triggerAction
    );

    window.removeEventListener("keydown", this.keyIsPressed);
    window.removeEventListener("keyup", this.keyIsUnpressed);
  },

  watch: {
    media: {
      handler: function () {
        this.updateMediaStyles();
        this.htmlForEditor = this.media.content ? this.media.content : "";
      },
      deep: true,
    },
  },
  computed: {
    is_selected() {
      return this.$root.settings.current_publication.selected_medias.some(
        (meta) => meta === this.media.metaFileName
      );
    },
    plyr_controls() {
      if (this.media.basic_player) return ["play-large", "play"];
      return;
    },
    mediaStyles() {
      const set_z_index =
        this.is_selected && !this.show_zindex_number && !this.preview_mode
          ? 100000
          : this.media.z_index;
      const mix_blend_mode = this.media.blend_mode
        ? this.media.blend_mode
        : "normal";

      return `
        transform: translate(${this.mediaPos.x}mm, ${this.mediaPos.y}mm) rotate(${this.rotate}deg);
        width: ${this.mediaSize.width}mm;
        height: ${this.mediaSize.height}mm;
        z-index: ${set_z_index};
        mix-blend-mode: ${mix_blend_mode};
      `;
    },
    contentStyles() {
      let css = `
        --font_size_percent: ${this.font_size_percent}%;
        --opacity: ${this.opacity};
        --margin: ${this.margin}mm;
        --fill_color: ${this.fill_color};
        --stroke_color: ${this.stroke_color};
        --stroke_width: ${this.stroke_width}mm;
      `;

      // using vector-effect="non-scaling-stroke" to make sure stroke-width is consistent and rounded shapes work as intended
      // not handled by electron 2.x.x so not working as expected for now in electron
      // need to update electron soon

      if (this.media.custom_css) css += this.media.custom_css;

      return css;
    },
    text_is_overflowing() {
      const el = this.$refs.media;
      return el.offsetHeight + 15 < el.scrollHeight;
    },
  },
  methods: {
    keyIsPressed(event) {
      if (event.key === "Alt") {
        this.copy_mode_enabled = true;
      }
    },
    keyIsUnpressed() {
      if (event.key === "Alt") {
        this.copy_mode_enabled = false;
      }
    },
    selectNewMedia(metaFileName) {
      if (metaFileName === this.media.metaFileName)
        if (!this.is_selected) this.selectMedia();
    },
    triggerAction({ action, detail }) {
      if (!this.is_selected || this.is_saving) return;

      if (action === "remove") {
        this.removePubliMedia();
      } else if (action === "move" && detail) {
        if (this.page.snap_to_grid) {
          detail.x *= this.page.gridstep;
          detail.y *= this.page.gridstep;
        }

        const deltaX = detail.x;
        let newX = this.mediaPos.x + deltaX;
        const deltaY = detail.y;
        let newY = this.mediaPos.y + deltaY;

        this.mediaPos.x = this.limitMediaXPos(newX);
        this.mediaPos.y = this.limitMediaYPos(newY);

        this.mediaPos.x =
          this.roundMediaVal(this.mediaPos.x - this.page.margin_left) +
          this.page.margin_left;
        this.mediaPos.y =
          this.roundMediaVal(this.mediaPos.y - this.page.margin_top) +
          this.page.margin_top;

        this.updateMediaPubliMeta({
          values: {
            x: this.mediaPos.x,
            y: this.mediaPos.y,
          },
        });
      }
    },
    setMediaToEditMode(metaFileName) {
      if (metaFileName === this.media.metaFileName) {
        if (!this.is_selected) this.selectMedia();
        this.editButtonClicked();
      }
    },
    flashZIndex() {
      if (!this.show_zindex_number) {
        this.show_zindex_number = true;
        setTimeout(() => {
          this.show_zindex_number = false;
        }, 2000);
      }
    },
    saveMedia() {
      const values = {
        content: this.htmlForEditor,
      };

      this.$emit("editPubliMedia", {
        metaFileName: this.media.metaFileName,
        values,
      });

      this.inline_edit_mode = false;
    },
    cancelMediaInlineEditing() {
      if (this.media.content === "") {
        this.removePubliMedia();
      }

      this.htmlForEditor = this.media.content;
      this.inline_edit_mode = false;
    },
    editButtonClicked() {
      if (this.media.hasOwnProperty("_linked_media"))
        this.$root.openMedia({
          slugProjectName: this.media._linked_media.slugProjectName,
          metaFileName: this.media._linked_media.metaFileName,
        });
      else {
        this.inline_edit_mode = true;
        this.$nextTick(() => {
          if (this.$refs.textField && this.$refs.textField.$el)
            this.$refs.textField.$el.querySelector(".ql-editor").focus();
        });
      }
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
        values: {
          height: this.mediaSize.height,
        },
      });
    },
    toggleImageFitMode() {
      if (this.fit_mode === "cover") this.fit_mode = "contain";
      else if (this.fit_mode === "contain") this.fit_mode = "cover";

      this.updateMediaPubliMeta({
        values: {
          fit_mode: this.fit_mode,
        },
      });
    },

    toggleLock() {
      this.locked_in_place = !this.locked_in_place;
      this.updateMediaPubliMeta({
        values: {
          locked_in_place: this.locked_in_place,
        },
      });

      if (this.locked_in_place) {
        this.deselectMedia();
      } else {
        this.selectMedia();
      }
    },

    updateMediaStyles() {
      this.rotate = this.media.hasOwnProperty("rotate") ? this.media.rotate : 0;
      this.ratio = this.$root.getFileMeta({
        type: "ratio",
        media: this.media,
      });
      this.mediaSize.width =
        this.media.hasOwnProperty("width") &&
        !!Number.parseFloat(this.media.width)
          ? this.limitMediaWidth(Number.parseFloat(this.media.width))
          : 100;
      this.mediaSize.height =
        this.media.hasOwnProperty("height") &&
        !!Number.parseFloat(this.media.height)
          ? this.limitMediaHeight(Number.parseFloat(this.media.height))
          : this.ratio
          ? this.mediaSize.width * this.ratio
          : 66;

      this.mediaPos.x =
        this.media.hasOwnProperty("x") && !Number.isNaN(this.media.x)
          ? this.limitMediaXPos(Number.parseFloat(this.media.x))
          : this.page.margin_left;
      this.mediaPos.y =
        this.media.hasOwnProperty("y") && !Number.isNaN(this.media.y)
          ? this.limitMediaYPos(Number.parseFloat(this.media.y))
          : this.page.margin_top;
      this.custom_css = this.media.hasOwnProperty("custom_css")
        ? this.media.custom_css
        : this.custom_css;
      this.mediaZIndex = this.media.hasOwnProperty("z_index")
        ? this.media.z_index
        : 0;
      this.fit_mode = this.media.hasOwnProperty("fit_mode")
        ? this.media.fit_mode
        : "cover";
      this.locked_in_place = this.media.hasOwnProperty("locked_in_place")
        ? Boolean(this.media.locked_in_place)
        : false;

      this.margin =
        this.media.hasOwnProperty("margin") &&
        Number.parseFloat(this.media.margin)
          ? Number.parseFloat(this.media.margin)
          : 0;

      this.opacity =
        this.media.hasOwnProperty("opacity") &&
        !Number.isNaN(this.media.opacity)
          ? Number.parseFloat(this.media.opacity)
          : 1;

      if (
        this.media.type === "text" ||
        (this.media.hasOwnProperty("_linked_media") &&
          this.media._linked_media.type === "text")
      ) {
        this.font_size_percent =
          this.media.hasOwnProperty("font_size_percent") &&
          !!Number.parseFloat(this.media.font_size_percent)
            ? Number.parseFloat(this.media.font_size_percent)
            : 100;

        this.$nextTick(() => {
          const el = this.$refs.media;
          this.is_text_overflowing =
            el.offsetHeight <
            el.firstElementChild.firstElementChild.firstElementChild
              .offsetHeight;
        });
      }

      this.stroke_color =
        this.media.hasOwnProperty("stroke_color") && !!this.media.stroke_color
          ? this.media.stroke_color
          : "";
      this.fill_color =
        this.media.hasOwnProperty("fill_color") && !!this.media.fill_color
          ? this.media.fill_color
          : "";
      this.stroke_width = this.media.hasOwnProperty("stroke_width")
        ? Number.parseFloat(this.media.stroke_width)
        : 4;
    },
    updateMediaPubliMeta({ values, metaFileName = this.media.metaFileName }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: updateMediaPubliMeta for metaFileName = ${metaFileName} and values=${JSON.stringify(
            values
          )}`
        );

      this.$emit("editPubliMedia", {
        metaFileName,
        values,
      });

      this.is_saving = true;

      const media_editing_timeout = setTimeout(() => {
        if (this.is_saving) {
          this.is_saving = false;
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("notifications.failed_to_save_media"));
        }
      }, 5000);

      this.$eventHub.$once(`publication.media_just_edited`, () => {
        this.is_saving = false;
        clearTimeout(media_editing_timeout);
      });
    },
    limitMediaXPos(xPos) {
      if (!this.limit_media_to_page) return xPos;

      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaXPos / xPos = ${xPos}`);
      // }

      const xcenter = this.mediaSize.width / 2;

      return Math.max(-xcenter, Math.min(this.page.width - xcenter, xPos));
      // return Math.max(
      //   this.page.margin_left - xcenter,
      //   Math.min(this.page.width - this.page.margin_right - xcenter, xPos)
      // );
    },
    roundMediaVal(val) {
      if (this.page.snap_to_grid)
        return Math.round(val / this.page.gridstep) * this.page.gridstep;

      return +val.toFixed(1);
    },

    limitMediaYPos(yPos) {
      if (!this.limit_media_to_page) return yPos;

      const ycenter = this.mediaSize.height / 2;

      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaYPos / yPos = ${yPos}`);
      // }

      return Math.max(-ycenter, Math.min(this.page.height - ycenter, yPos));
      // return Math.max(
      //   this.page.margin_top - ycenter,
      //   Math.min(this.page.height - this.page.margin_bottom - ycenter, yPos)
      // );
    },

    limitMediaWidth(w) {
      if (!this.limit_media_to_page) return w;

      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaWidth / w = ${w}`);
      // }

      return Math.max(5, Math.min(this.page.width, w));
    },
    limitMediaHeight(h) {
      if (!this.limit_media_to_page) return h;

      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaHeight / h = ${h}`);
      // }
      return Math.max(5, Math.min(this.page.height, h));
    },

    removePubliMedia() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sureToRemoveMedia"),
          () => {
            this.$emit("removePubliMedia", {
              metaFileName: this.media.metaFileName,
            });
          },
          () => {}
        );
    },
    duplicateMedia() {
      this.$emit("duplicateMedia", {
        metaFileName: this.media.metaFileName,
      });
    },
    resizeMedia({ event, type, origin }) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: resizeMedia with is_resized = ${this.is_resized}`
        );

      if (this.read_only) return;

      this.resize_origin = origin;

      if (this.resize_origin === "bottomright") this.lock_original_ratio = true;
      else if (this.resize_origin !== "bottomright")
        this.lock_original_ratio = false;

      if (type === "mouse") {
        window.addEventListener("mousemove", this.resizeMove);
        window.addEventListener("mouseup", this.resizeUp);
      } else if (type === "touch") {
        window.addEventListener("touchmove", this.resizeMove);
        window.addEventListener("touchend", this.resizeUp);
      }
    },
    rotateMedia(type, origin) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: rotateMedia with is_resized = ${this.is_resized}`
        );

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
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: resizeMove with is_resized = ${this.is_resized}`
        );

      const pageX = event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_resized) {
        this.is_resized = true;
        this.selectMedia();
        this.resizeOffset.x = pageX_mm;
        this.resizeOffset.y = pageY_mm;
        this.mediaSize.pwidth = Number.parseFloat(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseFloat(this.mediaSize.height);
        this.mediaPos.px = Number.parseFloat(this.mediaPos.x);
        this.mediaPos.py = Number.parseFloat(this.mediaPos.y);
      } else {
        if (
          this.resize_origin === "right" ||
          this.resize_origin === "bottomright"
        ) {
          const new_width = this.getNewSize({
            pageX_mm,
            pageY_mm,
            axis_angle: 0,
            plength: this.mediaSize.pwidth,
          });
          this.mediaSize.width = this.limitMediaWidth(new_width);
        }
        if (
          this.resize_origin === "bottom" ||
          this.resize_origin === "bottomright"
        ) {
          let new_height = 0;

          if (this.lock_original_ratio && this.ratio) {
            new_height = this.mediaSize.width * this.ratio;
          } else {
            new_height = this.getNewSize({
              pageX_mm,
              pageY_mm,
              axis_angle: 90,
              plength: this.mediaSize.pheight,
            });
          }

          this.mediaSize.height = this.limitMediaHeight(new_height);
        }

        // TODO : prevent opposite axis from moving

        // this.mediaPos.x =
        //   this.mediaPos.px + Math.cos(new_width - this.mediaSize.pwidth);

        // this.mediaPos.x =
        //   this.mediaPos.py + (new_width - this.mediaSize.pwidth) / 2;

        // we need to move x and y to prevent them from moving
      }
    },
    getNewSize({ pageX_mm, pageY_mm, axis_angle, plength }) {
      const angle = (this.rotate + axis_angle) * (Math.PI / 180); // rads to degs, range (-180, 180]
      let distance =
        Math.cos(angle) * (pageX_mm - this.resizeOffset.x) +
        Math.sin(angle) * (pageY_mm - this.resizeOffset.y);

      const new_length = distance / this.zoom + plength;
      return new_length;
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: resizeUp with is_resized = ${this.is_resized}`
        );

      if (this.is_resized) {
        this.mediaSize.width = this.roundMediaVal(this.mediaSize.width);
        // if (this.lock_original_ratio && this.media.hasOwnProperty("ratio"))
        //   this.mediaSize.height = this.mediaSize.width * this.media.ratio;
        // else
        if (this.lock_original_ratio && this.ratio)
          this.mediaSize.height = this.mediaSize.width * this.ratio;
        else this.mediaSize.height = this.roundMediaVal(this.mediaSize.height);

        this.updateMediaPubliMeta({
          values: {
            width: this.mediaSize.width,
            height: this.mediaSize.height,
          },
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
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: rotateMove with is_rotated = ${this.is_rotated}`
        );

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
        this.selectMedia();

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
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: rotateUp with is_rotated = ${this.is_rotated}`
        );

      if (this.is_rotated) {
        this.updateMediaPubliMeta({
          values: {
            rotate: this.rotate,
          },
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
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: dragMedia with is_dragged = ${this.is_dragged}`
        );

      if (this.read_only) return;

      if (type === "mouse") {
        this.selectMedia();

        window.addEventListener("mousemove", this.dragMove);
        window.addEventListener("mouseup", this.dragUp);
      } else if (type === "touch") {
        window.addEventListener("touchmove", this.dragMove);
        window.addEventListener("touchend", this.dragUp);
      }
    },
    dragMove(event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: dragMove with is_dragged = ${this.is_dragged}`
        );

      const pageX = !!event.pageX ? event.pageX : event.touches[0].pageX;
      const pageY = !!event.pageY ? event.pageY : event.touches[0].pageY;

      const pageX_mm = pageX / this.pixelsPerMillimeters;
      const pageY_mm = pageY / this.pixelsPerMillimeters;

      if (!this.is_dragged) {
        this.is_dragged = true;
        this.selectMedia();

        this.dragOffset.x = pageX_mm;
        this.dragOffset.y = pageY_mm;

        this.mediaPos.px = Number.parseFloat(this.mediaPos.x);
        this.mediaPos.py = Number.parseFloat(this.mediaPos.y);
      } else {
        const deltaX = (pageX_mm - this.dragOffset.x) / this.zoom;
        let newX = this.mediaPos.px + deltaX;
        this.mediaPos.x = this.limitMediaXPos(newX);

        const deltaY = (pageY_mm - this.dragOffset.y) / this.zoom;
        let newY = this.mediaPos.py + deltaY;
        this.mediaPos.y = this.limitMediaYPos(newY);
      }
    },
    dragUp(event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(
          `METHODS • MediaPublication: dragUp with is_dragged = ${this.is_dragged}`
        );

      if (this.is_dragged) {
        this.mediaPos.x =
          this.roundMediaVal(this.mediaPos.x - this.page.margin_left) +
          this.page.margin_left;
        this.mediaPos.y =
          this.roundMediaVal(this.mediaPos.y - this.page.margin_top) +
          this.page.margin_top;

        this.updateMediaPubliMeta({
          values: {
            x: this.mediaPos.x,
            y: this.mediaPos.y,
          },
        });
        this.is_dragged = false;
      }

      window.removeEventListener("mousemove", this.dragMove);
      window.removeEventListener("mouseup", this.dragUp);
      window.removeEventListener("touchmove", this.dragMove);
      window.removeEventListener("touchend", this.dragUp);

      return false;
    },
    toggleMediaSelection() {
      if (this.is_selected) this.deselectMedia();
      else this.selectMedia();
    },
    selectMedia() {
      if (this.is_selected || this.read_only || this.model_for_this_publication)
        return;

      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • MediaPublication: deselectMedia`);

      // if shift is not hold down
      // then we unselect everything
      this.$root.settings.current_publication.selected_medias = [];

      this.$root.settings.current_publication.selected_medias.push(
        this.media.metaFileName
      );
    },
    deselectMedia() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`METHODS • MediaPublication: deselectMedia`);

      this.show_advanced_menu = false;

      this.$root.settings.current_publication.selected_medias = this.$root.settings.current_publication.selected_medias.filter(
        (meta) => meta !== this.media.metaFileName
      );
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
  },
};
</script>
