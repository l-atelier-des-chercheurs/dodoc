(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[184],{67777:function(t,e,a){"use strict";a.d(e,{A:function(){return d}});var i=function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("export")},on:{close:t.removeAndCloseModal}},[e("div",{staticClass:"_cont"},[t.created_video?[e("div",{staticClass:"_preview"},[e("MediaContent",{attrs:{file:t.created_video,resolution:1600,show_fs_button:!0,context:"full"}}),e("div",{staticClass:"u-spacingBottom"}),e("ShowExportedFileInfos",{attrs:{file:t.created_video}})],1)]:[t.possible_formats?e("div",{staticClass:"u-spacingBottom"},[e("DLabel",{attrs:{str:t.$t("format")}}),e("SelectField2",{attrs:{value:t.output_format,options:t.possible_formats,can_edit:!0,hide_validation:!0},on:{change:function(e){t.output_format=e}}})],1):t._e(),e("div",[e("DLabel",{attrs:{str:t.$t("quality")}}),e("div",{},[e("SelectField2",{attrs:{value:t.resolution_preset_picked,options:t.presets,can_edit:!0,hide_validation:!0},on:{change:function(e){t.resolution_preset_picked=e}}})],1),"custom"===t.resolution_preset_picked?e("div",[e("div",{staticClass:"u-spacingBottom"}),e("CustomResolutionInput",{attrs:{width:t.custom_resolution_width,height:t.custom_resolution_height,ratio:t.ref_infos.ratio,is_video:!0},on:{"update:width":function(e){t.custom_resolution_width=e},"update:height":function(e){t.custom_resolution_height=e}}}),e("div",{staticClass:"u-spacingBottom"}),e("NumberInput",{attrs:{label:t.$t("bitrate"),instructions:t.$t("bitrate_instructions"),value:t.custom_bitrate,min:0,suffix:"kbps",size:"normal"},on:{"update:value":function(e){t.custom_bitrate=e}}})],1):t._e()],1),t.allow_disable_audio?e("div",[e("div",{staticClass:"u-spacingBottom"}),e("ToggleInput",{attrs:{content:t.keep_audio_track,label:t.$t("keep_audio_track")},on:{"update:content":function(e){t.keep_audio_track=e}}})],1):t._e()]],2),e("template",{slot:"footer"},[t.created_video||t.is_exporting?t.is_exporting?[e("div",{key:"loader",staticClass:"_spinner"},[e("AnimatedCounter",{attrs:{value:t.progress_percent}})],1)]:e("div",{staticClass:"_bottomBtns"},[e("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:t.cancelExport}},[e("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("back"))+" ")],1),e("div",{staticClass:"_rightRow"},[e("a",{staticClass:"u-buttonLink",attrs:{disabled:!t.export_href,download:t.export_name,href:t.export_href,target:"_blank"}},[t._v(" "+t._s(t.$t("download"))+" ")]),e("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:t.saveToProject}},[e("span",{staticClass:"u-icon",domProps:{innerHTML:t._s(t.dodoc_icon_collect)}}),t._v(" "+t._s(t.$t("save_to_project"))+" ")])]),t.finished_saving_to_project?e("div",{staticClass:"_saveNotice"},[t._v(" "+t._s(t.$t("media_was_saved_to_project"))+" ")]):t._e()]):[e("div"),e("div",[e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.renderVideo}},[e("b-icon",{attrs:{icon:"tools"}}),t._v(" "+t._s(t.$t("preview_new"))+" ")],1),e("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("wont_remove_original").toLowerCase())+" ")])])]],2)],2)},o=[],s=(a(44114),a(34928)),n={props:{base_instructions:Object,make_path:String,reference_media:Object,possible_formats:Array,allow_disable_audio:Boolean,default_resolution_preset:{type:String,default:"source"}},components:{ShowExportedFileInfos:s.A},data(){return{is_exporting:!1,finished_saving_to_project:!1,created_video:!1,resolution_preset_picked:this.default_resolution_preset,progress_percent:0,output_format:"mp4",custom_resolution_width:1920,custom_resolution_height:1080,custom_bitrate:4e3,keep_audio_track:!0}},created(){},mounted(){this.reference_media&&(this.custom_resolution_width=this.ref_infos.width,this.custom_resolution_height=this.ref_infos.height)},beforeDestroy(){},watch:{},computed:{export_href(){return this.created_video?this.makeMediaFileURL({$path:this.created_video.$path,$media_filename:this.created_video.$media_filename}):""},export_name(){return this.created_video?this.created_video.$media_filename:""},ref_infos(){if(!this.reference_media)return{};let{width:t,height:e,ratio:a}=this.reference_media.$infos;return t&&(t=2*Math.ceil(t/2)),e&&(e=2*Math.ceil(e/2)),{width:t,height:e,ratio:a}},presets(){const t=[];return t.push({key:"source",text:this.$t("close_to_source"),width:this.ref_infos.width,height:this.ref_infos.height,bitrate:4e3}),t.push({key:"high",text:this.$t("high"),width:1920,height:1080,bitrate:4e3}),t.push({key:"medium",text:this.$t("medium"),width:1280,height:720,bitrate:2e3}),t.push({key:"rough",text:this.$t("rough"),width:640,height:360,bitrate:1e3}),t.push({key:"custom",text:"↓ "+this.$t("custom_f")}),t.map((t=>("custom"!==t.key&&(t.instructions=this.$t("resolution_w_h",{width:t.width,height:t.height})+", "+this.$t("bitrate_kbps",{bitrate:t.bitrate}).toLowerCase()),t)))}},methods:{async renderVideo(){this.progress_percent=0,this.is_exporting=!0,this.created_video=!1;let t=Object.assign({},this.base_instructions);const e={$origin:"make"};this.connected_as?.$path&&(e.$authors=[this.connected_as.$path]);let a=1920,i=1080,o=4e3;if("custom"===this.resolution_preset_picked)a=this.custom_resolution_width,i=this.custom_resolution_height,o=this.custom_bitrate;else{const t=this.presets.find((t=>t.key===this.resolution_preset_picked));a=t.width,i=t.height,o=t.bitrate}this.possible_formats&&(t.output_format=this.output_format),this.allow_disable_audio&&(t.keep_audio_track=this.keep_audio_track);const s=await this.$api.exportFolder({path:this.make_path,instructions:{...t,output_width:a,output_height:i,video_bitrate:o,additional_meta:e}});this.$api.join({room:"task_"+s});const n=({task_id:t,progress:e})=>{t===s&&(this.progress_percent=e)};this.$eventHub.$on("task.status",n);const r=({task_id:t,message:e})=>{t===s&&(this.$eventHub.$off("task.ended",r),this.$api.leave({room:"task_"+s}),"completed"===e.event?(this.created_video=e.file,this.$nextTick((()=>{const t=this.$el.querySelector("video");t&&(t.volume=1)}))):"aborted"===e.event||"failed"===e.event&&e.info,this.progress_percent=100,this.is_exporting=!1)};this.$eventHub.$on("task.ended",r)},cancelExport(){this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.created_video=!1},removeAndCloseModal(){this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.$emit("close")},async saveToProject(){this.finished_saving_to_project=!0,this.$eventHub.$emit("pane.animate","collect"),setTimeout((()=>{this.$emit("close")}),3e3)}}},r=n,l=(a(72634),a(81656)),c=(0,l.A)(r,i,o,!1,null,"4703eca1",null),d=c.exports},27184:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return b}});var i=function(){var t=this,e=t._self._c;return e("div",[e("transition-group",{staticClass:"_listOfModules",attrs:{tag:"div",name:"StoryModules",appear:""}},[t._l(t.section_modules_list,(function(a,i){return e("div",{key:a.$path},[e("StopmotionModule",{attrs:{index:i,makemodule:a,number_of_modules:t.section_modules_list.length,imposed_ratio:t.first_media_ratio,module_position:1===t.section_modules_list.length?"alone":0===i?"first":i===t.section_modules_list.length-1?"last":"inbetween"},on:{moveTo:t.moveModuleTo,moveUp:function(e){return t.moveModuleTo({path:a.$path,new_position:i-1})},moveDown:function(e){return t.moveModuleTo({path:a.$path,new_position:i+1})},remove:t.removeModule}})],1)})),e("ModuleCreator",{key:"mc_0",attrs:{publication_path:t.make.$path,start_collapsed:!1,types_available:["capture","import"],pick_from_types:["image"],context:"montage"},on:{addModules:t.addModules}})],2),e("transition",{attrs:{name:"pagechange",mode:"out-in"}},[e("div",{staticClass:"_bottomRow"},[e("div",{staticClass:"_equationIcon"},[e("b-icon",{attrs:{icon:"chevron-double-down"}})],1),e("div",[e("div",{staticClass:"_create"},[e("div",{staticClass:"_fpsPick"},[e("RangeValueInput",{attrs:{can_toggle:!1,label:t.$t("img_per_second"),value:t.frame_rate,min:2,max:30,step:1,ticks:[2,4,8,15,24,30],default_value:4},on:{save:t.updateFrameRate}})],1),e("button",{staticClass:"u-button u-button_bleumarine",attrs:{type:"button",disabled:!t.export_is_available},on:{click:function(e){t.show_render_modal=!0}}},[e("b-icon",{attrs:{icon:"check"}}),t._v(" "+t._s(t.$t("make"))+" ")],1)])])])]),t.show_render_modal?e("ExportSaveMakeModal2",{attrs:{base_instructions:t.base_instructions,make_path:t.make.$path,reference_media:t.first_media,possible_formats:t.possible_formats,default_resolution_preset:"high"},on:{close:function(e){t.show_render_modal=!1}}}):t._e()],1)},o=[],s=(a(44114),a(58745)),n=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_stopmotionModule"},[e("div",{staticClass:"_mediaContainer",style:{"--aspectRatio":t.imposed_ratio}},[e("MediaContent",{attrs:{file:t.first_media}})],1),e("div",{staticClass:"_bottomBar"},[e("button",{staticClass:"u-button u-button_icon u-button_small",attrs:{type:"button",disabled:"alone"===t.module_position||"first"===t.module_position},on:{click:function(e){return t.$emit("moveUp")}}},[e("b-icon",{attrs:{icon:"chevron-left"}})],1),e("select",{attrs:{size:"small"},domProps:{value:t.index+1},on:{change:function(e){return t.$emit("moveTo",{path:t.makemodule.$path,new_position:+e.target.value-1})}}},t._l(t.number_of_modules,(function(a){return e("option",{key:a,domProps:{value:a}},[t._v(" "+t._s(a)+" ")])})),0),e("button",{staticClass:"u-button u-button_icon u-button_small",attrs:{type:"button",disabled:"alone"===t.module_position||"last"===t.module_position},on:{click:function(e){return t.$emit("moveDown")}}},[e("b-icon",{attrs:{icon:"chevron-right"}})],1),e("div",{staticClass:"_options"},[e("RemoveMenu",{attrs:{path:t.makemodule.$path,remove_text:t.$t("remove_image"),show_button_text:!1},on:{remove:t.removeModule},scopedSlots:t._u([{key:"content",fn:function(){return[e("MediaContent",{attrs:{file:t.first_media,resolution:440}})]},proxy:!0}])})],1)])])},r=[],l={props:{index:Number,makemodule:Object,number_of_modules:Number,imposed_ratio:Number,module_position:String},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{first_media(){return this.firstMedia(this.makemodule)}},methods:{async removeModule(){await this.$api.deleteItem({path:this.makemodule.$path}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t})),this.$emit("remove",this.makemodule.$path)}}},c=l,d=(a(89456),a(81656)),u=(0,d.A)(c,n,r,!1,null,"9871837c",null),_=u.exports,p=a(67777),m={props:{make:Object},components:{ModuleCreator:s.A,StopmotionModule:_,ExportSaveMakeModal2:p.A},data(){return{show_render_modal:!1,is_exporting:!1,created_video:!1,export_href:void 0,frame_rate:this.make.frame_rate||4,custom_resolution_width:1920,custom_resolution_height:1080,resolution_preset_picked:"original"}},async created(){this.sections&&0!==this.sections.length||await this.createSection2({publication:this.make,type:"section",group:"sections_list",title:"stopmotion"})},mounted(){},beforeDestroy(){},watch:{first_media:{handler(){if(!this.first_media?.$infos)return;const{width:t,height:e}=this.first_media.$infos;t&&e&&(this.custom_resolution_width=t,this.custom_resolution_height=e)},immediate:!0},"make.frame_rate":{handler(){this.frame_rate=this.make.frame_rate},immediate:!0}},computed:{possible_formats(){return[{key:"mp4",text:this.$t("video_mp4")},{key:"gif",text:this.$t("video_gif")}]},export_is_available(){return this.section_modules_list.length>0},sections(){return this.getSectionsWithProps({publication:this.make,group:"sections_list"})},first_section(){return this.sections.at(0)},first_media(){if(this.section_modules_list.length>0){const t=this.section_modules_list.at(0);return this.firstMedia(t)}},section_modules_list(){return this.getModulesForSection({publication:this.make,section:this.first_section}).map((({_module:t})=>t))},first_media_ratio(){return this.first_media?.$infos?.ratio||void 0},base_instructions(){const t="stopmotion_animation",e=this.section_modules_list.reduce(((t,e)=>{const a=e.source_medias[0]?.meta_filename_in_project;return a&&t.push({m:a,d:1}),t}),[]);return{recipe:t,images_meta:e,frame_rate:this.frame_rate}}},methods:{async addModules({meta_filenames:t}){await this.insertModuleMetaFilenamesToList2({publication:this.make,section:this.first_section,meta_filenames:t})},async insertModules({meta_filenames:t,index:e}){await this.insertModuleMetaFilenamesToList2({publication:this.make,section:this.first_section,index:e,meta_filenames:t})},async moveModuleTo({path:t,new_position:e}){await this.moveModuleTo2({publication:this.make,section:this.first_section,meta_filename:this.getFilename(t),new_position:e})},async removeModule(t){await this.removeModule2({publication:this.make,section:this.first_section,path:t})},updateFrameRate(t){this.$api.updateMeta({path:this.make.$path,new_meta:{frame_rate:t}})}}},h=m,f=(a(23118),(0,d.A)(h,i,o,!1,null,"15a9c490",null)),b=f.exports},37207:function(t,e,a){"use strict";a.d(e,{A:function(){return c}});var i=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_mediaPicker"},[e("PickMediaFromProjects",{attrs:{title:"single"===t.select_mode?t.$t("pick_media"):t.$t("pick_medias"),path:t.current_project_path,select_mode:t.select_mode,pick_from_types:t.pick_from_types},on:{addMedias:function(e){return t.$emit("addMedias",e)},close:function(e){return t.$emit("close")}}})],1)},o=[],s={props:{publication_path:String,select_mode:{type:String,default:"multiple"},pick_from_types:[String,Array]},components:{},data(){return{}},async created(){},beforeDestroy(){},watch:{},computed:{current_project_path(){const t=this.getParent(this.publication_path);return this.getParent(t)}},methods:{}},n=s,r=(a(8536),a(81656)),l=(0,r.A)(n,i,o,!1,null,"602d0e25",null),c=l.exports},58745:function(t,e,a){"use strict";a.d(e,{A:function(){return k}});a(74423);var i=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_moduleCreator",class:{"is--collapsed":!t.show_module_selector}},[e("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.show_module_selector||!t.start_collapsed?e("div",{staticClass:"_typePicker"},[t.types_available.includes("capture")?e("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:function(e){t.show_capture_modal=!0}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"record-circle-fill"}}),t.show_labels?[t._v(t._s(t.$t("capture")))]:t._e()],2):t._e(),t.show_capture_modal?e("CaptureModal",{attrs:{path:t.project_path,available_modes:t.available_modes},on:{createMosaic:t.createMosaic,close:function(e){t.show_capture_modal=!1}}}):t._e(),t.types_available.includes("import")?e("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:function(e){t.show_media_picker=!0}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"image"}}),t.show_labels?[t._v(t._s(t.$t("import")))]:t._e()],2):t._e(),t.show_media_picker?e("MediaPicker",{attrs:{publication_path:t.publication_path,select_mode:t.select_mode,pick_from_types:t.pick_from_types},on:{addMedias:t.createMosaic,close:function(e){t.show_media_picker=!1}}}):t._e(),t.types_available.includes("write")?e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createText}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"fonts"}}),t.show_labels?[t._v(t._s(t.$t("write")))]:t._e()],2):t._e(),t.types_available.includes("embed")?e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){t.show_link_picker=!0}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"link"}}),t.show_labels?[t._v(t._s(t.$t("embed")))]:t._e()],2):t._e(),t.show_link_picker?e("EmbedPicker",{on:{embed:t.createEmbed,close:function(e){t.show_link_picker=!1}}}):t._e(),t.types_available.includes("table")?e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createTable}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"table"}}),t.show_labels?[t._v(t._s(t.$t("table")))]:t._e()],2):t._e(),t.types_available.includes("shapes")?t._l(t.shapes,(function(a){return e("button",{key:a.type,staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(e){return t.createCustomModule({module_type:a.type,addtl_meta:a.addtl_meta})}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:a.icon}}),t.show_labels?[t._v(t._s(t.$t(a.type)))]:t._e()],2)})):t._e(),t.start_collapsed?e("EditBtn",{key:"addmodule",attrs:{btn_type:"close",is_unfolded:!1},on:{click:function(e){t.show_module_selector=!1}}}):t._e()],2):t.start_collapsed&&!t.show_module_selector?e("EditBtn",{key:"addmodule",staticClass:"_addBtn",attrs:{btn_type:"add",is_unfolded:!1},on:{click:function(e){t.show_module_selector=!0}}}):t._e()],1),e("DropZone",{staticClass:"_dropZone",on:{mediaDropped:t.mediaDropped}})],1)},o=[],s=(a(44114),function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("capture"),size:"full"},on:{close:function(e){return t.$emit("close")}}},[e("CaptureView",{attrs:{path:t.path,selected_mode:t.selected_mode,stopmotion_slug:t.stopmotion_slug,available_modes:t.available_modes},on:{changeMode:function(e){t.selected_mode=e},openStopmotion:function(e){t.stopmotion_slug=e},insertMedia:t.insertMedia}})],1)}),n=[],r={props:{path:String,available_modes:Array},components:{CaptureView:()=>a.e(331).then(a.bind(a,88331))},data(){return{selected_mode:"photo",stopmotion_slug:void 0}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async insertMedia(t){const e=this.path+"/"+t,a=[e];this.$emit("createMosaic",{path_to_source_media_metas:a}),this.$emit("close")}}},l=r,c=a(81656),d=(0,c.A)(l,s,n,!1,null,"888c14fc",null),u=d.exports,_=a(37207),p=function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("embed")},on:{close:function(e){return t.$emit("close")}}},[e("div",{staticClass:"_linkPicker"},[e("div",{staticClass:"_urlBox"},[e("TextInput",{attrs:{label_str:t.$t("input_url"),instructions:t.$t("input_url_instr"),content:t.full_url,placeholder:"https://",required:!0,input_type:"url"},on:{"update:content":function(e){t.full_url=e},toggleValidity:e=>t.allow_save=e}})],1),e("div",{staticClass:"u-instructions"},[e("small",{staticClass:"_examples"},[t._v(" "+t._s(t.$t("for_example"))+" "),t._l([{url:"https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde",label:"PeerTube"},{url:"https://www.youtube.com/watch?v=Bn6zdyCAwJs",label:"Youtube"},{url:"https://vimeo.com/447785086",label:"Vimeo"},{url:"https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas",label:"Observable"}],(function(a,i){return e("button",{key:i,staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{innerHTML:t._s(a.label)},on:{click:function(e){t.full_url=a.url}}})}))],2)]),t.url_to_site?e("div",{key:t.full_url},["any"===t.url_to_site.type?[e("iframe",{staticClass:"_siteIframe",attrs:{src:t.url_to_site.src,frameborder:"0"}})]:e("vue-plyr",[e("div",{staticClass:"plyr__video-embed"},[e("iframe",{attrs:{src:t.url_to_site.src,allowfullscreen:"",allowtransparency:"",allow:"autoplay; fullscreen",sandbox:"allow-same-origin allow-scripts allow-popups",frameborder:"0"}})])])],2):t._e()]),e("template",{slot:"footer"},[e("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[e("b-icon",{attrs:{icon:"x-circle"}}),t._v(" "+t._s(t.$t("cancel"))+" ")],1),e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button",disabled:!t.full_url},on:{click:function(e){return t.$emit("embed",t.full_url)}}},[t._v(" "+t._s(t.$t("embed"))+" ")])])],2)},m=[],h={props:{},components:{},data(){return{full_url:""}},async created(){},beforeDestroy(){},watch:{},computed:{url_to_site(){return!!this.full_url&&this.transformURL({url:this.full_url,autoplay:!1})}},methods:{}},f=h,b=(a(77742),(0,c.A)(f,p,m,!1,null,"1d3ca044",null)),v=b.exports,g={props:{publication_path:String,pre_addtl_meta:Object,post_addtl_meta:Object,select_mode:String,pick_from_types:[String,Array],available_modes:Array,show_labels:{type:Boolean,default:!0},context:String,types_available:{type:Array,default:()=>["capture","import","write","embed","table","shapes"]},start_collapsed:{type:Boolean,default:!0}},components:{CaptureModal:u,MediaPicker:_.A,EmbedPicker:v},data(){return{show_capture_modal:!1,show_module_selector:!1,show_media_picker:!1,show_file_picker:!1,show_link_picker:!1,shapes:[{type:"ellipsis",icon:"circle-fill",addtl_meta:{background_color:"#1d327f"}},{type:"rectangle",icon:"square-fill",addtl_meta:{background_color:"#ffbe32"}},{type:"line",icon:"dash-lg",addtl_meta:{outline_width:1,outline_color:"#000000"}},{type:"arrow",icon:"arrow-right-square",addtl_meta:{outline_width:1,outline_color:"#000000"}}],is_saving:!1}},created(){},mounted(){},beforeDestroy(){},watch:{show_module_selector(){}},computed:{project_path(){return"link"===this.$root.publication_include_mode?this.getParent(this.getParent(this.publication_path)):this.publication_path}},methods:{async mediaDropped({path_to_source_media_metas:t}){this.createMosaic({path_to_source_media_metas:t})},async createMosaic({meta_filename:t,path_to_source_media_metas:e}){let a=[];if(t)a.push({meta_filename:t});else if(e)for(const i of e){const t=this.$root.publication_include_mode,e=await this.prepareMediaForPublication({path_to_source_media_meta:i,publication_path:this.publication_path,import_mode:t});a.push(e)}"page_by_page"===this.context&&(a=a.map((t=>(t.objectFit="contain",t)))),["page_by_page","montage"].includes(this.context)?await this.createMultipleModules({module_type:"mosaic",source_medias:a}):await this.createModule({module_type:"mosaic",source_medias:a}),this.show_media_picker=!1},async createEmbed(t){const e="url-"+ +new Date+".txt",{meta_filename:a}=await this.$api.uploadText({path:this.publication_path,filename:e,content:t,additional_meta:{$type:"url"}});this.createMosaic({meta_filename:a}),this.show_link_picker=!1},async createFiles({path_to_source_media_metas:t}){let e=[];t.map((t=>{const a=this.getFilename(t);e.push({meta_filename_in_project:a})})),await this.createModule({module_type:"files",source_medias:e}),this.show_file_picker=!1},async createCustomModule({module_type:t,addtl_meta:e}){await this.createModule({module_type:t,addtl_meta:e})},async createText(){const t="text-"+ +new Date+".txt",{meta_filename:e}=await this.$api.uploadText({path:this.publication_path,filename:t,content:""}),a=[{meta_filename:e}],i="page_by_page"===this.context?"text":"mosaic";await this.createModule({module_type:i,source_medias:a})},async createTable(){const t="table-"+ +new Date+".json",{meta_filename:e}=await this.$api.uploadText({path:this.publication_path,filename:t,content:JSON.stringify([[{content:""},{content:""}],[{content:""},{content:""}]],null,4),additional_meta:{$type:"table"}});this.createMosaic({meta_filename:e}),this.show_link_picker=!1},async createModule({module_type:t,source_medias:e=[],addtl_meta:a={}}){if(e.length>0){const t=this.getSourceMedia({source_media:e[0],folder_path:this.publication_path});t?.$location&&(a.location=t.$location)}const i=await this.createMetaForModule({module_type:t,source_medias:e,addtl_meta:a});return this.$emit("addModules",{meta_filenames:[i]}),this.show_module_selector=!1,i},async createMultipleModules({module_type:t,source_medias:e=[]}){let a=[];for(const i of e){const e=this.getSourceMedia({source_media:i,folder_path:this.publication_path});let o={};["page_by_page","montage"].includes(this.context)&&e?.$infos?.ratio&&this.pre_addtl_meta?.width&&(o.height=this.pre_addtl_meta.width*e.$infos.ratio),e?.$location&&(o.location=e.$location);const s=await this.createMetaForModule({module_type:t,source_medias:[i],addtl_meta:o});a.push(s)}this.show_module_selector=!1,this.$emit("addModules",{meta_filenames:a})},async createMetaForModule({module_type:t,source_medias:e,addtl_meta:a}){let i={module_type:t,source_medias:e,requested_slug:"module"};this.pre_addtl_meta&&Object.assign(i,this.pre_addtl_meta),a&&Object.assign(i,a),this.post_addtl_meta&&Object.assign(i,this.post_addtl_meta);const{meta_filename:o}=await this.$api.uploadFile({path:this.publication_path,additional_meta:i}).catch((t=>{throw this.$alertify.delay(4e3).error(t),t}));return o}}},w=g,y=(a(32263),(0,c.A)(w,i,o,!1,null,"543db964",null)),k=y.exports},14876:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([t.id,"._linkPicker[data-v-1d3ca044]{width:100%;margin:0 auto}._addMediaBtn[data-v-1d3ca044]{text-align:center;padding:calc(var(--spacing)*1)}iframe[data-v-1d3ca044]{width:100%;aspect-ratio:4/3}._examples[data-v-1d3ca044]{display:inline-flex;flex-flow:row wrap;gap:calc(var(--spacing)/2)}",""]),e["default"]=r},49896:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([t.id,"._saveNotice[data-v-4703eca1]{inset:-2px;background:hsla(0,0%,100%,.95)}._saveNotice[data-v-4703eca1],._spinner[data-v-4703eca1]{position:absolute;display:flex;justify-content:center;align-items:center}._spinner[data-v-4703eca1]{top:0;left:0;right:0;bottom:0;background-color:hsla(0,0%,100%,.7);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}._bottomBtns[data-v-4703eca1]{flex-flow:row wrap;justify-content:space-between;width:100%}._bottomBtns[data-v-4703eca1],._rightRow[data-v-4703eca1]{display:flex;align-items:center;gap:calc(var(--spacing)/2)}._rightRow[data-v-4703eca1]{flex-flow:row nowrap;justify-content:flex-end}",""]),e["default"]=r},4024:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([t.id,"._listOfModules[data-v-15a9c490]{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--spacing);margin:var(--spacing) 0}._equationIcon[data-v-15a9c490]{font-size:2em;line-height:1;margin:calc(var(--spacing)*2);color:#fff}._bottomRow[data-v-15a9c490]{margin-top:calc(var(--spacing)*2);text-align:center}._bottomRow[data-v-15a9c490],._create[data-v-15a9c490]{display:flex;flex-flow:column nowrap;align-items:center;justify-content:center}._create[data-v-15a9c490]{gap:var(--spacing);background:#fff;padding:calc(var(--spacing)/2) calc(var(--spacing)/1);border-radius:var(--input-border-radius)}._create label[data-v-15a9c490]{color:inherit}",""]),e["default"]=r},80974:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([t.id,"._stopmotionModule[data-v-9871837c]{position:relative;background-color:#fff;border-radius:4px}._mediaContainer[data-v-9871837c]{position:relative}._mediaContainer[data-v-9871837c] ._mediaContent{width:100%;aspect-ratio:calc(1/var(--aspectRatio, 1/1));border-radius:3px;min-height:80px;min-width:80px}._mediaContainer[data-v-9871837c] ._mediaContent ._mediaContent--image{position:absolute;width:100%;height:100%;-o-object-fit:contain;object-fit:contain}._bottomBar[data-v-9871837c]{padding:calc(var(--spacing)/8);pointer-events:none;display:flex;flex-flow:row nowrap;align-items:center;justify-content:center;gap:calc(var(--spacing)/2)}._bottomBar button[data-v-9871837c],._bottomBar select[data-v-9871837c]{pointer-events:all}._bottomBar select[data-v-9871837c]{width:8ch}._options[data-v-9871837c]{position:absolute;bottom:0;right:0;padding:calc(var(--spacing)/8) calc(var(--spacing)/2);pointer-events:auto}",""]),e["default"]=r},64394:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([t.id,"._mediaPicker[data-v-602d0e25]{position:absolute}",""]),e["default"]=r},27677:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([t.id,"._moduleCreator[data-v-543db964]{position:relative;display:flex;justify-content:flex-start;align-items:center;width:100%;pointer-events:none;gap:calc(var(--spacing)/4);padding:calc(var(--spacing)/2) 0;transition:all .5s cubic-bezier(.19,1,.22,1);--icon-size:1.2rem}._moduleCreator.is--collapsed[data-v-543db964]{padding:0}._moduleCreator>*[data-v-543db964]{pointer-events:auto}._typePicker[data-v-543db964]{display:flex;flex-flow:row wrap;justify-content:flex-start;align-items:center;gap:calc(var(--spacing)/4)}._dropNotice[data-v-543db964]{pointer-events:none}._showModuleSelector[data-v-543db964]{transition:all .4s cubic-bezier(.19,1,.22,1)}._addBtn[data-v-543db964]{margin-left:-24px}",""]),e["default"]=r},77742:function(t,e,a){var i=a(14876);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("0dd982de",i,!0,{sourceMap:!1,shadowMode:!1})},72634:function(t,e,a){var i=a(49896);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("0a5de9db",i,!0,{sourceMap:!1,shadowMode:!1})},23118:function(t,e,a){var i=a(4024);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("0be20109",i,!0,{sourceMap:!1,shadowMode:!1})},89456:function(t,e,a){var i=a(80974);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("4a42ed6f",i,!0,{sourceMap:!1,shadowMode:!1})},8536:function(t,e,a){var i=a(64394);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("75e55b19",i,!0,{sourceMap:!1,shadowMode:!1})},32263:function(t,e,a){var i=a(27677);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("1ed179fc",i,!0,{sourceMap:!1,shadowMode:!1})}}]);