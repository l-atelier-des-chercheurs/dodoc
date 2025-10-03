<template>
  <BaseModal2 :title="$t('markdown_help')" @close="$emit('close')">
    <p>
      Pour renseigner le contenu du chapitre, on peut utiliser le langage de
      balisage léger <em>markdown</em>, très largement utilisé et documenté sur
      le web.
    </p>
    <p>Voici une brève documentation de son usage.</p>

    <h3>Paragraphes et saut de ligne</h3>
    <p>Pour retourner à la ligne dans un même paragraphe :</p>
    <CodeBlock
      code="Un premier vers. 
Un deuxième vers."
    />
    <p>
      Pour créer un nouveau paragraphe, laisser une ligne blanche entre deux
      lignes de texte :
    </p>
    <div class="u-spacingBottom" />
    <CodeBlock
      code="Un premier paragraphe.

Un deuxième paragraphe."
    />

    <p>
      Pour espacer davantage des éléments (paragraphes, titres, images, etc.),
      ajouter un caractère \ en début de ligne :
    </p>
    <div class="u-spacingBottom" />
    <CodeBlock
      code="Un premier paragraphe.
\
\
\
Un deuxième paragraphe."
    />

    <h3>Saut de page</h3>
    <p>
      À n'importe quel endroit, pour interrompre le texte et démarrer en haut
      d'une nouvelle page, utiliser la balise&nbsp;:
    </p>
    <CodeBlock code="(break: page)" />

    <p>
      Vous pouvez également préciser si vous souhaitez démarrer sur une page de
      gauche ou de droite en utilisant la balise&nbsp;:
    </p>
    <CodeBlock
      code="(break: left)
(break: right)"
    />

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
          <td class="syntax-cell">
            <template v-if="Array.isArray(item.syntax)">
              <CodeBlock :code="item.syntax.join('\n')" />
            </template>
            <template v-else>
              <CodeBlock :code="item.syntax" />
              <template v-if="item.warning">
                ⚠️ <a :href="item.link">{{ item.warning }}</a>
              </template>
            </template>
          </td>
        </tr>
      </tbody>
    </table>

    <h3>Médias</h3>
    <p>Pour insérer des médias, vous pouvez utiliser les balises&nbsp;:</p>
    <CodeBlock
      code="(image: url.jpg)
(video: url.mp4)
(audio: url.mp3)
(embed: url.com)"
    />
    <p>
      Pour plus d'informations, fermez cette fenêtre et cliquez sur le bouton
      <b>Importer des médias</b>.
    </p>

    <h3>Mettre en forme du texte</h3>
    <p>
      Pour mettre en forme une ligne complète, vous pouvez utiliser les balises
      suivantes&nbsp;:
    </p>
    <CodeBlock code='Grand texte rouge {style="color: red; font-size: 200%;}' />
    <p>
      Pour mettre en forme seulement un mot, vous pouvez utiliser la balise
      suivante&nbsp;:
    </p>
    <CodeBlock
      code='Grand [mot]{style="color: red; font-size: 200%;"} en rouge'
    />
    <p>
      Vous pouvez également attribuer une classe ou un identifiant à un mot, une
      ligne ou un média en le renseignant entre accolades&nbsp;:
    </p>
    <CodeBlock code='Grand texte rouge {class="titre rouge"}' />
    <p>
      Vous pouvez ensuite lui attribuer des propriétés CSS en ouvrant l'éditeur
      de styles graphiques, depuis le sommaire de la publication.
    </p>

    <h3>Aller plus loin</h3>
    <p>
      Lire la documentation sur
      <a href="https://www.markdownguide.org/">markdownguide.org</a>.
    </p>
    <p>
      (Utilisation avancée) Vous pouvez également utiliser les balises HTML
      directement dans le texte. En combinant avec la fonctionnalité
      <b>Styles graphiques</b>, vous pouvez appliquer des styles à des éléments
      spécifiques.
    </p>
    <CodeBlock
      code='<div style="color: red; font-size: 200%;" class="titre rouge">texte en rouge</div>'
    />
  </BaseModal2>
</template>
<script>
import CodeBlock from "./CodeBlock.vue";

export default {
  props: {},
  components: {
    CodeBlock,
  },
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
  width: 100%;
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
  border: none;

  &:first-child {
    font-style: italic;
    user-select: none;
  }
}

.syntax-cell {
  padding: 0.25rem 0.25rem 0.25rem 0.25rem !important;

  .code-block {
    margin: 0;
  }
}

h2,
h3,
p {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

h3 {
  margin-top: 2rem;
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
