<template>
  <portal to="modal_container">
    <div 
      class="m_modal--mask"
      :class="['typeOfModal-' + typeOfModal, { 'is_invisible' : !showModal }]"
      @click.self="closeModal"
    >
      <div class="m_modal--container"
        :class="['color-' + backgroundColor, { 'is_invisible' : !showModal }]"
        @keyup.ctrl.enter="$emit('submit')"
        >

        <div
          class="m_modal--container--content"
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

            <div class="m_modal--save">
              <button
                type="submit"
                :disabled="read_only"
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

        </div>

      </div>

      <button
        class="button-round bg-transparent m_modal--close_button padding-verysmall"
        @click="closeModal"
      >
        <img src="/images/i_close_sansfond.svg">
      </button>
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
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  mounted: function() {
    setTimeout(() => {
      this.showModal = true;
    },100);

  },
  methods: {
    modalKeyListener: function(evt) {
      // console.log('METHODS • BaseModal: modalKeyListener');
      if (evt.keyCode === 27) {
        this.closeModal();
      }
    },
    closeModal: function() {
      this.showModal = false;
      setTimeout(() => {
        this.$emit('close');
      }, 400);
    }
  },
  created: function() {
    document.addEventListener('keyup', this.modalKeyListener);
    document.body.classList.add('is_unscrollable');
    this.$root.settings.has_modal_opened = true;
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.modalKeyListener);
    document.body.classList.remove('is_unscrollable');
    this.$root.settings.has_modal_opened = false;
  }
};
</script>

<style lang="sass">

</style>