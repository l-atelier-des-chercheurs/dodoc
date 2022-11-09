<template>
  <div class="_topbar" v-if="$route.path !== '/'">
    <nav aria-label="Breadcrumb" class="_breadcrumb">
      <ul>
        <li class="_logo">
          <router-link :to="`/`">
            <img :src="`${$root.publicPath}i_logo.svg`" class="" />
          </router-link>
        </li>
        <sl-icon-button name="arrow-right-short" label="" />
        <li>
          <router-link :to="`/projects`">Les projets</router-link>
        </li>
        <template v-if="$route.name === 'projet'">
          <sl-icon-button name="arrow-right-short" label="" />
          <li>
            <router-link :to="$route.path" replace>
              <!-- {{ project.title }} -->
              <sl-spinner
                style="--indicator-color: currentColor"
                v-if="!project"
              />
              <span v-else>
                {{ project.title }}
              </span>
            </router-link>
          </li>
        </template>
      </ul>
    </nav>
    <button
      type="button"
      class="_subscribeBtn"
      @click="show_authors_modal = true"
    >
      Inscription
    </button>
    <AuthorList v-if="show_authors_modal" @close="show_authors_modal = false" />

    <div class="_socketStatus">
      <SocketStatus />
    </div>
  </div>
</template>
<script>
import SocketStatus from "@/components/SocketStatus.vue";
import AuthorList from "@/adc-core/author/AuthorList.vue";

export default {
  props: {},
  components: {
    SocketStatus,
    AuthorList,
  },
  data() {
    return {
      project: null,

      show_authors_modal: true,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("received.project", this.setProject);
  },
  beforeDestroy() {},
  watch: {
    $route: {
      handler() {},
      immediate: true,
    },
  },
  computed: {},
  methods: {
    setProject(project) {
      this.project = project;
    },
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  position: relative;
  z-index: 5;
  // position: absolute;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) * 2);
  align-items: center;

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  min-height: 60px;
  user-select: none;

  > * {
    flex: 1 1 0;
  }

  > ._subscribeBtn {
    flex-grow: 0;
  }
}

._subscribeBtn {
  background: var(--c-bleumarine_clair);
  padding: calc(var(--spacing) / 2);
  border-radius: 4px;
}

._breadcrumb {
  padding: 0 0.5rem;
  ul {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    align-items: center;

    // &:not(:last-child)::after {
    //   display: inline-block;
    //   margin: 0 0.25rem;
    //   content: "→";
    // }
  }
}

._socketStatus {
  display: flex;
  justify-content: flex-end;
}

._logo {
  flex: 0 0 auto;

  img {
    width: 8em;
    height: 2.6em;
  }
}
</style>
