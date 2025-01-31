import{n as r,_,I as u}from"../build.js";import{M as d}from"./MediaPicker-CZryquB9.js";const p={props:{path:String,available_modes:Array},components:{CaptureView:()=>_(()=>import("./CaptureView-B5mIJ28p.js"),[])},data(){return{selected_mode:"photo",stopmotion_slug:void 0}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async insertMedia(o){const e=[this.path+"/"+o];this.$emit("createMosaic",{path_to_source_media_metas:e}),this.$emit("close")}}};var m=function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("capture"),size:"full"},on:{close:function(a){return t.$emit("close")}}},[e("CaptureView",{attrs:{path:t.path,selected_mode:t.selected_mode,stopmotion_slug:t.stopmotion_slug,available_modes:t.available_modes},on:{changeMode:function(a){t.selected_mode=a},openStopmotion:function(a){t.stopmotion_slug=a},insertMedia:t.insertMedia}})],1)},f=[],h=r(p,m,f,!1,null,"c8c56c8c");const b=h.exports,y={props:{},components:{},data(){return{is_loading:!1,full_url:"",debounced_full_url:"",debounce_timeout:null,is_inserting_embed:!1}},async created(){},beforeDestroy(){},watch:{full_url(o){this.debounce_timeout&&clearTimeout(this.debounce_timeout),this.is_loading=!0,this.debounce_timeout=setTimeout(()=>{this.is_loading=!1,this.debounced_full_url=o},1e3)}},computed:{url_to_site(){return this.debounced_full_url?this.transformURL({url:this.debounced_full_url,autoplay:!1}):!1}},methods:{insertEmbed(){this.$emit("embed",this.full_url),this.is_inserting_embed=!0},iframeLoaded(){}}};var v=function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("embed"),confirm_before_closing:t.full_url.length>0,is_loading:t.is_inserting_embed},on:{close:function(a){return t.$emit("close")},save:t.insertEmbed}},[e("div",{staticClass:"_linkPicker"},[e("div",{staticClass:"_urlBox"},[e("TextInput",{attrs:{label_str:t.$t("input_url"),instructions:t.$t("input_url_instr"),content:t.full_url,placeholder:"https://",required:!0,input_type:"url"},on:{"update:content":function(a){t.full_url=a},toggleValidity:a=>t.allow_save=a}})],1),e("div",{staticClass:"u-instructions"},[e("small",{staticClass:"_examples"},[t._v(" "+t._s(t.$t("for_example"))+" "),t._l([{url:"https://peertube.fr/w/wB6M6CHdfpWXpozVnqjbde",label:"PeerTube"},{url:"https://www.youtube.com/watch?v=Bn6zdyCAwJs",label:"Youtube"},{url:"https://vimeo.com/447785086",label:"Vimeo"},{url:"https://observablehq.com/embed/@fil/bertin1953-glsl?cells=canvas",label:"Observable"}],function(a,s){return e("button",{key:s,staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{innerHTML:t._s(a.label)},on:{click:function(i){t.full_url=a.url}}})})],2)]),t.is_loading?e("LoaderSpinner",{staticClass:"_loader"}):t.url_to_site?e("div",{key:t.url_to_site.src,staticClass:"_previewEmbed"},[t.url_to_site.type==="any"?[e("iframe",{staticClass:"_siteIframe",attrs:{src:t.url_to_site.src,frameborder:"0"},on:{load:t.iframeLoaded}})]:e("vue-plyr",[e("div",{staticClass:"plyr__video-embed"},[e("iframe",{attrs:{src:t.url_to_site.src,allowfullscreen:"",allowtransparency:"",allow:"autoplay; fullscreen",sandbox:"allow-same-origin allow-scripts allow-popups",frameborder:"0"}})])])],2):t._e()],1),e("template",{slot:"footer"},[e("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:function(a){return t.$emit("close")}}},[e("b-icon",{attrs:{icon:"x-circle"}}),t._v(" "+t._s(t.$t("cancel"))+" ")],1),e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button",disabled:!t.full_url},on:{click:t.insertEmbed}},[e("b-icon",{attrs:{icon:"link"}}),t._v(" "+t._s(t.$t("embed"))+" ")],1)])],2)},w=[],g=r(y,v,w,!1,null,"e958836b");const $=g.exports,k={props:{publication_path:String,pre_addtl_meta:Object,post_addtl_meta:Object,select_mode:String,pick_from_types:[String,Array],available_modes:Array,show_labels:{type:Boolean,default:!0},context:String,types_available:{type:Array,default:()=>["capture","import","write","embed","table","shapes"]},start_collapsed:{type:Boolean,default:!0},enable_clipboard_paste:{type:Boolean,default:!1}},components:{CaptureModal:b,MediaPicker:d,EmbedPicker:$,ImportFileZone:u},data(){return{show_capture_modal:!1,show_module_selector:!1,show_media_picker:!1,show_file_picker:!1,show_link_picker:!1,files_to_import:[],shapes:[{type:"ellipsis",icon:"circle-fill",addtl_meta:{background_color:"#1d327f"}},{type:"rectangle",icon:"square-fill",addtl_meta:{background_color:"#ffbe32"}},{type:"line",icon:"dash-lg",addtl_meta:{outline_width:1,outline_color:"#000000"}},{type:"arrow",icon:"arrow-right-square",addtl_meta:{outline_width:1,outline_color:"#000000"}}],is_saving:!1}},created(){},mounted(){},beforeDestroy(){},watch:{show_module_selector(){}},computed:{project_path(){return this.$root.publication_include_mode==="link"?this.getParent(this.getParent(this.publication_path)):this.publication_path}},methods:{async mediaDropped({path_to_source_media_metas:o}){this.createMosaic({path_to_source_media_metas:o})},async mediaJustImported(o){const t=o.map(e=>this.project_path+"/"+e);this.createMosaic({path_to_source_media_metas:t})},async createMosaic({meta_filename:o,path_to_source_media_metas:t}){debugger;let e=[];if(o)e.push({meta_filename:o});else if(t)for(const a of t){const s=this.$root.publication_include_mode,i=await this.prepareMediaForPublication({path_to_source_media_meta:a,publication_path:this.publication_path,import_mode:s});e.push(i)}this.context==="page_by_page"&&(e=e.map(a=>(a.objectFit="contain",a))),["page_by_page","montage"].includes(this.context)?await this.createMultipleModules({module_type:"mosaic",source_medias:e}):await this.createModule({module_type:"mosaic",source_medias:e}),this.show_media_picker=!1},async createEmbed(o){const t="url-"+ +new Date+".txt",{meta_filename:e}=await this.$api.uploadText({path:this.publication_path,filename:t,content:o,additional_meta:{$type:"url"}});this.createMosaic({meta_filename:e}),this.show_link_picker=!1},async createFiles({path_to_source_media_metas:o}){let t=[];o.map(e=>{const a=this.getFilename(e);t.push({meta_filename_in_project:a})}),await this.createModule({module_type:"files",source_medias:t}),this.show_file_picker=!1},async createCustomModule({module_type:o,addtl_meta:t}){await this.createModule({module_type:o,addtl_meta:t})},async createText(){const o="text-"+ +new Date+".txt",{meta_filename:t}=await this.$api.uploadText({path:this.publication_path,filename:o,content:""}),e=[{meta_filename:t}],a=this.context==="page_by_page"?"text":"mosaic";await this.createModule({module_type:a,source_medias:e})},async createTable(){const o="table-"+ +new Date+".json",{meta_filename:t}=await this.$api.uploadText({path:this.publication_path,filename:o,content:JSON.stringify([[{content:""},{content:""}],[{content:""},{content:""}]],null,4),additional_meta:{$type:"table"}});this.createMosaic({meta_filename:t}),this.show_link_picker=!1},async createModule({module_type:o,source_medias:t=[],addtl_meta:e={}}){if(t.length>0){const s=this.getSourceMedia({source_media:t[0],folder_path:this.publication_path});s!=null&&s.$location&&(e.location=s.$location)}const a=await this.createMetaForModule({module_type:o,source_medias:t,addtl_meta:e});return this.$emit("addModules",{meta_filenames:[a]}),this.show_module_selector=!1,a},async createMultipleModules({module_type:o,source_medias:t=[]}){var a,s;let e=[];for(const i of t){const l=this.getSourceMedia({source_media:i,folder_path:this.publication_path});let n={};["page_by_page","montage"].includes(this.context)&&(a=l==null?void 0:l.$infos)!=null&&a.ratio&&(s=this.pre_addtl_meta)!=null&&s.width&&(n.height=this.pre_addtl_meta.width*l.$infos.ratio),l!=null&&l.$location&&(n.location=l.$location);const c=await this.createMetaForModule({module_type:o,source_medias:[i],addtl_meta:n});e.push(c)}this.show_module_selector=!1,this.$emit("addModules",{meta_filenames:e})},async createMetaForModule({module_type:o,source_medias:t,addtl_meta:e}){let a={module_type:o,source_medias:t,requested_slug:"module"};this.pre_addtl_meta&&Object.assign(a,this.pre_addtl_meta),e&&Object.assign(a,e),this.post_addtl_meta&&Object.assign(a,this.post_addtl_meta);const{meta_filename:s}=await this.$api.uploadFile({path:this.publication_path,additional_meta:a}).catch(i=>{throw this.$alertify.delay(4e3).error(i),i});return s}}};var M=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_moduleCreator",class:{"is--collapsed":!t.show_module_selector}},[e("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.show_module_selector||!t.start_collapsed?e("div",{staticClass:"_typePicker"},[t.types_available.includes("capture")?e("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:function(a){t.show_capture_modal=!0}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"record-circle-fill"}}),t.show_labels?[t._v(t._s(t.$t("capture")))]:t._e()],2):t._e(),t.show_capture_modal?e("CaptureModal",{attrs:{path:t.project_path,available_modes:t.available_modes},on:{createMosaic:t.createMosaic,close:function(a){t.show_capture_modal=!1}}}):t._e(),t.types_available.includes("import")?e("button",{staticClass:"u-button u-button_orange",attrs:{type:"button"},on:{click:function(a){t.show_media_picker=!0}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"image"}}),t.show_labels?[t._v(t._s(t.$t("import")))]:t._e()],2):t._e(),t.show_media_picker?e("MediaPicker",{attrs:{publication_path:t.publication_path,select_mode:t.select_mode,pick_from_types:t.pick_from_types},on:{addMedias:t.createMosaic,close:function(a){t.show_media_picker=!1}}}):t._e(),t.types_available.includes("write")?e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createText}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"fonts"}}),t.show_labels?[t._v(t._s(t.$t("write")))]:t._e()],2):t._e(),t.types_available.includes("embed")?e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(a){t.show_link_picker=!0}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"link"}}),t.show_labels?[t._v(t._s(t.$t("embed")))]:t._e()],2):t._e(),t.show_link_picker?e("EmbedPicker",{on:{embed:t.createEmbed,close:function(a){t.show_link_picker=!1}}}):t._e(),t.types_available.includes("table")?e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createTable}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:"table"}}),t.show_labels?[t._v(t._s(t.$t("table")))]:t._e()],2):t._e(),t.types_available.includes("shapes")?t._l(t.shapes,function(a){return e("button",{key:a.type,staticClass:"u-button u-button_bleumarine",attrs:{type:"button"},on:{click:function(s){return t.createCustomModule({module_type:a.type,addtl_meta:a.addtl_meta})}}},[e("b-icon",{staticStyle:{"font-size":"var(--icon-size)"},attrs:{icon:a.icon}}),t.show_labels?[t._v(t._s(t.$t(a.type)))]:t._e()],2)}):t._e(),t.start_collapsed?e("EditBtn",{key:"addmodule",attrs:{btn_type:"close",is_unfolded:!1},on:{click:function(a){t.show_module_selector=!1}}}):t._e()],2):t.start_collapsed&&!t.show_module_selector?e("EditBtn",{key:"addmodule",staticClass:"_addBtn",attrs:{btn_type:"add",is_unfolded:!1},on:{click:function(a){t.show_module_selector=!0}}}):t._e()],1),e("DropZone",{staticClass:"_dropZone",on:{mediaDropped:t.mediaDropped}}),t.enable_clipboard_paste?[e("ImportFileZone",{directives:[{name:"show",rawName:"v-show",value:!1,expression:"false"}],attrs:{multiple:!0,files_to_import:t.files_to_import},on:{"update:files_to_import":function(a){t.files_to_import=a}}}),t.files_to_import.length>0?e("UploadFiles",{attrs:{files_to_import:t.files_to_import,path:t.project_path},on:{importedMedias:function(a){return t.mediaJustImported(a)},close:function(a){t.files_to_import=[]}}}):t._e()]:t._e()],2)},C=[],x=r(k,M,C,!1,null,"c6fce788");const F=x.exports;export{F as M};
