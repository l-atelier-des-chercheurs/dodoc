"use strict";(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[504],{61504:function(t,s,e){e.r(s),e.d(s,{default:function(){return u}});var i=function(){var t=this,s=t._self._c;return s("div",[s("DLabel",{attrs:{str:t.$t("suggestions")}}),0===t.filtered_suggestions.length?s("div",[t._v("–")]):[t.filtered_suggestions.length>0?s("TagsList",{attrs:{tags:t.filtered_suggestions,tag_type:t.tag_type,mode:"add"},on:{tagClick:function(s){return t.$emit("newTag",s)}}}):t._e()]],2)},n=[],g={props:{tag_type:String,new_tag_name:String,tags_to_exclude:Array},components:{},data(){return{suggestions:[]}},created(){this.loadSuggestions(this.tag_type)},mounted(){},beforeDestroy(){},watch:{new_tag_name(){}},computed:{suggestions_list(){return this.suggestions},filtered_suggestions(){return this.suggestions_list.filter((t=>this.twoStringsMatch(t,this.new_tag_name)&&!this.tags_to_exclude.some((s=>s===t))))}},methods:{async loadSuggestions(t){const s=`categories/${t}`,e=await this.$api.getFolders({path:s}).catch((t=>{}));e?.list_of_suggestions&&(this.suggestions=e.list_of_suggestions.slice().sort(((t,s)=>t.localeCompare(s))))}}},a=g,o=e(81656),r=(0,o.A)(a,i,n,!1,null,"3a335bdc",null),u=r.exports}}]);
//# sourceMappingURL=504.js.map