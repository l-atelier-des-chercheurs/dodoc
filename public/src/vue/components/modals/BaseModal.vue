<template>
  <portal to="modal_container">
    <transition name="modal">
      <div class="m_modal--mask"
        v-if="showModal"
        @click.self="closeModal"
      >

        <div class="m_modal--container"
          :class="[{
            'is--large' : !!this.$slots['preview']
          }, 'color-' + backgroundColor]"
          @keyup.ctrl.enter="$emit('submit')"
          >

          <div
            class="m_modal--container--content"
            >

            <form v-if="!!this.$slots['sidebar']"
              class="m_modal--sidebar bg-noir_light c-blanc"
              v-on:submit.prevent="$emit('submit')"
              >

              <div class="m_modal--header padding-medium bg-noir c-blanc">
                <h3 class="margin-none with-bullet">
                  <slot name="header">
                      default header
                  </slot>
                </h3>
              </div>

              <div class="m_modal--metaOptions padding-medium">
                <slot name="sidebar">
                  default sidebar
                </slot>
              </div>

              <button
                class="m_modal--save bg-vert_vif button-rectangle button-allwide button-inline margin-none padding-small"
                type="submit"
                :disabled="read_only"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="24" style="fill: transparent"/>
                  <polyline points="35.48 13.74 22.2 36.41 12.81 25.55" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 2px"/>
                </svg>

                <span class="text-cap font-verysmall">
                  <slot name="submit_button">
                    {{ $t('save') }}
                  </slot>
                </span>
              </button>
            </form>

            <div v-if="!!this.$slots['preview']" class="m_modal--preview"
            >

              <!-- if there is no sidebar, output header here -->
              <template v-if="!this.$slots['sidebar']">
                <div class="m_modal--header padding-medium bg-noir c-blanc">
                  <h3 class="margin-none with-bullet">
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

          </div>

        </div>

        <button
          class="button-round bg-transparent m_modal--close_button padding-verysmall"
          @click="closeModal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
            <line x1="13.33" y1="13.33" x2="34.67" y2="34.67"/>
            <line x1="13.33" y1="34.67" x2="34.67" y2="13.33"/>
          </svg>
        </button>
      </div>
    </transition>
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
    }
  },
  data() {
    return {
      showModal: false
    };
  },
  methods: {
    modalKeyListener: function(evt) {
      console.log('METHODS • BaseModal: modalKeyListener');
      if (evt.keyCode === 27) {
        this.closeModal();
      }
    },
    closeModal: function() {
      this.showModal = false;
      setTimeout(() => {
        this.$emit('close');
      }, 500);
    }
  },
  created: function() {
    window.addEventListener('keyup', this.modalKeyListener);
    document.body.classList.add('is_unscrollable');
    this.$root.settings.has_modal_opened = true;
  },
  mounted: function() {
    this.showModal = true;
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