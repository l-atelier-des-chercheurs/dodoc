<template>
  <div
    class="m_captureview"
    :class="{ 'is--collapsed': collapse_capture_pane }"
  >
    <CaptureSettings
      v-show="show_capture_settings"
      :audio_output_deviceId.sync="audio_output_deviceId"
      @setStream="setStream"
      @hasFinishedLoading="hasFinishedLoading"
      @show="show_capture_settings = true"
      @close="show_capture_settings = false"
    />

    <CaptureEffects
      v-show="show_effects_pane"
      :enable_effects.sync="enable_effects"
      :videoElement="$refs.videoElement"
      :canvasElement="$refs.canvasElement"
      @updateImageData="setImageData"
      @close="show_effects_pane = false"
    />

    <div class="m_captureview--videoPane">
      <transition name="slidedown" :duration="500">
        <div
          class="_modeSelector"
          v-if="
            !media_to_validate &&
            !is_recording &&
            !is_making_stopmotion &&
            !delay_event
          "
        >
          <div class="_arrows">
            <button
              type="button"
              class="bg-transparent"
              @mousedown.stop.prevent="previousMode()"
              @touchstart.stop.prevent="previousMode()"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="169px"
                height="169px"
                viewBox="0 0 169 169"
                style="enable-background: new 0 0 169 169"
                xml:space="preserve"
              >
                <path
                  fill="currentColor"
                  stroke="currentColor"
                  stroke-width="10"
                  stroke-linejoin="round"
                  d="M60.2,84.5l48.6-24.3l0,48.6L60.2,84.5z"
                />
              </svg>
            </button>
          </div>

          <div v-for="mode in available_modes" :key="mode">
            <input
              type="radio"
              :id="id + '_' + mode"
              :value="mode"
              v-model="selected_mode"
            />
            <label :for="id + '_' + mode">
              <div
                class="_picto"
                :content="$t(mode)"
                v-tippy="
                  mode !== selected_mode
                    ? {
                        placement: 'bottom',
                        delay: [600, 0],
                      }
                    : ''
                "
              >
                <img :src="available_mode_picto[mode]" />
              </div>
              <span v-if="selected_mode === mode">{{ $t(mode) }}</span>
            </label>
          </div>

          <div class="_arrows">
            <button
              type="button"
              class="bg-transparent"
              @mousedown.stop.prevent="nextMode()"
              @touchstart.stop.prevent="nextMode()"
            >
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                width="169px"
                height="169px"
                viewBox="0 0 169 169"
                style="enable-background: new 0 0 169 169"
                xml:space="preserve"
              >
                <path
                  fill="currentColor"
                  stroke="currentColor"
                  stroke-width="10"
                  stroke-linejoin="round"
                  d="M108.8,84.5l-48.6,24.3V60.2L108.8,84.5z"
                />
              </svg>
            </button>
          </div>
        </div>
      </transition>
      <div
        class="m_captureview--videoPane--top"
        v-show="!is_validating_stopmotion_video"
        :class="{
          'is--being_streamed':
            (stream_sharing_informations_status &&
              stream_sharing_informations_status.enabled) ||
            (stream_access_informations_status &&
              stream_access_informations_status.enabled),
        }"
      >
        <div class="m_captureview--videoPane--top--videoContainer">
          <div v-show="show_videos">
            <video
              ref="videoElement"
              autoplay
              playsinline
              :src-object.prop.camel="stream"
              :controls="stream_type === 'RemoteSources'"
              muted
              v-show="!enable_effects"
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

          <Vecto
            v-if="selected_mode === 'vecto' && !media_to_validate"
            ref="vectoElement"
            :last_frame_from_video="last_frame_from_video"
            :number_of_colors="vecto_number_of_colors"
          />

          <Lines
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
            <label
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
              <label>
                <span>{{ $t("interval_between_pictures") }}</span>
                <input type="number" v-model.number="timelapse_interval" />
                <span>{{ $t("seconds") }}</span>
              </label>
            </div>

            <div
              v-if="
                stream_sharing_informations_status &&
                stream_sharing_informations_status.enabled &&
                stream_type === 'LocalSources'
              "
              :key="
                'stream_share_name-' + stream_sharing_informations_status.name
              "
            >
              <label>
                <span v-html="$t('stream_currently_shared_with_name:')" />
                <span>
                  <strong>{{ stream_sharing_informations_status.name }}</strong>
                </span>
                <br />
                <span
                  v-if="
                    stream_sharing_informations_status.peers_connected &&
                    stream_sharing_informations_status.peers_connected.length >
                      0
                  "
                >
                  {{ $t("other_users_connected") }} =
                  {{
                    stream_sharing_informations_status.peers_connected.length
                  }}
                </span>
              </label>
            </div>

            <div
              v-else-if="
                stream_access_informations_status &&
                stream_access_informations_status.enabled &&
                stream_type === 'RemoteSources'
              "
              :key="
                'stream_share_name-' + stream_access_informations_status.callee
              "
            >
              <label>
                <span v-html="$t('stream_shown:')" />
                <span>
                  <strong>{{
                    stream_access_informations_status.callee
                  }}</strong>
                </span>
              </label>
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
              <label>
                <span>{{ $t("delay").toLowerCase() }}</span>
                <input
                  type="number"
                  v-model.number="delay_seconds"
                  min="1"
                  max="60"
                />
                <span>{{ $t("seconds") }}</span>
              </label>
            </div>
          </transition-group>

          <transition name="scaleInFade" mode="out-in" duration="100">
            <label
              v-if="!!delay_before_picture || !!time_before_next_picture"
              :key="'time_before_' + delay_before_picture"
              mode="out-in"
              class="_delay_timer"
              :class="{ 'is--timelapse': !!time_before_next_picture }"
            >
              <template v-if="!!delay_before_picture">
                {{ delay_before_picture }}
              </template>
              <template v-else-if="!!time_before_next_picture">
                {{ time_before_next_picture }}
              </template>
              <!-- <template v-else>
                {{ $t("now!") }}
              </template> -->
            </label>
          </transition>

          <!-- <transition name="justCaptured" duration="400">
            <div
              v-if="capture_button_pressed"
              class="_just_captured_overlay"
            ></div>
          </transition> -->

          <transition name="scaleInFade" mode="in-out" duration="100">
            <MediaContent
              v-if="
                selected_mode === 'stopmotion' &&
                stopmotion.onion_skin_img &&
                current_stopmotion &&
                !is_validating_stopmotion_video &&
                !(show_live_feed && stopmotion.onion_skin_opacity === 0)
              "
              :key="
                show_live_feed ? false : stopmotion.onion_skin_img.metaFileName
              "
              class="_onion_skin"
              :class="{ 'is--onionskin': show_live_feed }"
              :context="'edit'"
              :slugFolderName="current_stopmotion"
              :media="stopmotion.onion_skin_img"
              :folderType="'stopmotions'"
              :style="
                show_live_feed
                  ? `--onionskin-opacity: ${stopmotion.onion_skin_opacity}`
                  : ''
              "
            />
          </transition>

          <div
            class="_video_grid_overlay"
            v-if="enable_grid && enable_video && !media_to_validate"
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
              <!-- <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                vector-effect="non-scaling-stroke"
              /> -->
            </svg>

            <!-- <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              :width="actual_camera_resolution.width"
              :height="actual_camera_resolution.height"
              :viewBox="`0 0 ${actual_camera_resolution.width} ${actual_camera_resolution.height}`"
            /> -->
          </div>

          <transition name="fade_fast">
            <div
              class="_settingsTag"
              v-if="!(must_validate_media && media_to_validate)"
            >
              <button
                type="button"
                class="button-nostyle"
                @click="show_capture_settings = !show_capture_settings"
                v-if="enable_video"
              >
                {{ actual_camera_resolution.width }}×{{
                  actual_camera_resolution.height
                }}
              </button>
              <!-- <div v-if="selected_devices.video_input_device">
                {{ selected_devices.video_input_device.label }}
              </div>
              <div v-if="selected_devices.audio_input_device">
                {{ selected_devices.audio_input_device.label }}
              </div> -->
              <button
                type="button"
                class="button-nostyle"
                :class="{ 'is--active': enable_grid }"
                v-if="enable_video"
                @click="enable_grid = !enable_grid"
              >
                {{ $t("grid").toLowerCase() }}
              </button>
              <div v-if="enable_video && enable_grid">
                <button
                  type="button"
                  class="button-nostyle"
                  v-for="grid_type in Object.keys(grids)"
                  :key="grid_type"
                  :class="{ 'is--active': current_grid_type === grid_type }"
                  @click="current_grid_type = grid_type"
                >
                  {{ $t(grid_type).toLowerCase() }}
                </button>
              </div>
            </div>
          </transition>

          <transition name="enableMode" :duration="800">
            <div
              v-if="mode_just_changed"
              class="_mode_indicator"
              v-html="$t(selected_mode)"
            />
          </transition>

          <transition name="justCaptured" :duration="200">
            <MediaPreviewBeforeValidation
              v-if="media_to_validate && must_validate_media"
              :media_to_validate="media_to_validate"
              :audio_output_deviceId="audio_output_deviceId"
            />
          </transition>
        </div>
      </div>
      <transition name="slideup" :duration="150" mode="out-in">
        <StopmotionPanel
          v-if="$root.store.stopmotions.hasOwnProperty(current_stopmotion)"
          :stopmotiondata="$root.store.stopmotions[current_stopmotion]"
          :type="type"
          :slugFolderName="slugFolderName"
          :read_only="read_only"
          :stream="stream"
          :can_add_to_fav="can_add_to_fav"
          :show_live_feed.sync="show_live_feed"
          :is_validating_stopmotion_video.sync="is_validating_stopmotion_video"
          @saveMedia="(metaFileName) => $emit('insertMedias', [metaFileName])"
          @close="closeStopmotionPanel"
          @new_single_image="updateSingleImage"
        />
      </transition>

      <transition name="slideup" :duration="150" mode="out-in">
        <div class="m_captureview--videoPane--bottom">
          <transition name="fade_fast" :duration="150">
            <Loader v-if="is_sending_image" />
          </transition>

          <transition name="slideup" :duration="150" mode="out-in">
            <div
              class="m_captureview--videoPane--bottom--buttons"
              :class="{
                'is--recording': is_recording && !video_recording_is_paused,
                'is--sending_image': is_sending_image,
              }"
              v-if="!(media_to_validate && must_validate_media)"
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
                    class="bg-rouge button-inline"
                    :class="{ 'is--active': show_capture_settings }"
                    @click="show_capture_settings = !show_capture_settings"
                    :content="$t('settings')"
                    v-tippy="{
                      placement: 'right',
                      delay: [600, 0],
                    }"
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
                    class="button-inline bg-bleumarine"
                    :class="{ 'is--active': show_effects_pane }"
                    @click="show_effects_pane = !show_effects_pane"
                    :content="$t('effects')"
                    v-tippy="{
                      placement: 'right',
                      delay: [600, 0],
                    }"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 168 168"
                      class="inline-svg inline-svg_larger"
                    >
                      <path
                        d="M84.0039,168A84,84,0,1,0,0,84,83.9973,83.9973,0,0,0,84.0039,168Z"
                        style="fill: #1b2f81"
                      />
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
                  class="bg-orange button-inline _captureButton"
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
                  class="bg-orange button-inline _captureButton"
                  :key="selected_mode + '_pause'"
                  v-if="
                    selected_mode === 'stopmotion' &&
                    is_making_stopmotion &&
                    !timelapse_event
                  "
                  @mousedown.stop.prevent="stopStopmotion()"
                  @touchstart.stop.prevent="stopStopmotion()"
                >
                  {{ $t("stop_stopmotion") }}
                </button>
              </div>
              <div>
                <transition name="fade_fast" mode="out-in">
                  <button
                    type="button"
                    v-if="!is_recording"
                    class="bg-orange button-inline _captureButton"
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
                        src="/images/i_record.svg"
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
                    class="bg-orange button-inline _captureButton"
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
                        src="/images/i_stop.svg"
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
                    v-if="selected_mode === 'stopmotion' && !timelapse_event"
                    :content="$t('timelapse')"
                    v-tippy="{
                      placement: 'top',
                      delay: [600, 0],
                    }"
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
                    v-if="!is_recording"
                    :class="{ 'is--active': delay_mode_enabled }"
                    :content="$t('delay')"
                    v-tippy="{
                      placement: 'top',
                      delay: [600, 0],
                    }"
                    @click="delay_mode_enabled = !delay_mode_enabled"
                  >
                    <!-- Generator: Adobe Illustrator 25.0.0, SVG Export Plug-In  -->
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
                <div
                  v-if="selected_mode === 'video'"
                  class="flex-wrap flex-vertically-centered"
                >
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

                  <span class="switch switch-xs" v-if="!is_recording">
                    <input
                      class="switch"
                      id="recordVideoWithAudio"
                      type="checkbox"
                      v-model="enable_audio_recording_in_video"
                      :disabled="is_recording"
                    />
                    <label for="recordVideoWithAudio">{{
                      $t("with_sound")
                    }}</label>
                  </span>
                </div>
                <div
                  v-if="
                    selected_mode === 'stopmotion' &&
                    stopmotion.onion_skin_img &&
                    show_live_feed &&
                    is_making_stopmotion &&
                    !timelapse_event
                  "
                  class="_mode_accessory_range"
                >
                  <label>{{ $t("onion_skin") }} </label>
                  <input
                    class="_rtl"
                    type="range"
                    v-model.number="stopmotion.onion_skin_opacity"
                    min="0"
                    max=".9"
                    step="0.01"
                    :title="stopmotion.onion_skin_opacity"
                  />
                </div>

                <button
                  type="button"
                  v-if="selected_mode === 'stopmotion' && !is_making_stopmotion"
                  @click="show_stopmotion_list = !show_stopmotion_list"
                  class="bg-bleumarine font-small"
                >
                  <span class>{{ $t("stopmotion_list") }}</span>
                </button>

                <div
                  v-if="selected_mode === 'vecto'"
                  class="_mode_accessory_range"
                >
                  <label
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
                  class="buttonLink"
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
                    <label>{{ $t("lines_angle") }} = {{ lines_angle }}</label>
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
                    <label
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
                    <label>{{ $t("contrast") }} = {{ lines_contrast }}</label>
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
                    <label
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
            <div v-else-if="must_validate_media" key="validation">
              <div class="_download_media_without_validation">
                <small>
                  <a
                    ref=""
                    :href="validated_media_href_blob"
                    :download="media_to_validate.temp_name"
                    target="_blank"
                  >
                    {{ $t("or_download_media_on_device") }} —
                    {{ $root.formatBytes(media_to_validate.rawData.size) }}
                  </a>
                </small>
              </div>

              <MediaValidationButtons
                :read_only="read_only"
                :can_add_to_fav="can_add_to_fav"
                :media_is_being_sent="media_is_being_sent"
                :media_being_sent_percent="media_being_sent_percent"
                @cancel="cancelValidation()"
                @save="sendMedia({})"
                @save_and_fav="sendMedia({ fav: true })"
              />
            </div>
          </transition>
        </div>
      </transition>
    </div>

    <StopmotionList
      v-if="show_stopmotion_list && !is_making_stopmotion"
      :slugFolderName="slugFolderName"
      @loadStopmotion="loadStopmotion"
    />
  </div>
</template>
<script>
import MediaPreviewBeforeValidation from "./MediaPreviewBeforeValidation.vue";
import MediaValidationButtons from "./MediaValidationButtons.vue";
import StopmotionPanel from "./StopmotionPanel.vue";
import MediaContent from "../subcomponents/MediaContent.vue";

import CaptureSettings from "./CaptureSettings.vue";
import CaptureEffects from "./CaptureEffects.vue";
import StopmotionList from "./StopmotionList.vue";
import AudioEqualizer from "./AudioEqualizer.vue";
import Vecto from "./Vecto.vue";
import Lines from "./Lines.vue";

import adapter from "webrtc-adapter";

import * as axios from "axios";
import RecordRTC from "recordrtc";
import { setTimeout } from "timers";

export default {
  props: {
    slugFolderName: String,
    type: String,
    read_only: Boolean,
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
    can_add_to_fav: {
      type: Boolean,
      default: true,
    },
    must_validate_media: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    MediaPreviewBeforeValidation,
    MediaValidationButtons,
    StopmotionPanel,
    MediaContent,
    CaptureSettings,
    CaptureEffects,
    StopmotionList,
    AudioEqualizer,
    Vecto,
    Lines,
  },
  data() {
    return {
      selected_mode: "",
      is_sending_image: false,

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
      invisible_canvas: undefined,

      available_mode_picto: {
        photo: "/images/i_icone-dodoc_image.svg",
        video: "/images/i_icone-dodoc_video.svg",
        stopmotion: "/images/i_icone-dodoc_anim.svg",
        audio: "/images/i_icone-dodoc_audio.svg",
        vecto: "/images/i_icone-dodoc_vecto.svg",
        lines: "/images/i_icone-dodoc_lines.svg",
      },

      media_to_validate: false,
      media_is_being_sent: false,
      media_being_sent_percent: 0,
      capture_button_pressed: false,
      mode_just_changed: false,
      is_validating_stopmotion_video: false,
      video_recording_is_paused: false,

      current_stopmotion: false,

      collapse_capture_pane: false,

      enable_grid: false,
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
      current_grid_type: "thirds",

      // selected_devices: {
      //   video_input_device: undefined,
      //   audio_input_device: undefined,
      //   audio_output_device: undefined,
      // },

      stream: undefined,
      stream_type: undefined,

      audio_output_deviceId: undefined,

      show_capture_settings: false,
      show_effects_pane: false,

      enable_audio_recording_in_video: true,
      enable_video: true,

      is_recording: false,
      timer_recording_in_seconds: false,
      recording_timer_interval: undefined,

      timelapse_mode_enabled: false,
      timelapse_interval: 2,
      timelapse_event: false,
      timelapse_start_time: false,

      delay_mode_enabled: false,
      delay_seconds: 5,
      delay_event: false,
      delay_start_time: false,

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
      stopmotion: {
        onion_skin_img: false,
        onion_skin_opacity: 0,
      },

      last_frame_from_video: undefined,
      frameGrabber: undefined,

      show_lines_settings: false,
      vecto_number_of_colors: 2,
      lines_angle: 108,
      lines_brightness: 1,
      lines_contrast: 1,
      lines_density: 0.25,

      stream_sharing_informations_status: {},
      stream_access_informations_status: {},

      enable_effects: false,
      update_last_video_imageData: undefined,
    };
  },
  created() {},
  mounted() {
    if (
      this.$root.settings.capture_options.selected_mode !== "" &&
      this.available_modes.includes(
        this.$root.settings.capture_options.selected_mode
      )
    )
      this.selected_mode = this.$root.settings.capture_options.selected_mode;
    else this.selected_mode = this.available_modes[0];

    document.addEventListener("keyup", this.captureKeyListener);

    this.checkCapturePanelSize();
    this.$eventHub.$on(`activity_panels_resized`, this.checkCapturePanelSize);
    this.$eventHub.$on(`window.resized`, this.checkCapturePanelSize);
    this.$eventHub.$on(
      `stream.newSharingInformations`,
      this.updateStreamSharing
    );
    this.$eventHub.$on(
      `stream.newDistantAccessInformations`,
      this.updateDistantStream
    );

    this.$refs.videoElement.volume = 0;
    this.$refs.videoElement.addEventListener(
      "loadedmetadata",
      this.refreshVideoActualSize
    );
  },
  beforeDestroy() {
    this.$eventHub.$off(`activity_panels_resized`, this.checkCapturePanelSize);
    this.$eventHub.$off(`window.resized`, this.checkCapturePanelSize);
    this.$eventHub.$off(
      `stream.newSharingInformations`,
      this.updateStreamSharing
    );
    this.$eventHub.$off(
      `stream.newDistantAccessInformations`,
      this.updateDistantStream
    );

    document.removeEventListener("keyup", this.captureKeyListener);

    this.$root.settings.ask_before_leaving_capture = false;

    this.stopFrameGrabber();
    this.stopTimelapseInterval();
    this.cancelDelay();
    this.eraseTimer();

    if (this.update_last_video_imageData)
      window.cancelAnimationFrame(this.update_last_video_imageData);

    this.$refs.videoElement.removeEventListener(
      "loadedmetadata",
      this.refreshVideoActualSize
    ); //turn off the event handler
  },
  watch: {
    selected_mode: function () {
      this.mode_just_changed = true;
      window.setTimeout(() => {
        this.mode_just_changed = false;
      }, 300);
      this.$root.settings.capture_options.selected_mode = this.selected_mode;

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
    is_validating_stopmotion_video: function () {
      if (this.is_validating_stopmotion_video) {
        this.$refs.videoElement.pause();
      } else {
        this.$refs.videoElement.play();
        this.show_live_feed = true;
      }
    },
    audio_output_deviceId: function () {
      // const audio = document.createElement('audio');
      // await audio.setSinkId(audioDevices[0].deviceId);
      // console.log('Audio is being played on ' + audio.sinkId);
    },
    media_to_validate: function () {
      console.log(
        `WATCH • Capture: media_to_validate = ${!!this.media_to_validate}`
      );

      if (!this.must_validate_media) {
        this.sendMedia({});
        return;
      }

      if (this.media_to_validate) {
        if (this.$refs.videoElement) this.$refs.videoElement.pause();
        if (this.$refs.audioElement) this.$refs.audioElement.pause();
        this.$root.settings.ask_before_leaving_capture = true;
      } else {
        if (this.$refs.videoElement) this.$refs.videoElement.play();
        if (this.$refs.audioElement) this.$refs.audioElement.play();
        this.$root.settings.ask_before_leaving_capture = false;
      }
    },
  },
  computed: {
    is_making_stopmotion() {
      const is_making_stopmotion = this.current_stopmotion ? true : false;
      if (is_making_stopmotion) {
        this.show_capture_settings = false;
      }
      return is_making_stopmotion;
    },
    uri_to_upload_media: function () {
      return (
        window.location.origin +
        `/_file-upload/${this.type}/${this.slugFolderName}/?socketid=${this.$root.$socketio.socket.id}`
      );
    },
    validated_media_href_blob() {
      if (!this.media_to_validate) return false;
      return window.URL.createObjectURL(this.media_to_validate.rawData);
    },
    time_before_next_picture: function () {
      if (!this.timelapse_start_time) return false;

      const time_since_start = +this.$moment(
        this.$root.currentTime_millis - this.timelapse_start_time
      );
      const time_remaining =
        (this.timelapse_interval * 1000 - time_since_start) / 1000;
      return Math.floor(time_remaining + 0.99);
    },
    delay_before_picture() {
      if (!this.delay_start_time) return false;
      const time_since_start = +this.$moment(
        this.$root.currentTime_millis - this.delay_start_time
      );
      const time_remaining =
        (this.delay_seconds * 1000 - time_since_start) / 1000;
      return Math.floor(time_remaining + 0.99);
      // return this.delay_seconds - seconds_ellapsed_since_click;
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
    hasFinishedLoading() {
      this.show_live_feed = true;
    },
    setStream({ stream, type }) {
      this.stream = stream;
      this.stream_type = type;
      this.$refs.videoElement.volume = 0;
    },
    setImageData(imageData) {
      if (!this.$refs.canvasElement) return;
      this.$refs.canvasElement.getContext("2d").putImageData(imageData, 0, 0);
    },
    previousMode() {
      console.log("METHODS • CaptureView: previousMode");
      if (
        this.is_recording ||
        this.media_to_validate ||
        this.mode_just_changed ||
        this.is_making_stopmotion
      )
        return;

      let current_mode_index = this.available_modes.indexOf(this.selected_mode);

      if (current_mode_index > 0) {
      }
      if (current_mode_index > 0) {
        this.selected_mode = this.available_modes[current_mode_index - 1];
      } else {
        this.selected_mode = this.available_modes[
          this.available_modes.length - 1
        ];
      }
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
    nextMode() {
      console.log("CaptureView: METHODS • nextMode");

      if (
        this.is_recording ||
        this.media_to_validate ||
        this.mode_just_changed ||
        this.is_making_stopmotion
      )
        return;

      let current_mode_index = this.available_modes.indexOf(this.selected_mode);
      if (current_mode_index < this.available_modes.length - 1) {
        this.selected_mode = this.available_modes[current_mode_index + 1];
      } else {
        this.selected_mode = this.available_modes[0];
      }
    },
    updateStreamSharing(val) {
      this.stream_sharing_informations_status = val;
    },
    updateDistantStream(val) {
      this.stream_access_informations_status = val;
    },
    refreshVideoActualSize() {
      this.getVideoActualSize()
        .then(({ width, height }) => {
          this.actual_camera_resolution.width = width;
          this.actual_camera_resolution.height = height;
        })
        .catch((err) => {
          if (this.$root.state.dev_mode === "debug")
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
    loadStopmotion(slugFolderName) {
      this.current_stopmotion = slugFolderName;
      this.$root.settings.ask_before_leaving_capture = true;
    },
    checkCapturePanelSize() {
      if (this.$el && this.$el.offsetWidth && this.$el.offsetWidth <= 600)
        this.collapse_capture_pane = true;
      else this.collapse_capture_pane = false;

      // this.updateVideoDisplayedSize();
    },

    stopStopmotion() {
      this.$alertify
        .okBtn(this.$t("yes"))
        .cancelBtn(this.$t("cancel"))
        .confirm(
          this.$t("sure_to_cancel_stopmotion"),
          () => {
            this.closeStopmotionPanel();
          },
          () => {}
        );
    },

    startFrameGrabber() {
      const getFrame = () => {
        if (this.$root.state.dev_mode === "debug")
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
      if (this.$root.state.dev_mode === "debug")
        console.log(`CaptureView • METHODS : stopFrameGrabber  `);

      if (this.frameGrabber) window.clearInterval(this.frameGrabber);
      this.last_frame_from_video = undefined;
    },
    addStopmotionImage() {
      const smdata = {
        name:
          this.slugFolderName + "-" + this.$moment().format("YYYYMMDD_HHmmss"),
        linked_project: this.slugFolderName,
        linked_type: this.type,
        authors: this.$root.current_author
          ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
          : "",
      };

      this.$refs.videoElement.pause();
      this.getImageDataFromFeed().then((imageData) => {
        if (!this.current_stopmotion) {
          this.$root.settings.ask_before_leaving_capture = true;
          // create stopmotion
          this.$root
            .createFolder({
              type: "stopmotions",
              data: smdata,
            })
            .then((fdata) => {
              this.current_stopmotion = fdata.slugFolderName;
              this.addImageToStopmotion(imageData);
            });
        } else {
          // append to stopmotion
          this.addImageToStopmotion(imageData);
        }
      });
    },
    addImageToStopmotion(imageData) {
      console.log("METHODS • CaptureView: addImageToStopmotion");
      this.is_sending_image = true;

      this.$root
        .createMedia({
          slugFolderName: this.current_stopmotion,
          type: "stopmotions",
          rawData: imageData,
          additionalMeta: {
            type: "image",
          },
        })
        .then((mdata) => {
          this.is_sending_image = false;
          this.$refs.videoElement.play();
        })
        .catch((err) => {
          if (this.is_sending_image && this.$refs.videoElement) {
            this.is_sending_image = false;
            this.$refs.videoElement.play();
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.failed_to_save_media"));
          }
        });
    },
    closeStopmotionPanel() {
      this.current_stopmotion = false;
      this.is_recording = false;
      this.$root.settings.ask_before_leaving_capture = false;
      this.show_live_feed = true;
    },

    captureKeyListener(event) {
      console.log("METHODS • CaptureView: captureKeyListener");

      // don’t register if validating a media
      if (this.media_to_validate || this.is_validating_stopmotion_video) {
        return false;
      }

      // TODO : write captcha to prevent writing to interfere with camera
      if (
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea"
      ) {
        return false;
      }

      switch (event.key) {
        case "w":
        case "z":
        case "ArrowLeft":
          this.previousMode();
          break;
        case "s":
        case "ArrowRight":
          this.nextMode();
          break;
        case "a":
        case "q":
        case " ":
          if (!this.is_recording) this.setCaptureInit();
          else this.stopRecording();
          break;
      }
    },
    setCaptureInit() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`CaptureView / setCaptureInit`);

      this.$root.settings.ask_before_leaving_capture = true;

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
      this.delay_start_time = this.$root.currentTime_millis;
      this.delay_event = window.setTimeout(() => {
        this.setCapture();
        this.delay_start_time = false;
        this.delay_event = false;
      }, this.delay_seconds * 1000);
    },
    cancelDelay() {
      window.clearTimeout(this.delay_event);
      this.delay_start_time = false;
      this.delay_event = false;
    },
    startTimelapseInterval() {
      this.timelapse_start_time = this.$root.currentTime_millis;
      this.timelapse_event = window.setInterval(() => {
        this.setCapture();
        this.timelapse_start_time = this.$root.currentTime_millis;
      }, this.timelapse_interval * 1000);
    },
    stopTimelapseInterval() {
      window.clearInterval(this.timelapse_event);
      this.timelapse_event = false;
      this.timelapse_start_time = false;
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
        const svgstr = this.$refs.vectoElement.$el.querySelector("svg")
          .outerHTML;
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

          this.media_to_validate = {
            rawData: video_blob,
            objectURL: URL.createObjectURL(video_blob),
            temp_name: "video.webm",
            type: "video",
          };
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
          this.media_to_validate = {
            preview,
            rawData: audio_blob,
            objectURL: URL.createObjectURL(audio_blob),
            temp_name: "audio.wav",
            type: "audio",
          };
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
      this.timer_recording_in_seconds = 0;
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
      this.recording_timer_interval = window.setInterval(() => {
        this.timer_recording_in_seconds = Number(
          Number(this.timer_recording_in_seconds) + 0.1
        ).toFixed(1);
      }, 100);
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

    getStaticImageFromVideoElement({
      width,
      height,
      returns = "blob",
      from_element = this.$refs.videoElement,
    } = {}) {
      return new Promise((resolve, reject) => {
        if (this.$root.state.dev_mode === "debug")
          console.log(
            `CaptureView • METHODS : getStaticImageFromVideoElement of type ${returns}`
          );

        if (!from_element) {
          if (this.$root.state.dev_mode === "debug")
            console.log(
              `CaptureView • METHODS : getStaticImageFromVideoElement • missing element`
            );
          return reject();
        }

        var t0 = performance.now();
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

        if (returns === "blob") {
          var imageData = _canvas.toBlob(
            (imageBlob) => {
              var t1 = performance.now();
              if (this.$root.state.dev_mode === "debug")
                console.log(
                  "CaptureView • METHODS : getStaticImageFromVideoElement toBlob took " +
                    (t1 - t0) +
                    " milliseconds."
                );

              return resolve(imageBlob);
            },
            "image/jpeg",
            0.95
          );
        } else if (returns === "imageData") {
          let frame = _canvas
            .getContext("2d")
            .getImageData(0, 0, _canvas.width, _canvas.height);

          var t1 = performance.now();
          if (this.$root.state.dev_mode === "debug")
            console.log(
              "CaptureView • METHODS : getStaticImageFromVideoElement getImageData took " +
                (t1 - t0) +
                " milliseconds."
            );

          return resolve(frame);
        }
      });
    },

    startRecordFeed(options) {
      return new Promise((resolve, reject) => {
        const finalStream = new MediaStream();

        // ajouter la vidéo au stream

        const video_source =
          this.enable_effects && this.$refs.canvasElement
            ? this.$refs.canvasElement.captureStream()
            : this.stream;
        video_source.getVideoTracks().forEach(function (track) {
          finalStream.addTrack(track);
        });

        if (
          !options.hasOwnProperty("enable_audio_recording_in_video") ||
          options.enable_audio_recording_in_video === true
        )
          this.stream
            .getAudioTracks()
            .forEach((track) => finalStream.addTrack(track));

        this.recorder = RecordRTC(finalStream, options);

        try {
          this.recorder.startRecording();
          this.is_recording = true;
          this.startTimer();
        } catch (err) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              this.$t("notifications.failed_to_start_record") +
                "<br>" +
                err.message
            );
        }
      });
    },

    sendMedia({ fav = false }) {
      return new Promise((resolve, reject) => {
        console.log(`METHODS • CaptureView: sendMedia with fav=${fav}`);
        if (this.$root.state.dev_mode === "debug")
          console.log(`METHODS • CaptureView / sendMedia`);

        const timeCreated = this.$moment().format("YYYYMMDD_HHmmss");
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
        const modified = new Date();

        // this.$set(this.selected_files_meta, filename, {
        //   upload_percentages: 0,
        //   status: 'sending'
        // });

        const rawData = this.media_to_validate.rawData;

        let formData = new FormData();
        formData.append("files", rawData, filename);
        const meta = {
          fileCreationDate: modified,
          fav,
          authors: this.$root.current_author
            ? [{ slugFolderName: this.$root.current_author.slugFolderName }]
            : "",
        };
        formData.append(filename, JSON.stringify(meta));

        const socketid = this.$socketio.socket.id;
        if (socketid !== undefined) {
          formData.append("socketid", socketid);
        }

        if (this.$root.state.dev_mode === "debug") {
          console.log(
            `METHODS • sendThisFile: name = ${filename} / formData is ready`
          );
        }

        this.media_is_being_sent = true;
        this.media_being_sent_percent = 0;

        // TODO : possibilité de cancel
        axios
          .post(this.uri_to_upload_media, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: function (progressEvent) {
              console.log(
                `METHODS • CaptureView: onUploadProgress for name = ${filename} / ${parseInt(
                  Math.round((progressEvent.loaded * 100) / progressEvent.total)
                )}% `
              );
              this.media_being_sent_percent = parseInt(
                Math.round((progressEvent.loaded * 100) / progressEvent.total)
              );
              // this.selected_files_meta[filename].upload_percentages = parseInt(Math.round((progressEvent.loaded * 100 ) / progressEvent.total ) );
            }.bind(this),
          })
          .then((x) => x.data)
          .then((x) => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • CaptureView: name = ${filename} / success uploading`
              );
            }

            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .success(this.$t("notifications.media_was_sent"));
            this.media_is_being_sent = false;
            this.media_to_validate = false;

            this.$emit("insertMedias", [x.metaFileNames[0]]);

            // this.selected_files_meta[filename].status = 'success';
            // this.selected_files_meta[filename].upload_percentages = 100;
            resolve();
          })
          .catch((err) => {
            if (this.$root.state.dev_mode === "debug") {
              console.log(
                `METHODS • sendThisFile: name = ${filename} / failed uploading`
              );
            }

            this.media_is_being_sent = false;
            this.media_being_sent_percent = 0;
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("notifications.media_couldnt_be_sent"));

            // this.selected_files_meta[filename].status = 'failed';
            // this.selected_files_meta[filename].upload_percentages = 0;
            reject();
          });
      });
    },
    cancelValidation() {
      this.media_to_validate = false;
    },
    updateSingleImage($event) {
      this.stopmotion.onion_skin_img = $event;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_captureview {
  display: flex;
  flex-flow: row nowrap;
  max-height: 100vh;

  // &.is--collapsed {
  //   .m_captureview--videoPane--bottom--buttons {
  //     > * {
  //       padding: 0;
  //     }
  //   }
  // }

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
    min-height: 300px;

    flex: 1 1 auto;
    overflow: hidden;

    width: 100%;
    height: 100%;
    background-color: var(--c-noir);
    // padding: calc(var(--spacing) / 2);

    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;

    &.is--being_streamed {
      border-bottom: 5px solid var(--c-rouge);
    }
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

      > * {
        display: flex;
        flex: 1 1 100px;
        padding: calc(var(--spacing) / 2);

        > * {
          margin-right: calc(var(--spacing) / 2);
        }

        &:nth-child(2) {
          flex: 1 1 200px;
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
        background-color: var(--c-orange);
      }
    }
  }

  ._settingsTag {
    position: absolute;
    bottom: 0;
    right: 0;
    color: var(--c-noir);
    font-size: var(--font-verysmall);
    margin: 15px;
    pointer-events: none;

    text-align: right;

    button {
      display: inline-block;
      background-color: white;
      // border: 2px solid #fff;
      border-radius: 4px;
      line-height: 1;
      margin: 2px;
      padding: 2px 4px;
      font-weight: 500;
      pointer-events: auto;
      cursor: pointer;

      &:hover {
        font-weight: 600;
      }

      &.is--active {
        background-color: var(--c-rouge);
        color: white;
      }
    }
  }

  .m_captureview--videoPane--top--videoContainer {
    position: relative;
    width: 100%;
    height: 100%;

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
  margin: 0 calc(var(--spacing) / 4);

  > img {
    flex: 0 0 auto;
  }
}

._modeSelector {
  position: absolute;
  z-index: 1;
  display: flex;
  left: 0;
  right: 0;
  // width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  padding: calc(var(--spacing) / 2) 0 0;
  user-select: none;
  pointer-events: none;

  font-family: "Fira Code";
  color: var(--c-orange);

  input[disabled] + label {
    filter: grayscale(100%);
    // opacity: 0.3;
    cursor: not-allowed;
  }

  > * {
    flex: 0 0 auto;
    display: flex;
    flex-flow: row wrap;
    font-family: inherit;
    pointer-events: auto;
    // background-color: white;
  }
  > ._arrows {
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);

    button {
      padding-left: 0;
      padding-right: 0;
      min-height: 0;
    }

    svg {
      width: 36px;
      height: 36px;
      padding: 4px;
      // padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
    }

    &:hover,
    &:focus {
      // background-color: var(--c-gris-fonce);
    }
  }

  input {
    width: 0px;
    height: 0;
    visibility: hidden;

    &:not(:checked) + label:not(:hover) {
      // opacity: 0.3;
      // background: transparent;
    }
  }

  input:checked + label {
    background-color: var(--c-orange);
    span {
      color: white;
    }
  }

  input[disabled] + label {
    filter: grayscale(100%);
    opacity: 0.3;
    cursor: not-allowed;
  }

  label {
    font-size: inherit;
    font-family: inherit;
    display: inline-block;
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.06em;
    flex-shrink: 0;
    margin: 0;
    cursor: pointer;
    // min-height: 2.43rem;
    border-radius: 6px;
    transition: color 0.25s ease-out, opacity 0.5s;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    letter-spacing: 0;
    // padding: 0 0.405rem;
    margin: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
    text-align: center;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  ._picto {
    border-radius: 50%;
    overflow: hidden;
    display: block;
    width: 36px;
    height: 36px;

    // margin: calc(var(--spacing) / 8);

    padding: 4px;
    color: #fff;

    margin-right: 0;
  }

  span {
    display: block;
    font-weight: 400;
    text-transform: lowercase;
    margin: 0.405rem;
    font-size: 0.8rem;
    font-family: Fira Mono;
    text-transform: uppercase;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: #666;
    font-weight: 600;
  }
}

._mode_indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--c-orange);
  font-weight: 700;
  font-family: "Fira Code";
  font-size: var(--font-large);
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

  &.is--timelapse {
    font-size: 10vmin;
    -webkit-text-stroke: 0.2vmin var(--c-text-stroke);
    height: 50%;
    bottom: 0;
  }
}

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
  margin: calc(var(--spacing) / 4) auto;

  label {
    display: inline-block;
    margin: 0 auto;
    background-color: var(--c-rouge);
    padding: 0 calc(var(--spacing) / 8);

    margin-bottom: calc(var(--spacing) / 8);
    color: white;
    border-radius: 4px;
    pointer-events: auto;
  }

  .record_options {
    max-width: 450px;
    margin: calc(var(--spacing) / 4) auto;
    // .padding-verysmall;
    pointer-events: auto;
    // .font-small;

    > * {
      background-color: var(--c-rouge);

      color: white;
      padding: 0 calc(var(--spacing) / 4);
      border-radius: 4px;
      width: auto;
    }

    input {
      display: inline-block;
      min-width: 2em;
      max-width: 3em;
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
}
._mode_accessory_range {
  max-width: 200px;
  margin: -5px 0 -5px auto;
  label {
    margin: 0;
  }
  input._rtl {
    direction: rtl;
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
  width: 24px;
  height: 24px;
  display: block;
  min-height: 0;
  line-height: 0;
  border-radius: 50%;
  text-align: center;
  font-weight: bold;
  padding: 0;
  margin: calc(var(--spacing) / 4);

  svg {
    width: 100%;
    height: 100%;
  }

  &.is--active {
    background: var(--c-rouge);
    color: white;
  }
}
._just_captured_overlay {
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
</style>
<style lang="scss">
._onion_skin img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
