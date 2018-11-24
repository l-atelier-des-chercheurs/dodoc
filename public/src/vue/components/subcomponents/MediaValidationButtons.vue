<template>
  <div class="m_mediaValidationButtons">
    <button type="button" class="bg-transparent button-arrow"
      @click="selectedMoveLeft"
    >
      ◀
    </button>

    <button
      type="button"
      class="button button-bg_rounded button-outline c-blanc"
      @click="validateButton(0)"
      :class="{ 'is--selected' : selected_button === 0 }"
      @mouseover="selected_button = 0"
    >
      <template v-if="cancelButtonIsBackButton">
        <span class="">
          ‹ {{ $t('back') }}
        </span>
      </template>
      <template v-else>
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
        <polygon  points="42.6,57.2 57.5,42.4 84.1,69 110.8,42.4 125.6,57.2 99,83.9 125.6,110.5 110.8,125.4 
        84.1,98.7 57.5,125.4 42.6,110.5 69.3,83.9 			"/>
        </svg>
        <span class="">
          {{ $t('cancel') }}
        </span>
      </template>
    </button>

    <button
      type="button"
      :disabled="read_only"
      @click="validateButton(1)"
      class="button button-bg_rounded button-outline c-rouge"
      :class="{ 'is--selected' : selected_button === 1 }"
      @mouseover="selected_button = 1"
    >
      <svg version="1.1" class="" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 168 168" style="enable-background:new 0 0 168 168;" xml:space="preserve">
        <rect x="51.4" y="73.1" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -53.857 72.9892)" width="19.5" height="56.8"/>
        <rect x="53.2" y="77.3" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -31.6875 97.6563)" width="97.6" height="19.5"/>
      </svg>
      <span class="c-rouge">
        {{ $t('save') }}
      </span>
    </button>

    <button
      type="button"
      :disabled="read_only"
      @click="validateButton(2)"
      class="button button-bg_rounded button-outline c-rouge"
      :class="{ 'is--selected' : selected_button === 2 }"
      @mouseover="selected_button = 2"
    >
      <svg version="1.1"
        class="padding-verysmall"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
        x="0px" y="0px" width="68.5px" height="80.4px" viewBox="0 0 78.5 106.4" style="enable-background:new 0 0 78.5 106.4;"
        xml:space="preserve">
        <polygon class="st0" points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"/>
        <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 "/>
      </svg>
      <span class="">
        {{ $t('save') }}<br>{{ $t('as_favorite') }}
      </span>
    </button>

    <button type="button" class="bg-transparent button-arrow"
      @click="selectedMoveRight"
    >
      ▶
    </button>

    <div class="m_mediaValidationButtons--overlay"
      v-if="media_is_being_sent"
    >
      <span class="loader loader-xs" />
      <span class="m_mediaValidationButtons--overlay--percent" v-html="media_being_sent_percent + '%'" />
    </div>
  </div>
</template>
<script>


export default {
  props: {
    read_only: Boolean,
    media_is_being_sent: Boolean,
    media_being_sent_percent: Number,
    cancelButtonIsBackButton: {
      type: Boolean,
      default: false
    }
  },
  components: {
  },
  data() {
    return {
      selected_button: 1
    }
  },
  
  created() {
  },
  mounted() {
    this.$root.settings.capture_mode_cant_be_changed = true;
    document.addEventListener('keyup', this.captureKeyListener);
  },
  beforeDestroy() {
    // this.$root.settings.capture_mode_cant_be_changed = false;
    document.removeEventListener('keyup', this.captureKeyListener);
  },

  watch: {
  },
  computed: {
  },
  methods: {
    captureKeyListener(evt) {
      console.log('METHODS • MediaValidationButtons: captureKeyListener');

      switch(evt.key) {
        case 'w':
        case 'z':
        case 'ArrowLeft':        
          this.selectedMoveLeft();
          break;
        case 's':
        case 'ArrowRight':
          this.selectedMoveRight();
          break;
        case 'a':
        case 'q':
        case ' ':
          this.validateButton(this.selected_button);
          break;
      }

      evt.preventDefault();
      return false;
    },
    selectedMoveLeft() {
      console.log('METHODS • MediaValidationButtons: captureKeyListener / goleft');
      this.selected_button += this.selected_button > 0 ? -1 : 0;
    },
    selectedMoveRight() {
      console.log('METHODS • MediaValidationButtons: captureKeyListener / goright');
      this.selected_button += this.selected_button < 2 ? +1 : 0;
    },
    validateButton(idx) {
      if(idx === 0) {
        this.$emit('cancel');     
      } else 
      if(idx === 1) {
        this.$emit('save')
      } else 
      if(idx === 2) {
        this.$emit('save_and_fav');
      }
    }
  }
}
</script>
<style>

</style>