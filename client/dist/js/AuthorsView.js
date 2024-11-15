(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[2],{52233:function(t,a,r){"use strict";r.r(a),r.d(a,{default:function(){return c}});var s=function(){var t=this,a=t.$createElement,r=t._self._c||a;return r("div",{staticClass:"_authorsView"},[r("div",{staticClass:"_backBtn"},[r("router-link",{staticClass:"u-buttonLink",attrs:{to:"/"}},[r("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("home"))+" ")],1)],1),r("h1",{staticClass:"_title",domProps:{textContent:t._s(t.$t("list_of_accounts"))}}),r("div",{staticClass:"_topRow"},[r("div",{staticClass:"_searchField"},[r("SearchInput",{attrs:{search_placeholder:t.$t("search_by_name"),name:"search_author"},model:{value:t.search_author_name,callback:function(a){t.search_author_name=a},expression:"search_author_name"}})],1),t.all_groups.length>0?r("div",[r("TagsList",{attrs:{tags:t.all_groups,tag_type:"accountgroup",tags_active:[t.filter_by_group]},on:{tagClick:function(a){return t.toggleGroupFilter(a)}}})],1):t._e()]),r("transition-group",{staticClass:"_allAuthors",attrs:{tag:"section",name:"listComplete",appear:""}},t._l(t.filtered_authors,(function(t){return r("AuthorCard",{key:t.$path,attrs:{author:t,links_to_author_page:!0}})})),1),0===t.filtered_authors.length?r("div",[t._v(" "+t._s(t.$t("no_accounts_to_show"))+" ")]):t._e()],1)},e=[],o=(r(70560),r(78766)),i={props:{},components:{AuthorCard:o.Z},data(){return{path:"authors",authors:[],search_author_name:"",filter_by_group:""}},created(){},async mounted(){this.authors=await this.$api.getFolders({path:this.path}),this.$api.join({room:this.path})},beforeDestroy(){},watch:{},computed:{sorted_authors(){return this.authors.slice().sort(((t,a)=>t.name.localeCompare(a.name)))},filtered_authors(){return this.sorted_authors.filter((t=>!(this.search_author_name&&!this.twoStringsSearch(t.name,this.search_author_name))&&!(this.filter_by_group&&!t.group?.includes(this.filter_by_group))))},all_groups(){return this.sorted_authors.reduce(((t,a)=>(a.group?.map((a=>{t.some((t=>t===a))||a&&t.push(a)})),t)),[]).sort(((t,a)=>t.localeCompare(a)))}},methods:{toggleGroupFilter(t){this.filter_by_group=t===this.filter_by_group?"":t}}},l=i,n=(r(45287),r(1001)),u=(0,n.Z)(l,s,e,!1,null,"76565b68",null),c=u.exports},50420:function(t,a,r){"use strict";r.r(a);var s=r(8081),e=r.n(s),o=r(23645),i=r.n(o),l=i()(e());l.push([t.id,"._backBtn[data-v-76565b68]{display:flex;margin-bottom:calc(var(--spacing)*1)}._authorsView[data-v-76565b68]{padding:calc(var(--spacing)*1);max-width:calc(var(--max-column-width));margin:0 auto}._allAuthors[data-v-76565b68]{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:calc(var(--spacing)/1)}._allAuthors>*[data-v-76565b68]{z-index:1}._title[data-v-76565b68]{margin-bottom:calc(var(--spacing)*1)}._searchField[data-v-76565b68]{max-width:30ch}._topRow[data-v-76565b68]{display:flex;flex-flow:row wrap;justify-content:flex-start;gap:calc(var(--spacing)/1);margin-bottom:calc(var(--spacing)/1)}",""]),a["default"]=l},45287:function(t,a,r){var s=r(50420);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var e=r(20730).Z;e("74647927",s,!0,{sourceMap:!1,shadowMode:!1})}}]);