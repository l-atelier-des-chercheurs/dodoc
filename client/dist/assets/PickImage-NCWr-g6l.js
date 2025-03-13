import{n as r,_ as c}from"../build.js";const _={props:{path:String,instructions:String,available_options:{type:Array,default:()=>["import","project","capture"]}},components:{CaptureView:()=>c(()=>import("./CaptureView-CRHVjQ5_.js"),[])},data(){return{id:`image_select_${(Math.random().toString(36)+"00000000000000000").slice(2,5)}`,show_picker:!1,show_medias_from_project:"",enable_capture_mode:!1}},created(){},mounted(){window.addEventListener("paste",this.handlePaste)},beforeDestroy(){window.removeEventListener("paste",this.handlePaste)},watch:{},computed:{_instructions(){return this.instructions!==void 0?this.instructions:this.$t("upload_an_image")}},methods:{handlePaste(a){a.clipboardData.files&&a.clipboardData.files.length>0?(a.preventDefault(),a.stopPropagation(),this.$alertify.closeLogOnClick(!0).delay(4e3).log("Importation depuis presse-papier"),this.$nextTick(()=>{const e=a.clipboardData.files[0];this.$emit("newPreview",{type:"file",data:e})})):this.$alertify.closeLogOnClick(!0).delay(4e3).error(this.$t("no_image_in_clipboard"))},onFileChange(a){var e=a.target.files||a.dataTransfer.files;if(!e.length)return;const t=e[0];this.$emit("newPreview",{type:"file",data:t})},async addMediaFromLib({path_to_source_media_metas:a}){const e=a[0],t=this.getMediaInFolder({path_to_source_media_meta:e}),i=this.getParent(t.$path),s=this.makeRelativeURLFromThumbs({$thumbs:t.$thumbs,$type:t.$type,$path:i,resolution:1600}),o=await fetch(s).then(l=>l.blob()),n=new File([o],t.$media_filename);this.$emit("newPreview",{type:"file",data:n})},async tempMedia(a){const e=new File([a.rawData],"filename");this.$emit("newPreview",{type:"file",data:e})}}};var d=function(){var e=this,t=e._self._c;return t("div",{staticClass:"_imageselect"},[e.available_options.includes("import")?t("div",{staticClass:"_imageselect--upload"},[t("input",{staticClass:"inputfile-2",attrs:{type:"file",accept:"image/*",id:e.id},on:{change:e.onFileChange}}),t("label",{staticClass:"u-button",attrs:{for:e.id}},[t("svg",{attrs:{width:"20",height:"17",viewBox:"0 0 20 17"}},[t("path",{attrs:{d:"M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"}})]),t("span",[e._v(" "+e._s(e._instructions)+" ")])])]):e._e(),e.available_options.includes("project")?t("div",{staticClass:"_imageselect--fromLib"},[t("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:function(i){e.show_picker=!0}}},[t("span",{staticClass:"u-icon",domProps:{innerHTML:e._s(e.dodoc_icon_collect)}}),t("span",[e._v(" "+e._s(e.$t("from_project"))+" ")])]),e.show_picker?t("PickMediaFromProjects",{attrs:{title:e.$t("pick_media"),path:e.path,select_mode:"single",pick_from_types:["image"]},on:{addMedias:e.addMediaFromLib,close:function(i){e.show_picker=!1}}}):e._e()],1):e._e(),e.available_options.includes("capture")?t("div",{staticClass:"_imageselect--takePhoto"},[e.enable_capture_mode?e._e():t("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:function(i){e.enable_capture_mode=!0}}},[t("img",{staticClass:"inlineSVG",attrs:{src:e.$root.publicPath+"images/i_record.svg"}}),t("span",[e._v(" "+e._s(e.$t("take_picture"))+" ")])]),e.enable_capture_mode?t("BaseModal2",{attrs:{title:e.$t("capture"),size:"full"},on:{close:function(i){e.enable_capture_mode=!1}}},[t("CaptureView",{attrs:{available_modes:[],selected_mode:"photo",return_temp_media:!0,must_validate_media:!1},on:{close:function(i){e.enable_capture_mode=!1},tempMedia:e.tempMedia}})],1):e._e()],1):e._e(),t("small",{staticClass:"u-instructions"},[e._v(e._s(e.$t("or_paste_an_image")))])])},p=[],u=r(_,d,p,!1,null,"5dd899b2");const h=u.exports;export{h as default};
