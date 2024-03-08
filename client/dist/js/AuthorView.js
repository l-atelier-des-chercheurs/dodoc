(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[112],{30662:function(t,a,s){"use strict";s.r(a),s.d(a,{default:function(){return l}});var r=function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"_authorView"},[s("div",{staticClass:"_backBtn"},[s("router-link",{staticClass:"u-buttonLink",attrs:{to:"/"}},[s("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("home"))+" ")],1),s("router-link",{staticClass:"u-buttonLink",attrs:{to:"/@"}},[s("b-icon",{attrs:{icon:"slash"}}),t._v(" "+t._s(t.$t("list_of_accounts"))+" ")],1)],1),t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):[s("div",{staticClass:"_card"},[s("AuthorCard",{key:t.author.$path,staticClass:"u-spacingBottom",attrs:{author:t.author,context:"full"}})],1)]],2)},o=[],i=s(12090),e={props:{},components:{AuthorCard:i.Z},data(){return{author:void 0,is_loading:!0,fetch_author_error:!1}},created(){},async mounted(){await this.listAuthor(),this.$api.join({room:this.author.$path})},beforeDestroy(){this.$api.leave({room:this.author.$path})},watch:{},computed:{},methods:{async listAuthor(){const t=this.createPath({author_slug:this.$route.params.author_slug}),a=await this.$api.getFolder({path:t}).catch((t=>{this.fetch_author_error=t.response,this.is_loading=!1}));this.is_loading=!1,this.author=a}}},u=e,n=(s(54529),s(1001)),c=(0,n.Z)(u,r,o,!1,null,"08a3038a",null),l=c.exports},55719:function(t,a,s){"use strict";s.r(a),s.d(a,{default:function(){return c}});var r=function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"_notFound"},[s("h2",[t._v(t._s(t.$t("page_not_found")))]),s("router-link",{staticClass:"u-buttonLink",attrs:{to:"/"}},[t._v(" "+t._s(t.$t("go_home"))+" ")])],1)},o=[],i={props:{},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},e=i,u=(s(41707),s(1001)),n=(0,u.Z)(e,r,o,!1,null,"352da5ea",null),c=n.exports},9375:function(t,a,s){"use strict";s.r(a),s.d(a,{default:function(){return c}});var r=function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("div",{staticClass:"_uiView"},[s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(t){var a=t.$path;return s("AuthorTag",{key:a,attrs:{path:a}})})),1),s("hr"),s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(a){var r=a.$path;return s("AuthorTag",{key:r,attrs:{path:r},on:{click:t.dummy}})})),1),s("hr"),s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(a){var r=a.$path;return s("AuthorTag",{key:r,attrs:{path:r,mode:"select"},on:{click:t.dummy}})})),1),s("hr"),s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(a){var r=a.$path;return s("AuthorTag",{key:r,attrs:{path:r,mode:"add"},on:{click:t.dummy}})})),1),s("hr"),s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(a){var r=a.$path;return s("AuthorTag",{key:r,attrs:{path:r,mode:"remove"},on:{click:t.dummy}})})),1),s("hr"),s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(t){var a=t.$path;return s("AuthorTag",{key:a,attrs:{path:a,mode:"link"}})})),1),s("hr"),s("div",{staticClass:"_authors"},t._l(t.authors_sublist,(function(t){var a=t.$path;return s("AuthorTag",{key:a,attrs:{path:a,show_image_only:!0,mode:"link"}})})),1),s("hr"),s("div",{key:"list",staticClass:"u-listOfAvatars"},t._l(t.authors_sublist,(function(t){var a=t.$path;return s("AuthorTag",{key:a,attrs:{path:a,show_image_only:!0,mode:"link"}})})),1)])},o=[],i={props:{},components:{},data(){return{authors:[]}},i18n:{messages:{fr:{}}},created(){},async mounted(){this.authors=await this.$api.getFolders({path:"authors"})},beforeDestroy(){},watch:{},computed:{authors_sublist(){return this.authors.slice(0,5)}},methods:{dummy(){}}},e=i,u=(s(73714),s(1001)),n=(0,u.Z)(e,r,o,!1,null,"03ac0f5a",null),c=n.exports},49103:function(t,a,s){"use strict";s.r(a);var r=s(8081),o=s.n(r),i=s(23645),e=s.n(i),u=e()(o());u.push([t.id,"._authorView[data-v-08a3038a]{padding:calc(var(--spacing)*1);padding-bottom:calc(var(--spacing)*6)}._card[data-v-08a3038a]{max-width:400px;margin:0 auto}._backBtn[data-v-08a3038a]{margin-bottom:calc(var(--spacing)*2)}",""]),a["default"]=u},28776:function(t,a,s){"use strict";s.r(a);var r=s(8081),o=s.n(r),i=s(23645),e=s.n(i),u=e()(o());u.push([t.id,"._notFound[data-v-352da5ea]{width:100%;min-height:60vh;margin:0 auto;max-width:var(--max-column-width);padding:calc(var(--spacing)*1);display:flex;flex-flow:column nowrap;justify-content:center;align-items:center;gap:calc(var(--spacing)/2)}",""]),a["default"]=u},64770:function(t,a,s){"use strict";s.r(a);var r=s(8081),o=s.n(r),i=s(23645),e=s.n(i),u=e()(o());u.push([t.id,"._uiView[data-v-03ac0f5a]{max-width:600px;margin:calc(var(--spacing)/1) auto;width:100%}._authors[data-v-03ac0f5a]{display:flex;flex-flow:row wrap;align-items:center;gap:calc(var(--spacing)/4)}",""]),a["default"]=u},54529:function(t,a,s){var r=s(49103);r.__esModule&&(r=r.default),"string"===typeof r&&(r=[[t.id,r,""]]),r.locals&&(t.exports=r.locals);var o=s(31982).Z;o("3647d3de",r,!0,{sourceMap:!1,shadowMode:!1})},41707:function(t,a,s){var r=s(28776);r.__esModule&&(r=r.default),"string"===typeof r&&(r=[[t.id,r,""]]),r.locals&&(t.exports=r.locals);var o=s(31982).Z;o("0e93d47c",r,!0,{sourceMap:!1,shadowMode:!1})},73714:function(t,a,s){var r=s(64770);r.__esModule&&(r=r.default),"string"===typeof r&&(r=[[t.id,r,""]]),r.locals&&(t.exports=r.locals);var o=s(31982).Z;o("3c8c6c3f",r,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=AuthorView.js.map