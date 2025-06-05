<template>
  <div
    class="_message"
    :ref="`message-${message.$path}`"
    :class="{ 'is-self': is_self }"
  >
    <div class="_message--header">
      <div class="_message--header--author">
        <AuthorTag
          v-if="message_author_path"
          :key="message_author_path"
          :path="message_author_path"
          :mode="'link'"
          :size="'small'"
        />
        <!-- <AuthorField
          :label="$t('authors')"
          :show_label="false"
          :field="'$authors'"
          :authors_paths="message.$authors"
          :path="message.$path"
          :can_edit="can_edit"
          :instructions="$t('file_author_instructions')"
          :no_options="true"
        /> -->
        <!-- <template v-else>
          &nbsp;&nbsp;<i>{{ $t("anonymous_user").toLowerCase() }}</i>
        </template> -->
      </div>
      <div class="_message--header--date">{{ formatted_date }}</div>
    </div>
    <div class="_message--content">
      {{ message.content || "…" }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Message",
  props: {
    message: {
      type: Object,
      required: true,
    },
    can_edit: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formatted_date() {
      if (!this.message.$date_uploaded) return "";
      const date = new Date(this.message.$date_uploaded);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    message_author_path() {
      if (this.message.$authors?.length > 0) return this.message.$authors[0];
      return undefined;
    },
    is_self() {
      if (this.message_author_path && this.connected_as)
        return this.message_author_path === this.connected_as.$path;
      return false;
    },
  },
};
</script>

<style lang="scss" scoped>
._message {
  border-radius: var(--border-radius);
  background: white;
  color: var(--c-noir);
  margin-bottom: calc(var(--spacing) / 4);

  &.is-self {
    margin-left: calc(var(--spacing) * 2);
  }
  &:not(.is-self) {
    margin-right: calc(var(--spacing) * 2);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

._message--header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--c-gris_fonce);
  padding: calc(var(--spacing) / 8);
  padding-bottom: 0;

  ._message--header--author {
    // font-weight: 500;
  }

  ._message--header--date {
    font-size: var(--sl-font-size-small);
    color: var(--c-gris_fonce);
    padding: calc(var(--spacing) / 4);
  }
}
._message--content {
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 1.5);
}
</style>
