(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[940],{59940:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return m}});var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("DLabel",{attrs:{str:t.$t("projects_you_edited_last")}}),t.paths?s("div",{},[s("LoadSelectedProjects",{key:t.paths.join("."),attrs:{paths:t.paths}})],1):s("div",[t._v(" "+t._s(t.$t("nothing_to_show"))+" ")])],1)},r=[],o=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"_loadSelectedProjects"},t._l(t.projects,(function(t){return s("div",{key:t.$path},[s("ProjectPresentation",{attrs:{project:t,context:"tiny",display_original_space:!0,can_edit:!1}})],1)})),0)},c=[],n=(s(70560),s(73213)),i={props:{paths:Array},components:{ProjectPresentation:n.Z},data(){return{projects:[],is_loading:!0,fetch_err:void 0}},created(){},async mounted(){await this.loadSelectedProjects(this.paths)},beforeDestroy(){},watch:{},computed:{},methods:{async loadSelectedProjects(t){for(const e of t){const t=await this.$api.getFolder({path:e}).catch((t=>{this.fetch_err=t.response}));t&&this.projects.push(t),this.is_loading=!1}}}},d=i,l=(s(94273),s(1001)),p=(0,l.Z)(d,o,c,!1,null,"2ecfe778",null),u=p.exports,h={props:{},components:{LoadSelectedProjects:u},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{paths(){return!!this.connected_as?.projects_recently_edited&&this.connected_as.projects_recently_edited.slice().reverse()}},methods:{}},_=h,f=(0,l.Z)(_,a,r,!1,null,"3f97cba4",null),m=f.exports},28261:function(t,e,s){"use strict";s.r(e);var a=s(8081),r=s.n(a),o=s(23645),c=s.n(o),n=c()(r());n.push([t.id,"._loadSelectedProjects[data-v-2ecfe778]{position:relative;margin-bottom:calc(var(--spacing)/2);display:grid;grid-auto-rows:max-content;grid-gap:calc(var(--spacing)/1);align-items:stretch;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}",""]),e["default"]=n},94273:function(t,e,s){var a=s(28261);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var r=s(20730).Z;r("2570c20d",a,!0,{sourceMap:!1,shadowMode:!1})}}]);