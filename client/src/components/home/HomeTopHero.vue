<template>
  <section class="_hero--container">
    <div class="_hero--content" :data-layout="text_image_layout">
      <template v-for="layout in custom_layout">
        <div v-if="layout === 'text'" :key="layout" class="_textBlock">
          <h1 class="_sessionTitle" v-text="name || $t('welcome_to_dodoc')" />
          <div class="">
            <CollaborativeEditor2 v-if="description" :content="description" />
            <template v-else>
              <template v-if="!is_instance_admin">
                <p v-html="$t('admins_edit_text_here')" />
              </template>
              <template v-else>
                <p v-html="$t('admins_edit_text_below')" />
              </template>
            </template>
          </div>
          <template v-if="$root.app_infos.instance_meta.contactmail">
            <div class="u-spacingBottom" />
            <p>
              <b>{{ $t("contactmail_of_instance") }}</b
              >&nbsp;
              <a
                :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
                target="_blank"
                >{{ $root.app_infos.instance_meta.contactmail }}</a
              >
            </p>
          </template>
          <EditBtn
            v-if="is_instance_admin"
            class="_editAdminText"
            :label_position="'left'"
            @click="editPresentationText"
          />
        </div>
        <div
          v-if="layout === 'image' && hero_thumb"
          :key="layout"
          class="_imageBlock"
        >
          <img :src="hero_thumb" role="presentation" />
        </div>
      </template>
      <EditBtn
        v-if="is_instance_admin"
        class="_editAdminImg"
        :label_position="'left'"
        @click="editHeroImage"
      />
    </div>

    <AdminSettings
      v-if="show_settings_modal"
      :starting_tab="settings_modal_starting_tab"
      @close="closeAdminSettings"
    />

    <svg class="_hidden">
      <clipPath id="clipPathSquircle" clipPathUnits="objectBoundingBox">
        <path
          transform="scale(1 1.835)"
          d="M 0.114 0.045 h 0.773 c 0.055 0 0.068 0.013 0.068 0.068 v 0.318 c 0 0.055 -0.013 0.068 -0.068 0.068 h -0.773 c -0.055 0 -0.068 -0.013 -0.068 -0.068 v -0.318 c 0 -0.055 0.013 -0.068 0.068 -0.068"
        />
      </clipPath>
    </svg>
  </section>
</template>

<script>
import AdminSettings from "@/adc-core/AdminSettings.vue";

export default {
  name: "HomeTopHero",
  components: {
    AdminSettings,
  },
  data() {
    return {
      settings_modal_starting_tab: undefined,
      show_settings_modal: false,
    };
  },
  computed: {
    name() {
      return this.$root.app_infos.instance_meta.name;
    },
    description() {
      return this.$root.app_infos.instance_meta.presentation;
    },
    hero_thumb() {
      return this.$root.app_infos.instance_meta.hero_thumb || false;
    },
    text_image_layout() {
      return (
        this.$root.app_infos.instance_meta.text_image_layout || "image_text"
      );
    },
    custom_layout() {
      if (this.text_image_layout === "text_image") return ["text", "image"];
      else if (this.text_image_layout === "image_text")
        return ["image", "text"];
      return ["text", "image"];
    },
  },
  methods: {
    editHeroImage() {
      this.settings_modal_starting_tab = "logo_and_images";
      this.show_settings_modal = true;
    },
    editPresentationText() {
      this.settings_modal_starting_tab = "informations";
      this.show_settings_modal = true;
    },
    closeAdminSettings() {
      this.show_settings_modal = false;
      this.settings_modal_starting_tab = undefined;
    },
  },
};
</script>

<style lang="scss" scoped>
._hero--container {
  width: 100%;
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;
  background: var(--hero-bg, transparent);
  border-radius: calc(var(--panel-radius) * 1.5);

  ._homeCover {
    background: white;

    ::v-deep img {
      object-fit: scale-down !important;
    }
  }
}

._hero--content {
  position: relative;
  width: 100%;
  margin: 0 auto;

  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: var(--spacing);
  overflow: hidden;
  // border-bottom: 1px solid var(--c-gris);

  > * {
    flex: 1 1 220px;
  }

  &[data-layout="image_text_overlay"],
  &[data-layout="text_image_overlay"] {
    min-height: 50vh;
    ._textBlock {
      max-width: 400px;
    }
    ._imageBlock {
      position: absolute;
      height: 100%;
      img {
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: cover;
        max-height: none;
      }
    }
  }
  &[data-layout="text_image_overlay"] {
    justify-content: flex-start;
  }
  &[data-layout="image_text_overlay"] {
    justify-content: flex-end;
  }

  ._textBlock {
    position: relative;
    z-index: 1;
    flex: 1 1 220px;
    // max-width: 350px;
    margin: 0 auto;

    border-radius: var(--panel-radius);
    // box-shadow: var(--panel-shadows);
    padding: calc(var(--spacing) / 1);
    margin: calc(var(--spacing) / 2);

    background: var(--text-bg, white);
  }
  ._imageBlock {
    position: relative;
    flex: 4 1 420px;
    width: 100%;

    // https://codepen.io/herrstrietzel/pen/jOQEjEm?editors=0010
    // clip-path: url(#clipPathSquircle);
    border-radius: 36px;
    overflow: hidden;

    // overflow: hidden;
    filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.1));

    img {
      width: auto;
    }
  }
}

._sessionTitle {
  display: block;
  font-weight: 500;
  letter-spacing: -0.015em;
  margin-bottom: calc(var(--spacing) * 1);
}

._editAdminText {
  position: absolute;
  top: calc(var(--spacing) / 2);
  right: calc(var(--spacing) / 2);
}
._editAdminImg {
  position: absolute;
  bottom: calc(var(--spacing) / 2);
  right: calc(var(--spacing) / 2);
}

._hidden {
  position: absolute;
  width: 0;
  height: 0;
}
</style>
