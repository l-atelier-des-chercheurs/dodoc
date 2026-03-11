<template>
  <button
    type="button"
    class="u-button u-button_transparent _paneItem"
    :class="{
      'is--enabled': is_enabled,
      'is--animating': is_animating,
      'is--main': variant === 'main',
      'is--secondary': variant === 'secondary',
    }"
    :title="!show_name ? $t(pane.type) : undefined"
    :style="color_active ? `--color-active: ${color_active};` : undefined"
    @click="$emit('click')"
  >
    <span class="u-icon" v-if="icon_html" v-html="icon_html" />
    <span class="_name" v-if="show_name" v-text="$t(pane.type)" />

    <transition name="fade" mode="out-in">
      <span key="count" class="_count" v-if="is_animating" v-text="+1" />
      <div v-else-if="is_enabled" class="_inlineBtn _removePaneBtn">
        <b-icon
          icon="x-lg"
          :label="$t('close')"
          @click.stop="$emit('remove')"
        />
      </div>
      <div v-else-if="show_add_remove" class="_inlineBtn _addPaneBtn">
        <b-icon icon="plus-lg" :label="$t('add')" @click.stop="$emit('add')" />
      </div>
    </transition>
  </button>
</template>

<script>
import DodocIcon from "@/mixins/DodocIcon.js";

export default {
  mixins: [DodocIcon],
  props: {
    pane: {
      type: Object,
      required: true,
    },
    variant: {
      type: String,
      default: "main",
      validator: (v) => ["main", "secondary"].includes(v),
    },
    is_enabled: Boolean,
    is_animating: Boolean,
    show_name: {
      type: Boolean,
      default: true,
    },
    show_add_remove: Boolean,
    color_active: String,
  },
  computed: {
    icon_html() {
      return this.getIcon(this.pane.type);
    },
  },
  methods: {
    getIcon(type) {
      if (type === "capture") return this.dodoc_icon_capture;
      if (type === "collect") return this.dodoc_icon_collect;
      if (type === "make") return this.dodoc_icon_make;
      if (type === "publish") return this.dodoc_icon_publish;
      if (type === "notes_todo") return this.dodoc_icon_todo;
      if (type === "chats") return this.dodoc_icon_chats;
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
._paneItem {
  color: var(--color-active);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 4);
  border-radius: 44px;
  text-transform: uppercase;
  font-weight: 500;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--enabled {
    background: var(--color-active);
    color: white;
  }

  &:hover,
  &:focus-visible {
    background: var(--color-active);
    color: white;
  }

  .u-icon {
    width: 2rem;
    height: 2rem;
  }
}

._inlineBtn {
  position: relative;
  display: block;
  --sl-transition-medium: 0;

  line-height: 0;
  padding: calc(var(--spacing) / 4);
  font-size: 120%;
  border-radius: 50%;
  transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);
}

._addPaneBtn {
  &:hover,
  &:focus {
    background: white;
    color: var(--color-active);
  }
}
._removePaneBtn {
  &:hover,
  &:focus {
    background: white;
    color: var(--color-active);
  }
}

._name {
  padding: 0 calc(var(--spacing) / 2);
}
._count {
  padding: 0 calc(var(--spacing) / 2);
}
</style>
