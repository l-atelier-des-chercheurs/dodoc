"use strict";(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[509],{16509:function(t,s,e){e.r(s),e.d(s,{default:function(){return u}});var i=function(){var t=this,s=t._self._c;return s("div",[s("DLabel",{attrs:{str:t.$t("suggestions")}}),0===t.filtered_suggestions.length?s("div",[t._v("–")]):[t.filtered_suggestions.length>0?s("TagsList",{attrs:{tags:t.filtered_suggestions,tag_type:t.tag_type,mode:"add"},on:{tagClick:function(s){return t.$emit("newTag",s)}}}):t._e()]],2)},g=[],n={props:{tag_type:String,local_suggestions:Array,new_tag_name:String,tags_to_exclude:Array},components:{},data(){return{suggestions:[]}},async created(){void 0!==this.local_suggestions?this.suggestions=this.local_suggestions:this.suggestions=await this.loadSuggestions(this.tag_type)},mounted(){},beforeDestroy(){},watch:{new_tag_name(){}},computed:{suggestions_list(){return this.suggestions},filtered_suggestions(){return this.suggestions_list.filter((t=>this.twoStringsMatch(t,this.new_tag_name)&&!this.tags_to_exclude.some((s=>s===t))))}},methods:{async loadSuggestions(t){const s=`categories/${t}`,e=await this.$api.getFolders({path:s}).catch((t=>{}));return e?.list_of_suggestions?e.list_of_suggestions:[]}}},a=n,o=e(81656),r=(0,o.A)(a,i,g,!1,null,"cc20de7a",null),u=r.exports}}]);