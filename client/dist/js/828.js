(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[828],{81828:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return m}});var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("DLabel",{attrs:{str:t.$t("projects_you_edited_last")}}),t.paths?s("div",{},[s("LoadSelectedProjects",{key:t.paths.join("."),attrs:{paths:t.paths}})],1):s("div",[t._v(" "+t._s(t.$t("nothing_to_show"))+" ")])],1)},r=[],o=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"_loadSelectedProjects"},t._l(t.projects,(function(t){return s("div",{key:t.$path},[s("ProjectPresentation",{attrs:{project:t,context:"tiny",display_original_space:!0,can_edit:!1}})],1)})),0)},c=[],n=(s(57658),s(56470)),i={props:{paths:Array},components:{ProjectPresentation:n.Z},data(){return{projects:[],is_loading:!0,fetch_err:void 0}},i18n:{messages:{fr:{}}},created(){},async mounted(){await this.loadSelectedProjects(this.paths)},beforeDestroy(){},watch:{},computed:{},methods:{async loadSelectedProjects(t){for(const e of t){const t=await this.$api.getFolder({path:e}).catch((t=>{this.fetch_err=t.response}));t&&this.projects.push(t),this.is_loading=!1}}}},d=i,l=(s(87560),s(1001)),p=(0,l.Z)(d,o,c,!1,null,"f6cfe82c",null),u=p.exports,h={props:{},components:{LoadSelectedProjects:u},data(){return{}},i18n:{messages:{fr:{}}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{paths(){return!!this.connected_as?.projects_recently_edited&&this.connected_as.projects_recently_edited.slice().reverse()}},methods:{}},f=h,_=(0,l.Z)(f,a,r,!1,null,"a809d584",null),m=_.exports},86390:function(t,e,s){"use strict";s.r(e);var a=s(8081),r=s.n(a),o=s(23645),c=s.n(o),n=c()(r());n.push([t.id,"._loadSelectedProjects[data-v-f6cfe82c]{position:relative;margin-bottom:calc(var(--spacing)/2);display:grid;grid-auto-rows:max-content;grid-gap:calc(var(--spacing)/1);align-items:stretch;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}",""]),e["default"]=n},87560:function(t,e,s){var a=s(86390);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var r=s(31982).Z;r("30aad91f",a,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=828.js.map