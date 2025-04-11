<template>
  <BaseModal2 :title="$t('markdown_help')" @close="$emit('close')">
    <table>
      <thead>
        <tr>
          <th>Élement</th>
          <th>Syntaxe Markdown</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Titres</td>
          <td>
            <code># H1</code><br /><code>## H2</code><br /><code>### H3</code>
          </td>
          <br />
        </tr>
        <tr>
          <td>Gras</td>
          <td><code>**texte en gras**</code></td>
        </tr>
        <tr>
          <td>Italique</td>
          <td><code>_texte en italique_</code></td>
        </tr>
        <tr>
          <td>Citation</td>
          <td><code>&gt; blockquote</code></td>
        </tr>
        <tr>
          <td>Liste ordonnée</td>
          <td>
            <code>1. Premier item</code><br /><code>2. Deuxième item</code
            ><br /><code>3. Troisième item</code>
          </td>
        </tr>
        <tr>
          <td>Liste non-ordonnée</td>
          <td>
            <code>- Premier item</code><br /><code>- Deuxième item</code><br />
            <code>- Troisième item</code>
          </td>
        </tr>
        <tr>
          <td>Code</td>
          <td><code>`code`</code></td>
        </tr>
        <tr>
          <td>Filet horizontal</td>
          <td><code>---</code></td>
        </tr>
        <tr>
          <td>Lien</td>
          <td><code>[titre](https://www.example.com)</code></td>
        </tr>
        <tr>
          <td>Image</td>
          <td>
            <code>![alternative textuelle](image.jpg)</code> ⚠️
            <a href="../images/">cf. Images</a>
          </td>
        </tr>
        <tr>
          <td>Note de bas de page</td>
          <td>
            <code>Ceci est une phrase avec une note de bas de page. [^1]</code
            ><br /><code>[^1]: Ceci est la note.</code> ⚠️
            <a href="../notes/">cf. Notes</a>
          </td>
        </tr>
        <tr>
          <td>ID de titre</td>
          <td><code>### Mon titre avec id {#custom-id}</code></td>
        </tr>
        <tr>
          <td>Liste de définition</td>
          <td><code>terme</code><br /><code>: définition</code></td>
        </tr>
        <tr>
          <td>Barré</td>
          <td><code>~~La terre est plate.~~</code></td>
        </tr>
        <tr>
          <td>Indice</td>
          <td><code>H~2~O</code></td>
        </tr>
        <tr>
          <td>Exposant</td>
          <td><code>X^2^</code></td>
        </tr>
        <tr>
          <td>Surligné</td>
          <td><code>Je veux surligner ces ==mots très importants==</code></td>
        </tr>
      </tbody>
    </table>
  </BaseModal2>
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
</style>
