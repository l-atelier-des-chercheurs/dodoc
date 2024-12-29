(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[146],{50308:function(t,e,a){"use strict";a.d(e,{Z:function(){return d}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.$t("export")},on:{close:t.removeAndCloseModal}},[a("div",{staticClass:"_cont"},[t.created_video?[a("div",{staticClass:"_preview"},[a("MediaContent",{attrs:{file:t.created_video,resolution:1600,show_fs_button:!0,context:"full"}}),a("div",{staticClass:"u-spacingBottom"}),a("ShowExportedFileInfos",{attrs:{file:t.created_video}})],1)]:[t.possible_formats?a("div",{staticClass:"u-spacingBottom"},[a("DLabel",{attrs:{str:t.$t("format")}}),a("SelectField2",{attrs:{value:t.output_format,options:t.possible_formats,can_edit:!0,hide_validation:!0},on:{change:function(e){t.output_format=e}}})],1):t._e(),a("div",[a("DLabel",{attrs:{str:t.$t("quality")}}),a("div",{},[a("SelectField2",{attrs:{value:t.resolution_preset_picked,options:t.presets,can_edit:!0,hide_validation:!0},on:{change:function(e){t.resolution_preset_picked=e}}})],1),"custom"===t.resolution_preset_picked?a("div",[a("div",{staticClass:"u-spacingBottom"}),a("CustomResolutionInput",{attrs:{width:t.custom_resolution_width,height:t.custom_resolution_height,ratio:t.ref_infos.ratio,is_video:!0},on:{"update:width":function(e){t.custom_resolution_width=e},"update:height":function(e){t.custom_resolution_height=e}}}),a("div",{staticClass:"u-spacingBottom"}),a("NumberInput",{attrs:{label:t.$t("bitrate"),instructions:t.$t("bitrate_instructions"),value:t.custom_bitrate,min:0,suffix:"kbps",size:"normal"},on:{"update:value":function(e){t.custom_bitrate=e}}})],1):t._e()],1)]],2),a("template",{slot:"footer"},[t.created_video||t.is_exporting?t.is_exporting?[a("div",{key:"loader",staticClass:"_spinner"},[a("AnimatedCounter",{attrs:{value:t.progress_percent}})],1)]:a("div",{staticClass:"_bottomBtns"},[a("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:t.cancelExport}},[a("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("back"))+" ")],1),a("div",{staticClass:"_rightRow"},[a("a",{staticClass:"u-buttonLink",attrs:{disabled:!t.export_href,download:t.export_name,href:t.export_href,target:"_blank"}},[t._v(" "+t._s(t.$t("download"))+" ")]),a("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:t.saveToProject}},[a("span",{staticClass:"u-icon",domProps:{innerHTML:t._s(t.dodoc_icon_collect)}}),t._v(" "+t._s(t.$t("save_to_project"))+" ")])]),t.finished_saving_to_project?a("div",{staticClass:"_saveNotice"},[t._v(" "+t._s(t.$t("media_was_saved_to_project"))+" ")]):t._e()]):[a("div"),a("div",[a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.renderVideo}},[a("b-icon",{attrs:{icon:"tools"}}),t._v(" "+t._s(t.$t("preview_new"))+" ")],1),a("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("wont_remove_original").toLowerCase())+" ")])])]],2)],2)},o=[],s=(a(70560),a(83105)),n={props:{base_instructions:Object,make_path:String,reference_media:Object,possible_formats:Array,default_resolution_preset:{type:String,default:"source"}},components:{ShowExportedFileInfos:s.Z},data(){return{is_exporting:!1,finished_saving_to_project:!1,created_video:!1,resolution_preset_picked:this.default_resolution_preset,progress_percent:0,output_format:"mp4",custom_resolution_width:1920,custom_resolution_height:1080,custom_bitrate:4e3}},created(){},mounted(){this.reference_media&&(this.custom_resolution_width=this.ref_infos.width,this.custom_resolution_height=this.ref_infos.height)},beforeDestroy(){},watch:{},computed:{export_href(){return this.created_video?this.makeMediaFileURL({$path:this.created_video.$path,$media_filename:this.created_video.$media_filename}):""},export_name(){return this.created_video?this.created_video.$media_filename:""},ref_infos(){if(!this.reference_media)return{};let{width:t,height:e,ratio:a}=this.reference_media.$infos;return t&&(t=2*Math.ceil(t/2)),e&&(e=2*Math.ceil(e/2)),{width:t,height:e,ratio:a}},presets(){const t=[];return t.push({key:"source",text:this.$t("close_to_source"),width:this.ref_infos.width,height:this.ref_infos.height,bitrate:4e3}),t.push({key:"high",text:this.$t("high"),width:1920,height:1080,bitrate:4e3}),t.push({key:"medium",text:this.$t("medium"),width:1280,height:720,bitrate:2e3}),t.push({key:"rough",text:this.$t("rough"),width:640,height:360,bitrate:1e3}),t.push({key:"custom",text:"↓ "+this.$t("custom_f")}),t.map((t=>("custom"!==t.key&&(t.instructions=this.$t("resolution_w_h",{width:t.width,height:t.height})+", "+this.$t("bitrate_kbps",{bitrate:t.bitrate}).toLowerCase()),t)))}},methods:{async renderVideo(){this.progress_percent=0,this.is_exporting=!0,this.created_video=!1;let t=Object.assign({},this.base_instructions);const e={$origin:"make"};this.connected_as?.$path&&(e.$authors=[this.connected_as.$path]);let a=1920,i=1080,o=4e3;if("custom"===this.resolution_preset_picked)a=this.custom_resolution_width,i=this.custom_resolution_height,o=this.custom_bitrate;else{const t=this.presets.find((t=>t.key===this.resolution_preset_picked));a=t.width,i=t.height,o=t.bitrate}this.possible_formats&&(t.output_format=this.output_format);const s=await this.$api.exportFolder({path:this.make_path,instructions:{...t,output_width:a,output_height:i,video_bitrate:o,additional_meta:e}});this.$api.join({room:"task_"+s});const n=({task_id:t,progress:e})=>{t===s&&(this.progress_percent=e)};this.$eventHub.$on("task.status",n);const r=({task_id:t,message:e})=>{t===s&&(this.$eventHub.$off("task.ended",r),this.$api.leave({room:"task_"+s}),"completed"===e.event?(this.created_video=e.file,this.$nextTick((()=>{const t=this.$el.querySelector("video");t&&(t.volume=1)}))):"aborted"===e.event||"failed"===e.event&&e.info,this.progress_percent=100,this.is_exporting=!1)};this.$eventHub.$on("task.ended",r)},cancelExport(){this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.created_video=!1},removeAndCloseModal(){this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.$emit("close")},async saveToProject(){this.finished_saving_to_project=!0,this.$eventHub.$emit("pane.animate","collect"),setTimeout((()=>{this.$emit("close")}),3e3)}}},r=n,l=(a(30846),a(1001)),c=(0,l.Z)(r,i,o,!1,null,"c8de3440",null),d=c.exports},70146:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return b}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_montageModules"},[a("transition-group",{staticClass:"_listOfModules",attrs:{tag:"div",name:"StoryModules",appear:"",duration:700}},[t._l(t.section_modules_list,(function(e,i){return[a("div",{key:"mc_"+i,staticClass:"_spacer"},[a("ModuleCreator",{attrs:{publication_path:t.make.$path,types_available:["capture","import"],pick_from_types:["image","video"],available_modes:["photo","video"],context:"montage"},on:{addModules:function(e){var a=e.meta_filenames;return t.insertModules({meta_filenames:a,index:i})}}})],1),a("div",{key:e.$path},[a("MontageModule",{attrs:{index:i+1,makemodule:e,module_position:1===t.section_modules_list.length?"alone":0===i?"first":i===t.section_modules_list.length-1?"last":"inbetween",default_image_duration:t.default_image_duration},on:{moveUp:function(a){return t.moveModuleTo({path:e.$path,new_position:i-1})},moveDown:function(a){return t.moveModuleTo({path:e.$path,new_position:i+1})},remove:function(a){return t.removeModule(e.$path)}}})],1)]}))],2),a("div",{staticClass:"_lastModule"},[a("ModuleCreator",{attrs:{publication_path:t.make.$path,start_collapsed:!1,types_available:["capture","import"],pick_from_types:["image","video"],available_modes:["photo","video"],context:"montage"},on:{addModules:t.addModules}})],1),a("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.export_is_available?a("div",{staticClass:"_bottomRow"},[a("div",{staticClass:"_equationIcon"},[a("b-icon",{attrs:{icon:"chevron-double-down"}})],1),a("div",{},[a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){t.show_render_modal=!0}}},[a("b-icon",{attrs:{icon:"check"}}),t._v(" "+t._s(t.$t("create"))+" ")],1)])]):t._e()]),t.show_render_modal?a("ExportSaveMakeModal2",{attrs:{base_instructions:t.base_instructions,make_path:t.make.$path,reference_media:t.first_media,default_resolution_preset:"high"},on:{close:function(e){t.show_render_modal=!1}}}):t._e()],1)},o=[],s=(a(70560),a(43555)),n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_montageModule"},[a("div",{staticClass:"_line"}),a("div",{staticClass:"_index"},[a("div",{staticClass:"_btns"},[a("button",{staticClass:"u-button u-button_icon",attrs:{type:"button",disabled:"alone"===t.module_position||"first"===t.module_position},on:{click:function(e){return t.$emit("moveUp")}}},[a("b-icon",{attrs:{icon:"chevron-up"}})],1),a("button",{staticClass:"u-button u-button_icon",attrs:{type:"button",disabled:"alone"===t.module_position||"last"===t.module_position},on:{click:function(e){return t.$emit("moveDown")}}},[a("b-icon",{attrs:{icon:"chevron-down"}})],1)]),a("span",{staticClass:"_num"},[t._v(" "+t._s(t.index)+" ")])]),a("div",{staticClass:"_preview"},[a("div",{staticClass:"_topRow"},[a("div",{staticClass:"u-label"},[t.first_media?[t._v(" "+t._s(t.$t(t.first_media.$type))+" "),t.first_media_duration?[t._v("/ "+t._s(t.first_media_duration))]:t._e()]:t._e(),a("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.removeModule}},[a("b-icon",{attrs:{icon:"trash"}})],1)],2),a("div",{},[a("span",{staticClass:"u-switch u-switch-xs"},[a("input",{staticClass:"switch",attrs:{id:"transition_in_"+t.makemodule.$path,type:"checkbox"},domProps:{checked:"fade"===t.makemodule.transition_in},on:{change:function(e){return t.toggleTransition("transition_in")}}}),a("label",{staticClass:"u-label",attrs:{for:"transition_in_"+t.makemodule.$path}},[t._v(t._s(t.$t("transition_fade")))])])])]),t.first_media?["text"!==t.first_media.$type?a("MediaContent",{attrs:{file:t.first_media,resolution:1600,context:"full",show_fs_button:!0}}):a("CollaborativeEditor2",{ref:"textBloc",attrs:{path:t.first_media.$path,content:t.first_media.$content,line_selected:!1,can_edit:!0},on:{lineClicked:function(e){return t.$emit("lineClicked",e)},contentIsEdited:function(e){return t.$emit("contentIsEdited",e)},contentIsNotEdited:function(e){return t.$emit("contentIsNotEdited",e)}}}),"image"===t.first_media.$type?a("div",{staticClass:"_imageDurationPicker"},[a("NumberInput",{attrs:{value:t.makemodule.image_duration||t.default_image_duration,suffix:t.$t("seconds"),size:"medium",min:0,max:3600},on:{save:function(e){return t.updateMakemodule({image_duration:e})}}})],1):t._e(),"last"===t.module_position?a("div",{staticClass:"_transitionPicker"},[a("span",{staticClass:"u-switch u-switch-xs"},[a("input",{staticClass:"switch",attrs:{id:"transition_out_"+t.makemodule.$path,type:"checkbox"},domProps:{checked:"fade"===t.makemodule.transition_out},on:{change:function(e){return t.toggleTransition("transition_out")}}}),a("label",{staticClass:"u-label",attrs:{for:"transition_out_"+t.makemodule.$path}},[t._v(t._s(t.$t("transition_fade")))])])]):t._e()]:t._e()],2)])},r=[],l={props:{makemodule:Object,index:Number,module_position:String,default_image_duration:Number},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{first_media(){return this.firstMedia(this.makemodule)},first_media_duration(){return this.displayDuration({media:this.first_media})}},methods:{toggleTransition(t){"fade"===this.makemodule[t]?this.updateMakemodule({[t]:"none"}):this.updateMakemodule({[t]:"fade"})},async updateMakemodule(t){await this.$api.updateMeta({path:this.makemodule.$path,new_meta:t})},async removeModule(){await this.$api.deleteItem({path:this.makemodule.$path}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t})),this.$emit("remove")}}},c=l,d=(a(5239),a(1001)),u=(0,d.Z)(c,n,r,!1,null,"df9236b8",null),_=u.exports,p=a(50308),m={props:{make:Object},components:{ModuleCreator:s.Z,MontageModule:_,ExportSaveMakeModal2:p.Z},data(){return{show_render_modal:!1,default_image_duration:2}},async created(){this.sections&&0!==this.sections.length||await this.createSection2({publication:this.make,type:"section",group:"sections_list",title:"montage"})},mounted(){},beforeDestroy(){},watch:{},computed:{export_name(){return"video_montage.mp4"},export_is_available(){return this.section_modules_list.length>0},montage(){return this.section_modules_list.reduce(((t,e)=>{const a=this.firstMedia(e);if(a){let i={path:this.makeMediaFilePath({$path:a.$path,$media_filename:a.$media_filename}),type:a.$type,transition_in:e.transition_in,transition_out:e.transition_out};"image"===a.$type&&(i.image_duration=e.image_duration||this.default_image_duration),t.push(i)}return t}),[])},sections(){return this.getSectionsWithProps({publication:this.make,group:"sections_list"})},first_section(){return this.sections.at(0)},first_media(){if(this.section_modules_list.length>0){const t=this.section_modules_list.at(0);return this.firstMedia(t)}},first_media_ratio(){return this.first_media?.$infos?.ratio||void 0},section_modules_list(){return this.getModulesForSection({publication:this.make,section:this.first_section}).map((({_module:t})=>t))},base_instructions(){return{recipe:this.make.type,suggested_file_name:this.make.type,montage:this.montage}}},methods:{async addModules({meta_filenames:t}){await this.insertModuleMetaFilenamesToList2({publication:this.make,section:this.first_section,meta_filenames:t})},async insertModules({meta_filenames:t,index:e}){await this.insertModuleMetaFilenamesToList2({publication:this.make,section:this.first_section,index:e,meta_filenames:t})},async moveModuleTo({path:t,new_position:e}){await this.moveModuleTo2({publication:this.make,section:this.first_section,meta_filename:this.getFilename(t),new_position:e})},async duplicatePublicationMedia({source_module_path:t,copy_meta_filename:e}){const a=this.getFilename(t);await this.duplicatePublicationMedia2({publication:this.make,section:this.first_section,source_meta_filename:a,copy_meta_filename:e})},async removeModule(t){await this.removeModule2({publication:this.make,section:this.first_section,path:t})}}},h=m,f=(a(50006),(0,d.Z)(h,i,o,!1,null,"301ce8aa",null)),b=f.exports},53214:function(t,e,a){"use strict";a.d(e,{Z:function(){return c}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_mediaPicker"},[a("PickMediaFromProjects",{attrs:{title:"single"===t.select_mode?t.$t("pick_media"):t.$t("pick_medias"),path:t.current_project_path,select_mode:t.select_mode,pick_from_types:t.pick_from_types},on:{addMedias:function(e){return t.$emit("addMedias",e)},close:function(e){return t.$emit("close")}}})],1)},o=[],s={props:{publication_path:String,select_mode:{type:String,default:"multiple"},pick_from_types:[String,Array]},components:{},data(){return{}},async created(){},beforeDestroy(){},watch:{},computed:{current_project_path(){const t=this.getParent(this.publication_path);return this.getParent(t)}},methods:{}},n=s,r=(a(69102),a(1001)),l=(0,r.Z)(n,i,o,!1,null,"602d0e25",null),c=l.exports},43555:function(t,e,a){"use strict";a.d(e,{Z:function(){return k}});var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_moduleCreator",class:{"is--collapsed":!t.show_module_selector}},[a("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.show_module_selector||!t.start_collapsed?a("div",{staticClass:"_typePicker"},[t.types_available.includes("capture")?a("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:function(e){t.show_capture_modal=!0}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"record-circle-fill"}}),t.show_labels?[t._v(t._s(t.$t("capture")))]:t._e()],2):t._e(),t.show_capture_modal?a("CaptureModal",{attrs:{path:t.project_path,available_modes:t.available_modes},on:{createMosaic:t.createMosaic,close:function(e){t.show_capture_modal=!1}}}):t._e(),t.types_available.includes("import")?a("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:function(e){t.show_media_picker=!0}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"image"}}),t.show_labels?[t._v(t._s(t.$t("import")))]:t._e()],2):t._e(),t.show_media_picker?a("MediaPicker",{attrs:{publication_path:t.publication_path,select_mode:t.select_mode,pick_from_types:t.pick_from_types},on:{addMedias:t.createMosaic,close:function(e){t.show_media_picker=!1}}}):t._e(),t.types_available.includes("write")?a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createText}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"fonts"}}),t.show_labels?[t._v(t._s(t.$t("write")))]:t._e()],2):t._e(),t.types_available.includes("embed")?a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){t.show_link_picker=!0}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"link"}}),t.show_labels?[t._v(t._s(t.$t("embed")))]:t._e()],2):t._e(),t.show_link_picker?a("EmbedPicker",{on:{embed:t.createEmbed,close:function(e){t.show_link_picker=!1}}}):t._e(),t.types_available.includes("table")?a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createTable}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"table"}}),t.show_labels?[t._v(t._s(t.$t("table")))]:t._e()],2):t._e(),t.types_available.includes("shapes")?t._l(t.shapes,(function(e){return a("button",{key:e.type,staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(a){return t.createCustomModule({module_type:e.type,addtl_meta:e.addtl_meta})}}},[a("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:e.icon}}),t.show_labels?[t._v(t._s(t.$t(e.type)))]:t._e()],2)})):t._e(),t.start_collapsed?a("EditBtn",{key:"addmodule",attrs:{btn_type:"close",is_unfolded:!1},on:{click:function(e){t.show_module_selector=!1}}}):t._e()],2):t.start_collapsed&&!t.show_module_selector?a("EditBtn",{key:"addmodule",staticClass:"_addBtn",attrs:{btn_type:"add",is_unfolded:!1},on:{click:function(e){t.show_module_selector=!0}}}):t._e()],1),a("DropZone",{staticClass:"_dropZone",on:{mediaDropped:t.mediaDropped}})],1)},o=[],s=(a(70560),a(76801),function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.$t("capture"),size:"full"},on:{close:function(e){return t.$emit("close")}}},[a("CaptureView",{attrs:{path:t.path,selected_mode:t.selected_mode,stopmotion_slug:t.stopmotion_slug,available_modes:t.available_modes},on:{changeMode:function(e){t.selected_mode=e},openStopmotion:function(e){t.stopmotion_slug=e},insertMedia:t.insertMedia}})],1)}),n=[],r={props:{path:String,available_modes:Array},components:{CaptureView:()=>a.e(771).then(a.bind(a,54771))},data(){return{selected_mode:"photo",stopmotion_slug:void 0}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async insertMedia(t){const e=this.path+"/"+t,a=[e];this.$emit("createMosaic",{path_to_source_media_metas:a}),this.$emit("close")}}},l=r,c=a(1001),d=(0,c.Z)(l,s,n,!1,null,"888c14fc",null),u=d.exports,_=a(53214),p=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.$t("embed")},on:{close:function(e){return t.$emit("close")}}},[a("div",{staticClass:"_linkPicker"},[a("div",{staticClass:"_urlBox"},[a("TextInput",{attrs:{label_str:t.$t("input_url"),instructions:t.$t("input_url_instr"),content:t.full_url,placeholder:"https://",required:!0,input_type:"url"},on:{"update:content":function(e){t.full_url=e},toggleValidity:function(e){return t.allow_save=e}}})],1),a("div",{staticClass:"u-instructions"},[a("small",{staticClass:"_examples"},[t._v(" "+t._s(t.$t("for_example"))+" "),t._l([{url:"https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde",label:"PeerTube"},{url:"https://www.youtube.com/watch?v=Bn6zdyCAwJs",label:"Youtube"},{url:"https://vimeo.com/447785086",label:"Vimeo"},{url:"https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas",label:"Observable"}],(function(e,i){return a("button",{key:i,staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{innerHTML:t._s(e.label)},on:{click:function(a){t.full_url=e.url}}})}))],2)]),t.url_to_site?a("div",{key:t.full_url},["any"===t.url_to_site.type?[a("iframe",{staticClass:"_siteIframe",attrs:{src:t.url_to_site.src,frameborder:"0"}})]:a("vue-plyr",[a("div",{staticClass:"plyr__video-embed"},[a("iframe",{attrs:{src:t.url_to_site.src,allowfullscreen:"",allowtransparency:"",allow:"autoplay; fullscreen",sandbox:"allow-same-origin allow-scripts allow-popups",frameborder:"0"}})])])],2):t._e()]),a("template",{slot:"footer"},[a("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[a("b-icon",{attrs:{icon:"x-circle"}}),t._v(" "+t._s(t.$t("cancel"))+" ")],1),a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button",disabled:!t.full_url},on:{click:function(e){return t.$emit("embed",t.full_url)}}},[t._v(" "+t._s(t.$t("embed"))+" ")])])],2)},m=[],h={props:{},components:{},data(){return{full_url:""}},async created(){},beforeDestroy(){},watch:{},computed:{url_to_site(){return!!this.full_url&&this.transformURL({url:this.full_url,autoplay:!1})}},methods:{}},f=h,b=(a(99273),(0,c.Z)(f,p,m,!1,null,"1d3ca044",null)),v=b.exports,g={props:{publication_path:String,pre_addtl_meta:Object,post_addtl_meta:Object,select_mode:String,pick_from_types:[String,Array],available_modes:Array,show_labels:{type:Boolean,default:!0},context:String,types_available:{type:Array,default:()=>["capture","import","write","embed","table","shapes"]},start_collapsed:{type:Boolean,default:!0}},components:{CaptureModal:u,MediaPicker:_.Z,EmbedPicker:v},data(){return{show_capture_modal:!1,show_module_selector:!1,show_media_picker:!1,show_file_picker:!1,show_link_picker:!1,shapes:[{type:"ellipsis",icon:"circle-fill",addtl_meta:{background_color:"#1d327f"}},{type:"rectangle",icon:"square-fill",addtl_meta:{background_color:"#ffbe32"}},{type:"line",icon:"dash-lg",addtl_meta:{outline_width:1,outline_color:"#000000"}},{type:"arrow",icon:"arrow-right-square",addtl_meta:{outline_width:1,outline_color:"#000000"}}],is_saving:!1}},created(){},mounted(){},beforeDestroy(){},watch:{show_module_selector(){}},computed:{project_path(){return"link"===this.$root.publication_include_mode?this.getParent(this.getParent(this.publication_path)):this.publication_path}},methods:{async mediaDropped({path_to_source_media_metas:t}){this.createMosaic({path_to_source_media_metas:t})},async createMosaic({meta_filename:t,path_to_source_media_metas:e}){let a=[];if(t)a.push({meta_filename:t});else if(e)for(const i of e){const t=this.$root.publication_include_mode,e=await this.prepareMediaForPublication({path_to_source_media_meta:i,publication_path:this.publication_path,import_mode:t});a.push(e)}"page_by_page"===this.context&&(a=a.map((t=>(t.objectFit="contain",t)))),["page_by_page","montage"].includes(this.context)?await this.createMultipleModules({module_type:"mosaic",source_medias:a}):await this.createModule({module_type:"mosaic",source_medias:a}),this.show_media_picker=!1},async createEmbed(t){const e="url-"+ +new Date+".txt",{meta_filename:a}=await this.$api.uploadText({path:this.publication_path,filename:e,content:t,additional_meta:{$type:"url"}});this.createMosaic({meta_filename:a}),this.show_link_picker=!1},async createFiles({path_to_source_media_metas:t}){let e=[];t.map((t=>{const a=this.getFilename(t);e.push({meta_filename_in_project:a})})),await this.createModule({module_type:"files",source_medias:e}),this.show_file_picker=!1},async createCustomModule({module_type:t,addtl_meta:e}){await this.createModule({module_type:t,addtl_meta:e})},async createText(){const t="text-"+ +new Date+".txt",{meta_filename:e}=await this.$api.uploadText({path:this.publication_path,filename:t,content:""}),a=[{meta_filename:e}],i="page_by_page"===this.context?"text":"mosaic";await this.createModule({module_type:i,source_medias:a})},async createTable(){const t="table-"+ +new Date+".json",{meta_filename:e}=await this.$api.uploadText({path:this.publication_path,filename:t,content:JSON.stringify([[{content:""},{content:""}],[{content:""},{content:""}]],null,4),additional_meta:{$type:"table"}});this.createMosaic({meta_filename:e}),this.show_link_picker=!1},async createModule({module_type:t,source_medias:e=[],addtl_meta:a={}}){if(e.length>0){const t=this.getSourceMedia({source_media:e[0],folder_path:this.publication_path});t?.$location&&(a.location=t.$location)}const i=await this.createMetaForModule({module_type:t,source_medias:e,addtl_meta:a});return this.$emit("addModules",{meta_filenames:[i]}),this.show_module_selector=!1,i},async createMultipleModules({module_type:t,source_medias:e=[]}){let a=[];for(const i of e){const e=this.getSourceMedia({source_media:i,folder_path:this.publication_path});let o={};["page_by_page","montage"].includes(this.context)&&e?.$infos?.ratio&&this.pre_addtl_meta?.width&&(o.height=this.pre_addtl_meta.width*e.$infos.ratio),e?.$location&&(o.location=e.$location);const s=await this.createMetaForModule({module_type:t,source_medias:[i],addtl_meta:o});a.push(s)}this.show_module_selector=!1,this.$emit("addModules",{meta_filenames:a})},async createMetaForModule({module_type:t,source_medias:e,addtl_meta:a}){let i={module_type:t,source_medias:e,requested_slug:"module"};this.pre_addtl_meta&&Object.assign(i,this.pre_addtl_meta),a&&Object.assign(i,a),this.post_addtl_meta&&Object.assign(i,this.post_addtl_meta);const{meta_filename:o}=await this.$api.uploadFile({path:this.publication_path,additional_meta:i}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t}));return o}}},w=g,y=(a(96384),(0,c.Z)(w,i,o,!1,null,"543db964",null)),k=y.exports},88945:function(t,e,a){"use strict";a.r(e);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),r=n()(o());r.push([t.id,"._linkPicker[data-v-1d3ca044]{width:100%;margin:0 auto}._addMediaBtn[data-v-1d3ca044]{text-align:center;padding:calc(var(--spacing)*1)}iframe[data-v-1d3ca044]{width:100%;aspect-ratio:4/3}._examples[data-v-1d3ca044]{display:inline-flex;flex-flow:row wrap;gap:calc(var(--spacing)/2)}",""]),e["default"]=r},50218:function(t,e,a){"use strict";a.r(e);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),r=n()(o());r.push([t.id,"._saveNotice[data-v-c8de3440]{inset:-2px;background:hsla(0,0%,100%,.95)}._saveNotice[data-v-c8de3440],._spinner[data-v-c8de3440]{position:absolute;display:flex;justify-content:center;align-items:center}._spinner[data-v-c8de3440]{top:0;left:0;right:0;bottom:0;background-color:hsla(0,0%,100%,.7);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}._bottomBtns[data-v-c8de3440]{flex-flow:row wrap;justify-content:space-between;width:100%}._bottomBtns[data-v-c8de3440],._rightRow[data-v-c8de3440]{display:flex;align-items:center;gap:calc(var(--spacing)/2)}._rightRow[data-v-c8de3440]{flex-flow:row nowrap;justify-content:flex-end}",""]),e["default"]=r},39999:function(t,e,a){"use strict";a.r(e);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),r=n()(o());r.push([t.id,"._montageModules[data-v-301ce8aa]{padding:calc(var(--spacing)*1);max-width:680px;margin:0 auto;width:100%}._montageModules[data-v-301ce8aa]  ._moduleCreator{justify-content:center}._listOfModules[data-v-301ce8aa]{display:flex;flex-flow:column nowrap;justify-content:center}._lastModule[data-v-301ce8aa],._spacer[data-v-301ce8aa]{padding:calc(var(--spacing)*1)}._spacer[data-v-301ce8aa]{min-height:4rem;display:flex;align-items:center;justify-content:center;transition:all .2s linear}._spacer[data-v-301ce8aa]  ._moduleCreator{padding:calc(var(--spacing)/4);z-index:1;border-radius:0}._spacer[data-v-301ce8aa]  ._moduleCreator.is--collapsed{padding:0}._equationIcon[data-v-301ce8aa]{font-size:2em;line-height:1;margin:calc(var(--spacing)*2);color:#fff}._bottomRow[data-v-301ce8aa]{margin-top:calc(var(--spacing)*2);text-align:center}",""]),e["default"]=r},42086:function(t,e,a){"use strict";a.r(e);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),r=n()(o());r.push([t.id,"._montageModule[data-v-df9236b8]{position:relative;max-width:400px;display:flex;flex-flow:row nowrap;align-items:flex-start;width:100%;margin:0 auto;gap:calc(var(--spacing)/1);color:#fff}._montageModule:last-child ._line[data-v-df9236b8]{height:100%}._line[data-v-df9236b8]{position:absolute;background:#fff;width:4px;height:calc(100% + 3rem);margin-left:3.1rem;margin-top:2px;z-index:0;top:0;border-radius:4px}._index[data-v-df9236b8]{position:sticky;top:0;font-family:Fira Mono;text-transform:uppercase;line-height:1;font-weight:600;z-index:1;background-color:var(--c-bleumarine);margin-top:-9px;display:flex;flex-flow:row nowrap;align-items:center}._index ._btns[data-v-df9236b8]{display:flex;flex-flow:column nowrap}._index ._btns>.u-button[data-v-df9236b8]{font-size:140%}._index ._num[data-v-df9236b8]{font-size:5rem}._index>.u-button[data-v-df9236b8]{font-size:50%}._lastModule[data-v-df9236b8]{margin-top:calc(var(--spacing)*2)}._preview[data-v-df9236b8]{flex:1 1 auto;background:#fff;padding:calc(var(--spacing)/2);border-radius:4px;color:var(--c-noir)}._preview[data-v-df9236b8]  ._mediaContent--image{max-width:none;width:100%}._topRow[data-v-df9236b8]{display:flex;flex-flow:row wrap;justify-content:space-between}._imageDurationPicker[data-v-df9236b8]{max-width:18ch;margin:calc(var(--spacing)/2) auto}._transitionPicker[data-v-df9236b8]{text-align:center;margin:calc(var(--spacing)/2) auto}",""]),e["default"]=r},21031:function(t,e,a){"use strict";a.r(e);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),r=n()(o());r.push([t.id,"._mediaPicker[data-v-602d0e25]{position:absolute}",""]),e["default"]=r},1507:function(t,e,a){"use strict";a.r(e);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),r=n()(o());r.push([t.id,"._moduleCreator[data-v-543db964]{position:relative;display:flex;justify-content:flex-start;align-items:center;width:100%;pointer-events:none;gap:calc(var(--spacing)/4);padding:calc(var(--spacing)/2) 0;transition:all .5s cubic-bezier(.19,1,.22,1);--icon-size:1.2rem}._moduleCreator.is--collapsed[data-v-543db964]{padding:0}._moduleCreator>*[data-v-543db964]{pointer-events:auto}._typePicker[data-v-543db964]{display:flex;flex-flow:row wrap;justify-content:flex-start;align-items:center;gap:calc(var(--spacing)/4)}._dropNotice[data-v-543db964]{pointer-events:none}._showModuleSelector[data-v-543db964]{transition:all .4s cubic-bezier(.19,1,.22,1)}._addBtn[data-v-543db964]{margin-left:-24px}",""]),e["default"]=r},99273:function(t,e,a){var i=a(88945);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(20730).Z;o("84d91a2a",i,!0,{sourceMap:!1,shadowMode:!1})},30846:function(t,e,a){var i=a(50218);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(20730).Z;o("957b6eee",i,!0,{sourceMap:!1,shadowMode:!1})},50006:function(t,e,a){var i=a(39999);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(20730).Z;o("719bc922",i,!0,{sourceMap:!1,shadowMode:!1})},5239:function(t,e,a){var i=a(42086);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(20730).Z;o("23d38ba8",i,!0,{sourceMap:!1,shadowMode:!1})},69102:function(t,e,a){var i=a(21031);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(20730).Z;o("2a905ab4",i,!0,{sourceMap:!1,shadowMode:!1})},96384:function(t,e,a){var i=a(1507);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(20730).Z;o("9243c7fe",i,!0,{sourceMap:!1,shadowMode:!1})}}]);