(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[432],{5512:function(e,t,i){"use strict";i.d(t,{Z:function(){return d}});var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"_mediaPicker"},[i("PickMediaFromProjects",{attrs:{path:e.current_project_path,select_mode:"multiple"},on:{addMedias:function(t){return e.$emit("addMedias",t)},close:function(t){return e.$emit("close")}}})],1)},o=[],s={props:{publication_path:String},components:{},data(){return{}},async created(){},beforeDestroy(){},watch:{},computed:{current_project_path(){const e=this.getParent(this.publication_path);return this.getParent(e)}},methods:{}},n=s,l=i(1001),r=(0,l.Z)(n,a,o,!1,null,"631237e0",null),d=r.exports},68115:function(e,t,i){"use strict";i.d(t,{Z:function(){return h}});var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"_moduleCreator"},[e.show_module_selector||!e.is_collapsed?i("div",{staticClass:"_typePicker"},[i("button",{staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:e.createText}},[i("sl-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{name:"fonts",label:e.$t("add_text")}})],1),i("button",{staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(t){e.show_media_picker=!0}}},[i("sl-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{name:"image",label:e.$t("add_medias")}})],1),e.show_media_picker?i("MediaPicker",{attrs:{publication_path:e.publication_path},on:{addMedias:e.createMosaic,close:function(t){e.show_media_picker=!1}}}):e._e(),i("button",{staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(t){e.show_file_picker=!0}}},[i("sl-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{name:"file-earmark-binary-fill",label:e.$t("add_files")}})],1),e.show_file_picker?i("MediaPicker",{attrs:{publication_path:e.publication_path},on:{addMedias:e.createFiles,close:function(t){e.show_file_picker=!1}}}):e._e(),i("button",{staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(t){e.show_link_picker=!0}}},[i("sl-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{name:"link",label:e.$t("add_link")}})],1),e.show_link_picker?i("LinkPicker",{attrs:{publication_path:e.publication_path},on:{embed:e.createEmbed,close:function(t){e.show_link_picker=!1}}}):e._e(),!0===e.show_shapes?e._l(e.shapes,(function(t){return i("button",{key:t.type,staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(i){return e.createModule({module_type:t.type,addtl_meta:t.addtl_meta})}}},[i("sl-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{name:t.icon,label:e.$t(t.type)}})],1)})):e._e()],2):e._e(),e.is_collapsed?i("button",{staticClass:"u-button u-button_transparent u-addBtn",style:e.show_module_selector?"transform: rotate(45deg);":"",attrs:{type:"button"},on:{click:function(t){e.show_module_selector=!e.show_module_selector}}},[i("sl-icon",{attrs:{name:"plus-circle"}})],1):e._e(),i("DropZone",{on:{mediaDropped:e.createMosaic}})],1)},o=[],s=(i(57658),i(5512)),n=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("BaseModal2",{on:{close:function(t){return e.$emit("close")}}},[i("div",{staticClass:"_linkPicker"},[i("div",{staticClass:"_urlBox"},[i("DLabel",{attrs:{str:e.$t("input_url"),instructions:e.$t("input_url_instr")}}),i("input",{directives:[{name:"model",rawName:"v-model",value:e.full_url,expression:"full_url"}],attrs:{type:"url",placeholder:"https://"},domProps:{value:e.full_url},on:{input:function(t){t.target.composing||(e.full_url=t.target.value)}}})],1),i("div",{staticClass:"u-instructions"},[e._v(" PeerTube, YouTube, Vimeo, etc. "+e._s(e.$t("for_example"))+"  "),e._l(["https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde","https://www.youtube.com/watch?v=Bn6zdyCAwJs","https://vimeo.com/447785086","https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas"],(function(t,a){return i("button",{key:a,staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{innerHTML:e._s(t)},on:{click:function(i){e.full_url=t}}})}))],2),i("br"),i("div",{key:e.full_url},["any"===e.url_to_site.type?[i("iframe",{staticClass:"_siteIframe",attrs:{src:e.url_to_site.src,frameborder:"0"}})]:i("vue-plyr",[i("div",{staticClass:"plyr__video-embed"},[i("iframe",{attrs:{src:e.url_to_site.src,allowfullscreen:"",allowtransparency:"",allow:"autoplay; fullscreen",sandbox:"allow-same-origin allow-scripts allow-popups",frameborder:"0"}})])])],2),i("br"),e.full_url?i("div",{staticClass:"_selectBtn"},[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(t){return e.$emit("close")}}},[e._v(" "+e._s(e.$t("cancel"))+" ")]),i("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(t){return e.$emit("embed",e.full_url)}}},[e._v(" "+e._s(e.$t("embed"))+" ")])]):e._e()])])},l=[],r={props:{publication_path:String},components:{},data(){return{full_url:"https://"}},async created(){},beforeDestroy(){},watch:{},computed:{url_to_site(){return!!this.full_url&&this.transformURL({url:this.full_url,autoplay:!1})}},methods:{}},d=r,u=(i(70586),i(1001)),c=(0,u.Z)(d,n,l,!1,null,"5f9b4bb8",null),_=c.exports,p={props:{publication_path:String,addtl_meta:Object,context:String,show_shapes:Boolean,is_collapsed:{type:Boolean,default:!0}},components:{MediaPicker:s.Z,LinkPicker:_},data(){return{show_module_selector:!1,show_media_picker:!1,show_file_picker:!1,show_link_picker:!1,shapes:[{type:"ellipsis",icon:"circle-fill",addtl_meta:{background_color:"#1d327f"}},{type:"rectangle",icon:"square-fill",addtl_meta:{background_color:"#ffbe32"}},{type:"line",icon:"dash-lg",addtl_meta:{outline_width:1,outline_color:"#000000"}},{type:"arrow",icon:"arrow-right-square",addtl_meta:{outline_width:1,outline_color:"#000000"}}],is_saving:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async createMosaic({meta_filename:e,path_to_source_media_metas:t}){let i=[];if(e?i.push({meta_filename:e}):t&&t.map((e=>{const t=this.getFilename(e);i.push({meta_filename_in_project:t})})),"page_by_page"===this.context&&(i=i.map((e=>(e.objectFit="contain",e)))),"page_by_page"===this.context)for(const o of i){var a;const e=this.getSourceMedia({source_media:o,folder_path:this.publication_path});let t={};null!==e&&void 0!==e&&null!==(a=e.$infos)&&void 0!==a&&a.ratio&&(t.height=this.$root.default_new_module_width*e.$infos.ratio),await this.createModule({module_type:"mosaic",source_medias:[o],addtl_meta:t})}else await this.createModule({module_type:"mosaic",source_medias:i});this.show_media_picker=!1},async createEmbed(e){const t=await this.$api.uploadText({path:this.publication_path,filename:"url.txt",content:e,additional_meta:{module_type:this.module_type,$type:"url"}});this.createMosaic({meta_filename:t})},async createFiles({path_to_source_media_metas:e}){let t=[];e.map((e=>{const i=this.getFilename(e);t.push({meta_filename_in_project:i})})),await this.createModule({module_type:"files",source_medias:t}),this.show_file_picker=!1},async createText(){const e=await this.$api.uploadText({path:this.publication_path,filename:"text.txt",content:"",additional_meta:{caption:"plip",module_type:this.module_type}}),t=[{meta_filename:e}];await this.createModule({module_type:"text",source_medias:t})},async createModule({module_type:e,source_medias:t=[],addtl_meta:i={}}){const a=await this.createMetaForModule({module_type:e,source_medias:t,addtl_meta:i});this.$emit("addModule",{meta_filename:a}),this.show_module_selector=!1},async createMetaForModule({module_type:e,source_medias:t,addtl_meta:i}){let a={module_type:e,source_medias:t,requested_slug:"module"};return this.addtl_meta&&Object.assign(a,this.addtl_meta,i),await this.$api.uploadFile({path:this.publication_path,additional_meta:a}).catch((e=>{throw this.$alertify.delay(4e3).error(e),e}))}}},m=p,f=(i(65006),(0,u.Z)(m,a,o,!1,null,"5fe0d5e8",null)),h=f.exports},86356:function(e,t,i){"use strict";i.d(t,{Z:function(){return P}});var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"_publicationModule",class:{"is--shape":e.is_shape,"has--fsButton":e.show_fs_button}},[e.can_edit&&"page_by_page"!==e.page_template?i("div",{staticClass:"_sideOptions"},[i("span",[e.$listeners.hasOwnProperty("moveUp")&&"first"!==e.module_position&&"alone"!==e.module_position?i("button",{staticClass:"_sideBtns _moveBefore",attrs:{type:"button"},on:{click:function(t){return e.$emit("moveUp")}}},[i("svg",{staticStyle:{transform:"rotate(90deg)"},attrs:{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 168 168"}},[i("path",{staticStyle:{fill:"currentColor"},attrs:{d:"M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"}})])]):e._e()]),i("div",{staticClass:"_options"},[i("button",{staticClass:"_sideBtns",class:{"is--active":e.show_advanced_menu},attrs:{type:"button"},on:{click:function(t){t.stopPropagation(),e.show_advanced_menu=!e.show_advanced_menu}}},[i("svg",{staticStyle:{fill:"currentColor"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",width:"24",height:"24",viewBox:"0 0 48 48","xml:space":"preserve"}},[i("circle",{attrs:{cx:"12",cy:"24",r:"4"}}),i("circle",{attrs:{cx:"24",cy:"24",r:"4"}}),i("circle",{attrs:{cx:"36",cy:"24",r:"4"}})])]),e.show_advanced_menu?i("div",{staticClass:"_advanced_menu"},[i("sl-button",{attrs:{variant:"default",size:"small",pill:""}},[e._v(" "+e._s(e.$t("module.label."+e.publimodule.module_type))+" ")]),i("div",{staticClass:"_buttonRow"},[i("button",{staticClass:"u-button",attrs:{type:"button",disabled:!e.publimodule.size||100===e.publimodule.size},on:{click:function(t){return e.updateMeta({size:100})}}},[e._v(" 100% ")]),i("button",{staticClass:"u-button",attrs:{type:"button",disabled:66.6===e.publimodule.size},on:{click:function(t){return e.updateMeta({size:66.6})}}},[e._v(" 66% ")]),i("button",{staticClass:"u-button",attrs:{type:"button",disabled:50===e.publimodule.size},on:{click:function(t){return e.updateMeta({size:50})}}},[e._v(" 50% ")]),i("button",{staticClass:"u-button",attrs:{type:"button",disabled:33.3===e.publimodule.size},on:{click:function(t){return e.updateMeta({size:33.3})}}},[e._v(" 33% ")])]),e.publimodule.size&&100!==e.publimodule.size?i("div",{staticClass:"_buttonRow"},[i("button",{staticClass:"u-button",attrs:{type:"button",disabled:!e.publimodule.align||"left"===e.publimodule.align},on:{click:function(t){return e.updateMeta({align:"left"})}}},[i("sl-icon",{attrs:{name:"align-start"}})],1),i("button",{staticClass:"u-button",attrs:{type:"button",disabled:"center"===e.publimodule.align},on:{click:function(t){return e.updateMeta({align:"center"})}}},[i("sl-icon",{attrs:{name:"align-center"}})],1),i("button",{staticClass:"u-button",attrs:{type:"button",disabled:"right"===e.publimodule.align},on:{click:function(t){return e.updateMeta({align:"right"})}}},[i("sl-icon",{attrs:{name:"align-end"}})],1)]):e._e(),i("div",{staticClass:"_buttonRow"},[i("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:e.duplicateModule}},[e._v(" "+e._s(e.$t("duplicate"))+" ")]),i("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:e.removeModule}},[e._v(" "+e._s(e.$t("remove"))+" ")])])],1):e._e()]),i("span",[e.$listeners.hasOwnProperty("moveDown")&&"last"!==e.module_position&&"alone"!==e.module_position?i("button",{staticClass:"_sideBtns _moveAfter",attrs:{type:"button"},on:{click:function(t){return e.$emit("moveDown")}}},[i("svg",{staticStyle:{transform:"rotate(90deg)"},attrs:{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 168 168"}},[i("path",{staticStyle:{fill:"currentColor"},attrs:{d:"M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"}})])]):e._e()])]):e._e(),i("div",{staticClass:"_content",style:e.media_styles},[["mosaic","files"].includes(e.publimodule.module_type)?i("MediasModule",{attrs:{publimodule:e.publimodule,can_edit:e.can_edit,context:e.context,page_template:e.page_template,number_of_max_medias:e.number_of_max_medias,show_fs_button:e.show_fs_button},on:{updateMeta:e.updateMeta,remove:e.removeModule}}):"text"===e.publimodule.module_type&&e.first_media?i("CollaborativeEditor2",{ref:"textBloc",attrs:{path:e.first_media.$path,content:e.first_media.$content,scrollingContainer:e.$el,line_selected:!1,can_edit:e.can_edit},on:{lineClicked:function(t){return e.$emit("lineClicked",t)},contentIsEdited:function(t){return e.$emit("contentIsEdited",t)},contentIsNotEdited:function(t){return e.$emit("contentIsNotEdited",t)}}}):e.is_shape?[i("svg",{attrs:{viewBox:"0 0 100 100",preserveAspectRatio:"none",xmlns:"http://www.w3.org/2000/svg"}},["ellipsis"===e.publimodule.module_type?i("circle",{attrs:{cx:"50",cy:"50",r:50-e.publimodule.outline_width*e.magnification/8,"vector-effect":"non-scaling-stroke"}}):"rectangle"===e.publimodule.module_type?i("rect",{attrs:{x:e.publimodule.outline_width*e.magnification/4,y:e.publimodule.outline_width*e.magnification/4,width:100-e.publimodule.outline_width*e.magnification/2,height:100-e.publimodule.outline_width*e.magnification/2,"vector-effect":"non-scaling-stroke",rx:e.borderRadius/2||0,ry:e.borderRadius/2||0}}):"line"===e.publimodule.module_type?i("g",[i("rect",{attrs:{width:"100",height:"100","vector-effect":"non-scaling-stroke",stroke:"none",rx:e.borderRadius/2||0,ry:e.borderRadius/2||0}}),i("line",{attrs:{x1:e.publimodule.outline_width*e.magnification/4||0,y1:"50",x2:100-(e.publimodule.outline_width*e.magnification/4||0),y2:"50","vector-effect":"non-scaling-stroke"}})]):"arrow"===e.publimodule.module_type?i("g",[i("rect",{attrs:{width:"100",height:"100","vector-effect":"non-scaling-stroke",stroke:"none",rx:e.borderRadius/2||0,ry:e.borderRadius/2||0}}),i("line",{attrs:{x1:e.publimodule.outline_width*e.magnification/4||0,y1:"50",x2:100-(e.publimodule.outline_width*e.magnification/4||0),y2:"50","vector-effect":"non-scaling-stroke"}}),i("g",{attrs:{transform:"\n              translate("+(100-(e.publimodule.outline_width*e.magnification/4||0))+", 50)",preserveAspectRatio:""}},[i("line",{attrs:{x1:"0",y1:"0",x2:"-10",y2:"-10","vector-effect":"non-scaling-stroke"}}),i("line",{attrs:{x1:"0",y1:"0",x2:"-10",y2:"10","vector-effect":"non-scaling-stroke"}})])]):e._e()])]:"free_drawing"===e.publimodule.module_type?void 0:i("small",[e._v(e._s(e.$t("nothing_to_show")))])],2)])},o=[],s=(i(52262),i(24506),i(26699),function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("transition",{attrs:{name:"fade_fast",mode:"out-in"}},[i("div",{key:e.medias_with_linked.length>1?"multiple":"single",staticClass:"_mediasModule",style:"--number_of_medias: "+e.medias_with_linked.length},["mosaic"===e.publimodule.module_type?i("MosaicMediaGrid",{attrs:{medias_with_linked:e.medias_with_linked,context:e.context,page_template:e.page_template,show_fs_button:e.show_fs_button,number_of_max_medias:e.number_of_max_medias,publication_path:e.publication_path,can_edit:e.can_edit},on:{addMedias:e.addMedias,removeMediaAtIndex:e.removeMediaAtIndex,updateMediaOpt:e.updateMediaOpt}}):e._e(),"files"===e.publimodule.module_type?i("FilesList",{attrs:{medias_with_linked:e.medias_with_linked,publication_path:e.publication_path,can_edit:e.can_edit},on:{addMedias:e.addMedias,reorderMedias:e.reorderMedias,removeMediaAtIndex:e.removeMediaAtIndex}}):e._e()],1)])}),n=[],l=(i(85827),i(57658),function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"_mediaGrid",class:{"is--multipleMedias":e.is_multiple_medias}},[e._l(e.medias_with_linked,(function(t,a){return[i("div",{key:t._linked_media&&t._linked_media.$path||"no_media_"+a,staticClass:"_mediaGrid--item",style:e.itemStyle({media_with_linked:t})},[t._linked_media?i("MediaContent",{attrs:{file:t._linked_media,resolution:"preview"===e.context?220:1600,context:e.context,show_fs_button:e.show_fs_button}}):i("span",{staticClass:"_noSourceMedia u-instructions",domProps:{textContent:e._s(e.$t("source_media_missing"))}}),e.can_edit?i("div",{staticClass:"_btnRow"},[(e.is_multiple_medias||"page_by_page"===e.page_template&&!e.single_media_displayed_at_full_ratio)&&t.objectFit&&"cover"!==t.objectFit?i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(t){return e.$emit("updateMediaOpt",{index:a,opt:{objectFit:"cover"}})}}},[e._v(" "+e._s(e.$t("object_fit_cover"))+" ")]):e._e(),(e.is_multiple_medias||"page_by_page"===e.page_template&&!e.single_media_displayed_at_full_ratio)&&"contain"!==t.objectFit?i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(t){return e.$emit("updateMediaOpt",{index:a,opt:{objectFit:"contain"}})}}},[e._v(" "+e._s(e.$t("object_fit_contain"))+" ")]):e._e(),e.is_multiple_medias?i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(t){return e.$emit("removeMediaAtIndex",a)}}},[e._v(" "+e._s(e.$t("remove"))+" ")]):e._e()]):e._e()],1)]})),e.can_edit&&(!e.number_of_max_medias||e.medias_with_linked.length<e.number_of_max_medias)?i("div",{staticClass:"_mediaPickerTile"},[i("button",{staticClass:"u-button u-button_transparent u-addBtn",attrs:{type:"button"},on:{click:function(t){e.show_media_picker=!0}}},[i("sl-icon",{attrs:{name:"plus-circle"}})],1),e.show_media_picker?i("MediaPicker",{attrs:{publication_path:e.publication_path},on:{addMedias:function(t){return e.$emit("addMedias",t)},close:function(t){e.show_media_picker=!1}}}):e._e(),!e.number_of_max_medias||e.medias_with_linked.length<e.number_of_max_medias?[i("DropZone",{on:{mediaDropped:function(t){return e.$emit("addMedias",t)}}})]:e._e()],2):e._e()],2)}),r=[],d=i(5512),u={props:{medias_with_linked:Array,context:String,page_template:String,show_fs_button:Boolean,number_of_max_medias:[Boolean,Number],publication_path:String,can_edit:Boolean},components:{MediaPicker:d.Z},data(){return{show_media_picker:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{is_multiple_medias(){return this.medias_with_linked.length>1},single_media_displayed_at_full_ratio(){var e;if(this.medias_with_linked.length>1)return!1;const t=null===(e=this.medias_with_linked[0]._linked_media.$infos)||void 0===e?void 0:e.ratio;return Math.round(10*t)===Math.round(this.publimodule.height/this.publimodule.width*10)}},methods:{itemStyle({media_with_linked:e}){let t={};return t["--object-fit"]=e.objectFit||"cover",t}}},c=u,_=(i(55687),i(1001)),p=(0,_.Z)(c,l,r,!1,null,"47b0af69",null),m=p.exports,f=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"_filesList"},[i("DLabel",{attrs:{str:e.$t("source_files")}}),i("SlickList",{staticClass:"_listOfFiles",attrs:{axis:"y",value:e.medias_with_linked.map((function(e){return e.meta_filename_in_project})),useDragHandle:!0},on:{input:function(t){return e.$emit("reorderMedias",t)}}},e._l(e.medias_with_linked,(function(t,a){var o=t._linked_media;return i("SlickItem",{key:o.$path,staticClass:"_reorderedFile",attrs:{index:a}},[e.can_edit?i("span",{directives:[{name:"handle",rawName:"v-handle"}],staticClass:"u-dragHandle"},[i("sl-icon",{attrs:{name:"grip-vertical",label:"Déplacer"}})],1):e._e(),o&&o.$path?i("span",{staticClass:"_link"},[["image","video","audio","pdf","stl","url"].includes(o.$type)?i("MediaContent",{staticClass:"_preview",attrs:{file:o,resolution:220}}):i("div",{staticClass:"_preview _preview--none"},[i("sl-icon",{attrs:{name:"file-earmark-arrow-down"}})],1),i("span",{staticClass:"_link--filename",domProps:{textContent:e._s(o.$media_filename)}}),o.$infos.size?[i("span",{staticClass:"u-instructions _link--filesize",domProps:{textContent:e._s(e.formatBytes(o.$infos.size))}})]:e._e()],2):e._e(),o&&o.$path?i("DownloadFile",{attrs:{file:o}},[i("sl-icon-button",{attrs:{name:"file-earmark-arrow-down-fill"}})],1):e._e(),e.can_edit?i("sl-icon-button",{attrs:{name:"x",size:"small"},on:{click:function(t){return e.$emit("removeMediaAtIndex",a)}}}):e._e()],1)})),1),e.can_edit?i("div",{staticClass:"_addBtnSection"},[i("button",{staticClass:"u-button u-button_transparent u-addBtn",attrs:{type:"button"},on:{click:function(t){e.show_media_picker=!0}}},[i("sl-icon",{attrs:{name:"plus-circle"}}),e._v(" "+e._s(e.$t("add_files"))+" ")],1),e.show_media_picker?i("MediaPicker",{attrs:{publication_path:e.publication_path},on:{addMedias:function(t){return e.$emit("addMedias",t)},close:function(t){e.show_media_picker=!1}}}):e._e(),i("DropZone",{on:{mediaDropped:function(t){return e.$emit("addMedias",t)}}})],1):e._e()],1)},h=[],b=i(55656),v={props:{medias_with_linked:Array,publication_path:String,can_edit:Boolean},components:{SlickItem:b.SlickItem,SlickList:b.SlickList,MediaPicker:d.Z},directives:{handle:b.HandleDirective},data(){return{show_media_picker:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},g=v,w=(i(51445),(0,_.Z)(g,f,h,!1,null,"5195f106",null)),y=w.exports,x={props:{publimodule:Object,context:{type:String,default:"full"},page_template:String,number_of_max_medias:[Boolean,Number],show_fs_button:Boolean,can_edit:Boolean},components:{MosaicMediaGrid:m,FilesList:y},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{publication_path(){return this.getParent(this.publimodule.$path)},medias_with_linked(){return this.publimodule.source_medias?this.publimodule.source_medias.map((e=>{const t=this.getSourceMedia({source_media:e,folder_path:this.publication_path});return Object.assign({},e,{_linked_media:t})})):[]}},methods:{addMedias({path_to_source_media_metas:e}){const t=e.map((e=>({meta_filename_in_project:this.getFilename(e)}))),i=this.publimodule.source_medias.slice()||[],a=i.concat(t);this.$emit("updateMeta",{source_medias:a})},removeMediaAtIndex(e){const t=this.publimodule.source_medias.slice();t.splice(e,1),0===t.length?this.$emit("remove"):this.$emit("updateMeta",{source_medias:t})},reorderMedias(e){const t=this.publimodule.source_medias.slice(),i=e.reduce(((e,i)=>{const a=t.find((e=>e.meta_filename_in_project===i));return a&&e.push(a),e}),[]);this.$emit("updateMeta",{source_medias:i})},updateMediaOpt({index:e,opt:t}){const i=this.publimodule.source_medias.slice();Object.assign(i[e],t),this.$emit("updateMeta",{source_medias:i})}}},k=x,M=(i(71624),(0,_.Z)(k,s,n,!1,null,"39ae7987",null)),$=M.exports,C={props:{publimodule:Object,module_position:String,can_edit:Boolean,magnification:Number,borderRadius:Number,context:String,page_template:String,number_of_max_medias:{type:[Boolean,Number],default:!1}},components:{MediasModule:$},data(){return{show_advanced_menu:!1}},created(){},mounted(){this.$eventHub.$on(`module.enable_edit.${this.module_meta_filename}`,this.enableEditForText),this.$eventHub.$on(`module.duplicate.${this.module_meta_filename}`,this.duplicateModule),this.$eventHub.$on(`module.remove.${this.module_meta_filename}`,this.removeModule)},beforeDestroy(){this.$eventHub.$off(`module.enable_edit.${this.module_meta_filename}`,this.enableEditForText),this.$eventHub.$off(`module.duplicate.${this.module_meta_filename}`,this.duplicateModule),this.$eventHub.$off(`module.remove.${this.module_meta_filename}`,this.removeModule)},watch:{},computed:{module_meta_filename(){return this.publimodule.$path.split("/").at(-1)},is_shape(){return["ellipsis","rectangle","line","arrow"].includes(this.publimodule.module_type)},show_fs_button(){return"page_by_page"!==this.page_template||!0===this.publimodule.show_fs_button},first_media(){if(!this.publimodule.source_medias||0===this.publimodule.source_medias.length)return!1;const e=this.publimodule.source_medias[0];if(e){const t=this.getParent(this.publimodule.$path);return this.getSourceMedia({source_media:e,folder_path:t})}return!1},media_styles(){let e=0;return"center"===this.publimodule.align&&(66.6===this.publimodule.size?e=16.6:50===this.publimodule.size?e=25:33.3===this.publimodule.size&&(e=33.3)),"right"===this.publimodule.align&&(66.6===this.publimodule.size?e=33.3:50===this.publimodule.size?e=50:33.3===this.publimodule.size&&(e=66.6)),{"--module-width":this.publimodule.size||100,"--module-margin-left":e}}},methods:{async updateMeta(e){await this.$api.updateMeta({path:this.publimodule.$path,new_meta:e}).catch((e=>{throw this.$alertify.delay(4e3).error(e),e}))},enableEditForText(){this.$nextTick((()=>{this.$refs.textBloc&&this.$refs.textBloc.enableEditor()}))},async duplicateModule(){let e={};"page_by_page"===this.page_template&&(e.x=(this.publimodule.x||0)+10,e.y=(this.publimodule.y||0)+10);const t=await this.duplicateModuleWithSourceMedias({og_module:this.publimodule,addtl_meta_to_module:e});this.$emit("duplicate",t)},async removeModule(){await this.$api.deleteItem({path:this.publimodule.$path}).catch((e=>{throw this.$alertify.delay(4e3).error(e),e})),this.$emit("remove")}}},z=C,F=(i(26411),(0,_.Z)(z,a,o,!1,null,"3674f1fb",null)),P=F.exports},18432:function(e,t,i){"use strict";i.r(t),i.d(t,{default:function(){return c}});var a=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{staticClass:"_storyTemplate"},[e.can_edit?i("div",{staticClass:"_settings"},[i("details",[i("summary",[e._v(e._s(e.$t("settings")))]),i("RangeValueInput",{staticClass:"u-spacingBottom",attrs:{label:e.$t("story_width"),value:e.publication.story_width,min:0,max:2400,step:1,ticks:[320,480,800,1200,2400],default_value:800,suffix:"px"},on:{save:function(t){return e.updatePubliMeta({story_width:t})}}}),i("ToggleInput",{attrs:{content:!0!==e.publication.story_is_not_responsive,label:e.$t("responsive"),options:{true:e.$t("responsive_instr"),false:e.$t("not_responsive_instr")}},on:{"update:content":function(t){return e.updatePubliMeta({story_is_not_responsive:!t})}}})],1)]):e._e(),i("div",{staticClass:"_storyContainer"},[i("div",{staticClass:"_storyContent",style:e.story_styles},[i("transition-group",{attrs:{tag:"div",name:"StoryModules",appear:"",duration:700}},[e._l(e.modules_list,(function(t,a){return[i("PublicationModule",{key:t,staticClass:"_mediaPublication",attrs:{publimodule:e.findModuleFromMetaFilename(t),module_position:1===e.modules_list.length?"alone":0===a?"first":a===e.modules_list.length-1?"last":"inbetween",can_edit:e.can_edit},on:{resize:function(i){return e.resize({meta_filename:t,new_size:i})},moveUp:function(i){return e.moveTo({meta_filename:t,dir:-1})},moveDown:function(i){return e.moveTo({meta_filename:t,dir:1})},duplicate:function(i){return e.duplicatePublicationMedia({source_meta_filename:t,copy_meta_filename:i})},remove:function(i){return e.removeModuleFromList(t)}}}),i("div",{key:"mc_"+a,staticClass:"_spacer"},[e.can_edit?i("ModuleCreator",{attrs:{publication_path:e.publication.$path},on:{addModule:function(t){var i=t.meta_filename;return e.insertModuleMetaFilenameToList({meta_filename:i,index:a+1})}}}):e._e()],1)]}))],2)],1)]),!e.can_edit||e.modules_list&&0!==e.modules_list.length?e._e():i("ModuleCreator",{attrs:{publication_path:e.publication.$path},on:{addModule:e.appendModuleMetaFilenameToList}})],1)},o=[],s=(i(85827),i(57658),i(68115)),n=i(86356),l={props:{publication:Object,can_edit:Boolean},components:{ModuleCreator:s.Z,PublicationModule:n.Z},data(){return{medias:[],fetch_publication_error:null}},created(){},async mounted(){},beforeDestroy(){},watch:{},computed:{story_styles(){const e=(this.publication.story_width||800)+"px";return!0===this.publication.story_is_not_responsive?{width:e,maxWidth:"none"}:{maxWidth:e}},modules_list(){if(this.publication.modules_list&&Array.isArray(this.publication.modules_list)){const e=this.publication.modules_list.reduce(((e,t)=>{const i=this.findModuleFromMetaFilename(t);return i&&e.push(t),e}),[]);return e}return[]}},methods:{async appendModuleMetaFilenameToList({meta_filename:e}){const t=this.modules_list.slice();t.push(e),await this.updateMeta({new_meta:{modules_list:t}}),this.toggleNewModuleEdit({meta_filename:e})},async insertModuleMetaFilenameToList({meta_filename:e,index:t}){const i=this.modules_list.slice();i.splice(t,0,e),await this.updateMeta({new_meta:{modules_list:i}}),this.toggleNewModuleEdit({meta_filename:e})},async updatePubliMeta(e){return await this.$api.updateMeta({path:this.publication.$path,new_meta:e})},async updateMeta({new_meta:e}){this.fetch_status="pending",this.fetch_error=null;try{this.response=await this.$api.updateMeta({path:this.publication.$path,new_meta:e}),this.fetch_status="success"}catch(t){this.fetch_status="error",this.fetch_error=t.response.data}},findModuleFromMetaFilename(e){return this.publication.$files?this.publication.$files.find((t=>{const i=t.$path.substring(t.$path.lastIndexOf("/")+1);return i===e})):[]},async moveTo({meta_filename:e,dir:t}){let i=this.modules_list.slice();const a=i.findIndex((t=>t===e));return!(a+t<0)&&(!(a+t>i.length-1)&&(i.move(a,a+t),void(this.response=await this.updatePubliMeta({modules_list:i}))))},async duplicatePublicationMedia({source_meta_filename:e,copy_meta_filename:t}){let i=this.modules_list.slice();const a=i.findIndex((t=>t===e));i.splice(a+1,0,t),this.response=await this.updatePubliMeta({modules_list:i})},async removeModuleFromList(e){let t=this.modules_list.slice();t=t.filter((t=>t!==e)),this.response=await this.updatePubliMeta({modules_list:t})},toggleNewModuleEdit({meta_filename:e}){setTimeout((()=>{console.log(`emit module.enable_edit.${e}`),this.$eventHub.$emit(`module.enable_edit.${e}`)}),50)}}},r=l,d=(i(84770),i(1001)),u=(0,d.Z)(r,a,o,!1,null,"759e3c2e",null),c=u.exports},53024:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._linkPicker[data-v-5f9b4bb8]{width:100%;margin:0 auto}._addMediaBtn[data-v-5f9b4bb8]{text-align:center;padding:calc(var(--spacing)*1)}._selectBtn[data-v-5f9b4bb8]{display:flex;place-items:center;justify-content:center;width:100%;gap:calc(var(--spacing)/1);background:#fff}iframe[data-v-5f9b4bb8]{width:100%;aspect-ratio:4/3}",""]),t["default"]=l},84700:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._filesList[data-v-5195f106]{text-align:center}._listOfFiles[data-v-5195f106]{padding:0;margin:0;display:flex;flex-flow:column nowrap;gap:calc(var(--spacing)/4)}._reorderedFile[data-v-5195f106]{z-index:10000;padding:0;min-height:2em;background:#fff;border:1px solid var(--c-gris);display:flex;flex-flow:row nowrap;justify-content:center;word-break:break-word;align-items:center;padding:0 calc(var(--spacing)/2);gap:calc(var(--spacing)/2);border-radius:2px;justify-content:space-between}._reorderedFile[data-v-5195f106]:focus-visible,._reorderedFile[data-v-5195f106]:hover{background:var(--c-gris)}._reorderedFile ._link[data-v-5195f106]{flex:1 1 auto;overflow:hidden;font-variant:none;font-weight:400;letter-spacing:0;font-size:var(--sl-font-size-x-small);text-decoration:none;display:flex;flex-flow:row nowrap;align-items:center;gap:calc(var(--spacing)/1)}._reorderedFile ._link>*[data-v-5195f106]{flex:1 1 50px}._reorderedFile ._link ._preview[data-v-5195f106]{flex:0 0 auto;font-size:100%;width:45px;height:45px;overflow:hidden;border-radius:4px;background:var(--c-gris_clair)}._reorderedFile ._link ._preview[data-v-5195f106]:focus-visible,._reorderedFile ._link ._preview[data-v-5195f106]:hover{background:#fff}._reorderedFile ._link ._preview._preview--none[data-v-5195f106]{display:flex;justify-content:center;align-items:center;font-size:150%}._reorderedFile ._link ._preview[data-v-5195f106]  ._mediaContent--image{position:absolute;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;max-width:none}._reorderedFile ._link ._link--filename[data-v-5195f106]{flex:1 1 0;text-align:left;white-space:break-spaces}._reorderedFile ._link ._link--filename[data-v-5195f106],._reorderedFile ._link ._link--filesize[data-v-5195f106]{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}._reorderedFile ._link ._link--filesize[data-v-5195f106]{flex:0 0 50px}._addBtnSection[data-v-5195f106]{padding:calc(var(--spacing)/4)}",""]),t["default"]=l},58613:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._mediasModule[data-v-39ae7987]{--number_of_medias:1;position:relative}._dropzone[data-v-39ae7987]{position:absolute;width:100%;height:100%}._dropzone[data-v-39ae7987]  ._dropNotice{transform:rotate(-90deg)}sl-icon-button[data-v-39ae7987]::part(base){font-size:1.5em;color:var(--c-bleuvert)}",""]),t["default"]=l},89425:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._moduleCreator[data-v-5fe0d5e8]{position:relative;display:flex;justify-content:center;align-items:center;width:100%;pointer-events:none;color:var(--c-bleuvert);border-radius:1rem;--icon-size:1.2rem}._moduleCreator>*[data-v-5fe0d5e8]{pointer-events:auto}._typePicker[data-v-5fe0d5e8]{display:flex;flex-flow:row wrap;justify-content:flex-start;gap:calc(var(--spacing)/4)}._dropNotice[data-v-5fe0d5e8]{pointer-events:none}sl-icon-button[data-v-5fe0d5e8]::part(base){font-size:1.5em;color:var(--c-bleuvert)}._showModuleSelector[data-v-5fe0d5e8]{transition:all .4s cubic-bezier(.19,1,.22,1)}",""]),t["default"]=l},32213:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._mediaGrid[data-v-47b0af69]{position:relative;width:100%}._mediaGrid.is--multipleMedias[data-v-47b0af69]{display:flex;flex-flow:row nowrap;gap:calc(var(--spacing)/4);transition:flex .25s cubic-bezier(.19,1,.22,1)}._mediaGrid>._mediaGrid--item[data-v-47b0af69]{position:relative;transition:flex .25s cubic-bezier(.19,1,.22,1)}._mediaGrid.is--multipleMedias>._mediaGrid--item[data-v-47b0af69]{aspect-ratio:1/1;overflow:hidden;background:var(--c-gris_clair);flex:1 1 calc(100%/var(--number_of_medias))}._mediaGrid.is--multipleMedias[data-v-47b0af69]  ._mediaContent{width:100%;height:100%}._mediaGrid.is--multipleMedias[data-v-47b0af69]  ._mediaContent img{width:100%;height:100%}._mediaGrid.is--multipleMedias[data-v-47b0af69]  ._mediaContent ._mediaContent--iframe,._mediaGrid.is--multipleMedias[data-v-47b0af69]  ._mediaContent ._mediaContent--image,._mediaGrid.is--multipleMedias[data-v-47b0af69]  ._mediaContent .plyr--video{position:absolute;height:100%;width:100%;-o-object-fit:var(--object-fit,cover);object-fit:var(--object-fit,cover)}._mediaPickerTile[data-v-47b0af69]{position:absolute;top:0;left:100%;display:flex;place-content:center;height:100%;align-items:center;pointer-events:none}._mediaPickerTile>*[data-v-47b0af69]{pointer-events:auto}._btnRow[data-v-47b0af69]{position:absolute;padding:calc(var(--spacing)/2);top:0;right:0;left:auto;z-index:100;display:flex;flex-flow:row wrap;gap:calc(var(--spacing)/2);pointer-events:none}._btnRow button[data-v-47b0af69]{pointer-events:auto;border-radius:4px;color:#fff;text-shadow:0 0 4px rgba(0,0,0,.8)}",""]),t["default"]=l},2565:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._publicationModule[data-v-3674f1fb]{position:relative;padding:0 calc(var(--spacing)*2)}._publicationModule.is--shape ._content[data-v-3674f1fb],._publicationModule.is--shape svg[data-v-3674f1fb]{overflow:visible;stroke-linejoin:arcs;stroke-linecap:round}._publicationModule.is--shape svg[data-v-3674f1fb]{width:100%;height:100%}._publicationModule ._content[data-v-3674f1fb]{width:calc(var(--module-width)*1%);margin-left:calc(var(--module-margin-left)*1%);transition:all .4s cubic-bezier(.19,1,.22,1)}._sideOptions[data-v-3674f1fb]{position:absolute;top:0;height:100%;right:100%;background:var(--active-color);background:rgba(0,0,0,.05);pointer-events:none;display:flex;flex-flow:column nowrap;justify-content:space-between;--side-width:24px;width:var(--side-width);border-radius:calc(var(--side-width)/2)}._sideOptions.is--pageByPage[data-v-3674f1fb]{display:none}._sideOptions>*[data-v-3674f1fb]{pointer-events:auto}._sideBtns[data-v-3674f1fb]{display:block;width:var(--side-width);height:var(--side-width);padding:0;border-radius:calc(var(--side-width)/2);background:transparent}._sideBtns[data-v-3674f1fb]:focus,._sideBtns[data-v-3674f1fb]:hover{background:rgba(0,0,0,.1)}._advanced_menu[data-v-3674f1fb]{position:absolute;z-index:1000;left:100%;top:50%;transform:translateY(-50%);background:#fff;background:var(--active-color);margin:2px;border-radius:4px;flex-flow:column nowrap}._advanced_menu[data-v-3674f1fb],._menu[data-v-3674f1fb]{padding:calc(var(--spacing)/2);display:flex;gap:calc(var(--spacing)/4)}._menu[data-v-3674f1fb]{width:100%;justify-content:flex-end}._menu.is--overlaid[data-v-3674f1fb]{position:absolute;top:0;right:0;z-index:10}._options[data-v-3674f1fb]{position:relative}._buttonRow[data-v-3674f1fb]{display:flex;gap:calc(var(--spacing)/4)}",""]),t["default"]=l},873:function(e,t,i){"use strict";i.r(t);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),l=n()(o());l.push([e.id,"._storyTemplate[data-v-759e3c2e]{display:flex;justify-content:center;flex-flow:column nowrap;align-items:center;margin:0 auto calc(var(--spacing)*4)}._settings[data-v-759e3c2e]{position:relative;top:0;right:0;display:flex;justify-content:flex-end;background:#fff;padding:calc(var(--spacing)/8) calc(var(--spacing)/4);margin:calc(var(--spacing)/2) auto 0;max-width:240px}._storyContainer[data-v-759e3c2e]{width:100%}._storyContent[data-v-759e3c2e]{width:100%;background:#fff;max-width:800px;padding:calc(var(--spacing)*1) 0;margin:calc(var(--spacing)/2) auto;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:all .4s cubic-bezier(.19,1,.22,1)}._mediaPublication[data-v-759e3c2e]{position:relative;margin-bottom:0}._mediaPublication[data-v-759e3c2e]  ._content{min-height:72px}._mediaPublication[data-v-759e3c2e]  ._floatingEditBtn[data-action=disable]{display:none}._spacer[data-v-759e3c2e]{min-height:3rem;display:flex;align-items:center;justify-content:center;padding:calc(var(--spacing)/4) 0}",""]),t["default"]=l},70586:function(e,t,i){var a=i(53024);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("652c5b6c",a,!0,{sourceMap:!1,shadowMode:!1})},51445:function(e,t,i){var a=i(84700);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("20a6a917",a,!0,{sourceMap:!1,shadowMode:!1})},71624:function(e,t,i){var a=i(58613);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("57007799",a,!0,{sourceMap:!1,shadowMode:!1})},65006:function(e,t,i){var a=i(89425);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("289fd354",a,!0,{sourceMap:!1,shadowMode:!1})},55687:function(e,t,i){var a=i(32213);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("43a75006",a,!0,{sourceMap:!1,shadowMode:!1})},26411:function(e,t,i){var a=i(2565);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("3539061f",a,!0,{sourceMap:!1,shadowMode:!1})},84770:function(e,t,i){var a=i(873);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[e.id,a,""]]),a.locals&&(e.exports=a.locals);var o=i(31982).Z;o("635719d9",a,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=432.js.map