<template>
  <div class="_topBar">
    <div class="_logo">
      <router-link to="/">LumaDoc</router-link>
    </div>
    <div class="menu">
      <router-link to="/contribute" active-class="active">DEPOSER</router-link>
      <router-link to="/corpus" active-class="active">FAÇONNER</router-link>
    </div>
    <div class="profile-icon">
      <b-icon icon="person-circle" />
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._topBar {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  height: 50px;
  // gap: 1rem;
  border-bottom: 1px solid var(--h-500);

  > * {
    flex: 1 1 0;

    &:not(:last-child) {
      border-right: 1px solid var(--h-500);
    }
  }
}

._logo {
  display: flex;
  align-items: center;
  padding: 0 1rem;

  font-size: 20px;
  font-weight: bold;

  a {
    text-decoration: none;
    // color: var(--h-900);
    font-weight: normal;
  }
}

.menu {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;

  a {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 10px 20px;
    background-color: transparent;
    // border: 1px solid #ddd;
    border-radius: 0;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      background-color: var(--h-200);
    }

    &.active {
      background-color: white;
      font-weight: bold;
    }
  }
}

.profile-icon {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  flex: 0 0 auto;
  font-size: 24px;
  cursor: pointer;
}
</style>
