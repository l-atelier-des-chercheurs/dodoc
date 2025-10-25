<template>
  <div class="m_captureview">
    <CapturePane
      v-show="show_capture_settings"
      :label="$t('settings')"
      :pane_type="'settings'"
      @close="show_capture_settings = false"
    >
      <CaptureSettings
        :audio_output_deviceId.sync="audio_output_deviceId"
        @setStream="setStream"
        @hasFinishedLoading="hasFinishedLoading"
        @show="show_capture_settings = true"
      />
    </CapturePane>

    <CapturePane
      v-show="show_effects_pane"
      :label="$t('effects')"
      :pane_type="'effects'"
      @close="show_effects_pane = false"
    >
      <CaptureEffects
        :enable_effects.sync="enable_effects"
        :videoElement="$refs.videoElement"
        :canvasElement="$refs.canvasElement"
        :project_path="path"
      />
    </CapturePane>

    <div class="m_captureview--videoPane">
      <transition name="slidedown" :duration="500">
        <ModeSelector
          v-if="show_mode_selector"
          :available_modes="available_modes"
          :selected_mode="selected_mode"
          :disable_change_mode="
            is_recording ||
            media_to_validate ||
            mode_just_changed ||
            is_making_stopmotion
          "
          @changeMode="$emit('changeMode', $event)"
        />
      </transition>

      <div
        class="m_captureview--videoPane--top"
        v-show="!is_validating_stopmotion_video"
      >
        <div class="m_captureview--videoPane--top--videoContainer">
          <div class="_videoEl" :style="`opacity: ${show_videos ? 1 : 0}`">
            <video
              v-if="showVideoElement"
              ref="videoElement"
              autoplay
              playsinline
              :src-object.prop.camel="stream"
              :controls="false"
              muted
              :style="`opacity: ${enable_effects ? '0' : '1'}`"
            />
            <canvas
              ref="canvasElement"
              v-show="enable_effects"
              :width="actual_camera_resolution.width"
              :height="actual_camera_resolution.height"
              @click="(e) => updateSelectedColor({ e, type: 'click' })"
            />
            <!-- @mousemove="(e) => updateSelectedColor({ e, type: 'move' })" -->
          </div>

          <VectoMode
            v-if="selected_mode === 'vecto' && !media_to_validate"
            ref="vectoElement"
            :last_frame_from_video="last_frame_from_video"
            :number_of_colors="vecto_number_of_colors"
          />

          <LinesMode
            v-if="selected_mode === 'lines' && !media_to_validate"
            ref="vectoElement"
            :last_frame_from_video="last_frame_from_video"
            :angle="lines_angle"
            :boost_brightness="lines_brightness"
            :boost_contrast="lines_contrast"
            :density="lines_density"
          />

          <AudioEqualizer
            v-if="selected_mode === 'audio' && !media_to_validate"
            ref="equalizerElement"
            :stream="stream"
            :is_recording="is_recording"
          />

          <transition-group
            tag="div"
            class="_capture_options"
            name="slideFromTop"
            mode="out-in"
          >
            <div
              class="_duration_timer"
              v-if="
                selected_mode !== 'stopmotion' &&
                is_recording &&
                timer_recording_in_seconds !== false
              "
              :key="'duration'"
              v-html="timer_recording_in_seconds"
            />

            <div
              v-if="
                selected_mode === 'stopmotion' &&
                timelapse_mode_enabled &&
                !timelapse_event
              "
              :key="'timelapse_interval'"
              class="record_options"
            >
              <div>
                <span>{{ $t("interval_between_pictures") }}</span>
                <input
                  type="number"
                  min="1"
                  v-model.number="timelapse_interval"
                />
                <span>{{ $t("seconds") }}</span>
              </div>
            </div>

            <div
              v-if="
                delay_mode_enabled &&
                !is_recording &&
                !media_to_validate &&
                !delay_event
              "
              :key="'delay_interval'"
              class="record_options"
            >
              <div>
                <span>{{ $t("delay") }}</span>
                <input
                  type="number"
                  v-model.number="delay_seconds"
                  min="1"
                  max="60"
                />
                <span>{{ $t("seconds") }}</span>
              </div>
            </div>
          </transition-group>

          <transition name="scaleInFade" mode="out-in">
            <label
              v-if="delay_remaining_time"
              :key="'delay_before_' + delay_remaining_time"
              class="_delay_timer"
              :class="{ 'is--small': capture_pane_is_small }"
              v-html="delay_remaining_time"
            />
            <label
              v-else-if="timelapse_time_before_next_picture"
              :key="'timelapse_before_' + timelapse_time_before_next_picture"
              class="_delay_timer is--small is--timelapse"
              v-html="timelapse_time_before_next_picture"
            />
            <!-- necessary to handle timely out-in transition -->
            <!-- <span v-else /> -->
          </transition>

          <transition name="onionSkin" mode="in-out">
            <MediaContent
              v-if="
                selected_mode === 'stopmotion' &&
                onion_skin_img &&
                stopmotion_slug &&
                !is_validating_stopmotion_video &&
                !(show_live_feed && onion_skin_opacity === 0)
              "
              class="_onion_skin"
              :class="{ 'is--onionskin': show_live_feed }"
              :key="show_live_feed ? false : onion_skin_img.$path"
              :file="onion_skin_img"
              :resolution="1600"
              :style="
                show_live_feed
                  ? `--onionskin-opacity: ${onion_skin_opacity}`
                  : ''
              "
            />
          </transition>

          <div
            class="_video_grid_overlay"
            v-if="current_grid_type && enable_video && !media_to_validate"
          >
            <svg
              :width="actual_camera_resolution.width"
              :height="actual_camera_resolution.height"
              :viewBox="`0 0 ${actual_camera_resolution.width} ${actual_camera_resolution.height}`"
            >
              <line
                v-for="([x1, y1, x2, y2], index) in grids[current_grid_type]"
                :key="index"
                :x1="x1 + '%'"
                :y1="y1 + '%'"
                :x2="x2 + '%'"
                :y2="y2 + '%'"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </div>

          <transition name="fade_fast">
            <div class="_settingsTag" v-if="!is_recording">
              <template
                v-if="
                  !(must_validate_media && media_to_validate) &&
                  selected_mode !== 'audio'
                "
              >
                <button
                  type="button"
                  class="u-button u-button_small"
                  @click="show_capture_settings = !show_capture_settings"
                  v-if="enable_video"
                >
                  {{ actual_camera_resolution.width }} ×
                  {{ actual_camera_resolution.height }}
                </button>

                <select
                  v-model="current_grid_type"
                  v-if="enable_video && selected_mode !== 'audio'"
                  size="small"
                  :class="{
                    'is--active': current_grid_type !== false,
                  }"
                >
                  <option :value="false">
                    --{{ $t("grid").toLowerCase() }}--
                  </option>
                  <option
                    v-for="grid_type in Object.keys(grids)"
                    :value="grid_type"
                    :key="grid_type"
                  >
                    {{ $t(grid_type).toLowerCase() }}
                  </option>
                </select>
              </template>

              <button
                type="button"
                class="u-button u-button_small"
                :class="{
                  'is--active': has_location_to_add_to_medias,
                }"
                @click="show_position_modal = true"
              >
                <!-- {{ $t("location") }} -->
                <b-icon
                  :icon="
                    has_location_to_add_to_medias ? 'pin-map-fill' : 'pin-map'
                  "
                />
              </button>
              <PickLocationForCaptures
                v-if="show_position_modal"
                :location_to_add_to_medias.sync="location_to_add_to_medias"
                @close="show_position_modal = false"
              />
            </div>
          </transition>

          <transition name="enableMode" :duration="800">
            <div
              v-if="mode_just_changed && !is_loading_stream"
              class="_mode_indicator"
              v-html="$t(selected_mode)"
            />
          </transition>

          <transition name="justCaptured">
            <MediaPreviewBeforeValidation
              v-if="media_to_validate && must_validate_media"
              :media_to_validate="media_to_validate"
              :audio_output_deviceId="audio_output_deviceId"
            />
          </transition>

          <transition name="fade_fast">
            <LoaderSpinner class="_loader" v-if="is_loading_stream" />
          </transition>
        </div>
      </div>

      <StopmotionPanel
        v-if="stopmotion_slug"
        :current_stopmotion_path="`${path}/stopmotions/${stopmotion_slug}`"
        :stream="stream"
        :show_live_feed.sync="show_live_feed"
        :is_validating_stopmotion_video.sync="is_validating_stopmotion_video"
        :onion_skin_opacity.sync="onion_skin_opacity"
        :stopmotion_frame_rate.sync="stopmotion_frame_rate"
        @insertMedia="(meta_filename) => $emit('insertMedia', meta_filename)"
        @close="closeStopmotionPanel"
        @showPreviousImage="onion_skin_img = $event"
      />
      <!-- </transition> -->

      <transition name="slideup" :duration="150" mode="out-in">
        <div class="m_captureview--videoPane--bottom">
          <transition name="fade_fast" :duration="150">
            <LoaderSpinner v-if="is_sending_image" />
          </transition>

          <transition name="slideup" :duration="150" mode="out-in">
            <div
              class="m_captureview--videoPane--bottom--buttons"
              :class="{
                'is--recording': is_recording && !video_recording_is_paused,
                'is--sending_image': is_sending_image,
              }"
              v-if="
                !(media_to_validate.temp_name && must_validate_media) &&
                !is_validating_stopmotion_video
              "
            >
              <div>
                <template
                  v-if="
                    !is_recording &&
                    !is_making_stopmotion &&
                    !is_recording &&
                    !delay_event
                  "
                >
                  <button
                    type="button"
                    class="u-button u-button_red _settingsBtn"
                    :class="{ 'is--active': show_capture_settings }"
                    @click="show_capture_settings = !show_capture_settings"
                    :content="$t('settings')"
                  >
                    <svg
                      class="inline-svg inline-svg_larger"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      viewBox="15 15 140 140"
                      xml:space="preserve"
                    >
                      <path
                        style="fill: currentColor"
                        d="M122.7,88.8v-10c0-1.1,0.6-2.1,1.6-2.6l9.6-4.9l-2-5.8l-11,1.6c-1.1,0.2-2.2-0.3-2.9-1.2l-6-8.1
                  c-0.7-0.9-0.8-2.1-0.3-3l4.8-9.6l-5.2-3.6l-7.7,7.5c-0.8,0.8-2,1-3.1,0.7l-9.9-3c-1.1-0.3-1.9-1.3-2.1-2.4L86.8,34h-6.4l-1.7,10.4
                  c-0.2,1.1-0.9,2-2,2.4L66.8,50c-1.1,0.3-2.2,0.1-3.1-0.7L55.9,42l-5.1,3.7l4.9,9.4c0.5,1,0.4,2.1-0.2,3l-6,8.2
                  c-0.6,0.9-1.8,1.4-2.9,1.2L35.8,66L34,71.8l9.7,4.8c1,0.5,1.7,1.5,1.7,2.6v10c0,1.1-0.6,2.1-1.6,2.6l-9.6,4.9l2,5.9l10.9-1.6
                  c1.1-0.2,2.2,0.3,2.9,1.2l6,8.1c0.7,0.9,0.8,2.1,0.3,3l-4.8,9.6l5.1,3.6l7.7-7.5c0.8-0.8,2-1,3.1-0.7l9.9,3
                  c1.1,0.3,1.9,1.3,2.1,2.4l1.9,10.4h6.4l1.7-10.4c0.2-1.1,0.9-2,2-2.4l9.9-3.2c1.1-0.3,2.2-0.1,3.1,0.7l7.8,7.3l5.1-3.7l-4.9-9.4
                  c-0.5-1-0.4-2.1,0.2-3l6-8.1c0.7-0.9,1.8-1.4,2.9-1.2l10.8,1.5l1.8-5.9l-9.7-4.8C123.3,90.9,122.7,89.9,122.7,88.8z M84,104.5
                  c-11.7,0-21.1-9.2-21.1-20.5c0-11.3,9.5-20.5,21.1-20.5s21.1,9.2,21.1,20.5C105.1,95.3,95.7,104.5,84,104.5z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    v-if="selected_mode !== 'audio'"
                    class="u-button u-button_bleumarine _settingsBtn"
                    :class="{ 'is--active': show_effects_pane }"
                    @click="show_effects_pane = !show_effects_pane"
                    :content="$t('effects')"
                  >
                    <!-- v-tippy="{
                      placement: 'right',
                      delay: [600, 0],
                    }" -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 168 168"
                      class="inline-svg inline-svg_larger"
                    >
                      <path
                        d="M110.3488,72.0093,114.6377,59.36a4.4236,4.4236,0,0,0-1.07-4.59,4.4946,4.4946,0,0,0-4.59-1.0745L96.3334,57.9846,85.62,50a4.5219,4.5219,0,0,0-4.6965-.4029,4.4316,4.4316,0,0,0-2.4409,4.0388l.1714,13.3577L67.7468,74.7049A4.4686,4.4686,0,0,0,68.9974,82.62L79.2565,85.807,38.1043,126.9546a2.3155,2.3155,0,1,0,3.2745,3.2746L82.5311,89.0769l3.1865,10.2638a4.4571,4.4571,0,0,0,3.5664,3.08c.12.0185.579.0556.704.0556a4.4844,4.4844,0,0,0,3.6451-1.88L101.35,89.6883l13.6078.1621a4.6074,4.6074,0,0,0,3.784-2.4316,4.4328,4.4328,0,0,0-.3983-4.6965ZM100.1869,85.0381a2.5322,2.5322,0,0,0-1.9221.9773L90.039,97.6409,85.8149,84.0423a2.3238,2.3238,0,0,0-1.5192-1.5238l-13.8764-4.03,11.8987-8.42a2.3208,2.3208,0,0,0,.9773-1.9221L82.846,53.71l11.6764,8.7168a2.3569,2.3569,0,0,0,2.1259.3381l13.5986-4.8911L105.56,71.6758a2.3135,2.3135,0,0,0,.3428,2.1259l8.8464,11.417Z"
                        style="
                          fill: #fc4b60;
                          stroke: #fc4b60;
                          stroke-miterlimit: 10;
                          stroke-width: 2.8346456692913384px;
                        "
                      />
                      <path
                        d="M58.9467,42.2277h2.3158v2.3158a2.3159,2.3159,0,1,0,4.6317,0V42.2277H68.21a2.3159,2.3159,0,0,0,0-4.6317H65.8942V35.28a2.3159,2.3159,0,0,0-4.6317,0V37.596H58.9467a2.3159,2.3159,0,0,0,0,4.6317Z"
                        style="
                          fill: #fc4b60;
                          stroke: #fc4b60;
                          stroke-miterlimit: 10;
                          stroke-width: 2.8346456692913384px;
                        "
                      />
                      <path
                        d="M49.6834,65.386h2.3158v2.3158a2.3159,2.3159,0,0,0,4.6317,0V65.386h2.3158a2.3159,2.3159,0,0,0,0-4.6317H56.6309V58.4385a2.3159,2.3159,0,0,0-4.6317,0v2.3158H49.6834a2.3159,2.3159,0,0,0,0,4.6317Z"
                        style="
                          fill: #fc4b60;
                          stroke: #fc4b60;
                          stroke-miterlimit: 10;
                          stroke-width: 2.8346456692913384px;
                        "
                      />
                      <path
                        d="M133.0531,102.4392h-2.3158v-2.3158a2.3159,2.3159,0,0,0-4.6317,0v2.3158H123.79a2.3159,2.3159,0,0,0,0,4.6317h2.3158v2.3158a2.3159,2.3159,0,1,0,4.6317,0v-2.3158h2.3158a2.3159,2.3159,0,0,0,0-4.6317Z"
                        style="
                          fill: #fc4b60;
                          stroke: #fc4b60;
                          stroke-miterlimit: 10;
                          stroke-width: 2.8346456692913384px;
                        "
                      />
                      <path
                        d="M109.8949,111.7026H107.579v-2.3159a2.3158,2.3158,0,1,0-4.6316,0v2.3159h-2.3158a2.3158,2.3158,0,1,0,0,4.6316h2.3158V118.65a2.3158,2.3158,0,1,0,4.6316,0v-2.3158h2.3159a2.3158,2.3158,0,0,0,0-4.6316Z"
                        style="
                          fill: #fc4b60;
                          stroke: #fc4b60;
                          stroke-miterlimit: 10;
                          stroke-width: 2.8346456692913384px;
                        "
                      />
                      <path
                        d="M119.1582,46.8594h2.3158v2.3158a2.3158,2.3158,0,1,0,4.6316,0V46.8594h2.3159a2.3159,2.3159,0,0,0,0-4.6317h-2.3159V39.9119a2.3158,2.3158,0,1,0-4.6316,0v2.3158h-2.3158a2.3159,2.3159,0,1,0,0,4.6317Z"
                        style="
                          fill: #fc4b60;
                          stroke: #fc4b60;
                          stroke-miterlimit: 10;
                          stroke-width: 2.8346456692913384px;
                        "
                      />
                    </svg>
                  </button>
                </template>

                <button
                  type="button"
                  class="u-button u-button_orange u-button_inline _captureButton"
                  :key="selected_mode + '_pause'"
                  v-if="selected_mode === 'video' && is_recording"
                  @mousedown.stop.prevent="pauseOrResumeCapture()"
                  @touchstart.stop.prevent="pauseOrResumeCapture()"
                >
                  <template v-if="!video_recording_is_paused">
                    <svg
                      class="inline-svg inline-svg_larger"
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
                        id="FOND_3_"
                        style="fill: #ffbe32"
                        d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84
			C168,37.6,130.4,0,84,0z"
                      />
                      <rect
                        id="CENTRE_3_"
                        x="35"
                        y="46.7"
                        style="fill: #ff3e51"
                        width="38"
                        height="76"
                      />
                      <rect
                        id="CENTRE_3_"
                        x="93"
                        y="46.7"
                        style="fill: #ff3e51"
                        width="38"
                        height="76"
                      />
                    </svg>
                    &nbsp;
                    <span>
                      {{ $t("pause_recording") }}
                    </span>
                  </template>
                  <template v-else>
                    <svg
                      class="inline-svg inline-svg_larger"
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
                        id="FOND_3_"
                        style="fill: #ffbe32"
                        d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84
			C168,37.6,130.4,0,84,0z"
                      />
                      <polygon
                        style="fill: #ff3e51"
                        points="45 40, 130 84.7, 45 128"
                      />
                    </svg>
                    &nbsp;
                    <span>
                      {{ $t("unpause_recording") }}
                    </span>
                  </template>
                </button>

                <button
                  type="button"
                  class="u-button u-button_transparent u-button_inline _captureButton"
                  :key="selected_mode + '_pause'"
                  v-if="
                    selected_mode === 'stopmotion' &&
                    is_making_stopmotion &&
                    !timelapse_event
                  "
                  @mousedown.stop.prevent="stopStopmotion()"
                  @touchstart.stop.prevent="stopStopmotion()"
                >
                  <span class>‹ {{ $t("back") }}</span>
                </button>
              </div>
              <div>
                <transition name="fade_fast" mode="out-in">
                  <button
                    type="button"
                    v-if="!is_recording"
                    class="u-button u-button_orange _captureButton"
                    :class="{
                      'is--active': capture_button_pressed,
                    }"
                    :disabled="is_sending_image"
                    :key="selected_mode + is_recording"
                    @mousedown.stop.prevent="setCaptureInit()"
                    @touchstart.stop.prevent="setCaptureInit()"
                  >
                    <span v-if="delay_event">
                      {{ $t("cancel") }}
                    </span>

                    <template v-else>
                      <img
                        class="inline-svg inline-svg_larger"
                        :src="$root.publicPath + 'images/i_record.svg'"
                      />
                      &nbsp;
                      <span
                        v-if="
                          ['photo', 'vecto', 'lines'].includes(selected_mode)
                        "
                        v-html="$t('take_picture')"
                      />
                      <span
                        v-else-if="selected_mode === 'video'"
                        v-html="$t('record_video')"
                      />
                      <span
                        v-else-if="selected_mode === 'audio'"
                        v-html="$t('record_audio')"
                      />
                      <span
                        v-else-if="selected_mode === 'stopmotion'"
                        v-html="
                          !timelapse_mode_enabled
                            ? $t('take_picture')
                            : $t('start_timelapse')
                        "
                      />
                    </template>
                  </button>
                  <button
                    type="button"
                    v-else-if="is_recording"
                    class="u-button u-button_orange u-button_inline _captureButton"
                    :disabled="is_sending_image"
                    :key="selected_mode + is_recording"
                    @mousedown.stop.prevent="stopRecording()"
                    @touchstart.stop.prevent="stopRecording()"
                  >
                    <span v-if="is_sending_image && false">
                      {{ $t("loading") }}
                    </span>

                    <template v-else>
                      <img
                        class="inline-svg inline-svg_larger"
                        :src="`${$root.publicPath}images/i_stop.svg`"
                      />

                      &nbsp;
                      <span v-if="['video', 'audio'].includes(selected_mode)">
                        {{ $t("stop_recording") }}
                      </span>
                      <span v-else-if="selected_mode === 'stopmotion'">
                        <template v-if="timelapse_mode_enabled">
                          {{ $t("stop_timelapse") }}
                        </template>
                      </span>
                      <span v-else>
                        {{ $t("stop") }}
                      </span>
                    </template>
                  </button>
                </transition>

                <transition name="fade_fast" mode="out-in">
                  <button
                    type="button"
                    class="_enable_timelapse_button"
                    :class="{ 'is--active': timelapse_mode_enabled }"
                    v-if="
                      selected_mode === 'stopmotion' &&
                      !timelapse_event &&
                      !delay_event
                    "
                    :content="$t('timelapse')"
                    @click="timelapse_mode_enabled = !timelapse_mode_enabled"
                  >
                    <svg
                      version="1.1"
                      class="inline-svg margin-right-verysmall"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="81px"
                      height="81px"
                      viewBox="0 0 81 81"
                      style="enable-background: new 0 0 81 81"
                      xml:space="preserve"
                    >
                      <path
                        d="M69.6,20.8c-0.9,0.6-1.7,1.1-2.6,1.7c-6-8.8-15.9-14-26.5-14c-17.6,0-32,14.4-32,32s14.4,32,32,32
                  c3.1,0,6.2-0.4,9.1-1.3l-1.7-5.8c-2.4,0.7-4.9,1.1-7.4,1.1c-14.3,0-26-11.7-26-26s11.7-26,26-26c8.6,0,16.6,4.2,21.5,11.4
                  c-0.8,0.5-1.6,1.1-2.4,1.6c-0.7,0.4-0.9,1.1-0.8,1.7c0,0.7,0.4,1.4,1.2,1.6c0.2,0.1,0.3,0.1,0.5,0.1c2.7,0.5,5.3,1.1,8,1.6
                  c1,0.2,2-0.4,2.3-1.4c0.6-2.8,1.1-5.5,1.7-8.3C72.8,21.3,71,19.9,69.6,20.8z"
                      />
                      <path
                        d="M23,49.4c-1.3,0-2.4-0.8-2.9-2.1c-0.5-1.6,0.4-3.3,1.9-3.8L39,38.3V27.2c0-1.7,1.3-3,3-3s3,1.3,3,3v13.3
                  c0,1.3-0.8,2.5-2.1,2.9l-19,5.9C23.6,49.4,23.3,49.4,23,49.4z"
                      />
                    </svg>
                  </button>
                </transition>

                <transition name="fade_fast" mode="out-in">
                  <button
                    type="button"
                    class="_enable_timelapse_button"
                    v-if="!is_recording && !delay_event"
                    :class="{ 'is--active': delay_mode_enabled }"
                    :content="$t('delay')"
                    @click="delay_mode_enabled = !delay_mode_enabled"
                  >
                    <svg
                      version="1.1"
                      class="inline-svg margin-right-verysmall"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      x="0px"
                      y="0px"
                      width="81px"
                      height="81px"
                      viewBox="0 0 81 81"
                      style="enable-background: new 0 0 81 81"
                      xml:space="preserve"
                    >
                      <path
                        d="M40.5,72.3c-15,0-27.1-12.2-27.1-27.1c0-15,12.2-27.1,27.1-27.1s27.1,12.2,27.1,27.1C67.6,60.2,55.5,72.3,40.5,72.3z
	 M40.5,23.7C28.7,23.7,19,33.4,19,45.2s9.6,21.5,21.5,21.5S62,57,62,45.2S52.3,23.7,40.5,23.7z"
                      />
                      <path
                        d="M40.5,48c-1.6,0-2.8-1.3-2.8-2.8l0-16.8c0-1.6,1.3-2.8,2.8-2.8s2.8,1.3,2.8,2.8l0,16.8C43.3,46.8,42.1,48,40.5,48z"
                      />
                      <rect x="32.1" y="10.7" width="16.8" height="5.7" />
                      <rect
                        x="57.9"
                        y="22.4"
                        transform="matrix(0.7069 -0.7073 0.7073 0.7069 2.864400e-02 50.6141)"
                        width="6.3"
                        height="5.7"
                      />
                    </svg>
                  </button>
                </transition>
              </div>
              <div>
                <div v-if="selected_mode === 'video'" class="_videoEq">
                  <div
                    v-if="enable_audio_recording_in_video"
                    class="_tiny_equalizer"
                  >
                    <AudioEqualizer
                      :stream="stream"
                      :is_recording="is_recording"
                      :type="'Tiny'"
                    />
                  </div>

                  <span class="u-switch u-switch-xs" v-if="!is_recording">
                    <input
                      class="switch"
                      id="recordVideoWithAudio"
                      type="checkbox"
                      v-model="enable_audio_recording_in_video"
                      :disabled="is_recording"
                    />
                    <label for="recordVideoWithAudio" class="u-label">{{
                      $t("with_sound")
                    }}</label>
                  </span>
                </div>

                <template v-if="selected_mode === 'stopmotion'">
                  <button
                    type="button"
                    v-if="!is_making_stopmotion"
                    @click="show_stopmotion_list = !show_stopmotion_list"
                    class="u-button u-button_bleumarine"
                  >
                    <span class>{{ $t("stopmotion_list") }}</span>
                  </button>

                  <div v-else class="_stopmotionValidation">
                    <div class="_stopmotionValidation--fpscounter">
                      <label class="u-label">{{ $t("img_per_second") }}</label>
                      <select
                        v-model.number="stopmotion_frame_rate"
                        size="small"
                      >
                        <option>2</option>
                        <option>4</option>
                        <option>8</option>
                        <option>15</option>
                        <option>24</option>
                        <option>30</option>
                      </select>
                    </div>

                    <div class="">
                      <button
                        type="button"
                        class="u-button u-button_bleuvert u-button_small"
                        @click="testStopmotion"
                      >
                        <img
                          :src="`${$root.publicPath}images/i_play.svg`"
                          width="48"
                          height="48"
                          draggable="false"
                        />
                        {{ $t("assemble") }}
                      </button>
                    </div>
                  </div>
                </template>

                <div
                  v-if="selected_mode === 'vecto'"
                  class="_mode_accessory_range"
                >
                  <label class="u-label"
                    >{{ $t("number_of_colors") }} =
                    {{ vecto_number_of_colors }}</label
                  >
                  <input
                    class=""
                    type="range"
                    v-model.number="vecto_number_of_colors"
                    min="2"
                    max="7"
                    step="1"
                  />
                </div>

                <button
                  type="button"
                  class="u-buttonLink"
                  v-if="selected_mode === 'lines'"
                  @click="show_lines_settings = !show_lines_settings"
                  :class="{ 'is--active': show_lines_settings }"
                >
                  {{ $t("advanced_options") }}
                </button>

                <template v-if="show_lines_settings">
                  <div
                    v-if="selected_mode === 'lines'"
                    class="_mode_accessory_range"
                  >
                    <label class="u-label"
                      >{{ $t("lines_angle") }} = {{ lines_angle }}</label
                    >
                    <input
                      class=""
                      type="range"
                      v-model.number="lines_angle"
                      min="0"
                      max="359"
                      step="1"
                    />
                  </div>
                  <div
                    v-if="selected_mode === 'lines'"
                    class="_mode_accessory_range"
                  >
                    <label class="u-label"
                      >{{ $t("brightness") }} = {{ lines_brightness }}</label
                    >
                    <input
                      class="margin-none"
                      type="range"
                      v-model.number="lines_brightness"
                      min=".1"
                      max="5"
                      step=".1"
                    />
                  </div>
                  <div
                    v-if="selected_mode === 'lines'"
                    class="_mode_accessory_range"
                  >
                    <label class="u-label"
                      >{{ $t("contrast") }} = {{ lines_contrast }}</label
                    >
                    <input
                      class="margin-none"
                      type="range"
                      v-model.number="lines_contrast"
                      min=".1"
                      max="5"
                      step=".1"
                    />
                  </div>
                  <div
                    v-if="selected_mode === 'lines'"
                    class="_mode_accessory_range"
                  >
                    <label class="u-label"
                      >{{ $t("lines_density") }} = {{ lines_density }}</label
                    >
                    <input
                      class="margin-none"
                      type="range"
                      v-model.number="lines_density"
                      min="0.2"
                      max="0.3"
                      step=".01"
                    />
                  </div>
                </template>
              </div>
            </div>
            <div
              v-else-if="media_to_validate && must_validate_media"
              key="validation"
            >
              <MediaValidationButtons
                :media_is_being_sent="media_is_being_sent"
                :media_being_sent_percent="media_being_sent_percent"
                :can_add_to_fav="true"
                @cancel="cancelValidation()"
                @save="sendMedia()"
                @save_and_fav="sendMedia({ fav: true })"
              />
              <div class="_download_media_without_validation">
                <small>
                  <a
                    ref=""
                    :href="validated_media_href_blob"
                    :download="media_to_validate.temp_name"
                    target="_blank"
                  >
                    {{ $t("or_download_media_on_device") }}
                    <template v-if="media_to_validate.rawData">
                      — {{ formatBytes(media_to_validate.rawData.size) }}
                    </template>
                  </a>
                </small>
              </div>
            </div>
          </transition>
        </div>
      </transition>
    </div>

    <StopmotionList
      v-if="show_stopmotion_list && !is_making_stopmotion"
      :project_path="path"
      @loadStopmotion="loadStopmotion"
    />
  </div>
</template>
<script>
import ModeSelector from "./ModeSelector.vue";
import MediaPreviewBeforeValidation from "./MediaPreviewBeforeValidation.vue";
import MediaValidationButtons from "./MediaValidationButtons.vue";
import StopmotionPanel from "./StopmotionPanel.vue";
import PickLocationForCaptures from "./PickLocationForCaptures.vue";

import CapturePane from "./CapturePane.vue";
import CaptureSettings from "./CaptureSettings.vue";
import CaptureEffects from "./CaptureEffects.vue";
import StopmotionList from "./StopmotionList.vue";
import AudioEqualizer from "./AudioEqualizer.vue";
import VectoMode from "./VectoMode.vue";
import LinesMode from "./LinesMode.vue";

// import adapter from "webrtc-adapter";

import RecordRTC from "recordrtc";
import ysFixWebmDuration from "fix-webm-duration";

export default {
  props: {
    type: String,
    path: String,
    selected_mode: String,
    stopmotion_slug: String,

    available_modes: {
      type: Array,
      default: () => [
        "photo",
        "video",
        "stopmotion",
        "audio",
        "vecto",
        "lines",
      ],
    },
    origin: {
      type: String,
      default: "capture",
    },
    return_temp_media: {
      type: Boolean,
      default: false,
    },
    must_validate_media: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    PickLocationForCaptures,
    ModeSelector,
    MediaPreviewBeforeValidation,
    MediaValidationButtons,
    StopmotionPanel,
    CapturePane,
    CaptureSettings,
    CaptureEffects,
    StopmotionList,
    AudioEqualizer,
    VectoMode,
    LinesMode,
  },
  data() {
    return {
      is_sending_image: false,
      is_loading_stream: true,

      invisible_canvas: undefined,

      ask_before_leaving_capture: false,

      capture_pane_is_small: false,

      media_to_validate: false,
      media_is_being_sent: false,
      media_being_sent_percent: 0,
      capture_button_pressed: false,
      mode_just_changed: false,
      is_validating_stopmotion_video: false,
      video_recording_is_paused: false,

      grids: {
        halfs: [
          [50, 0, 50, 100],
          [0, 50, 100, 50],
        ],
        thirds: [
          [33, 0, 33, 100],
          [66, 0, 66, 100],
          [0, 33, 100, 33],
          [0, 66, 100, 66],
        ],
        fourths: [
          [25, 0, 25, 100],
          [50, 0, 50, 100],
          [75, 0, 75, 100],
          [0, 25, 100, 25],
          [0, 50, 100, 50],
          [0, 75, 100, 75],
        ],
      },
      current_grid_type: false,

      location_to_add_to_medias: undefined,
      show_position_modal: false,

      // selected_devices: {
      //   video_input_device: undefined,
      //   audio_input_device: undefined,
      //   audio_output_device: undefined,
      // },

      stream: undefined,
      showVideoElement: true, // Control video element visibility for proper cleanup

      audio_output_deviceId: undefined,

      show_capture_settings: false,
      show_effects_pane: false,

      enable_audio_recording_in_video: true,
      enable_video: true,

      is_recording: false,
      timer_recording_in_seconds: false,
      recording_timer_interval: undefined,

      stopmotion_frame_rate: 4,
      timelapse_mode_enabled: false,
      timelapse_interval: 2,
      timelapse_event: false,
      timelapse_time_before_next_picture: false,

      delay_mode_enabled: false,
      delay_seconds: 5,
      delay_event: false,
      delay_remaining_time: false,

      recorder: null,

      actual_camera_resolution: {
        width: undefined,
        height: undefined,
      },
      displayed_video_size: {
        width: undefined,
        height: undefined,
      },

      show_live_feed: false,
      show_stopmotion_list: false,

      onion_skin_img: false,
      onion_skin_opacity: 0,

      last_frame_from_video: undefined,
      frameGrabber: undefined,

      show_lines_settings: false,
      vecto_number_of_colors: 2,
      lines_angle: 108,
      lines_brightness: 1,
      lines_contrast: 1,
      lines_density: 0.25,

      enable_effects: false,
      update_last_video_imageData: undefined,
    };
  },
  created() {
    try {
      const l = localStorage.getItem("location_to_add_to_medias");
      if (l && l !== "undefined")
        this.location_to_add_to_medias = JSON.parse(l);
    } catch (e) {
      console.error(e);
      this.location_to_add_to_medias = undefined;
    }
  },
  mounted() {
    if (!this.selected_mode) {
      this.$emit("changeMode", this.available_modes[0]);
    }

    document.addEventListener("keyup", this.captureKeyListener);

    this.checkCapturePanelSize();
    this.$eventHub.$on(`activity_panels_resized`, this.checkCapturePanelSize);
    this.$eventHub.$on(`window.resized`, this.checkCapturePanelSize);
    this.$eventHub.$on("capture.stopRecording", this.stopRecording);

    this.$refs.videoElement.volume = 0;
    this.$refs.videoElement.addEventListener(
      "loadedmetadata",
      this.refreshVideoActualSize
    );

    // Handle page visibility changes to release camera when tab is hidden
  },
  async beforeDestroy() {
    console.log("CaptureView: beforeDestroy - cleaning up camera resources");

    this.$eventHub.$off(`activity_panels_resized`, this.checkCapturePanelSize);
    this.$eventHub.$off(`window.resized`, this.checkCapturePanelSize);
    this.$eventHub.$off("capture.stopRecording", this.stopRecording);

    document.removeEventListener("keyup", this.captureKeyListener);

    this.ask_before_leaving_capture = false;

    // Stop any active recording first
    if (this.is_recording) {
      console.log("CaptureView: Stopping active recording before destroy");
      this.stopRecording();
    }

    this.stopFrameGrabber();
    this.stopTimelapseInterval();
    this.cancelDelay();
    this.eraseTimer();
    await this.stopStream();

    // Ensure video element is removed
    this.showVideoElement = false;

    if (this.update_last_video_imageData)
      window.cancelAnimationFrame(this.update_last_video_imageData);

    if (this.$refs.videoElement) {
      this.$refs.videoElement.removeEventListener(
        "loadedmetadata",
        this.refreshVideoActualSize
      ); //turn off the event handler
    }
  },
  watch: {
    selected_mode(val, oldVal) {
      // prevent starting nomode (when reclicking tab bar)
      if (!val) {
        this.$emit("changeMode", oldVal);
        return;
      }

      this.mode_just_changed = true;
      window.setTimeout(() => {
        this.mode_just_changed = false;
      }, 300);

      // set capture mode as query ?
      // this.$root.settings.capture_options.selected_mode = this.selected_mode;

      if (this.selected_mode === "audio") {
        this.enable_audio = true;
        this.enable_video = false;
      } else {
        this.enable_video = true;
      }

      this.stopFrameGrabber();
      if (this.selected_mode === "vecto" || this.selected_mode === "lines") {
        this.startFrameGrabber();
      }

      if (this.selected_mode !== "stopmotion") {
        this.show_stopmotion_list = false;
      }
    },
    location_to_add_to_medias() {
      if (this.has_location_to_add_to_medias)
        localStorage.setItem(
          "location_to_add_to_medias",
          JSON.stringify(this.location_to_add_to_medias)
        );
      else localStorage.removeItem("location_to_add_to_medias");
    },
    is_validating_stopmotion_video() {
      if (this.is_validating_stopmotion_video) {
        this.$refs.videoElement.pause();
      } else {
        this.$refs.videoElement.play();
        this.show_live_feed = true;
      }
    },
    is_making_stopmotion() {
      if (this.is_making_stopmotion) this.show_capture_settings = false;
    },
    audio_output_deviceId() {
      // const audio = document.createElement('audio');
      // await audio.setSinkId(audioDevices[0].deviceId);
      // console.log('Audio is being played on ' + audio.sinkId);
    },
    media_to_validate() {
      console.log(
        `WATCH • Capture: media_to_validate = ${!!this.media_to_validate}`
      );

      if (this.media_to_validate && !this.must_validate_media) {
        this.sendMedia();
        return;
      }

      if (this.media_to_validate) {
        if (this.$refs.videoElement) this.$refs.videoElement.pause();
        if (this.$refs.audioElement) this.$refs.audioElement.pause();
        this.ask_before_leaving_capture = true;
      } else {
        if (this.$refs.videoElement) this.$refs.videoElement.play();
        if (this.$refs.audioElement) this.$refs.audioElement.play();
        this.ask_before_leaving_capture = false;
      }
    },
  },
  computed: {
    show_mode_selector() {
      return (
        !this.media_to_validate &&
        !this.is_recording &&
        !this.is_making_stopmotion &&
        !this.delay_event
      );
    },
    has_location_to_add_to_medias() {
      return (
        this.location_to_add_to_medias?.longitude &&
        this.location_to_add_to_medias?.latitude
      );
    },
    is_making_stopmotion() {
      const is_making_stopmotion = this.stopmotion_slug ? true : false;
      return is_making_stopmotion;
    },
    validated_media_href_blob() {
      if (!this.media_to_validate) return false;
      return window.URL.createObjectURL(this.media_to_validate.rawData);
    },
    show_videos() {
      return (
        this.stream &&
        ["photo", "video", "stopmotion"].includes(this.selected_mode) &&
        this.show_live_feed &&
        !(this.must_validate_media && this.media_to_validate)
      );
    },
  },
  methods: {
    async stopStream() {
      console.log("CaptureView: METHODS • stopStream");

      // Stop all tracks in the current stream
      if (this.stream) {
        console.log(
          "CaptureView: Stopping stream tracks:",
          this.stream.getTracks().length
        );
        this.stream.getTracks().forEach((track) => {
          console.log("CaptureView: Stopping track:", track.kind, track.label);
          track.stop();
        });
        this.stream = null;
      }

      // Remove video element from DOM to fully release camera
      console.log("CaptureView: Removing video element from DOM");
      this.showVideoElement = false;

      // Stop any active recorder
      if (this.recorder) {
        console.log("CaptureView: Stopping recorder");
        try {
          this.recorder.stopRecording();
          this.recorder.destroy();
          this.recorder = null;
        } catch (err) {
          console.warn("CaptureView: Error stopping recorder:", err);
        }
      }

      // Reset stream-related state
      this.is_loading_stream = false;
      this.show_live_feed = false;
    },
    hasFinishedLoading() {
      this.is_loading_stream = false;
      this.show_live_feed = true;
    },
    setStream(stream) {
      console.log("CaptureView: METHODS • setStream", stream);
      this.stream = stream;
      this.showVideoElement = true;
      this.$nextTick(() => {
        if (this.$refs.videoElement) {
          this.$refs.videoElement.volume = 0;
        }
      });
      this.enable_effects = false;
    },
    updateSelectedColor({ e, type }) {
      if (!this.$refs.canvasElement) return;
      console.log("CaptureView: METHODS • updateSelectedColor");
      const px_color = this.getColorInCanvasFromPixelCount(e);
      this.$eventHub.$emit("captureCanvas.pixelColorUnderMouse", {
        px_color,
        type,
      });
    },
    getColorInCanvasFromPixelCount(e) {
      const getPropsForObjectfitContent = (
        videoWidth,
        videoHeight,
        width,
        height
      ) => {
        let scale, offsetX, offsetY;
        if (videoHeight / height > videoWidth / width) {
          (scale = videoHeight / height),
            (offsetX = (videoWidth - width * scale) / 2),
            (offsetY = 0);
        } else {
          (scale = videoWidth / width),
            (offsetY = (videoHeight - height * scale) / 2),
            (offsetX = 0);
        }
        return { scale, offsetX, offsetY };
      };

      const transformed_props = getPropsForObjectfitContent(
        this.actual_camera_resolution.width,
        this.actual_camera_resolution.height,
        this.$refs.canvasElement.getBoundingClientRect().width,
        this.$refs.canvasElement.getBoundingClientRect().height
      );

      // because of object-fit, we have to adjust the coordinates we get
      const mouse_pos_x =
        e.offsetX * transformed_props.scale + transformed_props.offsetX;
      const mouse_pos_y =
        e.offsetY * transformed_props.scale + transformed_props.offsetY;
      // +
      // (this.$refs.canvasElement.height -
      //   this.actual_camera_resolution.height) /
      //   2;
      const frame = this.$refs.canvasElement
        .getContext("2d")
        .getImageData(mouse_pos_x, mouse_pos_y, 1, 1);

      return {
        r: frame.data[0],
        g: frame.data[1],
        b: frame.data[2],
      };
    },
    refreshVideoActualSize() {
      this.getVideoActualSize()
        .then(({ width, height }) => {
          this.actual_camera_resolution.width = width;
          this.actual_camera_resolution.height = height;
        })
        .catch((err) => {
          if (this.$root.debug_mode === true)
            console.log(
              `CaptureView • METHODS : refreshVideoActualSize — couldnt get video size: ` +
                err
            );
          // this.$alertify
          //   .closeLogOnClick(true)
          //   .delay(4000)
          //   .error("DEBUG error : failed to get video actual size");
        });
    },
    testStopmotion() {
      this.$eventHub.$emit("stopmotion.test");
    },
    getVideoActualSize() {
      return new Promise((resolve, reject) => {
        //Wait for dimensions if they don't show right away
        let wait_period_if_necessary = 0;
        if (!this.$refs.videoElement.videoWidth) {
          wait_period_if_necessary = 500; //was 500
        }

        const wait = (ms) =>
          new Promise((resolve) => window.setTimeout(resolve, ms));

        wait(wait_period_if_necessary).then(() => {
          if (
            !this.$refs.videoElement ||
            this.$refs.videoElement.videoWidth *
              this.$refs.videoElement.videoHeight >
              0
          ) {
            return resolve({
              width: this.$refs.videoElement.videoWidth,
              height: this.$refs.videoElement.videoHeight,
            });
          } else {
            return reject("couldn’t get video dimensions");
          }
        });
      });
    },
    loadStopmotion(stopmotion_path) {
      const stopmotion_slug = stopmotion_path.substring(
        stopmotion_path.lastIndexOf("/") + 1
      );
      this.$emit("openStopmotion", stopmotion_slug);
      this.show_stopmotion_list = false;
      // this.ask_before_leaving_capture = true;
    },
    checkCapturePanelSize() {
      if (this.$el?.offsetHeight <= 400) this.capture_pane_is_small = true;
      else this.capture_pane_is_small = false;
    },
    stopStopmotion() {
      // two options : remove or save
      this.closeStopmotionPanel();
    },

    startFrameGrabber() {
      const getFrame = () => {
        if (this.$root.debug_mode === true)
          console.log(`CaptureView • METHODS : startFrameGrabber`);
        // this.frameGrabber();

        if (this.media_to_validate) return;

        const ratio =
          this.actual_camera_resolution.width /
          this.actual_camera_resolution.height;

        this.getImageDataFromFeed({
          width: 240 * ratio,
          height: 240,
        }).then((image_data) => (this.last_frame_from_video = image_data));
      };
      getFrame();
      this.frameGrabber = window.setInterval(getFrame, 300);
    },
    stopFrameGrabber() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureView • METHODS : stopFrameGrabber  `);

      if (this.frameGrabber) window.clearInterval(this.frameGrabber);
      this.last_frame_from_video = undefined;
    },
    async addStopmotionImage() {
      this.show_live_feed = true;
      this.$refs.videoElement.pause();
      this.is_sending_image = true;

      if (!this.stopmotion_slug) {
        this.ask_before_leaving_capture = true;
        // create stopmotion
        const new_stopmotion_slug = await this.$api.createFolder({
          path: `${this.path}/stopmotions`,
          additional_meta: {
            name: new Date().getTime(),
            $admins: "parent_contributors",
          },
        });
        this.$emit("openStopmotion", new_stopmotion_slug);
      }

      const imageData = await this.getImageDataFromFeed();
      this.$eventHub.$emit("stopmotion.addImage", { imageData });

      this.media_to_validate = {
        rawData: imageData,
        objectURL: URL.createObjectURL(imageData),
        type: "image",
      };
      setTimeout(() => {
        this.media_to_validate = false;
      }, 500);

      this.is_sending_image = false;
      this.$refs.videoElement.play();
    },
    closeStopmotionPanel() {
      this.$emit("openStopmotion", undefined);

      this.media_is_being_sent = false;
      this.media_being_sent_percent = 100;
      this.media_to_validate = false;

      this.is_recording = false;
      this.ask_before_leaving_capture = false;
      this.show_live_feed = true;
    },

    captureKeyListener(event) {
      console.log("METHODS • CaptureView: captureKeyListener");

      // don’t register if validating a media
      if (this.media_to_validate || this.is_validating_stopmotion_video)
        return false;

      // TODO : write captcha to prevent writing to interfere with camera
      // (!event.target.dataset ||
      //   event.target.dataset.use !== "onionskin")) ||
      if (
        this.$root.modal_is_opened ||
        event.target.tagName.toLowerCase() === "select" ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable")
      )
        return;

      switch (event.key) {
        case "w":
        case "z":
        case "ArrowLeft":
          this.$eventHub.$emit("capture.navigate.previous");
          break;
        case "s":
        case "ArrowRight":
          this.$eventHub.$emit("capture.navigate.next");
          break;
        case "a":
        case "q":
        case " ":
          if (!this.is_recording) this.setCaptureInit();
          else this.stopRecording();
          break;
        case "Backspace":
        case "Delete":
          this.$eventHub.$emit("capture.remove");
          break;
      }
    },
    setCaptureInit() {
      if (this.$root.debug_mode === true)
        console.log(`CaptureView / setCaptureInit`);

      this.ask_before_leaving_capture = true;

      if (this.delay_mode_enabled && this.delay_event) {
        // cancel delay
        this.cancelDelay();
      } else if (this.delay_mode_enabled) {
        this.startDelay();
      } else {
        this.setCapture();
      }
    },
    startDelay() {
      let time_passed = 0;
      this.delay_remaining_time = this.delay_seconds;

      this.delay_event = window.setInterval(() => {
        time_passed += 1;

        if (time_passed === this.delay_seconds) {
          this.setCapture();
          this.cancelDelay();
        } else {
          this.delay_remaining_time = this.delay_seconds - time_passed;
        }
      }, 1000);
    },
    cancelDelay() {
      this.delay_remaining_time = false;
      window.clearInterval(this.delay_event);
      this.delay_event = false;
    },
    startTimelapseInterval() {
      let time_passed = 0;
      this.timelapse_time_before_next_picture = this.timelapse_interval;

      this.timelapse_event = window.setInterval(() => {
        time_passed += 1;

        if (time_passed === this.timelapse_interval) {
          this.setCapture();
          this.stopTimelapseInterval();
          this.startTimelapseInterval();
        } else {
          this.timelapse_time_before_next_picture =
            this.timelapse_interval - time_passed;
        }
      }, 1000);
    },
    stopTimelapseInterval() {
      window.clearInterval(this.timelapse_event);
      this.timelapse_event = false;
      this.timelapse_time_before_next_picture = false;
    },
    setCapture() {
      this.capture_button_pressed = true;
      window.setTimeout(() => {
        this.capture_button_pressed = false;
      }, 400);
      this.show_capture_settings = false;

      if (this.selected_mode === "photo") {
        this.getImageDataFromFeed().then((rawData) => {
          this.media_to_validate = {
            rawData,
            objectURL: URL.createObjectURL(rawData),
            temp_name: "image.jpeg",
            type: "image",
          };
        });
      } else if (this.selected_mode === "video") {
        this.video_recording_is_paused = false;

        this.startRecordFeed({
          type: "video",
          // fix to make sure videos recorded in electron/chrome play on firefox
          // and to make sure videos with audio tracks can be recorded in firefox
          // https://github.com/onfido/onfido-sdk-ui/issues/891#issuecomment-572940251
          mimeType: "video/webm;codecs=vp8,opus",
          videoBitsPerSecond: 4112000,
          enable_audio_recording_in_video: this.enable_audio_recording_in_video,
        });
      } else if (this.selected_mode === "audio") {
        this.startRecordFeed({
          type: "audio",
        });
      } else if (this.selected_mode === "stopmotion") {
        this.addStopmotionImage();

        if (this.timelapse_mode_enabled && !this.is_recording) {
          this.is_recording = true;
          this.startTimelapseInterval();
        }
      } else if (this.selected_mode === "vecto") {
        const svgstr = this.$refs.vectoElement.svgstr;
        this.media_to_validate = {
          preview: svgstr,
          rawData: new Blob([svgstr], { type: "image/svg+xml" }),
          temp_name: "vecto.svg",
          type: "svg",
        };
      } else if (this.selected_mode === "lines") {
        const svgstr =
          this.$refs.vectoElement.$el.querySelector("svg").outerHTML;
        this.media_to_validate = {
          preview: svgstr,
          rawData: new Blob([svgstr], { type: "image/svg+xml" }),
          temp_name: "lines.svg",
          type: "svg",
        };
      }
    },
    stopRecording() {
      if (!this.is_recording) return;
      const duration = this.timer_recording_in_seconds;

      if (this.selected_mode === "stopmotion" && this.timelapse_mode_enabled) {
        this.is_recording = false;
        this.stopTimelapseInterval();
        return;
      }
      if (this.selected_mode === "video") {
        this.recorder.stopRecording(() => {
          this.is_recording = false;
          this.eraseTimer();

          let video_blob = this.recorder.getBlob();

          // recorder.camera.stop();
          this.recorder.destroy();
          this.recorder = null;

          ysFixWebmDuration(video_blob, duration * 1000, {
            logger: false,
          }).then((fixed_video_blob) => {
            this.media_to_validate = {
              rawData: fixed_video_blob,
              objectURL: URL.createObjectURL(fixed_video_blob),
              temp_name: "video.webm",
              type: "video",
            };
          });
        });
      } else if (this.selected_mode === "audio") {
        this.recorder.stopRecording(() => {
          this.is_recording = false;
          this.eraseTimer();

          let audio_blob = this.recorder.getBlob();

          // recorder.camera.stop();
          this.recorder.destroy();
          this.recorder = null;

          const preview = this.$refs.equalizerElement.$el
            .querySelector("canvas")
            .toDataURL("image/png");

          ysFixWebmDuration(audio_blob, duration * 1000, {
            logger: false,
          }).then((fixed_audio_blob) => {
            this.media_to_validate = {
              preview,
              rawData: fixed_audio_blob,
              objectURL: URL.createObjectURL(fixed_audio_blob),
              temp_name: "audio.wav",
              type: "audio",
            };
          });
        });
      }
    },

    pauseOrResumeCapture() {
      if (this.recorder.state !== "paused") {
        this.video_recording_is_paused = true;
        this.pauseTimer();
        this.recorder.pauseRecording();
      } else {
        this.video_recording_is_paused = false;
        this.unpauseTimer();
        this.recorder.resumeRecording();
      }
    },

    startTimer() {
      this.recording_timer_interval = window.setInterval(() => {
        this.timer_recording_in_seconds = Number(
          Number(this.timer_recording_in_seconds) + 0.1
        ).toFixed(1);
      }, 100);
    },
    pauseTimer() {
      window.clearInterval(this.recording_timer_interval);
    },
    unpauseTimer() {
      this.startTimer();
    },
    eraseTimer() {
      this.timer_recording_in_seconds = false;
      window.clearInterval(this.recording_timer_interval);
    },

    getImageDataFromFeed({ width, height } = {}) {
      return new Promise((resolve, reject) => {
        if (this.enable_effects && this.$refs.canvasElement) {
          this.getStaticImageFromVideoElement({
            width,
            height,
            from_element: this.$refs.canvasElement,
          })
            .then(resolve)
            .catch(reject);
        } else {
          this.getStaticImageFromVideoElement({ width, height })
            .then(resolve)
            .catch(reject);
        }
      });
    },

    async getStaticImageFromVideoElement({
      width,
      height,
      from_element = this.$refs.videoElement,
    } = {}) {
      if (this.$root.debug_mode === true)
        console.log(`CaptureView • METHODS : getStaticImageFromVideoElement`);

      if (!from_element) throw new Error("missing video element");

      let _canvas = undefined;
      if (from_element.tagName === "VIDEO") {
        if (!this.invisible_canvas)
          this.invisible_canvas = document.createElement("canvas");

        _canvas = this.invisible_canvas;

        _canvas.width = width ? width : from_element.videoWidth;
        _canvas.height = height ? height : from_element.videoHeight;

        let invisible_ctx = _canvas.getContext("2d");
        invisible_ctx.drawImage(
          from_element,
          0,
          0,
          _canvas.width,
          _canvas.height
        );
      } else if (from_element.tagName === "CANVAS") {
        _canvas = from_element;
      }

      const imageBlob = await new Promise((resolve) => {
        _canvas.toBlob(resolve, "image/jpeg", 0.95);
      });
      return imageBlob;
    },

    startRecordFeed(options) {
      return new Promise(() => {
        const finalStream = new MediaStream();

        if (options.type === "video") {
          const video_source =
            this.enable_effects && this.$refs.canvasElement
              ? this.$refs.canvasElement.captureStream()
              : this.stream;
          video_source.getVideoTracks().forEach((track) => {
            finalStream.addTrack(track);
          });
        }

        if (
          options?.enable_audio_recording_in_video === true ||
          options.type === "audio"
        )
          this.stream
            .getAudioTracks()
            .forEach((track) => finalStream.addTrack(track));

        this.recorder = RecordRTC(finalStream, options);

        try {
          this.recorder.startRecording();
          this.is_recording = true;
          this.timer_recording_in_seconds = 0;
          this.$eventHub.$emit("capture.isRecording", options.type);
          this.startTimer();
        } catch (err) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("failed_to_start_recording") + "<br>" + err.message);
        }
      });
    },

    async sendMedia({ fav = false } = {}) {
      console.log(`METHODS • CaptureView: sendMedia with fav=${fav}`);
      if (this.$root.debug_mode === true)
        console.log(`METHODS • CaptureView / sendMedia`);

      if (this.return_temp_media) {
        this.$emit("tempMedia", this.media_to_validate);
        return;
      }

      const timeCreated = +new Date();
      const randomString = (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2);

      const extensions = {
        image: "jpeg",
        video: "webm",
        audio: "wav",
        svg: "svg",
      };
      const filename = `${
        this.media_to_validate.type
      }-${timeCreated}-${randomString}.${
        extensions[this.media_to_validate.type]
      }`;

      // TODO merge with uploadFile

      const rawData = this.media_to_validate.rawData;

      this.media_is_being_sent = true;
      this.media_being_sent_percent = 0;

      let additional_meta = {
        fav,
        $origin: this.origin,
      };

      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];
      if (this.has_location_to_add_to_medias)
        additional_meta.$location = this.location_to_add_to_medias;

      const onProgress = (progressEvent) => {
        console.log(
          `METHODS • CaptureView: onUploadProgress for name = ${filename} / ${parseInt(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          )}% `
        );
        this.media_being_sent_percent = parseInt(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
      };

      const { meta_filename } = await this.$api
        .uploadFile({
          path: this.path,
          filename,
          file: rawData,
          additional_meta,
          onProgress,
        })
        .catch((err) => {
          console.log(
            `METHODS • sendThisFile: name = ${filename} / failed uploading ${err}`
          );
          this.media_is_being_sent = false;
          this.media_being_sent_percent = 0;
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("media_couldnt_be_sent"));
          throw err;
        });

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_was_saved"));

      this.media_is_being_sent = false;
      this.media_being_sent_percent = 100;
      this.media_to_validate = false;

      this.$eventHub.$emit("pane.animate", "collect");

      this.$emit("insertMedia", meta_filename);
      return;
    },
    cancelValidation() {
      this.media_to_validate = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureview {
  display: flex;
  flex-flow: row nowrap;
  max-height: 100vh;
  height: 100%;

  .m_captureview--settingsPaneButton {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 0;
    background-color: var(--c-rouge);

    > button {
      transform: rotate(-90deg);
      transform-origin: center top;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      margin-left: -1px;
    }
  }

  .m_captureview--videoPane {
    position: relative;
    overflow-y: auto;
    flex: 1 1 100px;

    display: flex;
    flex-flow: column nowrap;
  }

  .m_captureview--videoPane--top {
    position: relative;
    margin: 0 auto;
    min-height: 60px;

    flex: 1 1 auto;
    overflow: hidden;

    width: 100%;
    height: 100%;
    background-color: var(--c-noir);
    background-color: black;
    // padding: calc(var(--spacing) / 2);

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
  }

  .m_captureview--videoPane--bottom {
    position: relative;
    flex: 0 0 auto;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);

    .m_captureview--videoPane--bottom--buttons {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      align-items: center;

      button img,
      button svg {
        width: 2rem;
        height: 2rem;
        padding: 0;
      }

      > * {
        flex: 0 0 auto;
        display: flex;

        &:not(:empty) {
          padding: calc(var(--spacing) / 2);
        }

        @media only screen and (min-width: 781px) {
          flex: 1 0 200px;
        }

        > * {
          margin-right: calc(var(--spacing) / 2);
        }

        ._settingsBtn {
          flex-shrink: 0;
          padding: calc(var(--spacing) / 2);
        }
        &:nth-child(2) {
          // flex: 5 1 220px;
          text-align: center;
          display: flex;
          flex-flow: row wrap;
          align-items: center;
          justify-content: center;
        }
        &:last-child {
          justify-content: flex-end;
        }
      }

      &.is--recording {
        background-color: var(--c-rouge);
      }
    }
  }

  ._settingsTag {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
    margin: calc(var(--spacing) / 2);
    pointer-events: none;

    display: flex;
    flex-flow: row wrap;
    gap: calc(var(--spacing) / 4);

    button,
    select {
      pointer-events: auto;
    }
    select {
      width: 11ch;
    }
  }

  .m_captureview--videoPane--top--videoContainer {
    position: relative;
    width: 100%;
    height: 100%;

    ._videoEl {
      // transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    }

    video,
    canvas,
    .mediaContainer img,
    .m_audioEqualizer {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

._captureButton {
  position: relative;
  // margin: 0 auto;
  width: auto;
  height: auto;
  flex: 0 0 auto;
  margin: 0 calc(var(--spacing) / 4);

  &.is--active {
    background: var(--c-rouge);
  }

  > img {
    flex: 0 0 auto;
  }
}

._mode_indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--c-rouge);
  font-weight: 700;
  font-family: "Fira Code";
  font-size: var(--sl-font-size-large);
  text-transform: uppercase;

  letter-spacing: 0.06em;

  pointer-events: none;

  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

._delay_timer {
  position: absolute;
  z-index: 100;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  font-size: 40vmin;
  color: transparent;

  --c-text-stroke: var(--c-rouge);
  --c-text-shadow: rgba(0, 0, 0, 0.2);
  color: var(--c-rouge_fonce);

  -webkit-text-stroke: 1vmin var(--c-text-stroke);
  // text-shadow: 1vmin 1vmin 0 var(--c-text-shadow),
  //   -1px -1px 0 var(--c-text-shadow), 1px -1px 0 var(--c-text-shadow),
  //   -1px 1px 0 var(--c-text-shadow), 1px 1px 0 var(--c-text-shadow);

  &.is--small {
    font-size: 10vmin;
    -webkit-text-stroke: 0.2vmin var(--c-text-stroke);
    bottom: 0;

    &.is--timelapse {
      height: 50%;
    }
  }
}

// @container video-pane (height < 400px) {
//   ._delay_timer {
//     font-size: 10vmin;
//     -webkit-text-stroke: 0.2vmin var(--c-text-stroke);
//   }
// }

._capture_options {
  position: absolute;
  bottom: 0;
  width: 100%;
  z-index: 100;
  text-align: center;
  pointer-events: none;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 2);

  ._duration_timer {
    display: inline-block;
    margin: 0 auto;
    background-color: var(--c-rouge);
    padding: 0 calc(var(--spacing) / 8);
    font-size: var(--sl-font-size-normal);

    margin-bottom: calc(var(--spacing) / 8);
    color: white;
    border-radius: 4px;
    pointer-events: auto;
  }

  .record_options {
    max-width: 450px;
    margin: 0 auto;
    // .padding-verysmall;
    pointer-events: auto;
    // .font-small;

    > * {
      margin-bottom: 0;
      background-color: var(--c-rouge);

      color: white;
      padding: 0 calc(var(--spacing) / 4);
      border-radius: 4px;
      width: auto;

      display: flex;
      align-items: center;
    }

    input {
      min-width: 2em;
      max-width: 4em;
      height: 1.4em;
      margin: 2px;
      padding: 0 2px;
      width: auto;
      width: auto;
      text-align: center;
      color: white;

      background-color: var(--c-rouge_clair);

      border-bottom: 0px;

      &:active,
      &:focus {
        border-bottom-color: var(--c-rouge_fonce);
      }
    }

    .record_options--timer {
      font-size: 2em;
    }
  }
}

._tiny_equalizer {
  margin: 0 calc(var(--spacing) / 2);

  .m_audioEqualizer {
    position: relative;
    width: 64px;
    height: 36px;
    background-color: transparent !important;
    border-radius: 4px;
    overflow: hidden;
  }
}

._onion_skin {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  &.is--onionskin {
    opacity: 0.2;
    opacity: var(--onionskin-opacity);
  }

  ::v-deep {
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
._mode_accessory_range {
  max-width: 200px;
  margin: -5px 0 -5px auto;
  label {
    margin: 0;
  }
  input {
    margin: 0;
  }
}

._video_grid_overlay {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  object-fit: contain;

  --stroke_width: 2px;

  svg {
    position: absolute;
    width: 100%;
    height: 100%;
    stroke: var(--c-rouge);
    fill: none;
    // padding: calc(var(--stroke_width) / 2);

    line {
      stroke-width: var(--stroke_width);
    }
    rect {
      stroke-width: var(--stroke_width);
    }
  }
}

._enable_timelapse_button {
  color: #fff;
  background: var(--c-orange);
  width: 28px;
  height: 28px;
  display: block;
  min-height: 0;
  line-height: 0;
  border-radius: 50%;
  text-align: center;
  font-weight: bold;
  padding: calc(var(--spacing) / 8);
  margin: calc(var(--spacing) / 4);

  svg {
    width: 100% !important;
    height: 100% !important;
  }

  &.is--active {
    background: var(--c-rouge);
    color: white;
  }
}
._capture_flash {
  background-color: var(--c-rouge);
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
}

._download_media_without_validation {
  background-color: var(--c-noir);
  padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 4);
  // margin-top: calc(-0.5 * var(--spacing));
  margin-bottom: -0.2em;
  line-height: 1;
  text-align: right;

  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  a {
    color: var(--c-gris);
  }
}
._videoEq {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

._loader {
  background: transparent;
  color: white;
  color: var(--c-rouge);
  margin-bottom: calc(var(--spacing) * 2);
}

._stopmotionValidation {
  // .bg-rouge;
  flex: 0 0 auto;
  // padding: calc(var(--spacing) / 4);
  margin: 0;
  // margin: calc(var(--spacing) / 4);

  // background-color: white;

  // border: calc(var(--spacing) / 4) solid var(--c-noir);
  border-radius: calc(var(--spacing) / 4);

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;

  gap: calc(var(--spacing) / 2);

  --input-height: 2em;

  > * {
    flex: 0 0 auto;
  }

  ._stopmotionValidation--fpscounter {
    // .padding-sides-small;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;

    // select {
    //   margin-left: calc(var(--spacing) / 8);
    //   margin-right: calc(var(--spacing) / 8);

    //   flex: 0 0 auto;
    //   max-width: 50px;
    //   font-size: var(--font-small);

    //   // .bg-noir;
    // }
    // label {
    //   margin-left: calc(var(--spacing) / 8);
    //   margin-right: calc(var(--spacing) / 8);
    //   font-size: 0.6em;
    //   white-space: nowrap;
    // }
  }
}
</style>
