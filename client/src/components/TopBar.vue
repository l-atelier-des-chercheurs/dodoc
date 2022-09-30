<template>
  <div class="_topbar">
    <nav aria-label="Breadcrumb" class="_breadcrumb">
      <ul v-if="$route.path !== '/'">
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
    <SocketStatus />
  </div>
</template>
<script>
import SocketStatus from "@/components/SocketStatus.vue";

export default {
  props: {},
  components: {
    SocketStatus,
  },
  data() {
    return {
      project: null,
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
  flex-flow: row nowrap;
  gap: calc(var(--spacing) * 2);
  align-content: center;

  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  ._breadcrumb {
    flex: 1 1 auto;
  }
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

._logo {
  flex: 0 0 auto;

  img {
    width: 8em;
    height: 2.6em;
  }
}
</style>
