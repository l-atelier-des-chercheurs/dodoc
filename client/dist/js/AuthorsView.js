(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[182],{67582:function(t,a,s){"use strict";s.r(a),s.d(a,{default:function(){return u}});var r=function(){var t=this,a=t._self._c;return a("div",{staticClass:"_authorsView"},[a("div",{staticClass:"_backBtn"},[a("router-link",{staticClass:"u-buttonLink",attrs:{to:"/"}},[a("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("home"))+" ")],1)],1),a("h1",{staticClass:"_title",domProps:{textContent:t._s(t.$t("list_of_accounts"))}}),a("div",{staticClass:"u-spacingBottom _searchField"},[a("SearchInput",{attrs:{search_placeholder:t.$t("search_by_name"),name:"search_author"},model:{value:t.search_author_name,callback:function(a){t.search_author_name=a},expression:"search_author_name"}})],1),a("transition-group",{staticClass:"_allAuthors",attrs:{tag:"section",name:"listComplete",appear:""}},t._l(t.filtered_authors,(function(t){return a("AuthorCard",{key:t.$path,attrs:{author:t,links_to_author_page:!0}})})),1),0===t.filtered_authors.length?a("div",[t._v(" "+t._s(t.$t("no_accounts_to_show"))+" ")]):t._e()],1)},e=[],o=s(77724),c={props:{},components:{AuthorCard:o.A},data(){return{path:"authors",authors:[],search_author_name:""}},created(){},async mounted(){this.authors=await this.$api.getFolders({path:this.path}),this.$api.join({room:this.path})},beforeDestroy(){},watch:{},computed:{sorted_authors(){return this.authors.slice().sort(((t,a)=>t.name.localeCompare(a.name)))},filtered_authors(){return this.sorted_authors.filter((t=>!this.search_author_name||this.twoStringsSearch(t.name,this.search_author_name)))}},methods:{}},i=c,n=(s(74016),s(81656)),h=(0,n.A)(i,r,e,!1,null,"4c58e91f",null),u=h.exports},37560:function(t,a,s){"use strict";s.r(a);var r=s(31601),e=s.n(r),o=s(76314),c=s.n(o),i=c()(e());i.push([t.id,"._backBtn[data-v-4c58e91f]{margin-bottom:calc(var(--spacing)*2)}._authorsView[data-v-4c58e91f]{padding:calc(var(--spacing)*1);max-width:calc(var(--max-column-width));margin:0 auto}._allAuthors[data-v-4c58e91f]{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:calc(var(--spacing)/1)}._title[data-v-4c58e91f]{margin-bottom:calc(var(--spacing)*1)}._searchField[data-v-4c58e91f]{max-width:30ch}",""]),a["default"]=i},74016:function(t,a,s){var r=s(37560);r.__esModule&&(r=r.default),"string"===typeof r&&(r=[[t.id,r,""]]),r.locals&&(t.exports=r.locals);var e=s(3825).A;e("0842ad68",r,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=AuthorsView.js.map