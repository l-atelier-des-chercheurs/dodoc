(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[69],{61069:function(t,e,i){"use strict";i.r(e),i.d(e,{default:function(){return E}});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",["settings"===t.current_view&&t.can_edit?i("StorySettings",{attrs:{publication:t.publication}}):i("SectionsList",{attrs:{publication:t.publication,section_opened_meta:t.section_opened_meta,can_edit:t.can_edit},on:{toggleSection:function(e){return t.$emit("toggleSection",e)},closePublication:function(e){return t.$emit("closePublication")}}})],1)},n=[],s=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div")},o=[],l={props:{},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},c=l,r=i(1001),d=(0,r.Z)(c,s,o,!1,null,"618e1b8f",null),u=d.exports,p=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("div",{staticClass:"_summary"},[i("DLabel",{attrs:{str:t.$t("summary")}}),i("SlickList",{staticClass:"_list",attrs:{axis:"y",value:t.sections},on:{input:t.updateOrder}},t._l(t.sections,(function(e,a){return i("SlickItem",{key:e.$path,staticClass:"_item",class:{"is--active":t.isActive(e.$path)},attrs:{index:a}},[i("span",{directives:[{name:"handle",rawName:"v-handle"}],staticClass:"_inlineBtn"},[i("sl-icon-button",{attrs:{name:"grip-vertical",label:"Déplacer"}})],1),e.section_title?i("span",{staticClass:"_title"},[t._v(t._s(e.section_title))]):i("span",{staticClass:"_title",domProps:{innerHTML:t._s("<i>"+t.$t("untitled")+"</i>")}}),i("small",[t._v(" ("+t._s(e.modules_list?e.modules_list.length:0)+") ")]),t.isActive(e.$path)?t._e():i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(i){return t.openSection(e.$path)}}},[t._v(" "+t._s(t.$t("open"))+" ")])])})),1),i("hr"),i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.createSection}},[t._v(" "+t._s(t.$t("create_section"))+" ")])],1),i("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.opened_section?i("div",{key:t.opened_section.$path},[i("SingleSection",{attrs:{publication:t.publication,section:t.opened_section,can_edit:t.can_edit},on:{remove:function(e){return t.removeSection(t.opened_section.$path)},close:t.closeSection}})],1):t._e()])],1)},m=[],_=(i(57658),function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"_singleSection"},[i("div",{staticClass:"_storyContainer"},[i("div",{staticClass:"_storyContent",style:t.story_styles},[i("div",{staticClass:"_topbar"},[i("SectionTitle",{attrs:{section:t.section,can_edit:t.can_edit}}),i("div",{staticClass:"u-sameRow"},[i("RemoveMenu",{attrs:{remove_text:t.$t("remove")},on:{remove:function(e){return t.$emit("remove")}}}),i("div",[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[i("sl-icon",{attrs:{name:"x"}}),t._v(" "+t._s(t.$t("close"))+" ")],1)])],1)],1),i("transition-group",{attrs:{tag:"div",name:"StoryModules",appear:"",duration:700}},[t._l(t.modules_list,(function(e,a){return[i("PublicationModule",{key:e,staticClass:"_mediaPublication",attrs:{publimodule:t.findModuleFromMetaFilename(e),module_position:1===t.modules_list.length?"alone":0===a?"first":a===t.modules_list.length-1?"last":"inbetween",can_edit:t.can_edit},on:{resize:function(i){return t.resize({meta_filename:e,new_size:i})},moveUp:function(i){return t.moveTo({meta_filename:e,dir:-1})},moveDown:function(i){return t.moveTo({meta_filename:e,dir:1})},duplicate:function(i){return t.duplicatePublicationMedia({source_meta_filename:e,copy_meta_filename:i})},remove:function(i){return t.removeModuleFromList(e)}}}),i("div",{key:"mc_"+a,staticClass:"_spacer"},[t.can_edit?i("ModuleCreator",{attrs:{publication_path:t.publication.$path,meta_filenames_already_present:t.meta_filenames_already_present},on:{addModule:function(e){var i=e.meta_filename;return t.insertModuleMetaFilenameToList({meta_filename:i,index:a+1})}}}):t._e()],1)]}))],2)],1)]),!t.can_edit||t.modules_list&&0!==t.modules_list.length?t._e():i("ModuleCreator",{attrs:{publication_path:t.publication.$path},on:{addModule:t.appendModuleMetaFilenameToList}})],1)}),h=[],f=(i(85827),function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"_sectionTitle"},[i("TitleField",{attrs:{field_name:"section_title",label:t.$t("section_title"),content:t.section.section_title,path:t.section.$path,maxlength:120,tag:"h3",can_edit:t.can_edit}})],1)}),b=[],v={props:{section:Object,can_edit:Boolean},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},g=v,y=(0,r.Z)(g,f,b,!1,null,"fa160c10",null),M=y.exports,w=i(67934),$=i(26010),x={props:{publication:Object,section:Object,can_edit:Boolean},components:{SectionTitle:M,ModuleCreator:w.Z,PublicationModule:$.Z},data(){return{medias:[],fetch_publication_error:null}},created(){},async mounted(){},beforeDestroy(){},watch:{},computed:{story_styles(){return""},modules_list(){if(this.section.modules_list&&Array.isArray(this.section.modules_list)){const t=this.section.modules_list.reduce(((t,e)=>{const i=this.findModuleFromMetaFilename(e);return i&&t.push(e),t}),[]);return t}return[]},meta_filenames_already_present(){return this.modules_list.reduce(((t,e)=>{const i=this.findModuleFromMetaFilename(e);return i.source_medias&&i.source_medias.map((e=>{e.meta_filename_in_project&&t.push(e.meta_filename_in_project)})),t}),[])}},methods:{async appendModuleMetaFilenameToList({meta_filename:t}){const e=this.modules_list.slice();e.push(t),await this.updateMeta({modules_list:e}),this.toggleNewModuleEdit({meta_filename:t})},async insertModuleMetaFilenameToList({meta_filename:t,index:e}){const i=this.modules_list.slice();i.splice(e,0,t),await this.updateMeta({modules_list:i}),this.toggleNewModuleEdit({meta_filename:t})},async updateMeta(t){this.fetch_status="pending",this.fetch_error=null;try{this.response=await this.$api.updateMeta({path:this.section.$path,new_meta:t}),this.fetch_status="success"}catch(e){this.fetch_status="error",this.fetch_error=e.response.data}},findModuleFromMetaFilename(t){return this.publication.$files?this.publication.$files.find((e=>{const i=e.$path.substring(e.$path.lastIndexOf("/")+1);return i===t})):[]},async moveTo({meta_filename:t,dir:e}){let i=this.modules_list.slice();const a=i.findIndex((e=>e===t));return!(a+e<0)&&(!(a+e>i.length-1)&&(i.move(a,a+e),void(this.response=await this.updateMeta({modules_list:i}))))},async duplicatePublicationMedia({source_meta_filename:t,copy_meta_filename:e}){let i=this.modules_list.slice();const a=i.findIndex((e=>e===t));i.splice(a+1,0,e),this.response=await this.updateMeta({modules_list:i})},async removeModuleFromList(t){let e=this.modules_list.slice();e=e.filter((e=>e!==t)),this.response=await this.updateMeta({modules_list:e})},toggleNewModuleEdit({meta_filename:t}){setTimeout((()=>{console.log(`emit module.enable_edit.${t}`),this.$eventHub.$emit(`module.enable_edit.${t}`)}),50)}}},S=x,C=(i(86396),(0,r.Z)(S,_,h,!1,null,"4b6d2b88",null)),k=C.exports,F=i(55656),L={props:{publication:Object,section_opened_meta:String,can_edit:Boolean},components:{SingleSection:k,SlickItem:F.SlickItem,SlickList:F.SlickList},directives:{handle:F.HandleDirective},data(){return{opened_section_meta_filename:!1,fruits:["Apples","Bananas"]}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{sections_list(){return this.publication.sections_list||[]},sections(){const t=this.publication.$files?this.publication.$files.filter((t=>Object.prototype.hasOwnProperty.call(t,"section_type"))):[];return 0!==t.length&&this.publication.sections_list?this.publication.sections_list.map((({meta_filename:e})=>t.find((t=>t.$path.endsWith("/"+e))))):[]},opened_section(){var t;return null===(t=this.publication.$files)||void 0===t?void 0:t.find((t=>t.$path.endsWith("/"+this.section_opened_meta)))}},methods:{async createSection(){const t=await this.$api.uploadFile({path:this.publication.$path,additional_meta:{section_type:"-",requested_slug:"section"}}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t}));let e=this.sections_list.slice();e.push({meta_filename:t}),await this.updatePubliMeta({sections_list:e}),this.$emit("toggleSection",t)},async removeSection(t){const e=this.getFilename(t);let i=this.sections_list.slice();i=i.filter((t=>t.meta_filename!==e)),this.updatePubliMeta({sections_list:i}),await this.$api.deleteItem({path:t})},async updatePubliMeta(t){return await this.$api.updateMeta({path:this.publication.$path,new_meta:t})},isActive(t){return this.opened_section&&t===this.opened_section.$path},openSection(t){const e=this.getFilename(t);this.$emit("toggleSection",e)},closeSection(){this.$emit("toggleSection",!1)},updateOrder(t){const e=t.map((t=>({meta_filename:this.getFilename(t.$path)})));this.updatePubliMeta({sections_list:e})}}},P=L,T=(i(50409),i(64987),(0,r.Z)(P,p,m,!1,null,"25d693bc",null)),j=T.exports,Z={props:{publication:Object,section_opened_meta:String,can_edit:Boolean},components:{StorySettings:u,SectionsList:j},data(){return{current_view:"section"}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},O=Z,D=(i(77491),(0,r.Z)(O,a,n,!1,null,"7f5a0d1d",null)),E=D.exports},43058:function(t,e,i){"use strict";i.r(e);var a=i(8081),n=i.n(a),s=i(23645),o=i.n(s),l=o()(n());l.push([t.id,"._summary[data-v-25d693bc]{background:#fff;padding:calc(var(--spacing)/2);margin:0 auto;max-width:60ch}._list[data-v-25d693bc]{color:#000}",""]),e["default"]=l},13135:function(t,e,i){"use strict";i.r(e);var a=i(8081),n=i.n(a),s=i(23645),o=i.n(s),l=o()(n());l.push([t.id,"._item{z-index:10000;display:flex;flex-flow:row wrap;align-items:center;gap:calc(var(--spacing)/2)}._item.is--active ._title{background:var(--c-orange);padding:calc(var(--spacing)/8) calc(var(--spacing)/2);border-radius:4px}",""]),e["default"]=l},48001:function(t,e,i){"use strict";i.r(e);var a=i(8081),n=i.n(a),s=i(23645),o=i.n(s),l=o()(n());l.push([t.id,"._singleSectionx[data-v-4b6d2b88]{display:flex;justify-content:center;flex-flow:column nowrap;align-items:center;margin:0 auto calc(var(--spacing)*4)}._settings[data-v-4b6d2b88]{position:relative;top:0;right:0;display:flex;justify-content:flex-end;background:#fff;padding:calc(var(--spacing)/8) calc(var(--spacing)/4);margin:calc(var(--spacing)/2) auto 0;max-width:240px}._storyContainer[data-v-4b6d2b88]{width:100%;overflow:auto}._storyContent[data-v-4b6d2b88]{width:100%;background:#fff;max-width:800px;padding:calc(var(--spacing)*1) 0;margin:calc(var(--spacing)/2) auto;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:all .4s cubic-bezier(.19,1,.22,1)}._mediaPublication[data-v-4b6d2b88]{position:relative;margin-bottom:0}._mediaPublication[data-v-4b6d2b88]  ._content{min-height:72px}._mediaPublication[data-v-4b6d2b88]  ._floatingEditBtn[data-action=disable]{display:none}._spacer[data-v-4b6d2b88]{min-height:3rem;display:flex;align-items:center;justify-content:center;padding:calc(var(--spacing)/4) 0}._topbar[data-v-4b6d2b88]{display:flex;flex-flow:row wrap;justify-content:space-between;margin:0 calc(var(--spacing)/1) calc(var(--spacing)*1.5);padding-bottom:calc(var(--spacing)/1);border-bottom:2px solid var(--c-gris)}",""]),e["default"]=l},82616:function(t,e,i){"use strict";i.r(e);var a=i(8081),n=i.n(a),s=i(23645),o=i.n(s),l=o()(n());l.push([t.id,"._switch[data-v-7f5a0d1d]{margin:calc(var(--spacing)*1) 0}",""]),e["default"]=l},50409:function(t,e,i){var a=i(43058);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var n=i(31982).Z;n("3e148490",a,!0,{sourceMap:!1,shadowMode:!1})},64987:function(t,e,i){var a=i(13135);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var n=i(31982).Z;n("5b11cba0",a,!0,{sourceMap:!1,shadowMode:!1})},86396:function(t,e,i){var a=i(48001);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var n=i(31982).Z;n("deb9971c",a,!0,{sourceMap:!1,shadowMode:!1})},77491:function(t,e,i){var a=i(82616);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var n=i(31982).Z;n("ec60a604",a,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=69.js.map