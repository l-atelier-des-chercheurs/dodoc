<template>
  <div class="_accueil">
    <div class="_accueil--top">
      <div class="_accueil--top--content">
        <div class="_accueil--top--content--text">
          <h1>
            {{ top_title }}
          </h1>
          <p>
            {{ top_text }}
          </p>
        </div>
        <div class="_topImg" />
      </div>
    </div>

    <div class="_section">
      <h2>Donner à voir l'ensemble des processus de recherche et création</h2>
    </div>

    <section class="_section" v-for="section in sections">
      <img :src="section.img" />
      <div>
        <h3 v-html="section.title" />
        <p>{{ section.text }}</p>
      </div>
    </section>
    <p>
      <small>{{ $t("version") }} {{ $root.app_infos.version }}</small>
    </p>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {
    // this.$router.push("/import");
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    top_title() {
      if (this.$i18n.locale === "fr") {
        return "Une plateforme pour partager, connecter et renforcer les territoires par le design";
      } else {
        return "A platform to share, connect, and strengthen territories through design";
      }
    },
    top_text() {
      if (this.$i18n.locale === "fr") {
        return `Partagez vos recherches et vos projets de design pour contribuer à un réseau vivant de connaissances, de pratiques et de ressources à échelles locales.
Initiée par Atelier Luma, cette plateforme soutient une approche interdisciplinaire et biorégionale du design.
En documentant vos démarches, vous participez à la création d’assemblages de connaissances, de ressources et d’acteurs qui participent à renforcer les écosystème sociaux environnementaux et économique des territoires.`;
      } else {
        return `Share your research and design projects to contribute to a living network of knowledge, practices, and local-based resources.
Initiated by Atelier Luma, this platform supports an interdisciplinary and bioregional approach to design, addressing environmental, social, and economic challenges at the local scale.
By documenting your work, you help create assemblages, of materials, skills, and people that strengthen world’s bioregions in and of themselves.`;
      }
    },
    sections() {
      return [
        {
          name: "CONTRIBUTE",
          title: `Import all kind of medias for your ideas, sketchs, tests. <i>— nothing gets lost, everything has value.</i>`,
          text: `à remplir`,
          img: this.$root.publicPath + "home/contribute.png",
        },
        {
          name: "EXPLORE",
          title: `Explore the evolving work of your peers and trace connections across disciplines and practices. — here start the network.`,
          text: `à remplir`,
          img: this.$root.publicPath + "home/explore.png",
        },
        {
          name: "PUBLISH",
          title: `Publish your research and results in any format to encourage feedback, reflection and collaboration.— the world needs to know.`,
          text: `XXX`,
          img: this.$root.publicPath + "home/publish.png",
        },
      ];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._accueil {
  --max-width: 1000px;
}

._accueil--top {
  margin: 0 auto;
  padding: calc(var(--spacing) * 2) 0;
  background-color: var(--g-100);

  ._accueil--top--content {
    display: flex;
    flex-flow: row wrap;
    gap: calc(var(--spacing) * 4);
    max-width: var(--max-width);
    margin: calc(var(--spacing) * 4) auto;
  }
}

._section {
  max-width: var(--max-width);
  margin: calc(var(--spacing) * 4) auto;
  margin-bottom: calc(var(--spacing) * 1);

  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) * 4);

  > * {
    flex: 1 1 0;
  }
  > img {
    flex: 0 0 200px;
    width: 100%;
  }
}

._accueil--top--content--text {
  max-width: 45ch;
}

._topImg {
  background-color: var(--g-200);
  flex: 1 1 auto;
}

._section {
}
</style>
