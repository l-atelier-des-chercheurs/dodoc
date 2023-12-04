(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[780],{46188:function(e,t,a){"use strict";a.d(t,{Z:function(){return _}});var i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("BaseModal2",{attrs:{title:e.title||e.$t("export")},on:{close:function(t){return e.$emit("close")}}},[a("div",{staticClass:"_cont"},[a("div",{staticClass:"u-spacingBottom"},[e._t("default")],2),a("div",{},[a("div",{staticClass:"u-sameRow"},[a("a",{staticClass:"u-buttonLink",attrs:{disabled:!e.export_href,download:e.export_name,href:e.export_href,target:"_blank"}},[e._v(" "+e._s(e.$t("download"))+" ")]),a("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:e.saveToProject}},[a("svg",{staticStyle:{"enable-background":"new 0 0 168 168"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 168 168","xml:space":"preserve"}},[a("path",{staticStyle:{fill:"var(--c-rouge)"},attrs:{d:"M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"}}),a("g",{staticStyle:{fill:"var(--c-orange)"}},[a("path",{attrs:{d:"m42 42h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m73.2 42h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m104.4 42h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m42 73.5h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m73.2 73.5h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m104.4 73.5h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m42 105h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m73.2 105h21.6v21h-21.6z"}}),a("path",{attrs:{d:"m104.4 105h21.6v21h-21.6z"}})])]),e._v(" "+e._s(e.$t("save_to_project"))+" ")])])]),e.finished_saving_to_project?a("div",{staticClass:"_saveNotice"},[e._v(" "+e._s(e.$t("media_was_saved"))+" ")]):e._e()])])},o=[],s={props:{title:String,export_name:{type:String,default:"file"},export_blob:[Boolean,Blob],export_href:String,project_path:String},components:{},data(){return{finished_saving_to_project:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async saveToProject(){if(this.export_blob){const e={$origin:"make"};this.connected_as?.$path&&(e.$authors=[this.connected_as.$path]),await this.$api.uploadFile({path:this.project_path,filename:this.export_name,file:this.export_blob,additional_meta:e}).catch((e=>{throw this.$alertify.delay(4e3).error(e),e}))}this.finished_saving_to_project=!0,setTimeout((()=>{this.$emit("close")}),3e3)}}},n=s,d=(a(95407),a(1001)),r=(0,d.Z)(n,i,o,!1,null,"993a2d5e",null),_=r.exports},79780:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return c}});var i=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"_mixAudioAndImage"},[a("div",{staticClass:"_topRow"},[a("div",{},[a("SingleBaseMediaPicker",{attrs:{title:e.$t("pick_audio"),context:"full",field_name:"base_audio_filename",content:e.make.base_audio_filename,path:e.make.$path,media_type_to_pick:"audio"}})],1),a("div",{staticClass:"_equationIcon"},[a("b-icon",{attrs:{icon:"plus-circle-dotted"}})],1),a("div",{},["mix_audio_and_image"===e.make.type?a("SingleBaseMediaPicker",{attrs:{title:e.$t("pick_image"),context:"full",field_name:"base_image_filename",content:e.make.base_image_filename,path:e.make.$path,media_type_to_pick:"image"}}):"mix_audio_and_video"===e.make.type?a("SingleBaseMediaPicker",{attrs:{title:e.$t("pick_video"),context:"full",field_name:"base_video_filename",content:e.make.base_video_filename,path:e.make.$path,media_type_to_pick:"video"}}):e._e()],1)]),a("transition",{attrs:{name:"pagechange",mode:"out-in"}},[e.export_is_available?a("div",{staticClass:"_bottomRow"},[a("div",{staticClass:"_equationIcon"},[a("b-icon",{attrs:{icon:"chevron-double-down"}})],1),a("div",{},[a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(t){e.show_save_export_modal=!0}}},[a("b-icon",{attrs:{icon:"check"}}),e._v(" "+e._s(e.$t("create"))+" ")],1)])]):e._e()]),e.show_save_export_modal?a("ExportSaveMakeModal",{attrs:{title:e.$t("export_mix"),export_name:e.export_name,export_href:e.export_href},on:{close:function(t){e.show_save_export_modal=!1}}},[e.is_exporting?a("div",{key:"loader",staticClass:"_spinner"},[a("LoaderSpinner")],1):a("div",[a("MediaContent",{staticClass:"_preview",attrs:{file:e.created_video,resolution:1600,context:"full"}})],1)]):e._e()],1)},o=[],s=a(34620),n=a(46188),d={props:{make:Object},components:{SingleBaseMediaPicker:s.Z,ExportSaveMakeModal:n.Z},data(){return{show_save_export_modal:!1,is_exporting:!1,created_video:!1,export_href:void 0}},i18n:{messages:{fr:{pick_audio:"Choisissez le son à utiliser",pick_image:"Choisissez l’image à utiliser",pick_video:"Choisissez la vidéo à utiliser",export_mix:"Exporter la composition"},en:{pick_audio:"Pick audio media",pick_image:"Pick image media",pick_video:"Pick video media",export_mix:"Export composition"}}},created(){},mounted(){},beforeDestroy(){},watch:{show_save_export_modal(){this.show_save_export_modal&&this.renderAudioImageOrVideo()}},computed:{export_name(){return"mix_audio_and_image"===this.make.type?"audio_image_mix.mp4":"mix_audio_and_video"===this.make.type?"audio_video_mix.mp4":"untitled"},export_is_available(){return"mix_audio_and_image"===this.make.type?this.make.base_audio_filename&&this.make.base_image_filename:"mix_audio_and_video"===this.make.type&&(this.make.base_audio_filename&&this.make.base_video_filename)}},methods:{async renderAudioImageOrVideo(){this.is_exporting=!0,this.created_video=!1,this.export_href=void 0;const e=this.getSourceMedia({source_media:{meta_filename_in_project:this.make.base_audio_filename},folder_path:this.make.$path});let t={recipe:this.make.type,suggested_file_name:this.make.type,base_audio_path:this.makeMediaFilePath({$path:e.$path,$media_filename:e.$media_filename}),output_width:1280,output_height:720,additional_meta:{$origin:"make"}};if("mix_audio_and_image"===this.make.type){const e=this.getSourceMedia({source_media:{meta_filename_in_project:this.make.base_image_filename},folder_path:this.make.$path});t.base_image_path=this.makeMediaFilePath({$path:e.$path,$media_filename:e.$media_filename})}else if("mix_audio_and_video"===this.make.type){const a=this.getSourceMedia({source_media:{meta_filename_in_project:this.make.base_video_filename},folder_path:this.make.$path}),i=this.getMaxDuration(a.$infos?.duration,e.$infos?.duration);t.duration=i,t.base_video_path=this.makeMediaFilePath({$path:a.$path,$media_filename:a.$media_filename})}const a=await this.$api.exportFolder({path:this.make.$path,instructions:t});this.$api.join({room:"task_"+a});const i=({task_id:e,message:t})=>{e===a&&(this.$eventHub.$off("task.ended",i),this.$api.leave({room:"task_"+a}),"completed"===t.event?(this.created_video=t.file,this.export_href=this.makeMediaFileURL({$path:this.created_video.$path,$media_filename:this.created_video.$media_filename})):"aborted"===t.event||"failed"===t.event&&t.info,this.is_exporting=!1)};this.$eventHub.$on("task.ended",i)},getMaxDuration(){return Array.prototype.slice.call(arguments).reduce(((e,t)=>("number"===typeof t&&t>e&&(e=t),e)),0)}}},r=d,_=(a(50621),a(1001)),l=(0,_.Z)(r,i,o,!1,null,"55dad189",null),c=l.exports},68229:function(e,t,a){"use strict";a.r(t);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),d=n()(o());d.push([e.id,"._cont[data-v-993a2d5e]{position:relative}._saveNotice[data-v-993a2d5e]{position:absolute;inset:-2px;background:hsla(0,0%,100%,.95);display:flex;justify-content:center;align-items:center}",""]),t["default"]=d},38265:function(e,t,a){"use strict";a.r(t);var i=a(8081),o=a.n(i),s=a(23645),n=a.n(s),d=n()(o());d.push([e.id,"._mixAudioAndImage[data-v-55dad189]{padding:calc(var(--spacing)/1) 0}._topRow[data-v-55dad189]{display:flex;flex-flow:row wrap;justify-content:center;align-items:center;gap:calc(var(--spacing)*2)}._equationIcon[data-v-55dad189]{font-size:2em;line-height:1;margin:calc(var(--spacing)*2);color:#fff}._bottomRow[data-v-55dad189]{margin-top:calc(var(--spacing)*2);text-align:center}",""]),t["default"]=d},95407:function(e,t,a){var i=a(68229);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);var o=a(31982).Z;o("6c385c30",i,!0,{sourceMap:!1,shadowMode:!1})},50621:function(e,t,a){var i=a(38265);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[e.id,i,""]]),i.locals&&(e.exports=i.locals);var o=a(31982).Z;o("81a1753a",i,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=780.js.map