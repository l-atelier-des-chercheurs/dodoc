(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[746],{22746:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return v}});var a=function(){var t=this,e=t._self._c;return e("div",[e("DLabel",{attrs:{str:t.$t("projects_you_edited_last")}}),t.paths?e("div",{},[e("LoadSelectedProjects",{key:t.paths.join("."),attrs:{paths:t.paths}})],1):e("div",[t._v(" "+t._s(t.$t("nothing_to_show"))+" ")])],1)},o=[],r=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_loadSelectedProjects"},t._l(t.projects,(function(t){return e("div",{key:t.$path},[e("ProjectPresentation",{attrs:{project:t,context:"tiny",display_original_space:!0,can_edit:!1}})],1)})),0)},c=[],n=(s(44114),s(80510)),i={props:{paths:Array},components:{ProjectPresentation:n.A},data(){return{projects:[],is_loading:!0,fetch_err:void 0}},created(){},async mounted(){await this.loadSelectedProjects(this.paths)},beforeDestroy(){},watch:{},computed:{},methods:{async loadSelectedProjects(t){for(const e of t){const t=await this.$api.getFolder({path:e,no_files:!0}).catch((t=>{this.fetch_err=t.response}));t&&this.projects.push(t),this.is_loading=!1}}}},d=i,l=(s(90559),s(81656)),p=(0,l.A)(d,r,c,!1,null,"78bff119",null),u=p.exports,h={props:{},components:{LoadSelectedProjects:u},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{paths(){return!!this.connected_as?.projects_recently_edited&&this.connected_as.projects_recently_edited.slice().reverse()}},methods:{}},f=h,_=(0,l.A)(f,a,o,!1,null,"3f97cba4",null),v=_.exports},78429:function(t,e,s){"use strict";s.r(e);var a=s(31601),o=s.n(a),r=s(76314),c=s.n(r),n=c()(o());n.push([t.id,"._loadSelectedProjects[data-v-78bff119]{position:relative;margin-bottom:calc(var(--spacing)/2);display:grid;grid-auto-rows:max-content;grid-gap:calc(var(--spacing)/1);align-items:stretch;grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}",""]),e["default"]=n},90559:function(t,e,s){var a=s(78429);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=s(43197).A;o("232f931e",a,!0,{sourceMap:!1,shadowMode:!1})}}]);