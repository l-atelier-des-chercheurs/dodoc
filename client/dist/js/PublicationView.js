(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[724],{46885:function(t,e,i){"use strict";i.d(e,{Z:function(){return Z}});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"_topbar"},[!0!==t.no_back_button?i("button",{staticClass:"u-button u-button_icon _backPubli",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[i("b-icon",{attrs:{icon:"arrow-left-circle-fill","aria-label":t.$t("back_to_publications")}})],1):t._e(),i("div",{staticClass:"_publiTitle"},[i("TitleField",{attrs:{field_name:"title",tag:"h2",maxlength:40,required:!0,content:t.publication.title,path:t.publication.$path,can_edit:t.can_edit}})],1),i("div",{staticClass:"_buttonRow"},[t.can_edit&&"parent_contributors"!==t.publication.$admins?i("div",{},[i("small",[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.setCorrectPermForAdmins}},[t._v(" set perm to parent ")]),t._v(" "+t._s(t.publication.$admins)+" ")])]):t._e(),t.can_edit?i("StatusTag",{attrs:{status:t.publication.$status||"public",status_options:["public","private"],path:t.publication.$path,can_edit:t.can_edit}}):t._e(),t.can_edit&&"cartography"!==t.publication.template?i("button",{staticClass:"u-button u-button_small u-button_transparent",attrs:{type:"button",caret:""},on:{click:t.openSettings}},[i("b-icon",{attrs:{slot:"prefix",icon:"gear","aria-label":t.$t("settings")},slot:"prefix"}),t._v(" "+t._s(t.$t("settings"))+" ")],1):t._e(),t.can_edit?i("DropDown",{on:{show:t.closeSettings}},[i("DuplicatePublication",{attrs:{path:t.publication.$path,source_title:t.publication.title,publication:t.publication},on:{close:function(e){return t.$emit("close")}}}),i("RemoveMenu",{attrs:{remove_text:t.$t("remove")},on:{remove:t.removePublication}})],1):t._e(),i("DropDown",{on:{show:t.closeSettings}},[i("template",{slot:"trigger"},[i("b-icon",{attrs:{icon:"box-arrow-up-right"}}),t._v(" "+t._s(t.$t("share"))+" ")],1),t.can_edit?i("div",[i("button",{staticClass:"u-buttonLink _exportBtn",attrs:{type:"button"},on:{click:function(e){t.show_export_pdf_modal=!0}}},[i("b-icon",{attrs:{icon:"download"}}),t._v(" "+t._s(t.$t("to_export"))+" ")],1)]):t._e(),t.show_export_pdf_modal?i("ExportPubliModal",{attrs:{publication:t.publication,page_opened_id:t.page_opened_id},on:{close:function(e){t.show_export_pdf_modal=!1}}}):t._e(),i("div",[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){t.show_qr_code_modal=!0}}},[i("div",{staticClass:"icon",attrs:{part:"base","aria-hidden":"true"}},[i("svg",{staticClass:"bi bi-qr-code",attrs:{xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",fill:"currentColor",viewBox:"0 0 16 16"}},[i("path",{attrs:{d:"M2 2h2v2H2V2Z"}}),i("path",{attrs:{d:"M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"}}),i("path",{attrs:{d:"M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"}}),i("path",{attrs:{d:"M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"}}),i("path",{attrs:{d:"M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"}})])]),t._v(" "+t._s(t.$t("direct_link"))+" ")])]),t.show_qr_code_modal?i("QRModal",{attrs:{url_to_access:t.share_url},on:{close:function(e){t.show_qr_code_modal=!1}}},[i("ToggleField",{attrs:{label:t.$t("make_publication_public"),field_name:"$public",content:!0===t.publication.$public,path:t.publication.$path,can_edit:t.can_edit}})],1):t._e()],2)],1)])},o=[],s=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){t.show_modal=!0}}},[i("b-icon",{attrs:{icon:"file-plus"}}),t._v(" "+t._s(t.$t("duplicate_or_move"))+" ")],1),t.show_modal?i("BaseModal2",{attrs:{title:t.$t("duplicate_or_move")},on:{close:function(e){t.show_modal=!1}}},[t.navigation_to_copy?[i("a",{staticClass:"u-button u-button_bleumarine",attrs:{href:t.navigation_to_copy}},[t._v(" "+t._s(t.$t("open_copy"))+" ")])]:[i("div",{staticClass:"u-spacingBottom"},[i("div",{staticClass:"u-instructions"},[i("small",[t._v(" "+t._s(t.$t("dmp_instr"))+" ")])]),i("br"),i("SpaceProjectPicker",{staticClass:"u-spacingBottom",attrs:{path:t.path},on:{newProjectSelected:function(e){t.destination_project_path=e}}}),i("div",{staticClass:"u-spacingBottom"},[i("DLabel",{attrs:{str:t.$t("title_of_copy")}}),i("TextInput",{ref:"titleInput",attrs:{content:t.new_title,maxlength:40,required:!0},on:{"update:content":function(e){t.new_title=e}}})],1),i("div",{},[i("ToggleInput",{attrs:{content:t.remove_original,label:t.$t("remove_original"),options:{true:t.$t("remove_original_after_copy"),false:t.$t("keep_original_after_copy")}},on:{"update:content":function(e){t.remove_original=e}}})],1)],1),i("div",{staticClass:"u-sameRow",attrs:{slot:"footer"},slot:"footer"},[t.is_copying?i("LoaderSpinner"):[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){t.show_modal=!1}}},[t._v(" "+t._s(t.$t("cancel"))+" ")]),i("button",{staticClass:"u-button u-button_red",attrs:{type:"button",autofocus:"",disabled:!t.destination_project_path},on:{click:t.confirm}},[t.remove_original?[t._v(" "+t._s(t.$t("move"))+" ")]:[t._v(" "+t._s(t.$t("duplicate"))+" ")]],2)]],2)]],2):t._e()],1)},n=[],r=(i(76801),i(70560),i(7002)),c={props:{path:String,source_title:String,publication:Object},components:{SpaceProjectPicker:r.Z},data(){return{navigation_to_copy:!1,show_modal:!1,destination_project_path:void 0,remove_original:!1,new_title:this.$t("copy_of")+" "+this.source_title,is_copying:!1}},created(){},async mounted(){},beforeDestroy(){},watch:{show_modal(){this.show_modal&&(this.navigation_to_copy=void 0)}},computed:{project_medias_to_copy(){return this.publication.$files.reduce(((t,e)=>(Object.prototype.hasOwnProperty.call(e,"source_medias")&&e.source_medias.map((e=>{const i=this.getSourceMedia({source_media:e,folder_path:this.publication.$path});t.includes(i.$path)||t.push(i.$path)})),t)),[])}},methods:{async confirm(){this.is_copying=!0;const t=this.destination_project_path+"/publications",e=await this.$api.copyFolder({path:this.path,path_to_destination_type:t,new_meta:{title:this.new_title}}).catch((t=>{throw"unique_field_taken"===t?(this.$alertify.delay(4e3).error(this.$t("title_taken")),this.$refs.titleInput.$el.querySelector("input").select()):"not_allowed_to_copy_to_space"===t&&this.$alertify.delay(4e3).error(this.$t("not_allowed_to_copy_to_space")),this.is_copying=!1,"fail"})),i=await this.$api.getFolder({path:e});if(this.$alertify.closeLogOnClick(!0).delay(4e3).success("publication_copy_success"),this.getParent(this.path)!==this.destination_project_path+"/publications"){this.$alertify.closeLogOnClick(!0).delay(4e3).log("has_linked_media_to_copy");for(let t of this.project_medias_to_copy){const a=await this.$api.copyFile({path:t,path_to_destination_folder:this.destination_project_path,new_meta:{group:"imported_from_"+e}}).catch((t=>{this.$alertify.delay(4e3).error(t)})),o=this.getFilename(t);if(a!==o)for(let t of i.$files){if(!Object.prototype.hasOwnProperty.call(t,"source_medias"))continue;if(!t.source_medias.some((t=>t.meta_filename_in_project&&t.meta_filename_in_project===o)))continue;const e=t.source_medias.map((t=>(t.meta_filename_in_project===o&&(t.meta_filename_in_project=a),t)));await this.$api.updateMeta({path:t.$path,new_meta:{source_medias:e}})}}this.$alertify.closeLogOnClick(!0).delay(4e3).success("linked media copied")}let a={};a.projectpanes=JSON.stringify([{type:"publish",size:100,folder:this.getFilename(i.$path)}]);const o={path:this.createURLFromPath(this.destination_project_path),query:a};this.remove_original?(this.is_copying=!1,await this.$api.deleteItem({path:this.path}),this.$emit("close")):(this.is_copying=!1,this.navigation_to_copy=this.$router.resolve(o).href)}}},l=c,p=i(1001),_=(0,p.Z)(l,s,n,!1,null,"19fcccef",null),u=_.exports,d=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("BaseModal2",{attrs:{title:t.$t("export_publi")},on:{close:function(e){return t.$emit("close")}}},[i("div",{staticClass:"u-spacingBottom"},[i("DLabel",{attrs:{str:t.$t("document_type")}}),i("RadioCheckboxInput",{attrs:{value:t.export_mode,options:t.export_options,can_edit:!0},on:{"update:value":function(e){t.export_mode=e}}})],1),["pdf","webpage"].includes(t.export_mode)?[i("div",{attrs:{slot:"footer"},slot:"footer"},[i("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){return t.exportPublication(t.export_mode)}}},[i("b-icon",{attrs:{icon:"file-pdf"}}),t._v(" "+t._s(t.$t("create"))+" ")],1)])]:"png"===t.export_mode?["page_by_page"===t.publication.template?[i("div",{staticClass:"u-spacingBottom"}),i("div",{},[i("DLabel",{attrs:{str:t.$t("page_to_export")}}),i("select",{directives:[{name:"model",rawName:"v-model",value:t.page_to_export_as_image,expression:"page_to_export_as_image"}],on:{change:function(e){var i=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.page_to_export_as_image=e.target.multiple?i:i[0]}}},t._l(new Array(t.page_count),(function(e,a){return i("option",{key:a+1,domProps:{textContent:t._s(a+1)}})})),0)],1)]:t._e(),i("div",{attrs:{slot:"footer"},slot:"footer"},[i("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){return t.exportPublication("png")}}},[i("b-icon",{attrs:{icon:"file-earmark-image"}}),t._v(" "+t._s(t.$t("create"))+" ")],1)])]:t._e(),t.task_instructions?i("ExportItemAndSaveOrDownload",{attrs:{publication_path:t.publication.$path,instructions:t.task_instructions},on:{close:function(e){t.task_instructions=!1}}}):t._e()],2)},h=[],b=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("BaseModal2",{attrs:{title:t.$t("export_publi")},on:{close:function(e){return t.$emit("close")}}},[t.is_exporting?[i("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("export_in_progress"))+" ")]),i("div",{},[i("b",[i("AnimatedCounter",{attrs:{value:t.task_progress}})],1)])]:[t.created_doc?i("MediaContent",{staticClass:"_preview",attrs:{file:t.created_doc,resolution:1600,context:"full"}}):t._e(),i("div",{staticClass:"u-sameRow",attrs:{slot:"footer"},slot:"footer"},[i("a",{staticClass:"u-buttonLink",attrs:{disabled:!t.export_href,download:t.export_name,href:t.export_href,target:"_blank"}},[t._v(" "+t._s(t.$t("download"))+" ")]),i("button",{staticClass:"u-button u-button_red",attrs:{type:"button"},on:{click:t.saveToProject}},[i("svg",{staticStyle:{"enable-background":"new 0 0 168 168"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 168 168","xml:space":"preserve"}},[i("path",{staticStyle:{fill:"var(--c-rouge)"},attrs:{d:"M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"}}),i("g",{staticStyle:{fill:"var(--c-orange)"}},[i("path",{attrs:{d:"m42 42h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m73.2 42h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m104.4 42h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m42 73.5h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m73.2 73.5h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m104.4 73.5h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m42 105h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m73.2 105h21.6v21h-21.6z"}}),i("path",{attrs:{d:"m104.4 105h21.6v21h-21.6z"}})])]),t._v(" "+t._s(t.$t("save_to_project"))+" ")])]),t.finished_saving_to_project?i("div",{staticClass:"_saveNotice"},[t._v(" "+t._s(t.$t("media_was_saved_to_project"))+" ")]):t._e()]],2)},m=[],v={props:{publication_path:String,instructions:Object},components:{},data(){return{is_exporting:!1,created_doc:void 0,task_progress:0,finished_saving_to_project:!1}},created(){},async mounted(){await this.startExport()},beforeDestroy(){},watch:{},computed:{export_href(){return!!this.created_doc&&this.makeMediaFileURL({$path:this.created_doc.$path,$media_filename:this.created_doc.$media_filename})},export_name(){return this.created_doc?.$media_filename}},methods:{async startExport(){const t=await this.$api.exportFolder({path:this.publication_path,instructions:this.instructions});this.$api.join({room:"task_"+t}),this.$alertify.delay(4e3).log(this.$t("compilation_started")),this.is_exporting=!0;const e=({task_id:e,progress:i})=>{e===t&&(this.task_progress=i)};this.$eventHub.$on("task.status",e);const i=({task_id:e,message:a})=>{e===t&&(this.$eventHub.$off("task.ended",i),this.$api.leave({room:"task_"+t}),"completed"===a.event?this.created_doc=a.file:"aborted"===a.event||"failed"===a.event&&a.info,this.is_exporting=!1)};this.$eventHub.$on("task.ended",i)},async saveToProject(){this.finished_saving_to_project=!0,setTimeout((()=>{this.$emit("close")}),3e3)}}},g=v,f=(i(48992),(0,p.Z)(g,b,m,!1,null,"2d915ad8",null)),y=f.exports,w={props:{publication:Object,page_opened_id:String},components:{ExportItemAndSaveOrDownload:y},data(){return{task_instructions:!1,page_to_export_as_image:1,export_mode:"pdf",export_options:[{key:"pdf",label:this.$t("pdf")},{key:"png",label:this.$t("image")},{key:"webpage",label:this.$t("webpage")}]}},created(){if(this.page_opened_id&&this.publication.pages){const t=this.publication.pages.findIndex((t=>t.id===this.page_opened_id));t&&(this.page_to_export_as_image=t+1)}},mounted(){},beforeDestroy(){},watch:{},computed:{page_count(){return this.publication.pages.length}},methods:{async exportPublication(t){const e={$origin:"publish"};this.connected_as?.$path&&(e.$authors=[this.connected_as.$path]);let i={recipe:t,page_width:this.publication.page_width,page_height:this.publication.page_height,layout_mode:this.publication.layout_mode||"print",suggested_file_name:this.publication.title,additional_meta:e};"webpage"===t&&(i.layout_mode="screen"),"page_by_page"===this.publication.template&&"png"===this.export_mode&&(i.page=this.page_to_export_as_image),!0===this.publication.page_spreads&&(i.page_width*=2),this.task_instructions=i}}},$=w,x=(0,p.Z)($,d,h,!1,null,"3bf984fa",null),k=x.exports,C={props:{publication:Object,page_opened_id:String,no_back_button:Boolean,can_edit:Boolean},components:{DuplicatePublication:u,ExportPubliModal:k},data(){return{show_export_pdf_modal:!1,show_qr_code_modal:!1,is_exporting:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{share_url(){let t={};"page_by_page"===this.publication.template?t={display:"slides"}:("story_with_sections"===this.publication.template||"cartography"===this.publication.template)&&(t={display:"section"});const e=this.$router.resolve({path:this.createURLFromPath(this.publication.$path),query:t});return window.location.origin+e.href}},methods:{async removePublication(){this.fetch_status="pending",this.fetch_error=null;try{const t=await this.$api.deleteItem({path:this.publication.$path});this.response=t.data,this.fetch_status="success"}catch(t){this.fetch_status="error",this.fetch_error=t.response.data}},async setCorrectPermForAdmins(){await this.$api.updateMeta({path:this.publication.$path,new_meta:{$admins:"parent_contributors"}})},openSettings(){this.$eventHub.$emit("publication.settings.toggle")},closeSettings(){this.$eventHub.$emit("publication.settings.close")}}},j=C,P=(i(1026),(0,p.Z)(j,a,o,!1,null,"8ac87d8a",null)),Z=P.exports},68997:function(t,e,i){"use strict";i.r(e),i.d(e,{default:function(){return _}});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"_publicationView",class:{"is--serversidepreview":t.is_serversidepreview}},[i("style",{tag:"component"},[t._v(" "+t._s(t.set_print_margins)+" ")]),i("transition",{attrs:{name:"fade_fast",mode:"out-in"}},[t.$root.is_loading?i("div",{key:"loader",staticClass:"u-divCentered"},[i("LoaderSpinner")],1):t.fetch_publication_error?i("div",[t._v(" "+t._s(t.fetch_publication_error)+" ")]):t.publication?i("div",{key:"publication",ref:"fsContainer"},[i("transition",{attrs:{name:"pagechange",mode:"out-in"}},[t.is_serversidepreview||t.is_fullscreen||!t.show_topbar?t._e():i("div",{staticClass:"_pubTopbar"},[i("PublicationTopbar",{attrs:{publication:t.publication,no_back_button:!0,can_edit:!1}})],1)]),i("div",{staticClass:"_toggleTopbar"},[i("button",{staticClass:"u-button u-button_small u-button_icon",attrs:{type:"button"},on:{click:function(e){t.show_topbar=!t.show_topbar}}},[i("b-icon",{attrs:{icon:"chevron-up",rotate:t.show_topbar?0:180}})],1)]),"page_by_page"===t.publication.template?[i("PageSlides",{attrs:{publication:t.publication,is_serversidepreview:t.is_serversidepreview},on:{toggleFs:t.toggleFs}})]:"story"===t.publication.template?i("div",[i("StoryTemplate",{staticClass:"_storyTemplate",attrs:{publication:t.publication,can_edit:!1}})],1):"story_with_sections"===t.publication.template?i("div",[i("SectionWithPrint",{attrs:{publication:t.publication}})],1):"cartography"===t.publication.template?i("div",[i("MapForPrint",{attrs:{publication:t.publication}})],1):t._e()],2):t._e()])],1)},o=[],s=i(95226),n=i(46885),r={props:{},components:{PublicationTopbar:n.Z,PageSlides:()=>i.e(0).then(i.bind(i,46e3)),StoryTemplate:()=>i.e(561).then(i.bind(i,49561)),SectionWithPrint:()=>i.e(19).then(i.bind(i,85019)),MapForPrint:()=>i.e(597).then(i.bind(i,27658))},data(){return{project:null,publication:null,fetch_publication_error:void 0,show_topbar:!0,is_fullscreen:!1,is_serversidepreview:!1}},created(){console.log("Loading PublicationView")},async mounted(){let t;"true"===this.$route.query?.make_preview&&(this.is_serversidepreview=!0),this.$route.query?.sat&&(t=this.$route.query.sat),window.app_infos.page_is_standalone_html?this.publication=window.folder_data:this.publication=await this.$api.getPublicFolder({path:this.publication_path,superadmintoken:t}).catch((t=>{this.fetch_publication_error=t.code})),this.$root.is_loading=!1},beforeDestroy(){},watch:{is_fullscreen(){}},computed:{project_path(){return this.createPath({space_slug:this.$route.params.space_slug,project_slug:this.$route.params.project_slug})},publication_path(){return`${this.project_path}/publications/${this.$route.params.publication_slug}`},set_print_margins(){let t=15;return this.publication&&"page_by_page"===this.publication.template&&(t=0),`\n      @page {\n        margin: ${t}mm;\n      }\n      `}},methods:{async openFs(){await s.Z.request(this.$refs.fsContainer),this.is_fullscreen=!0,s.Z.onchange((()=>{s.Z.isFullscreen||(this.is_fullscreen=!1)}))},async closeFs(){await s.Z.exit(),this.is_fullscreen=!1},async toggleFs(){this.is_fullscreen?this.closeFs():this.openFs()}}},c=r,l=(i(45402),i(87958),i(1001)),p=(0,l.Z)(c,a,o,!1,null,"15ce8d69",null),_=p.exports},87192:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,"._preview[data-v-2d915ad8]{border:2px solid var(--c-gris);aspect-ratio:1}",""]),e["default"]=r},39253:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,"._topbar[data-v-8ac87d8a]{display:flex;flex-flow:row wrap;gap:calc(var(--spacing)/2);align-items:center;width:100%;background:#fff;padding:calc(var(--spacing)/2);margin:0;border-bottom:1px solid var(--c-gris)}._publiTitle[data-v-8ac87d8a]{flex:10 1 auto}._buttonRow[data-v-8ac87d8a]{display:flex;flex-flow:row wrap;flex:1 1 auto;justify-content:flex-end;gap:calc(var(--spacing)/2)}._exportBtn[data-v-8ac87d8a]{position:relative}._backPubli[data-v-8ac87d8a]{font-size:1.1rem}",""]),e["default"]=r},86142:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,"._publicationView[data-v-15ce8d69]{background:#fff}",""]),e["default"]=r},68209:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,".alertify-logs{display:none!important}body,html{background:#fff!important}._storyTemplate{padding:calc(var(--spacing)/1)}@media print{._pubTopbar{display:none}}._toggleTopbar{position:absolute;width:100%;text-align:center;z-index:1;pointer-events:none}._toggleTopbar button{pointer-events:auto}@media print{._sectionsSummary,._toggleTopbar{display:none}._storyContent{box-shadow:none!important}}",""]),e["default"]=r},48992:function(t,e,i){var a=i(87192);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(20730).Z;o("3d90bbec",a,!0,{sourceMap:!1,shadowMode:!1})},1026:function(t,e,i){var a=i(39253);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(20730).Z;o("7e57d8b4",a,!0,{sourceMap:!1,shadowMode:!1})},45402:function(t,e,i){var a=i(86142);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(20730).Z;o("1a36d6c9",a,!0,{sourceMap:!1,shadowMode:!1})},87958:function(t,e,i){var a=i(68209);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(20730).Z;o("b57bbee4",a,!0,{sourceMap:!1,shadowMode:!1})}}]);