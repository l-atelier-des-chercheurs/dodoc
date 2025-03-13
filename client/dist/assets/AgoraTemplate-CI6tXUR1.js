import{M as r}from"./ModuleCreator-BFcQoWGR.js";import{K as l}from"./KeywordsField-gGqCqc3v.js";import{n}from"../build.js";import"./EmbedPicker-B4yNP1w0.js";import"./SingleKeyword-D_nk-e8t.js";const c={props:{agoramodule:Object,index:Number,module_position:String,default_image_duration:Number,can_edit:Boolean},components:{KeywordsField:l},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{first_media(){return this.firstMedia(this.agoramodule)},first_media_duration(){return this.displayDuration({media:this.first_media})}},methods:{async updateAgoramodule(i){await this.$api.updateMeta({path:this.agoramodule.$path,new_meta:i})},async removeModule(){await this.$api.deleteItem({path:this.agoramodule.$path}).catch(i=>{throw this.$alertify.delay(4e3).error(i),i}),this.$emit("remove")}}};var u=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_montageModule"},[e("div",{staticClass:"_index"},[e("div",{staticClass:"_btns"},[e("button",{staticClass:"u-button u-button_icon",attrs:{type:"button",disabled:t.module_position==="alone"||t.module_position==="first"},on:{click:function(o){return t.$emit("moveUp")}}},[e("b-icon",{attrs:{icon:"chevron-up"}})],1),e("button",{staticClass:"u-button u-button_icon",attrs:{type:"button",disabled:t.module_position==="alone"||t.module_position==="last"},on:{click:function(o){return t.$emit("moveDown")}}},[e("b-icon",{attrs:{icon:"chevron-down"}})],1)]),e("span",{staticClass:"_num"},[t._v(" "+t._s(t.index)+" ")])]),e("div",{staticClass:"_preview"},[e("div",{staticClass:"u-spacingBottom _topLine"},[e("div",{staticClass:"u-label"},[t.first_media?[t._v(" "+t._s(t.$t(t.first_media.$type))+" "),t.first_media_duration?[t._v("/ "+t._s(t.first_media_duration))]:t._e()]:t._e()],2),e("div",{},[e("NumberInput",{attrs:{label:t.$t("duration"),value:t.agoramodule.duration||8,min:0,suffix:"s"},on:{save:function(o){return t.updateAgoramodule({duration:o})}}})],1),e("div",[e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.removeModule}},[t._v(" "+t._s(t.$t("remove"))+" "),e("b-icon",{attrs:{icon:"trash"}})],1)])]),e("div",{staticClass:"u-spacingBottom"},[e("KeywordsField",{attrs:{label:t.$t("keywords"),field_name:"keywords",keywords:t.agoramodule.keywords,path:t.agoramodule.$path,can_edit:t.can_edit}})],1),t.first_media?[t.first_media.$type!=="text"?e("MediaContent",{attrs:{file:t.first_media,resolution:1600,context:"full",show_fs_button:!0}}):e("CollaborativeEditor2",{ref:"textBloc",attrs:{path:t.first_media.$path,content:t.first_media.$content,line_selected:!1,can_edit:t.can_edit},on:{lineClicked:function(o){return t.$emit("lineClicked",o)},contentIsEdited:function(o){return t.$emit("contentIsEdited",o)},contentIsNotEdited:function(o){return t.$emit("contentIsNotEdited",o)}}})]:t._e()],2)])},d=[],_=n(c,u,d,!1,null,"131a4541");const p=_.exports,m={props:{publication:Object,can_edit:Boolean},components:{ModuleCreator:r,AgoraModule:p},data(){return{}},i18n:{fr:{autoscroll:"Défilement automatique"},en:{autoscroll:"Scroll automatically"}},async created(){(!this.sections||this.sections.length===0)&&await this.createSection2({publication:this.publication,type:"section",group:"sections_list",title:"montage"})},mounted(){},beforeDestroy(){},watch:{},computed:{sections(){return this.getSectionsWithProps({publication:this.publication,group:"sections_list"})},first_section(){return this.sections.at(0)},section_modules_list(){return this.getModulesForSection({publication:this.publication,section:this.first_section}).map(({_module:i})=>i)}},methods:{async addModules({meta_filenames:i}){await this.insertModuleMetaFilenamesToList2({publication:this.publication,section:this.first_section,meta_filenames:i})},async insertModules({meta_filenames:i,index:t}){await this.insertModuleMetaFilenamesToList2({publication:this.publication,section:this.first_section,index:t,meta_filenames:i})},async moveModuleTo({path:i,new_position:t}){await this.moveModuleTo2({publication:this.publication,section:this.first_section,meta_filename:this.getFilename(i),new_position:t})},async duplicatePublicationMedia({source_module_path:i,copy_meta_filename:t}){const e=this.getFilename(i);await this.duplicatePublicationMedia2({publication:this.publication,section:this.first_section,source_meta_filename:e,copy_meta_filename:t})},async removeModule(i){await this.removeModule2({publication:this.publication,section:this.first_section,path:i})}}};var h=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_montageModules"},[e("div",{staticClass:"u-spacingBottom"},[e("ToggleField",{attrs:{label:t.$t("autoscroll"),field_name:"autoscroll",content:t.publication.autoscroll===!0,path:t.publication.$path,can_edit:t.can_edit}})],1),e("div",{staticClass:"_titleBar"},[e("TitleField",{attrs:{field_name:"presentation",label:t.$t("presentation"),content:t.publication.presentation,path:t.publication.$path,required:!0,can_edit:t.can_edit,instructions:"ne sera pas affiché sur la page publique"}})],1),e("transition-group",{staticClass:"_listOfModules",attrs:{tag:"div",name:"StoryModules",appear:"",duration:700}},[t._l(t.section_modules_list,function(o,a){return[e("div",{key:"mc_"+a,staticClass:"_spacer"},[e("ModuleCreator",{attrs:{publication_path:t.publication.$path,types_available:[]},on:{addModules:({meta_filenames:s})=>t.insertModules({meta_filenames:s,index:a})}})],1),e("AgoraModule",{key:o.$path,attrs:{index:a+1,agoramodule:o,module_position:t.section_modules_list.length===1?"alone":a===0?"first":a===t.section_modules_list.length-1?"last":"inbetween",can_edit:t.can_edit},on:{moveUp:function(s){return t.moveModuleTo({path:o.$path,new_position:a-1})},moveDown:function(s){return t.moveModuleTo({path:o.$path,new_position:a+1})},remove:function(s){return t.removeModule(o.$path)}}})]})],2),e("div",{staticClass:"_lastModule"},[e("ModuleCreator",{attrs:{publication_path:t.publication.$path,start_collapsed:!1,types_available:[]},on:{addModules:t.addModules}})],1)],1)},f=[],b=n(m,h,f,!1,null,"824bfd92");const w=b.exports;export{w as default};
