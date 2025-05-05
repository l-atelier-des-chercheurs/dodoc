<template>
  <BaseModal2 :title="$t('markdown_help')" @close="$emit('close')">
    <p class="u-spacingBottom">
      Pour renseigner le contenu du chapitre, on peut utiliser le langage de
      balisage léger <em>markdown</em>, très largement utilisé et documenté
      partout sur le web.
    </p>
    <p class="u-spacingBottom">Voici une brève documentation de son usage.</p>

    <h3>Paragraphes et sauts de ligne</h3>
    <p>
      Pour créer un paragraphe, laisser une ligne blanche entre deux lignes de
      texte :
    </p>
    <div class="u-spacingBottom" />
    <blockquote>
      <code>Un premier paragraphe.</code> <br />
      <br />
      <code>Un deuxième paragraphe.</code>
    </blockquote>
    <p>Pour retourner à la ligne dans un même paragraphe :</p>
    <blockquote>
      <code>Un premier vers. </code>
      <br />
      <code>Un deuxième vers.</code>
    </blockquote>

    <h3>Syntaxe</h3>
    <table class="u-spacingBottom">
      <thead>
        <tr>
          <th>Élement</th>
          <th>Syntaxe Markdown</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in markdownSyntax" :key="item.element">
          <td>{{ item.element }} {{ "&nbsp;&nbsp;" }}</td>
          <td>
            <template v-if="Array.isArray(item.syntax)">
              <template v-for="(syntax, index) in item.syntax">
                <code>{{ syntax }}</code>
                <br v-if="index < item.syntax.length - 1" />
              </template>
            </template>
            <template v-else>
              <code>{{ item.syntax }}</code>
              <template v-if="item.warning">
                ⚠️ <a :href="item.link">{{ item.warning }}</a>
              </template>
            </template>
            {{ "\n\n" }}
          </td>
        </tr>
      </tbody>
    </table>

    <h3>Médias</h3>
    <p>Pour insérer des médias, vous pouvez utiliser la balise&nbsp;:</p>
    <blockquote>
      <code>(image: url.jpg)</code> <br />
      <code>(video: url.mp4)</code> <br />
      <code>(audio: url.mp3)</code> <br />
      <code>(embed: url.com)</code>
    </blockquote>
    <p>
      Pour plus d’informations, fermez cette fenêtre et cliquez sur le bouton
      <b>Importer des médias</b>.
    </p>

    <h3>Mettre en forme du texte</h3>
    <p>
      Pour mettre en forme une ligne complète, vous pouvez utiliser les balises
      suivantes&nbsp;:
    </p>
    <blockquote>
      <code>Grand texte rouge {style="color: red; font-size: 200%;"}</code>
    </blockquote>
    <p>
      Pour mettre en forme seulement un mot, vous pouvez utiliser la balise
      suivante&nbsp;:
    </p>
    <blockquote>
      <code>Grand [mot]{style="color: red; font-size: 200%;"} en rouge</code>
    </blockquote>
    <p>
      Vous pouvez également attribuer une classe ou un identifiant à un mot, une
      ligne ou un média en le renseignant entre accolades&nbsp;:
    </p>
    <blockquote>
      <code>
        <code>Grand texte rouge {class="titre rouge"}</code>
      </code>
    </blockquote>
    <p>
      Vous pouvez ensuite lui attribuer des propriétés CSS en ouvrant l’éditeur
      de styles graphiques, depuis le sommaire de la publication.
    </p>

    <h3>Aller plus loin</h3>
    <p>
      Lire la documentation sur
      <a href="https://www.markdownguide.org/">markdownguide.org</a>.
    </p>
  </BaseModal2>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      markdownSyntax: [
        {
          element: "Titres",
          syntax: ["# H1", "## H2", "### H3"],
        },
        {
          element: "Gras",
          syntax: "**texte en gras**",
        },
        {
          element: "Italique",
          syntax: "_texte en italique_",
        },
        {
          element: "Citation",
          syntax: "> blockquote",
        },
        {
          element: "Liste ordonnée",
          syntax: ["1. Premier item", "2. Deuxième item", "3. Troisième item"],
        },
        {
          element: "Liste non-ordonnée",
          syntax: ["- Premier item", "- Deuxième item", "- Troisième item"],
        },
        {
          element: "Code",
          syntax: "`code`",
        },
        {
          element: "Filet horizontal",
          syntax: "---",
        },
        {
          element: "Lien",
          syntax: "[titre](https://www.example.com)",
        },
        {
          element: "Image",
          syntax: "![alternative textuelle](image.jpg)",
          // warning: "cf. Images",
          // link: "../images/",
        },
        // {
        //   element: "Note de bas de page",
        //   syntax: [
        //     "Ceci est une phrase avec une note de bas de page. [^1]",
        //     "[^1]: Ceci est la note.",
        //   ],
        //   warning: "cf. Notes",
        //   link: "../notes/",
        // },
        // {
        //   element: "ID de titre",
        //   syntax: "### Mon titre avec id {#custom-id}",
        // },
        // {
        //   element: "Liste de définition",
        //   syntax: ["terme", ": définition"],
        // },
        {
          element: "Barré",
          syntax: "~~La terre est plate.~~",
        },
        // {
        //   element: "Indice",
        //   syntax: "H~2~O",
        // },
        // {
        //   element: "Exposant",
        //   syntax: "X^2^",
        // },
        // {
        //   element: "Surligné",
        //   syntax: "Je veux surligner ces ==mots très importants==",
        // },
      ],
    };
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
table {
  border: 2px solid var(--c-gris_clair);
  padding: 0;
}
th {
  text-align: left;
  padding: 0.25rem;
}
tr {
  &:nth-child(even) {
    background-color: var(--c-gris_clair);
  }
}
td {
  vertical-align: top;
  padding: 0.25rem;
  &:first-child {
    font-style: italic;
    user-select: none;
  }
}

h3 {
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}

._space {
  position: relative;
  &:after {
    content: "•";
    position: absolute;
    top: -0.125rem;
    left: 0;
    color: var(--c-gris);
    display: inline-block;
  }
}
</style>
