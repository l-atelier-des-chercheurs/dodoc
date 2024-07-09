(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[895],{47228:function(e,t,a){"use strict";a.d(t,{A:function(){return d}});var i=function(){var e=this,t=e._self._c;return t("BaseModal2",{attrs:{title:e.title||e.$t("export")},on:{close:function(t){return e.$emit("close")}}},[t("div",{staticClass:"_cont"},[t("div",{staticClass:"u-spacingBottom"},[e._t("default")],2),e.enable_options?t("div",[t("div",{staticClass:"u-sameRow"},[t("a",{staticClass:"u-buttonLink",attrs:{disabled:!e.export_href,download:e.export_name,href:e.export_href,target:"_blank"}},[e._v(" "+e._s(e.$t("download"))+" ")]),t("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:e.saveToProject}},[t("svg",{staticStyle:{"enable-background":"new 0 0 168 168"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 168 168","xml:space":"preserve"}},[t("path",{staticStyle:{fill:"var(--c-rouge)"},attrs:{d:"M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"}}),t("g",{staticStyle:{fill:"var(--c-orange)"}},[t("path",{attrs:{d:"m42 42h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m73.2 42h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m104.4 42h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m42 73.5h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m73.2 73.5h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m104.4 73.5h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m42 105h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m73.2 105h21.6v21h-21.6z"}}),t("path",{attrs:{d:"m104.4 105h21.6v21h-21.6z"}})])]),e._v(" "+e._s(e.$t("save_to_project"))+" ")])])]):e._e(),e.finished_saving_to_project?t("div",{staticClass:"_saveNotice"},[e._v(" "+e._s(e.$t("media_was_saved_to_project"))+" ")]):e._e()])])},o=[],s={props:{title:String,export_name:{type:String,default:"file"},export_blob:[Boolean,Blob],export_href:String,project_path:String,enable_options:{type:Boolean,default:!0}},components:{},data(){return{finished_saving_to_project:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async saveToProject(){if(this.export_blob){const e={$origin:"make"};this.connected_as?.$path&&(e.$authors=[this.connected_as.$path]),await this.$api.uploadFile({path:this.project_path,filename:this.export_name,file:this.export_blob,additional_meta:e}).catch((e=>{throw this.$alertify.delay(4e3).error(e),e}))}this.finished_saving_to_project=!0,setTimeout((()=>{this.$emit("close")}),3e3)}}},n=s,r=(a(73255),a(81656)),_=(0,r.A)(n,i,o,!1,null,"1e9fab52",null),d=_.exports},81895:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return c}});var i=function(){var e=this,t=e._self._c;return t("div",{staticClass:"_mixAudioAndImage"},[t("div",{staticClass:"_topRow"},[t("div",{},["mix_audio_and_image"===e.make.type?t("SingleBaseMediaPicker",{attrs:{title:e.$t("pick_image"),context:"full",field_name:"base_image_filename",content:e.make.base_image_filename,path:e.make.$path,media_type_to_pick:"image"}}):"mix_audio_and_video"===e.make.type?t("SingleBaseMediaPicker",{attrs:{title:e.$t("pick_video"),context:"full",field_name:"base_video_filename",content:e.make.base_video_filename,path:e.make.$path,media_type_to_pick:"video"}}):e._e()],1),t("div",{staticClass:"_equationIcon"},[t("b-icon",{attrs:{icon:"plus-circle-dotted"}})],1),t("div",{},[t("SingleBaseMediaPicker",{attrs:{title:e.$t("pick_audio"),context:"full",field_name:"base_audio_filename",content:e.make.base_audio_filename,path:e.make.$path,media_type_to_pick:"audio"}})],1)]),t("transition",{attrs:{name:"pagechange",mode:"out-in"}},[e.export_is_available?t("div",{staticClass:"_bottomRow"},[t("div",{staticClass:"_equationIcon"},[t("b-icon",{attrs:{icon:"chevron-double-down"}})],1),t("div",{},[t("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(t){e.show_save_export_modal=!0}}},[t("b-icon",{attrs:{icon:"check"}}),e._v(" "+e._s(e.$t("create"))+" ")],1)])]):e._e()]),e.show_save_export_modal?t("ExportSaveMakeModal",{attrs:{title:e.$t("export_mix"),export_name:e.export_name,export_href:e.export_href},on:{close:function(t){e.show_save_export_modal=!1}}},[e.is_exporting?t("div",{key:"loader",staticClass:"_spinner"},[t("LoaderSpinner")],1):t("div",[t("MediaContent",{staticClass:"_preview",attrs:{file:e.created_video,resolution:1600,context:"full"}})],1)]):e._e()],1)},o=[],s=a(17272),n=a(47228),r={props:{make:Object},components:{SingleBaseMediaPicker:s.A,ExportSaveMakeModal:n.A},data(){return{show_save_export_modal:!1,is_exporting:!1,created_video:!1,export_href:void 0}},created(){},mounted(){},beforeDestroy(){},watch:{show_save_export_modal(){this.show_save_export_modal&&this.renderAudioImageOrVideo()}},computed:{export_name(){return"mix_audio_and_image"===this.make.type?"audio_image_mix.mp4":"mix_audio_and_video"===this.make.type?"audio_video_mix.mp4":"untitled"},export_is_available(){return"mix_audio_and_image"===this.make.type?this.make.base_audio_filename&&this.make.base_image_filename:"mix_audio_and_video"===this.make.type&&(this.make.base_audio_filename&&this.make.base_video_filename)}},methods:{async renderAudioImageOrVideo(){this.is_exporting=!0,this.created_video=!1,this.export_href=void 0;const e=this.getSourceMedia({source_media:{meta_filename_in_project:this.make.base_audio_filename},folder_path:this.make.$path}),t={$origin:"make"};this.connected_as?.$path&&(t.$authors=[this.connected_as.$path]);let a={recipe:this.make.type,suggested_file_name:this.make.type,base_audio_path:this.makeMediaFilePath({$path:e.$path,$media_filename:e.$media_filename}),output_width:1280,output_height:720,additional_meta:t};if("mix_audio_and_image"===this.make.type){const e=this.getSourceMedia({source_media:{meta_filename_in_project:this.make.base_image_filename},folder_path:this.make.$path});a.base_image_path=this.makeMediaFilePath({$path:e.$path,$media_filename:e.$media_filename})}else if("mix_audio_and_video"===this.make.type){const t=this.getSourceMedia({source_media:{meta_filename_in_project:this.make.base_video_filename},folder_path:this.make.$path}),i=this.getMaxDuration(t.$infos?.duration,e.$infos?.duration);a.duration=i,a.base_video_path=this.makeMediaFilePath({$path:t.$path,$media_filename:t.$media_filename})}const i=await this.$api.exportFolder({path:this.make.$path,instructions:a});this.$api.join({room:"task_"+i});const o=({task_id:e,message:t})=>{e===i&&(this.$eventHub.$off("task.ended",o),this.$api.leave({room:"task_"+i}),"completed"===t.event?(this.created_video=t.file,this.export_href=this.makeMediaFileURL({$path:this.created_video.$path,$media_filename:this.created_video.$media_filename})):"aborted"===t.event||"failed"===t.event&&t.info,this.is_exporting=!1)};this.$eventHub.$on("task.ended",o)},getMaxDuration(){return Array.prototype.slice.call(arguments).reduce(((e,t)=>("number"===typeof t&&t>e&&(e=t),e)),0)}}},_=r,d=(a(59783),a(81656)),l=(0,d.A)(_,i,o,!1,null,"198705a0",null),c=l.exports},6191:function(e,t,a){"use strict";a.r(t);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([e.id,"._cont[data-v-1e9fab52]{position:relative}._saveNotice[data-v-1e9fab52]{position:absolute;inset:-2px;background:hsla(0,0%,100%,.95);display:flex;justify-content:center;align-items:center}",""]),t["default"]=r},70751:function(e,t,a){"use strict";a.r(t);var i=a(31601),o=a.n(i),s=a(76314),n=a.n(s),r=n()(o());r.push([e.id,"._mixAudioAndImage[data-v-198705a0]{padding:calc(var(--spacing)/1) 0}._topRow[data-v-198705a0]{display:flex;flex-flow:row wrap;justify-content:center;align-items:center;gap:calc(var(--spacing)*2)}._equationIcon[data-v-198705a0]{font-size:2em;line-height:1;margin:calc(var(--spacing)*2);color:#fff}._bottomRow[data-v-198705a0]{margin-top:calc(var(--spacing)*2);text-align:center}",""]),t["default"]=r},73255:function(e,t,a){var i=a(6191);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);var o=a(3825).A;o("7c8700c4",i,!0,{sourceMap:!1,shadowMode:!1})},59783:function(e,t,a){var i=a(70751);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);var o=a(3825).A;o("810c6600",i,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=895.js.map