(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[155],{67777:function(t,e,a){"use strict";a.d(e,{A:function(){return _}});var i=function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("export")},on:{close:t.removeAndCloseModal}},[e("div",{staticClass:"_cont"},[t.created_video?[e("div",{staticClass:"_preview"},[e("MediaContent",{attrs:{file:t.created_video,resolution:1600,show_fs_button:!0,context:"full"}}),e("div",{staticClass:"u-spacingBottom"}),e("ShowExportedFileInfos",{attrs:{file:t.created_video}})],1)]:[t.possible_formats?e("div",{staticClass:"u-spacingBottom"},[e("DLabel",{attrs:{str:t.$t("format")}}),e("SelectField2",{attrs:{value:t.output_format,options:t.possible_formats,can_edit:!0,hide_validation:!0},on:{change:function(e){t.output_format=e}}})],1):t._e(),e("div",[e("DLabel",{attrs:{str:t.$t("quality")}}),e("div",{},[e("SelectField2",{attrs:{value:t.resolution_preset_picked,options:t.presets,can_edit:!0,hide_validation:!0},on:{change:function(e){t.resolution_preset_picked=e}}})],1),"custom"===t.resolution_preset_picked?e("div",[e("div",{staticClass:"u-spacingBottom"}),e("CustomResolutionInput",{attrs:{width:t.custom_resolution_width,height:t.custom_resolution_height,ratio:t.ref_infos.ratio,is_video:!0},on:{"update:width":function(e){t.custom_resolution_width=e},"update:height":function(e){t.custom_resolution_height=e}}}),e("div",{staticClass:"u-spacingBottom"}),e("NumberInput",{attrs:{label:t.$t("bitrate"),instructions:t.$t("bitrate_instructions"),value:t.custom_bitrate,min:0,suffix:"kbps",size:"normal"},on:{"update:value":function(e){t.custom_bitrate=e}}})],1):t._e()],1),t.allow_disable_audio?e("div",[e("div",{staticClass:"u-spacingBottom"}),e("ToggleInput",{attrs:{content:t.keep_audio_track,label:t.$t("keep_audio_track")},on:{"update:content":function(e){t.keep_audio_track=e}}})],1):t._e()]],2),e("template",{slot:"footer"},[t.created_video||t.is_exporting?t.is_exporting?[e("div",{key:"loader",staticClass:"_spinner"},[e("AnimatedCounter",{attrs:{value:t.progress_percent}})],1)]:e("div",{staticClass:"_bottomBtns"},[e("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:t.cancelExport}},[e("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("back"))+" ")],1),e("div",{staticClass:"_rightRow"},[e("a",{staticClass:"u-buttonLink",attrs:{disabled:!t.export_href,download:t.export_name,href:t.export_href,target:"_blank"}},[t._v(" "+t._s(t.$t("download"))+" ")]),e("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:t.saveToProject}},[e("span",{staticClass:"u-icon",domProps:{innerHTML:t._s(t.dodoc_icon_collect)}}),t._v(" "+t._s(t.$t("save_to_project"))+" ")])]),t.finished_saving_to_project?e("div",{staticClass:"_saveNotice"},[t._v(" "+t._s(t.$t("media_was_saved_to_project"))+" ")]):t._e()]):[e("div"),e("div",[e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.renderVideo}},[e("b-icon",{attrs:{icon:"tools"}}),t._v(" "+t._s(t.$t("preview_new"))+" ")],1),e("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("wont_remove_original").toLowerCase())+" ")])])]],2)],2)},o=[],s=(a(44114),a(34928)),r={props:{base_instructions:Object,make_path:String,reference_media:Object,possible_formats:Array,allow_disable_audio:Boolean,default_resolution_preset:{type:String,default:"source"}},components:{ShowExportedFileInfos:s.A},data(){return{is_exporting:!1,finished_saving_to_project:!1,created_video:!1,resolution_preset_picked:this.default_resolution_preset,progress_percent:0,output_format:"mp4",custom_resolution_width:1920,custom_resolution_height:1080,custom_bitrate:4e3,keep_audio_track:!0}},created(){},mounted(){this.reference_media&&(this.custom_resolution_width=this.ref_infos.width,this.custom_resolution_height=this.ref_infos.height)},beforeDestroy(){},watch:{},computed:{export_href(){return this.created_video?this.makeMediaFileURL({$path:this.created_video.$path,$media_filename:this.created_video.$media_filename}):""},export_name(){return this.created_video?this.created_video.$media_filename:""},ref_infos(){if(!this.reference_media)return{};let{width:t,height:e,ratio:a}=this.reference_media.$infos;return t&&(t=2*Math.ceil(t/2)),e&&(e=2*Math.ceil(e/2)),{width:t,height:e,ratio:a}},presets(){const t=[];return t.push({key:"source",text:this.$t("close_to_source"),width:this.ref_infos.width,height:this.ref_infos.height,bitrate:4e3}),t.push({key:"high",text:this.$t("high"),width:1920,height:1080,bitrate:4e3}),t.push({key:"medium",text:this.$t("medium"),width:1280,height:720,bitrate:2e3}),t.push({key:"rough",text:this.$t("rough"),width:640,height:360,bitrate:1e3}),t.push({key:"custom",text:"↓ "+this.$t("custom_f")}),t.map((t=>("custom"!==t.key&&(t.instructions=this.$t("resolution_w_h",{width:t.width,height:t.height})+", "+this.$t("bitrate_kbps",{bitrate:t.bitrate}).toLowerCase()),t)))}},methods:{async renderVideo(){this.progress_percent=0,this.is_exporting=!0,this.created_video=!1;let t=Object.assign({},this.base_instructions);const e={$origin:"make"};this.connected_as?.$path&&(e.$authors=[this.connected_as.$path]);let a=1920,i=1080,o=4e3;if("custom"===this.resolution_preset_picked)a=this.custom_resolution_width,i=this.custom_resolution_height,o=this.custom_bitrate;else{const t=this.presets.find((t=>t.key===this.resolution_preset_picked));a=t.width,i=t.height,o=t.bitrate}this.possible_formats&&(t.output_format=this.output_format),this.allow_disable_audio&&(t.keep_audio_track=this.keep_audio_track);const s=await this.$api.exportFolder({path:this.make_path,instructions:{...t,output_width:a,output_height:i,video_bitrate:o,additional_meta:e}});this.$api.join({room:"task_"+s});const r=({task_id:t,progress:e})=>{t===s&&(this.progress_percent=e)};this.$eventHub.$on("task.status",r);const n=({task_id:t,message:e})=>{t===s&&(this.$eventHub.$off("task.ended",n),this.$api.leave({room:"task_"+s}),"completed"===e.event?(this.created_video=e.file,this.$nextTick((()=>{const t=this.$el.querySelector("video");t&&(t.volume=1)}))):"aborted"===e.event||"failed"===e.event&&e.info,this.progress_percent=100,this.is_exporting=!1)};this.$eventHub.$on("task.ended",n)},cancelExport(){this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.created_video=!1},removeAndCloseModal(){this.created_video&&this.$api.deleteItem({path:this.created_video.$path}),this.$emit("close")},async saveToProject(){this.finished_saving_to_project=!0,this.$eventHub.$emit("pane.animate","collect"),setTimeout((()=>{this.$emit("close")}),3e3)}}},n=r,l=(a(72634),a(81656)),c=(0,l.A)(n,i,o,!1,null,"4703eca1",null),_=c.exports},14155:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return _}});var i=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_videoEffects"},[e("div",{staticClass:"_topContent"},[e("div",{staticClass:"_leftBtns"},[e("DLabel",{attrs:{str:t.$t("effect")}}),e("select",{domProps:{value:t.selected_effect_type},on:{change:t.setEffectType}},t._l(t.available_effects,(function(a){return e("option",{key:a.key,domProps:{value:a.key}},[t._v(" "+t._s(a.label)+" ")])})),0),e("div",{staticClass:"u-spacingBottom"}),"colored_filter"===t.selected_effect_type?e("div",{staticClass:"u-spacingBottom"},[e("ColorInput",{attrs:{can_toggle:!1,live_editing:!0,value:t.make.color_filter,default_value:"#fc4b60"},on:{save:function(e){return t.updatePubliMeta({color_filter:e})}}})],1):"speed_up"===t.selected_effect_type?e("div",{staticClass:"u-spacingBottom"},[e("RangeValueInput",{attrs:{label:t.$t("playback_speed"),value:t.make.playback_speed,can_toggle:!1,min:100,max:1e3,step:1,default_value:100,suffix:"%",ticks:[100,200,500,1e3]},on:{save:function(e){return t.updatePubliMeta({playback_speed:e})}}}),t.make.playback_speed<50?e("small",{domProps:{innerHTML:t._s(t.$t("slowing_video_down_limit"))}}):t._e()],1):"slow_down"===t.selected_effect_type?e("div",{staticClass:"u-spacingBottom"},[e("RangeValueInput",{attrs:{label:t.$t("playback_speed"),value:t.make.playback_speed,can_toggle:!1,min:1,max:100,step:1,default_value:50,suffix:"%",ticks:[1,10,25,50]},on:{save:function(e){return t.updatePubliMeta({playback_speed:e})}}}),t.make.playback_speed<50?e("small",{domProps:{innerHTML:t._s(t.$t("slowing_video_down_limit"))}}):t._e()],1):"mirror"===t.selected_effect_type?e("div",{staticClass:"u-spacingBottom"},[e("select",{domProps:{value:t.make.flip},on:{change:function(e){return t.updatePubliMeta({flip:e.target.value})}}},[e("option",{attrs:{value:"vflip"}},[t._v(" "+t._s(t.$t("vertical_flip").toLowerCase())+" ")]),e("option",{attrs:{value:"hflip"}},[t._v(" "+t._s(t.$t("horizontal_flip").toLowerCase())+" ")]),e("option",{attrs:{value:"hflip, vflip"}},[t._v(" "+t._s(t.$t("both").toLowerCase())+" ")])])]):"rotate"===t.selected_effect_type?e("div",{staticClass:"u-spacingBottom"},[e("select",{domProps:{value:t.make.rotation},on:{change:function(e){return t.updatePubliMeta({rotation:e.target.value})}}},[e("option",{attrs:{value:"cw"}},[t._v(t._s(t.$t("move_right"))+" ⟳")]),e("option",{attrs:{value:"ccw"}},[t._v(t._s(t.$t("move_left"))+" ⟲")])])]):t._e()],1),e("div",{staticClass:"_cropWindow",attrs:{"data-rotate":t.rotate_preview,"data-isblackandwhite":"black_and_white"===t.selected_effect_type}},[e("MediaContent",{attrs:{file:t.base_media,resolution:1600,show_fs_button:!0,context:"full"}}),"colored_filter"===t.selected_effect_type?e("div",{staticClass:"_coloredFilter",style:{backgroundColor:t.make.color_filter}}):t._e()],1)]),e("div",{staticClass:"_bottomBtns"},[e("div",{staticClass:"_equationIcon"},[e("b-icon",{attrs:{icon:"chevron-double-down"}})],1),e("button",{staticClass:"u-button u-button_bleumarine",attrs:{type:"button",disabled:!t.base_instructions},on:{click:function(e){t.show_render_modal=!0}}},[e("b-icon",{attrs:{icon:"check"}}),t._v(" "+t._s(t.$t("make"))+" ")],1),e("div",[t.base_instructions?t._e():e("div",{staticClass:"fieldCaption u-colorRed"},[e("small",{domProps:{innerHTML:t._s(t.$t("all_fields_not_filled"))}})])]),t.show_render_modal?e("ExportSaveMakeModal2",{attrs:{base_instructions:t.base_instructions,make_path:t.make.$path,reference_media:t.base_media,allow_disable_audio:!0},on:{close:function(e){t.show_render_modal=!1}}}):t._e()],1)])},o=[],s=a(67777),r={props:{make:Object,base_media:Object},components:{ExportSaveMakeModal2:s.A},data(){return{show_render_modal:!1,available_effects:[{key:"black_and_white",label:this.$t("black_and_white")},{key:"colored_filter",label:this.$t("colored_filter")},{key:"slow_down",label:this.$t("slow_down")},{key:"speed_up",label:this.$t("speed_up")},{key:"reverse",label:this.$t("reverse")},{key:"rotate",label:this.$t("rotate")},{key:"mirror",label:this.$t("mirror")}]}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{base_instructions(){const t="video_effects",e=this.selected_effect_type,a=this.base_media.$media_filename+"-"+e,i=this.makeMediaFilePath({$path:this.base_media.$path,$media_filename:this.base_media.$media_filename});let o={};if("colored_filter"===e){if(!this.make.color_filter)return!1;o={color_filter:this.make.color_filter}}else if("slow_down"===e||"speed_up"===e){if(!this.make.playback_speed)return!1;o={playback_speed:this.make.playback_speed}}else if("mirror"===e){if(!this.make.flip)return!1;o={flip:this.make.flip}}else if("rotate"===e){if(!this.make.rotation)return!1;o={rotation:this.make.rotation}}return{recipe:t,effect_type:e,effect_opts:o,suggested_file_name:a,base_media_path:i}},rotate_preview(){return"rotate"===this.selected_effect_type?this.make.rotation:"mirror"===this.selected_effect_type&&this.make.flip},selected_effect_type:{get(){return this.make.effect_type||"black_and_white"}},base_media_width(){return this.base_media?.$infos?.width},base_media_height(){return this.base_media?.$infos?.height}},methods:{setEffectType(t){const e=t.target.value;let a={effect_type:e};"colored_filter"===e?a.color_filter="#fc4b60":"speed_up"===e?a.playback_speed=200:"slow_down"===e?a.playback_speed=50:"rotate"===e?a.rotation="cw":"mirror"===e&&(a.flip="hflip"),this.updatePubliMeta(a)},async updatePubliMeta(t){return await this.$api.updateMeta({path:this.make.$path,new_meta:t})}}},n=r,l=(a(49076),a(81656)),c=(0,l.A)(n,i,o,!1,null,"35c21182",null),_=c.exports},49896:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),r=a.n(s),n=r()(o());n.push([t.id,"._saveNotice[data-v-4703eca1]{inset:-2px;background:hsla(0,0%,100%,.95)}._saveNotice[data-v-4703eca1],._spinner[data-v-4703eca1]{position:absolute;display:flex;justify-content:center;align-items:center}._spinner[data-v-4703eca1]{top:0;left:0;right:0;bottom:0;background-color:hsla(0,0%,100%,.7);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}._bottomBtns[data-v-4703eca1]{flex-flow:row wrap;justify-content:space-between;width:100%}._bottomBtns[data-v-4703eca1],._rightRow[data-v-4703eca1]{display:flex;align-items:center;gap:calc(var(--spacing)/2)}._rightRow[data-v-4703eca1]{flex-flow:row nowrap;justify-content:flex-end}",""]),e["default"]=n},54866:function(t,e,a){"use strict";a.r(e);var i=a(31601),o=a.n(i),s=a(76314),r=a.n(s),n=r()(o());n.push([t.id,'._videoEffects[data-v-35c21182]{border-radius:6px;width:100%;max-width:880px;margin:0 auto;background:#fff;padding:calc(var(--spacing)/4)}._topContent[data-v-35c21182]{display:flex;flex-flow:row wrap;justify-content:center;align-items:center;gap:calc(var(--spacing)*1)}._topContent ._leftBtns[data-v-35c21182]{flex:0 0 240px}._topContent ._cropWindow[data-v-35c21182]{position:relative;flex:0 1 50vmin}._cropWindow[data-v-35c21182]{position:relative}._cropWindow[data-v-35c21182] .plyr__video-wrapper{transition:transform .6s cubic-bezier(.19,1,.22,1);transform-origin:center}._cropWindow[data-isblackandwhite=true][data-v-35c21182] .plyr__video-wrapper{filter:grayscale(100%)}._cropWindow[data-rotate=cw][data-v-35c21182] .plyr__video-wrapper{transform:rotate(90deg)}._cropWindow[data-rotate=ccw][data-v-35c21182] .plyr__video-wrapper{transform:rotate(-90deg)}._cropWindow[data-rotate=hflip][data-v-35c21182] .plyr__video-wrapper{transform:scaleX(-1)}._cropWindow[data-rotate=vflip][data-v-35c21182] .plyr__video-wrapper{transform:scaleY(-1)}._cropWindow[data-rotate="hflip, vflip"][data-v-35c21182] .plyr__video-wrapper{transform:scale(-1)}._cropWindow>*[data-v-35c21182]{width:100%;aspect-ratio:1/1}._coloredFilter[data-v-35c21182]{position:absolute;width:100%;height:100%;top:0;left:0;opacity:1;mix-blend-mode:overlay;pointer-events:none}._bottomBtns[data-v-35c21182]{display:flex;flex-flow:column wrap;justify-content:center;align-items:center;gap:0;padding-bottom:calc(var(--spacing)*1)}._equationIcon[data-v-35c21182]{font-size:2em;line-height:1;margin:calc(var(--spacing)*2) 0;color:var(--c-bleumarine_fonce)}',""]),e["default"]=n},72634:function(t,e,a){var i=a(49896);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("0a5de9db",i,!0,{sourceMap:!1,shadowMode:!1})},49076:function(t,e,a){var i=a(54866);i.__esModule&&(i=i.default),"string"===typeof i&&(i=[[t.id,i,""]]),i.locals&&(t.exports=i.locals);var o=a(43197).A;o("654c2daa",i,!0,{sourceMap:!1,shadowMode:!1})}}]);