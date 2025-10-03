<template>
  <div
    class="_message"
    :ref="`message-${message.$path}`"
    :class="{ 'is--self': is_self, 'is--removed': message_is_removed }"
  >
    <div class="_message--header">
      <div class="_message--header--author">
        <template v-if="message_author_path">
          <AuthorTag
            :key="message_author_path"
            :path="message_author_path"
            :size="'small'"
          />
        </template>
        <span v-else class="_message--header--author--anonymous">
          {{ $t("anonymous_user") }}
        </span>
        <!-- <span v-else-if="is_self" class="_message--header--author--self">{{
          "Vous"
        }}</span> -->
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
      <div class="_message--header--date">
        {{ formatted_date }}

        <template
          v-if="
            !message_is_removed &&
            can_contribute_to_chat &&
            (is_self || can_edit_chat)
          "
        >
          <div>
            <button
              type="button"
              class="u-buttonLink"
              :title="$t('edit')"
              @click="show_edit_modal = true"
            >
              <b-icon icon="pencil" />
            </button>
          </div>

          <BaseModal2
            v-if="show_edit_modal"
            :title="$t('edit_this_message')"
            :path="message.$path"
            @close="show_edit_modal = false"
          >
            <TitleField
              :label="$t('content')"
              :field_name="'$content'"
              :content="message.$content"
              :path="message.$path"
              :input_type="'editor'"
              :custom_formats="['bold', 'italic', 'link', 'emoji']"
              :minlength="0"
              :maxlength="max_message_length"
              :can_edit="true"
            />
          </BaseModal2>

          <RemoveMenu
            :show_button_text="false"
            :modal_title="$t('remove_this_message')"
            @remove="removeMessage"
          />
        </template>
      </div>
    </div>
    <div class="_message--content" v-html="message_content" />
  </div>
</template>

<script>
import DOMPurify from "dompurify";
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if ("target" in node) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
  if (
    !node.hasAttribute("target") &&
    (node.hasAttribute("xlink:href") || node.hasAttribute("href"))
  ) {
    node.setAttribute("xlink:show", "new");
  }
});

export default {
  name: "Message",
  props: {
    message: {
      type: Object,
      required: true,
    },
    max_message_length: Number,
    can_contribute_to_chat: {
      type: Boolean,
      default: false,
    },
    can_edit_chat: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show_remove_modal: false,
      show_edit_modal: false,
    };
  },
  methods: {
    async removeMessage() {
      await this.$api.updateMeta({
        path: this.message.$path,
        new_meta: {
          $content: "message_removed",
        },
      });
    },
  },
  computed: {
    message_content() {
      if (this.message.$content === "message_removed") {
        return `<i>${this.$t("message_has_been_removed")}</i>`;
      } else if (this.message.$content) {
        return DOMPurify.sanitize(this.message.$content);
      }
      return "…";
    },
    message_is_removed() {
      return this.message.$content === "message_removed";
    },
    formatted_date() {
      if (!this.message.$date_uploaded) return "";
      const date = new Date(this.message.$date_uploaded);
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    message_author_path() {
      if (this.message.$authors?.length > 0) return this.message.$authors?.[0];
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
  margin: calc(var(--spacing) / 4) calc(var(--spacing) / 2);

  &.is--self {
    margin-left: calc(var(--spacing) * 2);
  }
  &:not(.is--self) {
    margin-right: calc(var(--spacing) * 2);
  }

  &:last-child {
    margin-bottom: 0;
  }

  &.is--removed {
    opacity: 0.5;
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

    display: flex;
    align-items: center;
    gap: calc(var(--spacing) / 4);
  }

  ._message--header--author--anonymous {
    font-style: italic;
    padding-left: calc(var(--spacing) / 4);
  }
}
._message--content {
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  overflow-wrap: break-word;

  max-height: 30rem;
  overflow: auto;
  hyphens: auto;
}
</style>
