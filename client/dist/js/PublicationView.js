(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[724],{21297:function(t,e,i){"use strict";i.d(e,{Z:function(){return m}});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"_topbar"},[!0!==t.no_back_button?i("button",{staticClass:"u-button u-button_icon _backPubli",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[i("b-icon",{attrs:{icon:"arrow-left-circle-fill","aria-label":t.$t("back_to_publications")}})],1):t._e(),i("div",{staticClass:"_publiTitle"},[i("TitleField",{attrs:{field_name:"title",tag:"h2",maxlength:40,required:!0,content:t.publication.title,path:t.publication.$path,can_edit:t.can_edit}})],1),i("div",{staticClass:"_buttonRow"},[t.can_edit&&"parent_contributors"!==t.publication.$admins?i("div",{},[i("small",[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.setCorrectPermForAdmins}},[t._v(" set perm to parent ")]),t._v(" "+t._s(t.publication.$admins)+" ")])]):t._e(),t.can_edit?i("StatusTag",{attrs:{status:t.publication.$status||"public",status_options:["public","private"],path:t.publication.$path,can_edit:t.can_edit}}):t._e(),t.can_edit&&"cartography"!==t.publication.template?i("button",{staticClass:"u-button u-button_small",attrs:{type:"button",caret:""},on:{click:t.openSettings}},[i("b-icon",{attrs:{slot:"prefix",icon:"gear","aria-label":t.$t("settings")},slot:"prefix"}),t._v(" "+t._s(t.$t("settings"))+" ")],1):t._e(),t.can_edit?i("DropDown",{on:{show:t.closeSettings}},[i("DuplicatePublication",{attrs:{path:t.publication.$path,source_title:t.publication.title,publication:t.publication},on:{close:function(e){return t.$emit("close")}}}),i("RemoveMenu",{attrs:{remove_text:t.$t("remove")},on:{remove:t.removePublication}})],1):t._e(),i("DropDown",{on:{show:t.closeSettings}},[i("template",{slot:"trigger"},[i("b-icon",{attrs:{icon:"box-arrow-up-right"}}),t._v(" "+t._s(t.$t("share"))+" ")],1),i("div",{},[i("button",{staticClass:"u-buttonLink _exportBtn",attrs:{type:"button",disabled:!t.can_edit||t.is_exporting},on:{click:t.exportPublication}},[i("sl-icon",{attrs:{name:"filetype-pdf"}}),t._v(" "+t._s(t.$t("export_in_pdf"))+" "),i("transition",{attrs:{name:"fade_fast",duration:150,mode:"out-in"}},[t.is_exporting?i("LoaderSpinner"):t._e()],1)],1)]),i("div",{},[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){t.show_qr_code_modal=!0}}},[i("sl-icon",{attrs:{name:"qr-code"}}),t._v(" "+t._s(t.$t("direct_link"))+" ")],1)]),t.show_qr_code_modal?i("QRModal",{attrs:{url_to_access:t.share_url},on:{close:function(e){t.show_qr_code_modal=!1}}}):t._e()],2)],1)])},o=[],s=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){t.show_modal=!0}}},[i("b-icon",{attrs:{icon:"file-plus"}}),t._v(" "+t._s(t.$t("duplicate_or_move"))+" ")],1),t.show_modal?i("BaseModal2",{attrs:{title:t.$t("duplicate_or_move")},on:{close:function(e){t.show_modal=!1}}},[t.navigation_to_copy?[i("a",{staticClass:"u-button u-button_bleumarine",attrs:{href:t.navigation_to_copy}},[t._v(" "+t._s(t.$t("open_copy"))+" ")])]:[i("div",{staticClass:"u-spacingBottom"},[i("div",{staticClass:"u-instructions"},[i("small",[t._v(" "+t._s(t.$t("dmp_instr"))+" ")])]),i("br"),i("SpaceProjectPicker",{staticClass:"u-spacingBottom",attrs:{path:t.path},on:{newProjectSelected:function(e){t.destination_project_path=e}}}),i("div",{staticClass:"u-spacingBottom"},[i("DLabel",{attrs:{str:t.$t("title_of_copy")}}),i("TextInput",{ref:"titleInput",attrs:{content:t.new_title,maxlength:40,required:!0},on:{"update:content":function(e){t.new_title=e}}})],1),i("div",{},[i("ToggleInput",{attrs:{content:t.remove_original,label:t.$t("remove_original"),options:{true:t.$t("remove_original_after_copy"),false:t.$t("keep_original_after_copy")}},on:{"update:content":function(e){t.remove_original=e}}})],1)],1),i("div",{staticClass:"u-sameRow",attrs:{slot:"footer"},slot:"footer"},[t.is_copying?i("LoaderSpinner"):[i("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){t.show_modal=!1}}},[t._v(" "+t._s(t.$t("cancel"))+" ")]),i("button",{staticClass:"u-button u-button_red",attrs:{type:"button",autofocus:"",disabled:!t.destination_project_path},on:{click:t.confirm}},[t.remove_original?[t._v(" "+t._s(t.$t("move"))+" ")]:[t._v(" "+t._s(t.$t("duplicate"))+" ")]],2)]],2)]],2):t._e()],1)},n=[],r=(i(26699),i(57658),i(42069)),c={props:{path:String,source_title:String,publication:Object},components:{SpaceProjectPicker:r.Z},data(){return{navigation_to_copy:!1,show_modal:!1,destination_project_path:void 0,remove_original:!1,new_title:this.$t("copy_of")+" "+this.source_title,is_copying:!1}},created(){},async mounted(){},beforeDestroy(){},watch:{show_modal(){this.show_modal&&(this.navigation_to_copy=void 0)}},computed:{project_medias_to_copy(){return this.publication.$files.reduce(((t,e)=>(Object.prototype.hasOwnProperty.call(e,"source_medias")&&e.source_medias.map((e=>{const i=this.getSourceMedia({source_media:e,folder_path:this.publication.$path});t.includes(i.$path)||t.push(i.$path)})),t)),[])}},methods:{async confirm(){this.is_copying=!0;const t=this.destination_project_path+"/publications",e=await this.$api.copyFolder({path:this.path,path_to_destination_type:t,new_meta:{title:this.new_title}}).catch((t=>{throw"unique_field_taken"===t?(this.$alertify.delay(4e3).error(this.$t("notifications.title_taken")),this.$refs.titleInput.$el.querySelector("input").select()):"not_allowed_to_copy_to_space"===t&&this.$alertify.delay(4e3).error(this.$t("notifications.not_allowed_to_copy_to_space")),this.is_copying=!1,"fail"})),i=await this.$api.getFolder({path:e});if(this.$alertify.closeLogOnClick(!0).delay(4e3).success("publication_copy_success"),this.getParent(this.path)!==this.destination_project_path+"/publications"){this.$alertify.closeLogOnClick(!0).delay(4e3).log("has_linked_media_to_copy");for(let t of this.project_medias_to_copy){const a=await this.$api.copyFile({path:t,path_to_destination_folder:this.destination_project_path,new_meta:{group:"imported_from_"+e}}).catch((t=>{this.$alertify.delay(4e3).error(t)})),o=this.getFilename(t);if(a!==o)for(let t of i.$files){if(!Object.prototype.hasOwnProperty.call(t,"source_medias"))continue;if(!t.source_medias.some((t=>t.meta_filename_in_project&&t.meta_filename_in_project===o)))continue;const e=t.source_medias.map((t=>(t.meta_filename_in_project===o&&(t.meta_filename_in_project=a),t)));await this.$api.updateMeta({path:t.$path,new_meta:{source_medias:e}})}}this.$alertify.closeLogOnClick(!0).delay(4e3).success("linked media copied")}let a={};a.projectpanes=JSON.stringify([{type:"publish",size:100,folder:this.getFilename(i.$path)}]);const o={path:this.createURLFromPath(this.destination_project_path),query:a};this.remove_original?(this.is_copying=!1,await this.$api.deleteItem({path:this.path}),this.$emit("close")):(this.is_copying=!1,this.navigation_to_copy=this.$router.resolve(o).href)}}},l=c,p=i(1001),u=(0,p.Z)(l,s,n,!1,null,"71cba5fb",null),_=u.exports,d={props:{publication:Object,no_back_button:Boolean,can_edit:Boolean},components:{DuplicatePublication:_},data(){return{show_qr_code_modal:!1,is_exporting:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{share_url(){let t={};"page_by_page"===this.publication.template?t={display:"slides"}:"story_with_sections"===this.publication.template&&(t={display:"section"});const e=this.$router.resolve({path:this.createURLFromPath(this.publication.$path),query:t});return window.location.origin+e.href}},methods:{async exportPublication(){const t={$origin:"publish"};this.connected_as?.$path&&(t.$authors=[this.connected_as.$path]);let e={recipe:"pdf",page_width:this.publication.page_width,page_height:this.publication.page_height,layout_mode:this.publication.layout_mode||"print",suggested_file_name:this.publication.title,additional_meta:t};!0===this.publication.page_spreads&&(e.page_width*=2);const i=await this.$api.exportFolder({path:this.publication.$path,instructions:e});this.$alertify.delay(4e3).log(this.$t("compilation_started")),this.is_exporting=!0;const a=({task_id:t})=>{t===i&&(this.is_exporting=!1,this.$eventHub.$off("task.ended",a))};this.$eventHub.$on("task.ended",a)},async removePublication(){this.fetch_status="pending",this.fetch_error=null;try{const t=await this.$api.deleteItem({path:this.publication.$path});this.response=t.data,this.fetch_status="success"}catch(t){this.fetch_status="error",this.fetch_error=t.response.data}},async setCorrectPermForAdmins(){await this.$api.updateMeta({path:this.publication.$path,new_meta:{$admins:"parent_contributors"}})},openSettings(){this.$eventHub.$emit("publication.settings.toggle")},closeSettings(){this.$eventHub.$emit("publication.settings.close")}}},h=d,b=(i(542),(0,p.Z)(h,a,o,!1,null,"044d272a",null)),m=b.exports},11562:function(t,e,i){"use strict";i.r(e),i.d(e,{default:function(){return u}});var a=function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"_publicationView",class:{"is--serversidepreview":t.is_serversidepreview}},[i("style",{tag:"component"},[t._v(" "+t._s(t.set_print_margins)+" ")]),i("transition",{attrs:{name:"fade_fast",mode:"out-in"}},[t.project&&t.publication?t.fetch_project_error?i("div",{key:"err"},[t._v(" "+t._s(t.fetch_project_error)+" ")]):i("div",{key:"publication",ref:"fsContainer"},[(!t.is_serversidepreview&&t.is_fullscreen,t._e()),"page_by_page"===t.publication.template?[i("PageSlides",{attrs:{publication:t.publication,is_serversidepreview:t.is_serversidepreview},on:{toggleFs:t.toggleFs}})]:"story"===t.publication.template?i("div",[i("StoryTemplate",{staticClass:"_storyTemplate",attrs:{publication:t.publication,can_edit:!1}})],1):"story_with_sections"===t.publication.template?i("div",[i("SectionWithPrint",{attrs:{publication:t.publication}})],1):"cartography"===t.publication.template?i("div",[i("MapForPrint",{attrs:{publication:t.publication}})],1):t._e()],2):i("div",{key:"loader",staticClass:"u-divCentered"},[i("LoaderSpinner")],1)])],1)},o=[],s=i(8375),n=i(21297),r={props:{},components:{PublicationTopbar:n.Z,PageSlides:()=>i.e(684).then(i.bind(i,43684)),StoryTemplate:()=>i.e(833).then(i.bind(i,61833)),SectionWithPrint:()=>i.e(156).then(i.bind(i,32156)),MapForPrint:()=>i.e(929).then(i.bind(i,7666))},data(){return{fetch_project_error:null,project:null,publication:null,is_fullscreen:!1,is_serversidepreview:!1}},created(){},async mounted(){"true"===this.$route.query?.make_preview&&(this.is_serversidepreview=!0),await this.listProject(),this.$eventHub.$emit("received.project",this.project),await this.listPublication()},beforeDestroy(){},watch:{is_fullscreen(){}},computed:{project_path(){return this.createPath({space_slug:this.$route.params.space_slug,project_slug:this.$route.params.project_slug})},publication_path(){return`${this.project_path}/publications/${this.$route.params.publication_slug}`},set_print_margins(){let t=15;return this.publication&&"page_by_page"===this.publication.template&&(t=0),`\n      @page {\n        margin: ${t}mm;\n      }\n      `}},methods:{async openFs(){await s.Z.request(this.$refs.fsContainer),this.is_fullscreen=!0,s.Z.onchange((()=>{s.Z.isFullscreen||(this.is_fullscreen=!1)}))},async closeFs(){await s.Z.exit(),this.is_fullscreen=!1},async toggleFs(){this.is_fullscreen?this.closeFs():this.openFs()},async listProject(){const t=await this.$api.getFolder({path:this.project_path}).catch((t=>{this.fetch_project_error=t.response,this.is_loading=!1}));this.project=t},async listPublication(){const t=await this.$api.getFolder({path:this.publication_path}).catch((t=>{this.fetch_publication_error=t.response}));this.publication=t}}},c=r,l=(i(71930),i(30305),i(1001)),p=(0,l.Z)(c,a,o,!1,null,"6cb5e5f2",null),u=p.exports},88667:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,"._topbar[data-v-044d272a]{display:flex;flex-flow:row wrap;gap:calc(var(--spacing)/2);align-items:center;width:100%;background:#fff;padding:calc(var(--spacing)/2);margin:0;border-bottom:1px solid var(--c-gris)}._publiTitle[data-v-044d272a]{flex:10 1 auto}._buttonRow[data-v-044d272a]{display:flex;flex-flow:row wrap;flex:1 1 auto;justify-content:flex-end;gap:calc(var(--spacing)/2)}._exportBtn[data-v-044d272a]{position:relative}._backPubli[data-v-044d272a]{font-size:1.1rem}",""]),e["default"]=r},26066:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,"._publicationView[data-v-6cb5e5f2]{background:#fff}",""]),e["default"]=r},24136:function(t,e,i){"use strict";i.r(e);var a=i(8081),o=i.n(a),s=i(23645),n=i.n(s),r=n()(o());r.push([t.id,".alertify-logs{display:none!important}@media print{body,html{background:#fff!important}}._storyTemplate{padding:calc(var(--spacing)/1)}._pubTopbar ._topbar{margin:var(--spacing) auto}._pubTopbar{margin:0 auto;max-width:86ch}@media print{._pubTopbar,._sectionsSummary{display:none}._storyContent{box-shadow:none!important}}",""]),e["default"]=r},542:function(t,e,i){var a=i(88667);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(31982).Z;o("3653eddc",a,!0,{sourceMap:!1,shadowMode:!1})},71930:function(t,e,i){var a=i(26066);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(31982).Z;o("59133a52",a,!0,{sourceMap:!1,shadowMode:!1})},30305:function(t,e,i){var a=i(24136);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var o=i(31982).Z;o("0a781bbe",a,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=PublicationView.js.map