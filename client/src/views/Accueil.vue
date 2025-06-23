<template>
  <div
    class="_accueil"
    :class="{
      'is--mobileView': $root.is_mobile_view,
    }"
  >
    <div class="_accueil--top">
      <div class="_accueil--top--content">
        <div class="_accueil--top--content--text">
          <h1 v-html="top_title"></h1>
          <div class="" v-html="top_text" />
        </div>
        <div class="_topImg">
          <figure>
            <!-- <img :src="$root.publicPath + '/home/agora-screenshot.jpeg'" /> -->
            <div class="_fakeBrowserBar" />
            <video
              :src="$root.publicPath + '/home/agora-r.mp4'"
              autoplay
              loop
              muted
              playsinline
              class="agora-video"
            />
            <figcaption>
              Aperçu du format de présentation dans l’espace : Agora
            </figcaption>
          </figure>
        </div>
      </div>
    </div>

    <div class="_section">
      <h3
        v-text="
          `Donner à voir l’ensemble des processus de recherche et création`
        "
      />
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
        <p>Documenter et partager les démarches de recherches pour participer à la <b>création de projets de design</b> qui répondent aux enjeux <b>sociaux, environnementaux et économiques</b> des acteurs des territoires.</p>
<p>Initiée par Atelier Luma, <i>DocSpaces</i> soutient une approche <b>interdisciplinaire</b> et <b>biorégionale</b> du design qui contribue à un réseau vivant de <b>connaissances</b>, de <b>pratiques</b> et de <b>ressources</b> à échelles locales.</p>`;
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
  --max-width: 1100px;
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
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 4);
  margin: 0 auto;
}

._section {
  h2 {
    font-weight: 700;
  }

  p {
    font-size: var(--sl-font-size-large);
  }

  > * {
    flex: 1 1 0;
  }
  > img {
    flex: 0 1 320px;
    width: 100%;
  }

  &:nth-child(2n) {
    ._accueil:not(.is--mobileView) & img {
      order: 1;
    }
  }
}

._accueil--top--content--text {
  flex: 10 1 0;
  min-width: 200px;
  // max-width: 45ch;

  h1 {
    font-size: var(--sl-font-size-xx-large);
  }
  :deep(p) {
    font-size: var(--sl-font-size-large);
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
      border-radius: 4px;
      padding: 0 2px;

      &._partager {
        background-color: var(--y-200);
      }
      &._connecter {
        background-color: var(--gr-200);
      }
      &._renforcer {
        background-color: var(--o-200);
      }

      &._design {
        background-color: var(--b-200);
      }
    }
  }
}

._topImg {
  flex: 1 1 220px;
  // min-width: 320px;
  // min-height: 320px;

  figure {
    padding: 0;
    margin: 0;
    background-color: transparent;
    text-align: right;

    --radius: 8px;

    ._fakeBrowserBar {
      position: relative;
      width: 100%;
      height: 15px;
      background-color: var(--g-200);
      border-top-left-radius: var(--radius);
      border-top-right-radius: var(--radius);

      &::before {
        content: "";
        display: block;
        position: absolute;
        top: 50%;
        // left: 50%;
        transform: translate(5px, -50%);
        // padding-top: 100%;
        margin: 2px;
        width: 5px;
        height: 5px;
        background-color: var(--g-500);
        border-radius: 50%;
        // position: absolute;
        // top: 50%;
        // left: 50%;
        // transform: translate(-50%, -50%);
      }
    }

    video {
      // max-height: max(60vh, 320px);
      // width: max(100%, 220px);
      height: auto;
      border-bottom-left-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
      overflow: hidden;
      background-color: var(--g-50);
      border: 2px solid var(--g-200);
    }

    figcaption {
      margin-top: calc(var(--spacing) / 2);
    }
  }
}

._section {
}

._footer {
  justify-content: center;
}
</style>
