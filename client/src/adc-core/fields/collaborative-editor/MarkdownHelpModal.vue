<template>
  <BaseModal2 :title="$t('markdown_help')" @close="$emit('close')">
    <p class="u-spacingBottom">
      Pour renseigner le contenu du chapitre, on peut utiliser le langage de
      balisage léger <em>markdown</em>, très largement utilisé et documenté
      partout sur le web.
    </p>
    <p class="u-spacingBottom">Voici une brève documentation de son usage.</p>
    <b>Paragraphes et sauts de ligne</b>
    <p>
      Pour créer un paragraphe, laisser une ligne blanche entre deux lignes de
      texte :
    </p>
    <div class="u-spacingBottom" />
    <blockquote>
      <p>
        <code>Un premier paragraphe.</code> <br />
        <br />
        <code>Un deuxième paragraphe.</code>
      </p>
    </blockquote>
    <p>Pour forcer un saut de ligne, saisir deux espaces en fin de ligne :</p>
    <blockquote>
      <p>
        <code
          >Un premier vers.<span class="_space">&nbsp;</span
          ><span class="_space">&nbsp;</span>
        </code>
        <br />
        <code>Un deuxième vers.</code>
      </p>
    </blockquote>

    <hr />

    <b>Syntaxe</b>
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

    <b>Aller plus loin</b>
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
