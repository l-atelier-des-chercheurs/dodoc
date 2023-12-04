(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[781],{46188:function(t,e,a){"use strict";a.d(e,{Z:function(){return c}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.title||t.$t("export")},on:{close:function(e){return t.$emit("close")}}},[a("div",{staticClass:"_cont"},[a("div",{staticClass:"u-spacingBottom"},[t._t("default")],2),a("div",{},[a("div",{staticClass:"u-sameRow"},[a("a",{staticClass:"u-buttonLink",attrs:{disabled:!t.export_href,download:t.export_name,href:t.export_href,target:"_blank"}},[t._v(" "+t._s(t.$t("download"))+" ")]),a("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:t.saveToProject}},[a("svg",{staticStyle:{"enable-background":"new 0 0 168 168"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 168 168","xml:space":"preserve"}},[a("path",{staticStyle:{fill:"var(--c-rouge)"},attrs:{d:"M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"}}),a("g",{staticStyle:{fill:"var(--c-orange)"}},[a("path",{attrs:{d:"m42 42h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m73.2 42h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m104.4 42h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m42 73.5h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m73.2 73.5h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m104.4 73.5h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m42 105h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m73.2 105h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m104.4 105h21.6v21h-21.6z"}})])]),t._v(" "+t._s(t.$t("save_to_project"))+" ")])])]),t.finished_saving_to_project?a("div",{staticClass:"_saveNotice"},[t._v(" "+t._s(t.$t("media_was_saved"))+" ")]):t._e()])])},s=[],o={props:{title:String,export_name:{type:String,default:"file"},export_blob:[Boolean,Blob],export_href:String,project_path:String},components:{},data(){return{finished_saving_to_project:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async saveToProject(){if(this.export_blob){const t={$origin:"make"};this.connected_as?.$path&&(t.$authors=[this.connected_as.$path]),await this.$api.uploadFile({path:this.project_path,filename:this.export_name,file:this.export_blob,additional_meta:t}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t}))}this.finished_saving_to_project=!0,setTimeout((()=>{this.$emit("close")}),3e3)}}},n=o,r=(a(95407),a(1001)),l=(0,r.Z)(n,i,s,!1,null,"993a2d5e",null),c=l.exports},6781:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return v}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_montageModules"},[a("transition-group",{staticClass:"_listOfModules",attrs:{tag:"div",name:"StoryModules",appear:"",duration:700}},[t._l(t.section_modules_list,(function(e,i){return[a("div",{key:"mc_"+i,staticClass:"_spacer"},[a("ModuleCreator",{attrs:{publication_path:t.make.$path,types_available:["medias"]},on:{addModules:function(e){var a=e.meta_filenames;return t.insertModules({meta_filenames:a,index:i})}}})],1),a("MontageModule",{key:e.$path,attrs:{index:i+1,makemodule:e,module_position:1===t.section_modules_list.length?"alone":0===i?"first":i===t.section_modules_list.length-1?"last":"inbetween",default_image_duration:t.default_image_duration},on:{remove:function(a){return t.removeModule(e.$path)}}})]}))],2),a("ModuleCreator",{staticClass:"_lastModule",attrs:{publication_path:t.make.$path,start_collapsed:!1,types_available:["medias"]},on:{addModules:t.addModules}}),a("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.export_is_available?a("div",{staticClass:"_bottomRow"},[a("div",{staticClass:"_equationIcon"},[a("b-icon",{attrs:{icon:"chevron-double-down"}})],1),a("div",{},[a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){t.show_save_export_modal=!0}}},[a("b-icon",{attrs:{icon:"check"}}),t._v(" "+t._s(t.$t("create"))+" ")],1)])]):t._e()]),t.show_save_export_modal?a("ExportSaveMakeModal",{attrs:{title:t.$t("export_montage"),export_name:t.export_name,export_href:t.export_href},on:{close:function(e){t.show_save_export_modal=!1}}},[t.is_exporting?a("div",{key:"loader",staticClass:"_spinner"},[a("LoaderSpinner")],1):a("div",[t.created_video?a("div",[a("MediaContent",{staticClass:"_preview",attrs:{file:t.created_video,resolution:1600,context:"full"}})],1):a("div",[a("SelectField2",{attrs:{value:t.resolution_preset_picked,options:t.presets,can_edit:!0,hide_validation:!0},on:{change:function(e){t.resolution_preset_picked=e}}}),a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.renderMontage}},[a("b-icon",{attrs:{icon:"check"}}),t._v(" "+t._s(t.$t("create"))+" ")],1)],1)])]):t._e()],1)},s=[],o=(a(57658),a(52262),a(24506),a(39694)),n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_montageModule"},[a("div",{staticClass:"_line"}),a("div",{staticClass:"_index"},[t._v(" "+t._s(t.index)+" ")]),a("div",{staticClass:"_preview"},[a("div",{staticClass:"_topRow"},[a("div",{staticClass:"u-label"},[t.first_media?[t._v(" "+t._s(t.$t(t.first_media.$type))+" "),t.first_media_duration?[t._v("/ "+t._s(t.first_media_duration))]:t._e()]:t._e(),a("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.removeModule}},[a("sl-icon",{attrs:{name:"trash3"}})],1)],2),a("div",{},[a("span",{staticClass:"u-switch u-switch-xs"},[a("input",{staticClass:"switch",attrs:{id:"transition_in_"+t.makemodule.$path,type:"checkbox"},domProps:{checked:"fade"===t.makemodule.transition_in},on:{change:function(e){return t.toggleTransition("transition_in")}}}),a("label",{staticClass:"u-label",attrs:{for:"transition_in_"+t.makemodule.$path}},[t._v(t._s(t.$t("transition_fade")))])])])]),t.first_media?["text"!==t.first_media.$type?a("MediaContent",{attrs:{file:t.first_media,resolution:1600,context:"full",show_fs_button:!0,is_draggable:!1}}):a("CollaborativeEditor2",{ref:"textBloc",attrs:{path:t.first_media.$path,content:t.first_media.$content,line_selected:!1,can_edit:!0},on:{lineClicked:function(e){return t.$emit("lineClicked",e)},contentIsEdited:function(e){return t.$emit("contentIsEdited",e)},contentIsNotEdited:function(e){return t.$emit("contentIsNotEdited",e)}}}),"image"===t.first_media.$type?a("div",{staticClass:"_imageDurationPicker"},[a("NumberInput",{attrs:{value:t.makemodule.image_duration||t.default_image_duration,suffix:t.$t("seconds"),size:"medium",min:0,max:3600},on:{save:function(e){return t.updateMakemodule({image_duration:e})}}})],1):t._e(),"last"===t.module_position?a("div",{staticClass:"_transitionPicker"},[a("span",{staticClass:"u-switch u-switch-xs"},[a("input",{staticClass:"switch",attrs:{id:"transition_out_"+t.makemodule.$path,type:"checkbox"},domProps:{checked:"fade"===t.makemodule.transition_out},on:{change:function(e){return t.toggleTransition("transition_out")}}}),a("label",{staticClass:"u-label",attrs:{for:"transition_out_"+t.makemodule.$path}},[t._v(t._s(t.$t("transition_fade")))])])]):t._e()]:t._e()],2)])},r=[],l={props:{makemodule:Object,index:Number,module_position:String,default_image_duration:Number},components:{},data(){return{}},i18n:{messages:{fr:{transition_fade:"Transition : fondu enchaîné"},en:{transition_fade:"Transition: fade"}}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{first_media(){return this.firstMedia(this.makemodule)},first_media_duration(){return this.displayDuration({media:this.first_media})}},methods:{toggleTransition(t){"fade"===this.makemodule[t]?this.updateMakemodule({[t]:"none"}):this.updateMakemodule({[t]:"fade"})},async updateMakemodule(t){await this.$api.updateMeta({path:this.makemodule.$path,new_meta:t})},async removeModule(){await this.$api.deleteItem({path:this.makemodule.$path}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t})),this.$emit("remove")}}},c=l,d=(a(54837),a(1001)),u=(0,d.Z)(c,n,r,!1,null,"05aa2e18",null),_=u.exports,p=a(46188),m={props:{make:Object},components:{ModuleCreator:o.Z,MontageModule:_,ExportSaveMakeModal:p.Z},data(){return{show_save_export_modal:!1,is_exporting:!1,created_video:!1,export_href:void 0,default_image_duration:2,resolution_preset_picked:"high",presets:[{key:"vhigh",text:this.$t("very_high"),instructions:"1920 × 1080",width:1920,height:1080},{key:"high",text:this.$t("high"),instructions:"1280 × 720",width:1280,height:720},{key:"medium",text:this.$t("medium"),instructions:"640 × 480",width:640,height:480},{key:"low",text:this.$t("low"),instructions:"480 × 360",width:480,height:360},{key:"rough",text:"→"+this.$t("rough"),instructions:"360 × 240",width:360,height:240},{key:"custom",text:"↓"+this.$t("custom"),instructions:"512 × 512"}]}},i18n:{messages:{fr:{export_montage:"Exporter le montage"},en:{export_montage:"Export montage"}}},async created(){this.sections&&0!==this.sections.length||await this.createSection2({publication:this.make,type:"section",group:"sections_list",title:"montage"})},mounted(){},beforeDestroy(){},watch:{show_save_export_modal(){this.show_save_export_modal||(this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.created_video=!1)}},computed:{export_name(){return"video_montage.mp4"},export_is_available(){return this.section_modules_list.length>1},montage(){return this.section_modules_list.reduce(((t,e)=>{const a=this.firstMedia(e);if(a){let i={path:this.makeMediaFilePath({$path:a.$path,$media_filename:a.$media_filename}),type:a.$type,transition_in:e.transition_in,transition_out:e.transition_out};"image"===a.$type&&(i.image_duration=e.image_duration||this.default_image_duration),t.push(i)}return t}),[])},sections(){return this.getSectionsWithProps({publication:this.make,group:"sections_list"})},first_section(){return this.sections.at(0)},section_modules_list(){return this.getModulesForSection({publication:this.make,section:this.first_section}).map((({_module:t})=>t))}},methods:{async addModules({meta_filenames:t}){await this.insertModuleMetaFilenamesToList2({publication:this.make,section:this.first_section,meta_filenames:t})},async insertModules({meta_filenames:t,index:e}){await this.insertModuleMetaFilenamesToList2({publication:this.make,section:this.first_section,index:e,meta_filenames:t})},async moveModuleTo({path:t,new_position:e}){await this.moveModuleTo2({publication:this.make,section:this.first_section,meta_filename:this.getFilename(t),new_position:e})},async duplicatePublicationMedia({source_module_path:t,copy_meta_filename:e}){const a=this.getFilename(t);await this.duplicatePublicationMedia2({publication:this.make,section:this.first_section,source_meta_filename:a,copy_meta_filename:e})},async removeModule(t){await this.removeModule2({publication:this.make,section:this.first_section,path:t})},async renderMontage(){this.is_exporting=!0,this.created_video=!1,this.export_href=void 0;const{width:t,height:e}=this.presets.find((t=>t.key===this.resolution_preset_picked));let a={recipe:this.make.type,suggested_file_name:this.make.type,montage:this.montage,output_width:t,output_height:e,additional_meta:{$origin:"make"}};const i=await this.$api.exportFolder({path:this.make.$path,instructions:a});this.$api.join({room:"task_"+i});const s=({task_id:t,message:e})=>{t===i&&(this.$eventHub.$off("task.ended",s),this.$api.leave({room:"task_"+i}),"completed"===e.event?(e.file,this.created_video=e.file,this.export_href=this.makeMediaFileURL({$path:this.created_video.$path,$media_filename:this.created_video.$media_filename})):"aborted"===e.event||"failed"===e.event&&e.info,this.is_exporting=!1)};this.$eventHub.$on("task.ended",s)}}},h=m,f=(a(35812),(0,d.Z)(h,i,s,!1,null,"1c510276",null)),v=f.exports},41078:function(t,e,a){"use strict";a.d(e,{Z:function(){return c}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_mediaPicker"},[a("PickMediaFromProjects",{attrs:{title:"single"===t.select_mode?t.$t("pick_media"):t.$t("pick_medias"),path:t.current_project_path,select_mode:t.select_mode},on:{addMedias:function(e){return t.$emit("addMedias",e)},close:function(e){return t.$emit("close")}}})],1)},s=[],o={props:{publication_path:String,select_mode:{type:String,default:"multiple"}},components:{},data(){return{}},async created(){},beforeDestroy(){},watch:{},computed:{current_project_path(){const t=this.getParent(this.publication_path);return this.getParent(t)}},methods:{}},n=o,r=(a(20244),a(1001)),l=(0,r.Z)(n,i,s,!1,null,"32c4a41c",null),c=l.exports},39694:function(t,e,a){"use strict";a.d(e,{Z:function(){return f}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_moduleCreator",class:{"is--collapsed":!t.show_module_selector}},[a("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.show_module_selector||!t.start_collapsed?a("div",{staticClass:"_typePicker"},[t.types_available.includes("text")?a("button",{staticClass:"u-button u-button_black",attrs:{type:"button"},on:{click:t.createText}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"fonts",label:t.$t("add_text")}}),t.show_labels?[t._v(t._s(t.$t("text")))]:t._e()],2):t._e(),t.types_available.includes("medias")?a("button",{staticClass:"u-button u-button_black",attrs:{type:"button"},on:{click:function(e){t.show_media_picker=!0}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"image",label:t.$t("add_medias")}}),t.show_labels?[t._v(t._s(t.$t("medias")))]:t._e()],2):t._e(),t.show_media_picker?a("MediaPicker",{attrs:{publication_path:t.publication_path,select_mode:t.select_mode},on:{addMedias:t.createMosaic,close:function(e){t.show_media_picker=!1}}}):t._e(),t.types_available.includes("link")?a("button",{staticClass:"u-button u-button_black",attrs:{type:"button"},on:{click:function(e){t.show_link_picker=!0}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"link",label:t.$t("add_link")}}),t.show_labels?[t._v(t._s(t.$t("link")))]:t._e()],2):t._e(),t.show_link_picker?a("LinkPicker",{on:{embed:t.createEmbed,close:function(e){t.show_link_picker=!1}}}):t._e(),t.types_available.includes("shapes")?t._l(t.shapes,(function(e){return a("button",{key:e.type,staticClass:"u-button u-button_black",attrs:{type:"button"},on:{click:function(a){return t.createCustomModule({module_type:e.type,addtl_meta:e.addtl_meta})}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:e.icon,label:t.$t(e.type)}}),t.show_labels?[t._v(t._s(t.$t(e.type)))]:t._e()],2)})):t._e(),t.start_collapsed?a("EditBtn",{key:"addmodule",attrs:{btn_type:"close",is_unfolded:!1},on:{click:function(e){t.show_module_selector=!1}}}):t._e()],2):t.start_collapsed&&!t.show_module_selector?a("EditBtn",{key:"addmodule",staticClass:"_addBtn",attrs:{btn_type:"add",is_unfolded:!1},on:{click:function(e){t.show_module_selector=!0}}}):t._e()],1),a("DropZone",{on:{mediaDropped:t.createMosaic}})],1)},s=[],o=(a(57658),a(41078)),n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{on:{close:function(e){return t.$emit("close")}}},[a("div",{staticClass:"_linkPicker"},[a("div",{staticClass:"_urlBox"},[a("DLabel",{attrs:{str:t.$t("input_url"),instructions:t.$t("input_url_instr")}}),a("input",{directives:[{name:"model",rawName:"v-model",value:t.full_url,expression:"full_url"}],attrs:{type:"url",placeholder:"https://"},domProps:{value:t.full_url},on:{input:function(e){e.target.composing||(t.full_url=e.target.value)}}})],1),a("div",{staticClass:"u-instructions"},[t._v(" PeerTube, YouTube, Vimeo, etc. "+t._s(t.$t("for_example"))+"  "),t._l(["https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde","https://www.youtube.com/watch?v=Bn6zdyCAwJs","https://vimeo.com/447785086","https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas"],(function(e,i){return a("button",{key:i,staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{innerHTML:t._s(e)},on:{click:function(a){t.full_url=e}}})}))],2),a("br"),a("div",{key:t.full_url},["any"===t.url_to_site.type?[a("iframe",{staticClass:"_siteIframe",attrs:{src:t.url_to_site.src,frameborder:"0"}})]:a("vue-plyr",[a("div",{staticClass:"plyr__video-embed"},[a("iframe",{attrs:{src:t.url_to_site.src,allowfullscreen:"",allowtransparency:"",allow:"autoplay; fullscreen",sandbox:"allow-same-origin allow-scripts allow-popups",frameborder:"0"}})])])],2),a("br"),t.full_url?a("div",{staticClass:"_selectBtn"},[a("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[t._v(" "+t._s(t.$t("cancel"))+" ")]),a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){return t.$emit("embed",t.full_url)}}},[t._v(" "+t._s(t.$t("embed"))+" ")])]):t._e()])])},r=[],l={props:{},components:{},data(){return{full_url:"https://"}},async created(){},beforeDestroy(){},watch:{},computed:{url_to_site(){return!!this.full_url&&this.transformURL({url:this.full_url,autoplay:!1})}},methods:{}},c=l,d=(a(20148),a(1001)),u=(0,d.Z)(c,n,r,!1,null,"a5930508",null),_=u.exports,p={props:{publication_path:String,pre_addtl_meta:Object,post_addtl_meta:Object,select_mode:String,show_labels:{type:Boolean,default:!0},context:String,types_available:{type:Array,default:()=>["text","medias","files","link","shapes"]},start_collapsed:{type:Boolean,default:!0}},components:{MediaPicker:o.Z,LinkPicker:_},data(){return{show_module_selector:!1,show_media_picker:!1,show_file_picker:!1,show_link_picker:!1,shapes:[{type:"ellipsis",icon:"circle-fill",addtl_meta:{background_color:"#1d327f"}},{type:"rectangle",icon:"square-fill",addtl_meta:{background_color:"#ffbe32"}},{type:"line",icon:"dash-lg",addtl_meta:{outline_width:1,outline_color:"#000000"}},{type:"arrow",icon:"arrow-right-square",addtl_meta:{outline_width:1,outline_color:"#000000"}}],is_saving:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async createMosaic({meta_filename:t,path_to_source_media_metas:e}){let a=[];if(t)a.push({meta_filename:t});else if(e)for(const i of e){const t=this.getParent(i),e=this.getParent(this.getParent(this.publication_path));let s;s=t!==e?await this.$api.copyFile({path:i,path_to_destination_folder:e}).catch((t=>{throw this.$alertify.delay(4e3).error(t),"fail"})):this.getFilename(i),a.push({meta_filename_in_project:s})}"page_by_page"===this.context&&(a=a.map((t=>(t.objectFit="contain",t)))),"page_by_page"===this.context?await this.createMultipleModules({module_type:"mosaic",source_medias:a}):await this.createModule({module_type:"mosaic",source_medias:a}),this.show_media_picker=!1},async createEmbed(t){const e="url-"+ +new Date+".txt",a=await this.$api.uploadText({path:this.publication_path,filename:e,content:t,additional_meta:{module_type:this.module_type,$type:"url"}});this.createMosaic({meta_filename:a}),this.show_link_picker=!1},async createFiles({path_to_source_media_metas:t}){let e=[];t.map((t=>{const a=this.getFilename(t);e.push({meta_filename_in_project:a})})),await this.createModule({module_type:"files",source_medias:e}),this.show_file_picker=!1},async createCustomModule({module_type:t,addtl_meta:e}){await this.createModule({module_type:t,addtl_meta:e})},async createText(){const t="text-"+ +new Date+".txt",e=await this.$api.uploadText({path:this.publication_path,filename:t,content:"",additional_meta:{module_type:this.module_type}}),a=[{meta_filename:e}];await this.createModule({module_type:"text",source_medias:a})},async createModule({module_type:t,source_medias:e=[],addtl_meta:a={}}){if(e.length>0){const t=this.getSourceMedia({source_media:e[0],folder_path:this.publication_path});t?.$infos?.gps&&(a.location=t.$infos.gps)}const i=await this.createMetaForModule({module_type:t,source_medias:e,addtl_meta:a});return this.$emit("addModules",{meta_filenames:[i]}),this.show_module_selector=!1,i},async createMultipleModules({module_type:t,source_medias:e=[]}){let a=[];for(const i of e){const e=this.getSourceMedia({source_media:i,folder_path:this.publication_path});let s={};"page_by_page"===this.context&&e?.$infos?.ratio&&(s.height=this.$root.default_new_module_width*e.$infos.ratio),e?.$infos?.gps&&(s.location=e.$infos.gps);const o=await this.createMetaForModule({module_type:t,source_medias:[i],addtl_meta:s});a.push(o)}this.show_module_selector=!1,this.$emit("addModules",{meta_filenames:a})},async createMetaForModule({module_type:t,source_medias:e,addtl_meta:a}){let i={module_type:t,source_medias:e,requested_slug:"module"};return this.pre_addtl_meta&&Object.assign(i,this.pre_addtl_meta),a&&Object.assign(i,a),this.post_addtl_meta&&Object.assign(i,this.post_addtl_meta),await this.$api.uploadFile({path:this.publication_path,additional_meta:i}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t}))}}},m=p,h=(a(81162),(0,d.Z)(m,i,s,!1,null,"1435570e",null)),f=h.exports},84421:function(t,e,a){"use strict";a.r(e);var i=a(8081),s=a.n(i),o=a(23645),n=a.n(o),r=n()(s());r.push([t.id,"._linkPicker[data-v-a5930508]{width:100%;margin:0 auto}._addMediaBtn[data-v-a5930508]{text-align:center;padding:calc(var(--spacing)*1)}._selectBtn[data-v-a5930508]{display:flex;place-items:center;justify-content:center;width:100%;gap:calc(var(--spacing)/1);background:#fff}iframe[data-v-a5930508]{width:100%;aspect-ratio:4/3}",""]),e["default"]=r},68229:function(t,e,a){"use strict";a.r(e);var i=a(8081),s=a.n(i),o=a(23645),n=a.n(o),r=n()(s());r.push([t.id,"._cont[data-v-993a2d5e]{position:relative}._saveNotice[data-v-993a2d5e]{position:absolute;inset:-2px;background:hsla(0,0%,100%,.95);display:flex;justify-content:center;align-items:center}",""]),e["default"]=r},85283:function(t,e,a){"use strict";a.r(e);var i=a(8081),s=a.n(i),o=a(23645),n=a.n(o),r=n()(s());r.push([t.id,"._montageModules[data-v-1c510276]{padding:calc(var(--spacing)*2);max-width:600px;margin:0 auto;width:100%}._montageModules[data-v-1c510276]  ._moduleCreator{justify-content:center}._listOfModules[data-v-1c510276]{display:flex;flex-flow:column nowrap;justify-content:center}._lastModule[data-v-1c510276],._spacer[data-v-1c510276]{padding:calc(var(--spacing)*1)}._spacer[data-v-1c510276]{min-height:4rem;display:flex;align-items:center;justify-content:center;transition:all .2s linear}._spacer[data-v-1c510276]  ._moduleCreator{padding:calc(var(--spacing)/4);z-index:1;border-radius:0}._spacer[data-v-1c510276]  ._moduleCreator.is--collapsed{padding:0}._equationIcon[data-v-1c510276]{font-size:2em;line-height:1;margin:calc(var(--spacing)*2);color:#fff}._bottomRow[data-v-1c510276]{margin-top:calc(var(--spacing)*2);text-align:center}",""]),e["default"]=r},66523:function(t,e,a){"use strict";a.r(e);var i=a(8081),s=a.n(i),o=a(23645),n=a.n(o),r=n()(s());r.push([t.id,"._montageModule[data-v-05aa2e18]{position:relative;max-width:400px;display:flex;flex-flow:row nowrap;align-items:flex-start;width:100%;margin:0 auto;gap:calc(var(--spacing)/1);color:#fff}._montageModule:last-child ._line[data-v-05aa2e18]{height:100%}._line[data-v-05aa2e18]{position:absolute;background:#fff;width:4px;height:calc(100% + 3rem);margin-left:1.5rem;margin-top:2px;z-index:0;top:0;border-radius:4px}._index[data-v-05aa2e18]{position:sticky;top:0;font-size:5rem;font-family:Fira Mono;text-transform:uppercase;line-height:1;font-weight:600;z-index:1;background-color:var(--c-bleumarine)}._lastModule[data-v-05aa2e18]{margin-top:calc(var(--spacing)*2)}._preview[data-v-05aa2e18]{flex:1 1 auto;background:#fff;padding:calc(var(--spacing)/2);border-radius:4px;color:var(--c-noir)}._preview[data-v-05aa2e18]  ._mediaContent--image{max-width:none;width:100%}._topRow[data-v-05aa2e18]{display:flex;flex-flow:row wrap;justify-content:space-between}._imageDurationPicker[data-v-05aa2e18]{max-width:18ch;margin:calc(var(--spacing)/2) auto}._transitionPicker[data-v-05aa2e18]{text-align:center;margin:calc(var(--spacing)/2) auto}",""]),e["default"]=r},99526:function(t,e,a){"use strict";a.r(e);var i=a(8081),s=a.n(i),o=a(23645),n=a.n(o),r=n()(s());r.push([t.id,"._mediaPicker[data-v-32c4a41c]{position:absolute}",""]),e["default"]=r},66721:function(t,e,a){"use strict";a.r(e);var i=a(8081),s=a.n(i),o=a(23645),n=a.n(o),r=n()(s());r.push([t.id,"._moduleCreator[data-v-1435570e]{position:relative;display:flex;justify-content:flex-start;align-items:center;width:100%;pointer-events:none;gap:calc(var(--spacing)/4);color:var(--c-bleuvert);border-radius:1rem;--icon-size:1.2rem}._moduleCreator>*[data-v-1435570e]{pointer-events:auto}._typePicker[data-v-1435570e]{display:flex;flex-flow:row wrap;justify-content:flex-start;align-items:center;gap:calc(var(--spacing)/4)}._dropNotice[data-v-1435570e]{pointer-events:none}sl-icon-button[data-v-1435570e]::part(base){font-size:1.5em;color:var(--c-bleuvert)}._showModuleSelector[data-v-1435570e]{transition:all .4s cubic-bezier(.19,1,.22,1)}.u-addBtn[data-v-1435570e]{color:var(--c-noir)}",""]),e["default"]=r},20148:function(t,e,a){var i=a(84421);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var s=a(31982).Z;s("d9648a00",i,!0,{sourceMap:!1,shadowMode:!1})},95407:function(t,e,a){var i=a(68229);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var s=a(31982).Z;s("6c385c30",i,!0,{sourceMap:!1,shadowMode:!1})},35812:function(t,e,a){var i=a(85283);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var s=a(31982).Z;s("0f8df216",i,!0,{sourceMap:!1,shadowMode:!1})},54837:function(t,e,a){var i=a(66523);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var s=a(31982).Z;s("67d85b97",i,!0,{sourceMap:!1,shadowMode:!1})},20244:function(t,e,a){var i=a(99526);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var s=a(31982).Z;s("54ebc155",i,!0,{sourceMap:!1,shadowMode:!1})},81162:function(t,e,a){var i=a(66721);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var s=a(31982).Z;s("22a564ba",i,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=781.js.map