(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[57],{4156:function(e,t,o){"use strict";o.r(t),o.d(t,{default:function(){return a}});var i=function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("div",{staticClass:"_collectionView",class:{"is--serversidepreview":e.is_serversidepreview}},[o("transition",{attrs:{name:"fade_fast",mode:"out-in"}},[e.$root.is_loading?o("div",{key:"loader",staticClass:"u-divCentered"},[o("LoaderSpinner")],1):e.fetch_collection_error?o("div",{staticClass:"u-divCentered"},[e._v(" "+e._s(e.fetch_collection_error)+" ")]):o("div",{key:"collection",ref:"fsContainer"},[e.collection.template&&"story_with_sections"!==e.collection.template?"agora"===e.collection.template?o("AgoraExport",{attrs:{publication:e.collection}}):e._e():o("div",[o("SectionWithPrint",{attrs:{publication:e.collection}})],1)],1)])],1)},l=[],c={props:{},components:{SectionWithPrint:()=>o.e(156).then(o.bind(o,32156)),AgoraExport:()=>o.e(800).then(o.bind(o,26800))},data(){return{collection:null,fetch_collection_error:null,is_fullscreen:!1,is_serversidepreview:!1}},i18n:{messages:{fr:{fetch_collection_error:"Erreur lors du fetch de la collection",collection_is_not_public:"Cette collection n'est pas publique, veuillez cocher la case qui s'affiche dans la fenêtre de partage."}}},created(){console.log("Loading collectionView")},async mounted(){let e;"true"===this.$route.query?.make_preview&&(this.is_serversidepreview=!0),this.$route.query?.sat&&(e=this.$route.query.sat),this.collection=await this.$api.getPublicFolder({path:this.collection_path,superadmintoken:e}).catch((e=>{"folder_not_public"===e.code?this.fetch_collection_error=this.$t("collection_is_not_public"):this.fetch_collection_error=this.$t("fetch_collection_error"),this.$root.is_loading=!1})),this.$root.is_loading=!1},beforeDestroy(){},watch:{is_fullscreen(){}},computed:{collection_path(){return`collections/${this.$route.params.collection_slug}`}},methods:{}},r=c,s=(o(80978),o(1001)),n=(0,s.Z)(r,i,l,!1,null,"48548c10",null),a=n.exports},52756:function(e,t,o){"use strict";o.r(t);var i=o(8081),l=o.n(i),c=o(23645),r=o.n(c),s=r()(l());s.push([e.id,"._collectionView[data-v-48548c10]{background:#fff;min-height:100%}",""]),t["default"]=s},80978:function(e,t,o){var i=o(52756);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);var l=o(31982).Z;l("09e20076",i,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=CollectionView.js.map