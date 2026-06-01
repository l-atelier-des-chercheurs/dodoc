<template>
  <div class="_authorCard u-card2" :data-isself="is_self">
    <router-link
      class="_linkTo"
      :to="author_url"
      @click.native="$emit('navToPage')"
    >
      <div class="_topbar">
        <div class="_cover">
          <CoverField
            :context="'preview'"
            :cover="author.$cover"
            :title="$t('pick_portrait')"
            :preview_format="'circle'"
            :ratio="'square'"
            :path="author.$path"
            :placeholder="author.name.substring(0, 2)"
            :can_edit="false"
          />
        </div>
        <div class="indicators">
          <b-icon v-if="author_has_location" class="" icon="pin-map-fill" />
        </div>
        <div class="_text">
          <div class="">
            <TitleField
              :label="$t('name_or_pseudonym')"
              :show_label="false"
              :field_name="'name'"
              :content="author.name"
              :path="author.$path"
              :tag="'h3'"
              :can_edit="false"
            />
            <div
              class="u-instructions"
              v-if="
                authorIsInstance({
                  field: '$admins',
                  folder_path: author.$path,
                })
              "
            >
              <small>
                <b-icon icon="shield-check" :aria-label="$t('admin')" />
                {{ $t("admin") }}
              </small>
            </div>
            <div
              class="u-instructions"
              v-if="is_instance_admin && author.email"
            >
              <small>
                <b-icon icon="envelope" />
                {{ author.email }}
              </small>
            </div>
            <div class="_connected" v-if="is_connected && !is_self">
              <b-icon
                :title="$t('connected_currently')"
                class=""
                icon="people-fill"
              />
              {{ $t("connected_currently") }}
            </div>
          </div>

          <div v-if="author.group">
            <TagsField
              :tag_type="'accountgroup'"
              :content="author.group"
              :path="author.$path"
              :can_edit="false"
            />
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>
<script>
export default {
  props: {
    author: Object,
  },
  components: {},
  data() {
    return {};
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    is_self() {
      if (this.connected_as)
        return this.connected_as.$path === this.author.$path;
      return false;
    },
    is_connected() {
      return this.$api.other_devices_connected.some(
        (u) => u.meta?.token_path === this.author.$path
      );
    },
    author_url() {
      return this.createURLFromPath(this.author.$path);
    },
    author_has_location() {
      return (
        !!this.author.$location?.latitude && !!this.author.$location?.longitude
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._authorCard {
  border-radius: 3px;

  &[data-isself] {
    border: 1px solid var(--c-bleumarine);
    background-color: var(--c-bleumarine_clair);
  }

  background: white;

  ._topbar {
    position: relative;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);

    > * {
      flex: 1 1 auto;

      &._cover {
        flex: 0 0 100px;
        aspect-ratio: 1/1;
      }
    }
  }
}

._linkTo {
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
}

._cover {
  position: relative;
  overflow: hidden;
}

._text {
  // overflow: hidden;
  display: flex;
  flex-flow: column nowrap;
  // padding-bottom: calc(var(--spacing) / 2);
  gap: calc(var(--spacing) / 2);

  ::v-deep {
    a {
      color: currentColor;
    }

    ._container {
      // line-height: 1;
    }
    ._content {
    }
  }
}

._connected {
  display: inline-flex;
  gap: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background-color: var(--c-bleumarine_clair);
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 2);
  color: var(--c-bleumarine_fonce);
  border-radius: 3px;

  font-weight: 500;
  justify-content: center;
}

.indicators {
  position: absolute;
  top: calc(var(--spacing) / 2);
  right: calc(var(--spacing) / 2);
  color: var(--c-bleumarine_fonce);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 4);
}
</style>
