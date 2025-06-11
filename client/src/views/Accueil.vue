<template>
  <div class="_accueil">
    <div class="_accueil--top">
      <div class="_accueil--top--content">
        <div class="_accueil--top--content--text">
          <h1 v-html="top_title"></h1>
          <div class="" v-html="top_text" />
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
        <h2 v-html="section.title" />
        <h3 v-html="section.subtitle" />
        <p>{{ section.text }}</p>
      </div>
    </section>
    <div class="_footer">
      <small>{{ $t("version") }} {{ $root.app_infos.version }}</small>
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
  created() {
    // this.$router.push("/import");
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    top_title() {
      if (this.$i18n.locale === "fr") {
        return `Une plateforme pour <span class="_partager">partager</span>, <span class="_connecter">connecter</span> et <span class="_renforcer">renforcer</span> les territoires par le <span class="_design">design</span>`;
      } else {
        return "A platform to share, connect, and strengthen territories through design";
      }
    },
    sections() {
      return [
        {
          title:
            this.$i18n.locale === "fr"
              ? "DOCUMENTER SES RECHERCHES"
              : "CONTRIBUTE",
          subtitle:
            this.$i18n.locale === "fr"
              ? "Importez toutes sortes de médias pour documenter vos idées, vos croquis, vos essais. <i>– Rien ne se perd, tout a de la valeur.</i>"
              : `Import all kind of medias for your ideas, sketchs, tests. <i>— nothing gets lost, everything has value.</i>`,
          text: `DocSpaces a été conçu pour faciliter la documentation à tout moment. Le dépôt de fichiers est simplifié, adapté à un usage mobile à faible connexion, pour sauvegarder ce qui mérite de l’être à l’instant t.`,
          img: this.$root.publicPath + "home/contribute.png",
        },
        {
          title:
            this.$i18n.locale === "fr"
              ? "EXPLORER L’ARCHIVE COLLECTIVE"
              : "EXPLORE",
          subtitle:
            this.$i18n.locale === "fr"
              ? "Explorez l'évolution du travail de vos pairs et établissez des liens entre les disciplines et les pratiques. – Ici commence le réseau"
              : `Explore the evolving work of your peers and trace connections across disciplines and practices. — here start the network.`,
          text:
            this.$i18n.locale === "fr"
              ? "L’archive est conçue comme un espace vivant où les connexions se font à l’aide de mots-clé croisés. Les équipes collaborent et enrichissent des ensembles de médias qui donnent à voir l’ensemble du travail mis en œuvre."
              : "",
          img: this.$root.publicPath + "home/explore.png",
        },
        {
          title:
            this.$i18n.locale === "fr"
              ? "PUBLIER SOUS TOUS LES FORMATS"
              : "PUBLISH",
          subtitle:
            this.$i18n.locale === "fr"
              ? "Publier vos recherches et vos résultats sous de multiples formats pour encourager le retour d'information, la réflexion et la collaboration, – La recherche est affaire de collectif"
              : `Publish your research and results in any format to encourage feedback, reflection and collaboration.— the world needs to know.`,
          text:
            this.$i18n.locale === "fr"
              ? "Diffuser les travaux de recherches est essentiel pour pérenniser leur existences et prolonger leur portée. Les canaux actuels sont multiples, les formats de publication également : aussi bien web, imprimé, que dans l’espace muséal."
              : "à remplir",
          img: this.$root.publicPath + "home/publish.png",
        },
      ];
    },
    top_text() {
      if (this.$i18n.locale === "fr") {
        return `
        <p>Documenter et partager les démarches de recherches pour participer à la création de projets de design qui répondent aux enjeux sociaux, environnementaux et économiques des acteurs des territoires.</p>
<p>Initiée par Atelier Luma, DocSpaces soutient
une approche interdisciplinaire et biorégionale du
design qui contribue à un réseau vivant de connaissances, de pratiques et de ressources
à échelles locales.</p>`;
      } else {
        return `<p>Share your research and design projects to contribute to a living network of knowledge, practices, and local-based resources.</p>
<p>Initiated by Atelier Luma, this platform supports an interdisciplinary and bioregional approach to design, addressing environmental, social, and economic challenges at the local scale.
By documenting your work, you help create assemblages, of materials, skills, and people that strengthen world’s bioregions in and of themselves.</p>`;
      }
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
  background-color: var(--g-50);
  padding: calc(var(--spacing) * 1) 0;
}
._accueil--top--content,
._section,
._footer {
  margin: 0 auto;
  padding: calc(var(--spacing) * 2);
  max-width: var(--max-width);
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) * 4);
  margin: 0 auto;
}

._section {
  > * {
    flex: 1 1 0;
  }
  > img {
    flex: 1 1 0;
    width: 100%;
  }
}

._accueil--top--content--text {
  max-width: 45ch;

  h1 {
    font-size: var(--sl-font-size-xx-large);
  }

  h1,
  :deep(p) {
    margin-bottom: calc(var(--spacing) * 2);
  }

  ::v-deep {
    ._partager,
    ._connecter,
    ._renforcer,
    ._design {
      background-color: var(--g-200);
    }
  }
}

._topImg {
  background-color: var(--g-200);
}

._section {
}

._footer {
  justify-content: center;
}
</style>
