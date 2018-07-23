<template>
  <portal to="modal_container">
    <div 
      class="m_modal--mask"
      :class="['typeOfModal-' + typeOfModal, { 'is_invisible' : !showModal }]"
      @mousedown.self="closeModal"
      :style="`height: ${window_innerHeight}px`"
    >
      <div class="m_modal--container"
        :class="['color-' + backgroundColor, { 'is_invisible' : !showModal }]"
        @keyup.ctrl.enter="$emit('submit')"
      >

        <div
          class="m_modal--container--content"
          ref="modalContent"
        >

          <div v-if="!!this.$slots['preview']" class="m_modal--preview"
          >

            <!-- if there is no sidebar, output header here -->
            <template v-if="!this.$slots['sidebar']">
              <div class="m_modal--header">
                <h3 class="margin-none">
                  <slot name="header">
                      default header
                  </slot>
                </h3>
              </div>
            </template>

            <slot name="preview">
              default preview
            </slot>
          </div>

          <form v-if="!!this.$slots['sidebar']"
            class="m_modal--sidebar"
            v-on:submit.prevent="$emit('submit')"
            ref="form"
          >

            <div class="m_modal--header">
              <h3 class="margin-none">
                <slot name="header">
                    default header
                </slot>
              </h3>
            </div>

            <div class="m_modal--metaOptions">
              <slot name="sidebar">
                default sidebar
              </slot>
            </div>

            <div 
              v-if="!!this.$slots['submit_button']"
              class="m_modal--buttons"
            >
              <button
                type="submit"
                :disabled="read_only"
                class="button button-bg_rounded bg-bleuvert"
              >
                <img src="/images/i_enregistre.svg"/>
                <span class="text-cap font-verysmall">
                  <slot name="submit_button">
                    {{ $t('save') }}
                  </slot>
                </span>
              </button>
            </div>
          </form>

          <form 
            v-if="!!this.$slots['buttons']" 
            class="m_modal--buttons"
            v-on:submit.prevent="$emit('submit')"
            ref="form"
          >

            <button
              type="button"
              @click="closeModal"
              class="button button-bg_rounded bg-orange"
            >
              <img src="/images/i_clear.svg"/>
              <span class="text-cap font-verysmall">
                <slot name="cancel_button">
                  {{ $t('cancel') }}
                </slot>
              </span>
            </button>

            <button
              type="submit"
              :disabled="read_only"
              class="button button-bg_rounded bg-bleuvert"
            >
              <img src="/images/i_enregistre.svg"/>
              <span class="text-cap font-verysmall">
                <slot name="submit_button">
                  {{ $t('save') }}
                </slot>
              </span>
            </button>

          </form>

        </div>

      </div>

      <transition name="fade" :duration="600">
        <button
          class="button-round bg-transparent m_modal--close_button padding-verysmall"
          @click="closeModal"
          v-if="showModal"
        >
          <img src="/images/i_close_sansfond.svg">
        </button>
      </transition>
    </div>
  </portal>
</template>

<script>
export default {
  name: 'BaseModal',
  props: {
    backgroundColor: {
      type: String,
      default: 'white'
    },
    read_only: {
      type: Boolean,
      default: true
    },
    typeOfModal: {
      type: String,
      default: 'EditMeta'
    },
    askBeforeClosingModal: {
      type: Boolean,
      default: false
    },
    isFile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  mounted: function() {
    console.log(`MOUNTED • BaseModal`)

    setTimeout(() => {
      this.showModal = true;

      if (Modernizr !== undefined && !Modernizr.touchevents) {
        if(this.$refs.modalContent && this.$refs.modalContent.querySelector('[autofocus]')) {
          const el = this.$refs.modalContent.querySelector('[autofocus]');
          if(el.classList.contains('quillWrapper')) {
            el.querySelector('.ql-editor').focus();
          }  else {
            el.focus();
          }
        }

        if (this.isFile && this.$refs.form){
          this.$refs.form.setAttribute('enctype', 'multipart/form-data');
        }

      }
    },100);
  },
  computed: {
    window_innerHeight() { 
      let wHeight = window.innerHeight;
      // if(this.$root.settings.enable_system_bar) {
      //   // wHeight -= 22;
      // }
      return wHeight; 
    }
  },
  methods: {
    modalKeyListener: function(evt) {
      // console.log('METHODS • BaseModal: modalKeyListener');
      if (evt.keyCode === 27) {
        this.closeModal();
      }
    },
    closeModal: function() {
      console.log(`METHODS • BaseModal: closeModal with askBeforeClosingModal = ${this.askBeforeClosingModal}`)
      if(this.askBeforeClosingModal) {
        if (!window.confirm(this.$t('sureToCloseModal'))) {
          console.log(`METHODS • BaseModal: closeModal refused`)
          return;
        }
      }
      this.showModal = false;
      setTimeout(() => {
        this.$emit('close');
      }, 400);
    }
  },
  created: function() {
    document.addEventListener('keyup', this.modalKeyListener);
    document.body.classList.add('has_modal_opened');
    this.$root.settings.has_modal_opened = true;
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.modalKeyListener);
    document.body.classList.remove('has_modal_opened');
    this.$root.settings.has_modal_opened = false;
  }
};
</script>