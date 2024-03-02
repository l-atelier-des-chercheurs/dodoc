(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[998],{84998:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return V}});var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("BaseModal2",{attrs:{title:t.$t("admin_settings"),size:"x-large"},on:{close:function(e){return t.$emit("close")}}},[s("div",{staticClass:"_adminSettings"},[t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):s("div",[s("sl-tab-group",{ref:"tabgroup",on:{"sl-tab-show":t.newTabShown}},[s("sl-tab",{attrs:{slot:"nav",panel:"informations"},slot:"nav"},[t._v(" "+t._s(t.$t("informations"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"logo_and_images"},slot:"nav"},[t._v(" "+t._s(t.$t("logo_and_images"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"administration_and_access_control"},slot:"nav"},[t._v(" "+t._s(t.$t("administration_and_access_control"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"fonts"},slot:"nav"},[t._v(" "+t._s(t.$t("fonts"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"events"},slot:"nav"},[t._v(" "+t._s(t.$t("events"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"terms"},slot:"nav"},[t._v(" "+t._s(t.$t("terms"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"suggested_cat_kw"},slot:"nav"},[t._v(" "+t._s(t.$t("suggested_cat_kw"))+" ")]),s("sl-tab",{attrs:{slot:"nav",panel:"storage"},slot:"nav"},[t._v(" "+t._s(t.$t("storage"))+" ")]),s("sl-tab-panel",{attrs:{name:"informations"}},["informations"===t.current_tab?[s("div",{staticClass:"u-spacingBottom"},[s("TitleField",{staticClass:"u-spacingBottom",attrs:{field_name:"name_of_instance",label:t.$t("name_of_instance"),instructions:t.$t("name_of_instance_instructions"),content:t.settings.name_of_instance||"",path:t.settings.$path,tag:"h1",maxlength:40,can_edit:t.is_instance_admin}})],1),s("div",{staticClass:"u-spacingBottom"},[s("TitleField",{attrs:{field_name:"presentation_of_instance",label:t.$t("presentation_of_instance"),instructions:t.$t("presentation_of_instance_instructions"),content:t.settings.presentation_of_instance,path:t.settings.$path,required:!1,input_type:"markdown",can_edit:t.is_instance_admin}})],1),s("div",{staticClass:"u-spacingBottom"},[s("TitleField",{attrs:{field_name:"contactmail_of_instance",label:t.$t("contactmail_of_instance"),instructions:t.$t("contactmail_of_instance_instructions"),content:t.settings.contactmail_of_instance,path:t.settings.$path,required:!1,input_type:"email",can_edit:t.is_instance_admin}})],1),s("div",{staticClass:"u-instructions"},[s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.reloadPage}},[t._v(" "+t._s(t.$t("refresh_window_to_apply"))+" ")])])]:t._e()],2),s("sl-tab-panel",{attrs:{name:"logo_and_images"}},["logo_and_images"===t.current_tab?[s("ImagesPanel",{attrs:{settings:t.settings,can_edit:t.is_instance_admin},on:{reloadPage:t.reloadPage}})]:t._e()],2),s("sl-tab-panel",{attrs:{name:"administration_and_access_control"}},["administration_and_access_control"===t.current_tab?[s("AdminsAndContributorsField",{attrs:{folder:t.settings,can_edit:t.is_instance_admin,custom_label:t.$t("instance_admins_and_admins"),admin_label:t.$t("admin"),admin_instructions:t.$t("instance_admin_instructions"),contrib_instructions:t.$t("instance_contrib_instructions")}}),s("br"),s("ToggleField",{attrs:{label:t.$t("require_signup_to_contribute"),field_name:"require_signup_to_contribute",content:!0===t.settings.require_signup_to_contribute,path:t.settings.$path,can_edit:t.is_instance_admin}}),s("br"),s("ToggleField",{attrs:{label:t.$t("require_mail_to_signup"),field_name:"require_mail_to_signup",content:!0===t.settings.require_mail_to_signup,path:t.settings.$path,can_edit:t.is_instance_admin}}),s("br"),s("TitleField",{attrs:{field_name:"general_password",label:t.$t("general_password"),instructions:t.$t("general_password_instructions"),content:t.settings.general_password,path:t.settings.$path,input_type:"password",required:!1,can_edit:t.is_instance_admin}}),s("br"),s("TitleField",{attrs:{field_name:"signup_password",label:t.$t("signup_password"),instructions:t.$t("signup_password_instructions"),content:t.settings.signup_password,path:t.settings.$path,required:!1,can_edit:t.is_instance_admin}}),s("br"),s("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("restart_to_apply"))+" ")])]:t._e()],2),s("sl-tab-panel",{attrs:{name:"fonts"}},["fonts"===t.current_tab?s("FontsPanel"):t._e()],1),s("sl-tab-panel",{attrs:{name:"events"}},["events"===t.current_tab?[s("DLabel",{attrs:{str:t.$t("events")}}),s("ToggleField",{attrs:{label:t.$t("enable_events"),field_name:"enable_events",content:!0===t.settings.enable_events,path:t.settings.$path,can_edit:t.is_instance_admin}})]:t._e()],2),s("sl-tab-panel",{attrs:{name:"terms"}},["terms"===t.current_tab?s("TermsPanel",{attrs:{settings:t.settings},on:{close:function(e){return t.$emit("close")}}}):t._e()],1),s("sl-tab-panel",{attrs:{name:"pages"}},["pages"===t.current_tab?s("PagesPanel",{attrs:{settings:t.settings},on:{close:function(e){return t.$emit("close")}}}):t._e()],1),s("sl-tab-panel",{attrs:{name:"suggested_cat_kw"}},["suggested_cat_kw"===t.current_tab?s("SuggestedCategories"):t._e()],1),s("sl-tab-panel",{attrs:{name:"storage"}},["storage"===t.current_tab?s("PickNativePath",{attrs:{can_edit:t.is_instance_admin&&t.$root.app_infos.is_electron}}):t._e(),s("br"),s("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("restart_to_apply"))+" ")])],1)],1)],1)])])},i=[],n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[t.opened_font_item_path?[s("FontItem",{attrs:{font_path:t.opened_font_item_path},on:{toggle:function(e){t.opened_font_item_path=!1}}})]:[s("div",t._l(t.fonts,(function(e){return s("div",{key:e.$path,staticClass:"_fontRow"},[s("h3",[t._v(" "+t._s(e.title)+" ")]),s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("open"))},on:{click:function(s){return t.openFontItem(e.$path)}}})])})),0),s("br"),s("button",{staticClass:"u-button u-button_bleuvert",class:{"is--active":t.show_create_font},attrs:{type:"button"},on:{click:function(e){t.show_create_font=!t.show_create_font}}},[t._v(" "+t._s(t.$t("add"))+" ")]),t.show_create_font?s("form",{staticClass:"input-validation-required",on:{submit:function(e){return e.preventDefault(),t.createFont.apply(null,arguments)}}},[s("fieldset",[s("legend",{staticClass:"u-label"},[t._v(t._s(t.$t("add_font")))]),s("TextInput",{attrs:{content:t.new_font_title,label_str:"font_name",required:!0,input_type:"text"},on:{"update:content":function(e){t.new_font_title=e}}}),s("br"),s("br"),s("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",disabled:0===t.new_font_title.length,type:"submit"},slot:"footer"},[t._v(" "+t._s(t.$t("create"))+" ")])],1)]):t._e()]],2)},o=[],r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"_fontItem"},[t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):s("div",[s("div",{staticClass:"_topContent"},[s("TitleField",{staticClass:"_title",attrs:{field_name:"title",content:t.font.title,path:t.font_path,tag:"h3",can_edit:!0}}),s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("close"))},on:{click:function(e){return t.$emit("toggle")}}})],1),s("div",[s("br"),s("div",{staticClass:"u-instructions"},[s("small",[t._v(" "+t._s(t.$t("font_instr"))+" ")])]),s("br"),s("div",[s("DLabel",{attrs:{str:"1."+t.$t("import")}}),s("input",{staticClass:"inputfile-2",attrs:{type:"file",multiple:"multiple",id:t.id+"-add_file",name:"file",accept:".woff2"},on:{change:function(e){return t.updateInputFiles(e)}}}),s("label",{attrs:{for:t.id+"-add_file"}},[s("svg",{attrs:{width:"20",height:"17",viewBox:"0 0 20 17"}},[s("path",{attrs:{d:"M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"}})]),t._v(" "+t._s(t.$t("import"))+" ")]),t.selected_files.length>0?s("UploadFiles",{attrs:{files_to_import:t.selected_files,path:t.font_path},on:{close:function(e){t.selected_files=[]}}}):t._e()],1),s("br"),t.font.$files&&t.font.$files.length>0?s("div",{},[s("DLabel",{attrs:{str:"2."+t.$t("select")}}),s("div",{staticClass:"_fileList"},t._l(t.font_options,(function(e,a){return s("div",{key:a,staticClass:"_file",attrs:{value:e.key}},[t._v(" "+t._s(e.text)+" "),s("select",{directives:[{name:"model",rawName:"v-model",value:t.new_font_files[e.key],expression:"new_font_files[font_option.key]"}],on:{change:function(s){var a=Array.prototype.filter.call(s.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.$set(t.new_font_files,e.key,s.target.multiple?a:a[0])}}},[s("option",{attrs:{value:""},domProps:{textContent:t._s("–")}}),t._l(t.font.$files,(function(e){return s("option",{key:e.$path,domProps:{textContent:t._s(e.$media_filename)}})}))],2)])})),0),JSON.stringify(t.font.font_files)!==JSON.stringify(t.new_font_files)?[s("br"),s("SaveCancelButtons",{staticClass:"_scb",on:{save:t.updateFont,cancel:t.cancel}})]:t._e()],2):t._e(),s("div",{staticClass:"u-instructions"},[s("small",[t._v(" "+t._s(t.$t("reload_page_to_apply"))+" ")])]),s("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:function(e){return t.$router.go()}}},[t._v(" "+t._s(t.$t("reload_page"))+" ")])])])])},l=[],_={props:{font_path:String},components:{},data(){return{selected_files:[],id:`fonts_upload_${(Math.random().toString(36)+"00000000000000000").slice(2,5)}`,is_loading:!0,font:void 0,new_font_files:{},font_options:[{key:"regular-normal",text:this.$t("font_regular")+"/"+this.$t("font_normal")},{key:"regular-italic",text:this.$t("font_regular")+"/"+this.$t("font_italic")},{key:"bold-normal",text:this.$t("font_bold")+"/"+this.$t("font_normal")},{key:"bold-italic",text:this.$t("font_bold")+"/"+this.$t("font_italic")}]}},created(){},async mounted(){this.font=await this.$api.getFolder({path:this.font_path}),this.new_font_files=this.font.font_files||{},this.is_loading=!1,this.$api.join({room:this.font_path})},beforeDestroy(){this.$api.leave({room:this.font_path})},watch:{"font.font_files"(){this.initFF()}},computed:{},methods:{initFF(){this.new_font_files=JSON.parse(JSON.stringify(this.font.font_files))},updateInputFiles(t){this.selected_files=Array.from(t.target.files),t.target.value=""},async updateFont(){await this.$api.updateMeta({path:this.font_path,new_meta:{font_files:this.new_font_files}}),this.$emit("toggle")},cancel(){this.initFF()}}},c=_,p=(s(7792),s(1001)),d=(0,p.Z)(c,r,l,!1,null,"041d16a7",null),u=d.exports,g={props:{},components:{FontItem:u},data(){return{fonts:void 0,show_create_font:!1,opened_font_item_path:!1,new_font_title:"",path:"fonts"}},created(){},async mounted(){this.fonts=await this.$api.getFolders({path:this.path}).catch((t=>{this.fetch_fonts_error=t.response})),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{async createFont(){const t=await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_font_title,requested_slug:this.new_font_title,$status:"public"}});this.openFontItem(this.path+"/"+t)},openFontItem(t){this.opened_font_item_path=t}}},h=g,f=(s(87003),(0,p.Z)(h,n,o,!1,null,"0b1c0cf3",null)),m=f.exports,v=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("DLabel",{attrs:{str:t.$t("images")}}),s("div",{staticClass:"u-spacingBottom"},[s("input",{staticClass:"inputfile-2",attrs:{type:"file",multiple:"multiple",id:t.id+"-add_file",name:"file",accept:"image/*"},on:{change:function(e){return t.updateInputFiles(e)}}}),s("label",{attrs:{for:t.id+"-add_file"}},[s("svg",{attrs:{width:"20",height:"17",viewBox:"0 0 20 17"}},[s("path",{attrs:{d:"M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"}})]),t._v(" "+t._s(t.$t("import"))+" ")]),t.selected_files.length>0?s("UploadFiles",{attrs:{files_to_import:t.selected_files,path:t.settings.$path},on:{close:function(e){t.selected_files=[]}}}):t._e()],1),t.settings.$files&&t.settings.$files.length>0?s("div",{staticClass:"u-spacingBottom _imagesList"},t._l(t.settings.$files,(function(t){return s("div",{key:t.$path,staticClass:"_imagesList--image"},[s("MediaContent",{attrs:{file:t,context:"preview",resolution:640}})],1)})),0):t._e(),t.settings.$files?s("div",t._l(t.possible_types,(function(e){return s("div",{key:e.key,staticClass:"u-spacingBottom"},[s("DLabel",{attrs:{str:e.label,instructions:e.instructions}}),s("RadioCheckboxField",{attrs:{field_name:e.key,input_type:"radio",content:t.settings[e.key],path:t.settings.$path,can_edit:t.can_edit,options:t.editing_options}})],1)})),0):t._e(),s("ColorInput",{staticClass:"u-spacingBottom",attrs:{label:t.$t("hero_background_color"),value:t.settings.hero_background_color},on:{save:function(e){return t.saveNewHeroBgColor({$event:e,field:"hero_background_color"})}}}),s("ColorInput",{staticClass:"u-spacingBottom",attrs:{label:t.$t("text_background_color"),value:t.settings.text_background_color},on:{save:function(e){return t.saveNewHeroBgColor({$event:e,field:"text_background_color"})}}}),s("div",{staticClass:"u-spacingBottom"},[s("DLabel",{attrs:{str:t.$t("text_image_layout")}}),s("RadioCheckboxField",{attrs:{field_name:"text_image_layout",input_type:"radio",content:t.settings["text_image_layout"],path:t.settings.$path,can_edit:t.can_edit,options:t.layout_options}})],1),s("div",{staticClass:"u-instructions"},[s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){return t.$emit("reloadPage")}}},[t._v(" "+t._s(t.$t("refresh_window_to_apply"))+" ")])])],1)},b=[],$=(s(57658),{props:{settings:Object,can_edit:Boolean},components:{},data(){return{selected_files:[],id:`admin_images_upload_${(Math.random().toString(36)+"00000000000000000").slice(2,5)}`,possible_types:[{key:"favicon_image_name",label:this.$t("favicon_image"),instructions:this.$t("favicon_image_instr")},{key:"topbar_image_name",label:this.$t("topbar_image"),instructions:this.$t("topbar_image_instr")},{key:"hero_image_name",label:this.$t("hero_image"),instructions:this.$t("hero_image_instr")}],layout_options:[{key:"image_text",label:"Image + texte"},{key:"text_image",label:"Texte + image"},{key:"image_text_overlay",label:"Image et texte superposés"}]}},created(){},async mounted(){},beforeDestroy(){},watch:{},computed:{editing_options(){if(!this.settings.$files||0===this.settings.$files.length)return[];let t=[];return t.push({key:"",label:"–"}),this.settings.$files.map((e=>{const s=this.makeRelativeURLFromThumbs({$thumbs:e.$thumbs,$type:e.$type,$path:"",resolution:640});t.push({key:e.$path,label:e.$path,thumb_src:s})})),t}},methods:{async saveNewHeroBgColor({$event:t,field:e}){await this.$api.updateMeta({path:this.settings.$path,new_meta:{[e]:t||""}})},updateInputFiles(t){this.selected_files=Array.from(t.target.files),t.target.value=""},imageSelected(t){return this.settings[t]},async updateImageField(t,e){await this.$api.updateMeta({path:this.settings.$path,new_meta:{[e]:t}})}}}),y=$,w=(s(14970),(0,p.Z)(y,v,b,!1,null,"80193df2",null)),C=w.exports,k=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):s("div",[t.terms_page?[s("div",{staticClass:"u-spacingBottom"},[s("ToggleField",{attrs:{label:t.$t("users_must_accept_terms_to_signup"),field_name:"users_must_accept_terms_to_signup",content:!0===t.settings.users_must_accept_terms_to_signup,path:t.settings.$path,can_edit:!0}})],1),s("div",{staticClass:"u-spacingBottom"},[s("ToggleField",{attrs:{label:t.$t("terms_in_footer"),field_name:"terms_in_footer",content:!0===t.settings.terms_in_footer,path:t.settings.$path,can_edit:!0}})],1),s("router-link",{staticClass:"u-buttonLink",attrs:{to:t.createURLFromPath(t.terms_page.$path)},nativeOn:{click:function(e){return t.$emit("close")}}},[t._v(" "+t._s(t.$t("open_page"))+" ")])]:[s("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:t.createTermsPage}},[t._v(" "+t._s(t.$t("create_terms_page"))+" ")])]],2)])},x=[],F={props:{settings:Object},components:{},data(){return{pages:void 0,path:"pages",is_loading:!0}},created(){},async mounted(){this.pages=await this.$api.getFolders({path:this.path}).catch((t=>{this.fetch_pages_error=t.response})),this.$api.join({room:this.path}),this.is_loading=!1},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{terms_page(){return this.pages?.find((t=>"pages/terms"===t.$path))}},methods:{async createTermsPage(){await this.$api.createFolder({path:this.path,additional_meta:{title:this.$t("terms"),requested_slug:"terms",$status:"public"}});this.show_create_page=!1}}},L=F,M=(s(30043),(0,p.Z)(L,k,x,!1,null,"11e6c807",null)),P=M.exports,S=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("div",{staticClass:"_pagesList"},t._l(t.pages,(function(e){return s("div",{key:e.$path,staticClass:"_pagesList--page"},[s("h3",[t._v(" "+t._s(e.title)+" ")]),s("router-link",{staticClass:"u-buttonLink",attrs:{to:t.createURLFromPath(e.$path)},nativeOn:{click:function(e){return t.$emit("close")}}},[t._v(" "+t._s(t.$t("open"))+" ")])],1)})),0),s("br"),s("button",{staticClass:"u-button u-button_bleuvert",class:{"is--active":t.show_create_page},attrs:{type:"button"},on:{click:function(e){t.show_create_page=!t.show_create_page}}},[t._v(" "+t._s(t.$t("add"))+" ")]),t.show_create_page?s("form",{staticClass:"input-validation-required",on:{submit:function(e){return e.preventDefault(),t.createPage.apply(null,arguments)}}},[s("fieldset",[s("legend",{staticClass:"u-label"},[t._v(t._s(t.$t("create_page")))]),s("TextInput",{attrs:{content:t.new_page_title,label_str:"title",required:!0,input_type:"text"},on:{"update:content":function(e){t.new_page_title=e}}}),s("br"),s("br"),s("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",disabled:0===t.new_page_title.length,type:"submit"},slot:"footer"},[t._v(" "+t._s(t.$t("create"))+" ")])],1)]):t._e()])},T=[],B={props:{},components:{},data(){return{pages:void 0,fetch_pages_error:void 0,show_create_page:!1,new_page_title:"",path:"pages"}},created(){},async mounted(){this.pages=await this.$api.getFolders({path:this.path}).catch((t=>{this.fetch_pages_error=t.response})),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{async createPage(){await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_page_title,requested_slug:this.new_page_title,$status:"public"}});this.show_create_page=!1}}},I=B,q=(s(39915),(0,p.Z)(I,S,T,!1,null,"577c2c9d",null)),j=q.exports,D=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[t.opened_category_path?[s("SingleCategory",{attrs:{path:t.opened_category_path},on:{close:function(e){t.opened_category_path=!1}}})]:[s("div",t._l(t.categories,(function(e){return s("div",{key:e.$path,staticClass:"_categoryRow",style:t.categoryStyles(e)},[s("div",{staticClass:"_title"},[s("strong",[t._v(t._s(e.title))]),t._v(" ("+t._s(t.getCatSuggLength(e))+") ")]),s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("open"))},on:{click:function(s){return t.openCategory(e.$path)}}})])})),0),t.missing_suggested_categories.length>0?s("button",{staticClass:"u-buttonLink",class:{"is--active":t.show_create_category},attrs:{type:"button"},on:{click:function(e){t.show_create_category=!t.show_create_category}}},[t._v(" "+t._s(t.$t("add_category"))+" ")]):t._e(),t.show_create_category?s("form",{staticClass:"input-validation-required"},[s("fieldset",[s("legend",{staticClass:"u-label"},[t._v(" "+t._s(t.$t("create_suggestion_list_for"))+" ")]),s("div",{staticClass:"u-sameRow"},t._l(t.missing_suggested_categories,(function(e){return s("button",{key:e.key,staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(s){return t.createCategory(e)}}},[t._v(" "+t._s(e.label)+" ")])})),0)])]):t._e()]],2)},Z=[],N=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("div",{staticClass:"u-spacingBottom _top"},[s("div",[s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[s("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("back"))+" ")],1)]),s("RemoveMenu",{attrs:{remove_text:t.$t("remove_category")},on:{remove:t.removeCat}})],1),t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):s("div",[s("div",{staticClass:"u-spacingBottom"},[s("TitleField",{staticClass:"_title",attrs:{field_name:"title",content:t.category.title,path:t.category.$path,tag:"h3",required:!0,maxlength:20,can_edit:!1}})],1),s("div",{},[s("TagsField",{attrs:{label:t.$t("list_of_suggestions"),field_name:"list_of_suggestions",tag_type:t.tag_type,content:t.category.list_of_suggestions,path:t.path,never_shorten_list:!0,can_edit:!0}})],1)])])},R=[],E=(s(52262),s(24506),s(26699),{props:{path:String},components:{},data(){return{category:void 0,is_loading:!0,new_list_of_suggestions:[],new_suggestion:""}},created(){},async mounted(){this.category=await this.$api.getFolder({path:this.path}),this.$api.join({room:this.path}),this.new_list_of_suggestions=this.category.list_of_suggestions||[],this.is_loading=!1},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{tag_type(){return this.path.split("/").at(-1)},new_keyword_already_exists(){return this.new_list_of_suggestions.some((t=>t.toLowerCase()===this.new_suggestion.toLowerCase()))},new_keyword_contains_slash(){return this.new_suggestion.includes("/")}},methods:{removeSuggestion(t){this.new_list_of_suggestions=this.new_list_of_suggestions.filter((e=>e!==t))},newKeyword(){if(0===this.new_suggestion.length||this.new_keyword_already_exists||this.new_keyword_contains_slash)return!1;this.new_list_of_suggestions.push(this.new_suggestion),this.new_suggestion=""},cancel(){this.new_list_of_suggestions=this.category.list_of_suggestions,this.new_suggestion="",this.$emit("close")},async saveNewSuggestion(){await this.$api.updateMeta({path:this.path,new_meta:{list_of_suggestions:this.new_list_of_suggestions}}),this.$emit("close")},async saveNewColor(t){await this.$api.updateMeta({path:this.path,new_meta:{tag_color:t||""}})},async removeCat(){await this.$api.deleteItem({path:this.path}),this.$emit("close")}}}),O=E,z=(s(48361),(0,p.Z)(O,N,R,!1,null,"40a1e802",null)),A=z.exports,U={props:{},components:{SingleCategory:A},data(){return{categories:void 0,show_create_category:!1,opened_category_path:!1,suggestion_list_cat:[{key:"machines",label:this.$t("machines")},{key:"materials",label:this.$t("materials")},{key:"keywords",label:this.$t("keywords")},{key:"accountgroup",label:this.$t("account_group")}],path:"categories"}},created(){},async mounted(){this.categories=await this.$api.getFolders({path:this.path}).catch((t=>{this.fetch_categories_error=t.response})),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{missing_suggested_categories(){return this.suggestion_list_cat.filter((t=>!this.categories?.some((e=>e.$path.endsWith("/"+t.key)))))}},methods:{async createCategory(t){const e=await this.$api.createFolder({path:this.path,additional_meta:{title:t.label,requested_slug:t.key,$status:"public"}});this.openCategory(this.path+"/"+e)},getCatSuggLength(t){return t.list_of_suggestions?.length||0},openCategory(t){this.opened_category_path=t},categoryStyles(t){return t.tag_color?`\n        --cat-color: ${t.tag_color}\n      `:""}}},J=U,H=(s(53803),(0,p.Z)(J,D,Z,!1,null,"4f5ddffe",null)),K=H.exports,W={props:{starting_tab:String},components:{FontsPanel:m,ImagesPanel:C,TermsPanel:P,PagesPanel:j,SuggestedCategories:K},data(){return{path_to_content:void 0,new_path_to_content:void 0,settings:void 0,is_loading:!0,current_tab:"informations"}},created(){},async mounted(){this.settings=await this.$api.getFolder({path:""}).catch((t=>(this.is_loading=!1,t))),this.is_loading=!1,this.starting_tab&&setTimeout((()=>{this.$refs.tabgroup.show(this.starting_tab)}),100),this.$api.join({room:this.settings.$path})},beforeDestroy(){this.$api.leave({room:this.settings.$path})},watch:{},computed:{},methods:{restartDodoc(){this.$api.restartDodoc()},reloadPage(){window.location.reload()},saveNewPathToContent(){},newTabShown(t){this.current_tab=t.detail.name}}},G=W,Q=(s(82585),(0,p.Z)(G,a,i,!1,null,"876ee3ac",null)),V=Q.exports},97283:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._adminSettings[data-v-876ee3ac]{margin-top:calc(var(--spacing)/-1);margin-bottom:calc(var(--spacing)/-1)}",""]),e["default"]=r},69626:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._fontItem[data-v-041d16a7]{padding:calc(var(--spacing)/2) 0}._topContent[data-v-041d16a7]{display:flex;flex-flow:row wrap;justify-content:space-between}._topContent ._title[data-v-041d16a7]{width:auto}._fileList[data-v-041d16a7]{display:flex;flex-flow:column nowrap;padding:calc(var(--spacing)/2) 0;gap:calc(var(--spacing)/2)}._file>*[data-v-041d16a7]{flex:0 0 50%}",""]),e["default"]=r},33825:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._fontRow[data-v-0b1c0cf3]{display:flex;justify-content:space-between;align-content:center;border-bottom:2px solid var(--c-gris);padding:calc(var(--spacing)/2) 0}",""]),e["default"]=r},94647:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._cover[data-v-80193df2]{position:relative;width:100%;aspect-ratio:2/1;border:2px solid var(--c-gris)}._cover[data-v-80193df2]  img{-o-object-fit:scale-down;object-fit:scale-down}._imagesList[data-v-80193df2]{border:2px solid var(--c-gris);display:grid;grid-template-columns:repeat(auto-fill,minmax(50px,1fr));gap:2px;padding:calc(var(--spacing)/4)}._imagesList--image[data-v-80193df2]{width:100%;aspect-ratio:1}._imagesList--image[data-v-80193df2]  ._mediaContent{width:100%;height:100%}._imagesList--image[data-v-80193df2]  ._mediaContent--image{position:absolute;width:100%;height:100%;-o-object-fit:cover;object-fit:cover;max-width:none}",""]),e["default"]=r},39600:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._pagesList--page[data-v-577c2c9d]{display:flex;justify-content:space-between;align-content:center;border-bottom:2px solid var(--c-gris);padding:calc(var(--spacing)/2) 0}",""]),e["default"]=r},12062:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._top[data-v-40a1e802]{display:flex;flex-flow:row wrap;justify-content:space-between}",""]),e["default"]=r},35997:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._categoryRow[data-v-4f5ddffe]{display:flex;justify-content:space-between;align-content:center;padding:calc(var(--spacing)/8) 0}._title[data-v-4f5ddffe]{background:var(--cat-color,#fff)}",""]),e["default"]=r},17134:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._pagesList--page[data-v-11e6c807]{display:flex;justify-content:space-between;align-content:center;border-bottom:2px solid var(--c-gris);padding:calc(var(--spacing)/2) 0}",""]),e["default"]=r},82585:function(t,e,s){var a=s(97283);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("728f7244",a,!0,{sourceMap:!1,shadowMode:!1})},7792:function(t,e,s){var a=s(69626);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("0a8260e9",a,!0,{sourceMap:!1,shadowMode:!1})},87003:function(t,e,s){var a=s(33825);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("463f413b",a,!0,{sourceMap:!1,shadowMode:!1})},14970:function(t,e,s){var a=s(94647);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("368e6618",a,!0,{sourceMap:!1,shadowMode:!1})},39915:function(t,e,s){var a=s(39600);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("35bfefe1",a,!0,{sourceMap:!1,shadowMode:!1})},48361:function(t,e,s){var a=s(12062);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("1b4a0818",a,!0,{sourceMap:!1,shadowMode:!1})},53803:function(t,e,s){var a=s(35997);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("142b7859",a,!0,{sourceMap:!1,shadowMode:!1})},30043:function(t,e,s){var a=s(17134);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(31982).Z;i("557a4d24",a,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=998.js.map