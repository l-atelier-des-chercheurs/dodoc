"use strict";(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[263],{47263:function(t,e,s){s.r(e),s.d(e,{default:function(){return u}});var n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("DLabel",{attrs:{str:t.$t("suggestions")}}),0===t.filtered_suggestions.length?s("div",[t._v("–")]):[t.filtered_suggestions.length>0?s("TagsList",{attrs:{tags:t.filtered_suggestions,tag_type:t.tag_type,mode:"add"},on:{tagClick:function(e){return t.$emit("newTag",e)}}}):t._e()]],2)},i=[],g={props:{tag_type:String,new_tag_name:String,tags_to_exclude:Array},components:{},data(){return{suggestions:[]}},created(){this.loadSuggestions(this.tag_type)},mounted(){},beforeDestroy(){},watch:{new_tag_name(){}},computed:{suggestions_list(){return this.suggestions},filtered_suggestions(){return this.suggestions_list.filter((t=>this.twoStringsMatch(t,this.new_tag_name)&&!this.tags_to_exclude.some((e=>e===t))))}},methods:{async loadSuggestions(t){const e=`categories/${t}`,s=await this.$api.getFolders({path:e}).catch((t=>{}));s.list_of_suggestions&&(this.suggestions=s.list_of_suggestions.slice().sort(((t,e)=>t.localeCompare(e))))}}},a=g,o=s(1001),r=(0,o.Z)(a,n,i,!1,null,"6eaec864",null),u=r.exports}}]);
//# sourceMappingURL=263.js.map