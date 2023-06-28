<template>
  <div
    class="_lumaView"
    :class="{
      'is--mobile_view': $root.is_mobile_view,
    }"
  >
    <LoaderSpinner v-if="!shared_folder_path" />
    <template v-else>
      <div class="_panes">
        <div
          class="_myContent"
          :class="{
            'is--shown': show_chutier,
          }"
          :key="'myContent'"
        >
          <MyChutier
            v-show="show_chutier"
            :shared_space_path="shared_folder_path"
            @close="show_chutier = false"
          />

          <div
            class="_chutierBtn"
            :class="{
              'is--showingChutier': show_chutier,
            }"
          >
            <!-- <div class="">
              // todo shown number of items to handle
            </div> -->

            <button type="button" @click="show_chutier = !show_chutier">
              <svg
                width="17"
                height="9"
                viewBox="0 0 17 9"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.999812 4.546V4.726C1.87581 5.098 2.67381 5.602 3.39381 6.238C4.11381 6.874 4.77381 7.546 5.37381 8.254L5.75181 7.894C5.53581 7.594 5.30181 7.3 5.04981 7.012C4.78581 6.712 4.51581 6.418 4.23981 6.13C4.07181 5.962 3.98781 5.788 3.98781 5.608C3.98781 5.512 4.02381 5.428 4.09581 5.356C4.16781 5.284 4.28781 5.248 4.45581 5.248H14.5718V8.254H15.5078V1H14.5718V4.024H4.43781C4.26981 4.024 4.14981 3.982 4.07781 3.898C4.00581 3.802 3.96981 3.712 3.96981 3.628C3.96981 3.484 4.05381 3.328 4.22181 3.16C4.48581 2.908 4.75581 2.62 5.03181 2.296C5.29581 1.972 5.52981 1.66 5.73381 1.36L5.35581 1C4.75581 1.696 4.10181 2.368 3.39381 3.016C2.67381 3.664 1.87581 4.174 0.999812 4.546Z"
                  fill="currentColor"
                  stroke="currentColor"
                />
              </svg>

              <!-- <sl-icon
                :name="show_chutier ? 'arrow-bar-left' : 'arrow-bar-right'"
              /> -->
            </button>
          </div>
        </div>

        <div
          class="_sharedContent"
          :class="{
            'has--chutier': show_chutier,
          }"
          :key="'sharedContent'"
        >
          <SharedFolder :shared_folder_path="shared_folder_path" />
        </div>
      </div>
    </template>
  </div>
</template>
<script>
// import { Splitpanes, Pane } from "splitpanes";
import MyChutier from "@/components/MyChutier.vue";
import SharedFolder from "@/components/SharedFolder.vue";

export default {
  props: {},
  components: {
    // Splitpanes,
    // Pane,
    MyChutier,
    SharedFolder,
  },
  data() {
    return {
      path: "folders",
      folders: undefined,
      shared_folder_path: undefined,

      show_chutier:
        localStorage.getItem("show_chutier") === "false" ? false : true,
    };
  },
  created() {},
  async mounted() {
    // todo add lang selector instead
    this.$i18n.locale = "fr";

    await this.loadFolder();
    // check if necerray to login or create account :
  },
  beforeDestroy() {},
  watch: {
    connected_as() {},
    show_chutier() {
      localStorage.setItem("show_chutier", this.show_chutier);
    },
  },
  computed: {},
  methods: {
    async loadFolder() {
      await this.$api.getFolders({
        path: `authors`,
      });

      this.folders = await this.$api
        .getFolders({
          path: this.path,
        })
        .catch((err) => {
          this.fetch_spaces_error = err.response;
          // this.is_loading = false;
          return;
        });
      if (this.folders.length === 0) {
        await this.createFolder();
        window.location.reload();
      } else {
        this.shared_folder_path = this.folders[0].$path;
      }
    },
    async createFolder() {
      try {
        const new_space_slug = await this.$api.createFolder({
          path: this.path,
        });
        return new_space_slug;
      } catch (err) {
        // this.error_msg = "Error: " + err.message;
        // setTimeout(() => {
        //   this.error_msg = "";
        // }, 5000);
        // this.is_creating_project = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._lumaView {
  height: 100%;
  --chutier-bar-width: 40px;
  --chutier-width: 420px;

  &.is--mobile_view {
    --chutier-width: 100%;
  }
}
._panes {
  height: 100%;
}

._myContent {
  position: absolute;
  z-index: 2;

  width: var(--chutier-width);
  height: 100%;
  background: var(--chutier-bg);
  box-shadow: -4px 0px 5px inset rgba(0, 0, 0, 0.52);
  overflow: hidden;

  transform: translate(
    calc(-1 * (var(--chutier-width) - var(--chutier-bar-width))),
    0
  );

  transition: transform 0.275s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--shown {
    transform: translate(0, 0);
  }
}
._sharedContent {
  position: relative;
  z-index: 1;
  height: 100%;
  flex: 1 1 auto;
  margin-left: var(--chutier-bar-width);
  width: calc(100% - var(--chutier-bar-width));

  transition: margin-left 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &.has--chutier {
    width: calc(100% - var(--chutier-width));
    margin-left: var(--chutier-width);
  }
}

._chutierBtn {
  position: absolute;
  // height: 100%;
  top: 0;
  right: 0;
  width: var(--chutier-bar-width);
  height: var(--chutier-bar-width);
  z-index: 1;

  background: transparent;

  transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  > button {
    position: absolute;
    width: 100%;
    height: 100%;
    color: white;
    border-radius: 50%;
    // top: 0;

    // top: calc(var(--spacing) / 2);
    left: 0;
    font-size: 1.5rem;
    background: transparent;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;

    transform-origin: center;

    // transition: transform 0.8s cubic-bezier(0.19, 1, 0.3, 1.32);
    transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);

    &:hover,
    &:focus-visible {
      color: hsl(0, 0, 80%);
    }
  }

  &:not(.is--showingChutier) {
    height: 100%;

    > button {
      // transform: rotate(-540deg);
      transform: rotate(-180deg);
    }
  }
}
</style>
