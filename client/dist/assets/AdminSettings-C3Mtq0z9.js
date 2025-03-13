import{n as a}from"../build.js";const c={props:{font_path:String},components:{},data(){return{selected_files:[],id:`fonts_upload_${(Math.random().toString(36)+"00000000000000000").slice(2,5)}`,is_loading:!0,font:void 0,new_font_files:{},font_options:[{key:"regular-normal",text:this.$t("font_regular")+"/"+this.$t("font_normal")},{key:"regular-italic",text:this.$t("font_regular")+"/"+this.$t("font_italic")},{key:"bold-normal",text:this.$t("font_bold")+"/"+this.$t("font_normal")},{key:"bold-italic",text:this.$t("font_bold")+"/"+this.$t("font_italic")}]}},created(){},async mounted(){this.font=await this.$api.getFolder({path:this.font_path}),this.new_font_files=this.font.font_files||{},this.is_loading=!1,this.$api.join({room:this.font_path})},beforeDestroy(){this.$api.leave({room:this.font_path})},watch:{"font.font_files"(){this.initFF()}},computed:{},methods:{initFF(){this.new_font_files=JSON.parse(JSON.stringify(this.font.font_files))},updateInputFiles(i){this.selected_files=Array.from(i.target.files),i.target.value=""},async updateFont(){await this.$api.updateMeta({path:this.font_path,new_meta:{font_files:this.new_font_files}}),this.$emit("toggle")},cancel(){this.initFF()}}};var u=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_fontItem"},[t.is_loading?e("div",{key:"loader",staticClass:"_spinner"},[e("LoaderSpinner")],1):e("div",[e("div",{staticClass:"_topContent"},[e("TitleField",{staticClass:"_title",attrs:{field_name:"title",content:t.font.title,path:t.font_path,tag:"h3",can_edit:!0}}),e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("close"))},on:{click:function(s){return t.$emit("toggle")}}})],1),e("div",[e("br"),e("div",{staticClass:"u-instructions"},[e("small",[t._v(" "+t._s(t.$t("font_instr"))+" ")])]),e("br"),e("div",[e("DLabel",{attrs:{str:"1."+t.$t("import")}}),e("input",{staticClass:"inputfile-2",attrs:{type:"file",multiple:"multiple",id:t.id+"-add_file",name:"file",accept:".woff2"},on:{change:function(s){return t.updateInputFiles(s)}}}),e("label",{attrs:{for:t.id+"-add_file"}},[e("svg",{attrs:{width:"20",height:"17",viewBox:"0 0 20 17"}},[e("path",{attrs:{d:"M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"}})]),t._v(" "+t._s(t.$t("import"))+" ")]),t.selected_files.length>0?e("UploadFiles",{attrs:{files_to_import:t.selected_files,path:t.font_path},on:{close:function(s){t.selected_files=[]}}}):t._e()],1),e("br"),t.font.$files&&t.font.$files.length>0?e("div",{},[e("DLabel",{attrs:{str:"2."+t.$t("select")}}),e("div",{staticClass:"_fileList"},t._l(t.font_options,function(s,n){return e("div",{key:n,staticClass:"_file",attrs:{value:s.key}},[t._v(" "+t._s(s.text)+" "),e("select",{directives:[{name:"model",rawName:"v-model",value:t.new_font_files[s.key],expression:"new_font_files[font_option.key]"}],on:{change:function(o){var _=Array.prototype.filter.call(o.target.options,function(r){return r.selected}).map(function(r){var l="_value"in r?r._value:r.value;return l});t.$set(t.new_font_files,s.key,o.target.multiple?_:_[0])}}},[e("option",{attrs:{value:""},domProps:{textContent:t._s("–")}}),t._l(t.font.$files,function(o){return e("option",{key:o.$path,domProps:{textContent:t._s(o.$media_filename)}})})],2)])}),0),JSON.stringify(t.font.font_files)!==JSON.stringify(t.new_font_files)?[e("br"),e("SaveCancelButtons",{staticClass:"_scb",on:{save:t.updateFont,cancel:t.cancel}})]:t._e()],2):t._e(),e("div",{staticClass:"u-instructions"},[e("small",[t._v(" "+t._s(t.$t("reload_page_to_apply"))+" ")])]),e("button",{staticClass:"u-button",attrs:{type:"button"},on:{click:function(s){return t.$router.go()}}},[t._v(" "+t._s(t.$t("reload_page"))+" ")])])])])},d=[],p=a(c,u,d,!1,null,"0a31dda3");const h=p.exports,g={props:{},components:{FontItem:h},data(){return{fonts:void 0,show_create_font:!1,opened_font_item_path:!1,new_font_title:"",path:"fonts"}},created(){},async mounted(){this.fonts=await this.$api.getFolders({path:this.path}).catch(i=>{this.fetch_fonts_error=i.response}),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{async createFont(){const i=await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_font_title,requested_slug:this.new_font_title,$status:"public"}});this.openFontItem(this.path+"/"+i)},openFontItem(i){this.opened_font_item_path=i}}};var f=function(){var t=this,e=t._self._c;return e("div",[t.opened_font_item_path?[e("FontItem",{attrs:{font_path:t.opened_font_item_path},on:{toggle:function(s){t.opened_font_item_path=!1}}})]:[e("div",t._l(t.fonts,function(s){return e("div",{key:s.$path,staticClass:"_fontRow"},[e("h3",[t._v(" "+t._s(s.title)+" ")]),e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("open"))},on:{click:function(n){return t.openFontItem(s.$path)}}})])}),0),e("br"),e("button",{staticClass:"u-button u-button_bleuvert",class:{"is--active":t.show_create_font},attrs:{type:"button"},on:{click:function(s){t.show_create_font=!t.show_create_font}}},[t._v(" "+t._s(t.$t("add"))+" ")]),t.show_create_font?e("form",{staticClass:"input-validation-required",on:{submit:function(s){return s.preventDefault(),t.createFont.apply(null,arguments)}}},[e("fieldset",[e("legend",{staticClass:"u-label"},[t._v(t._s(t.$t("add_font")))]),e("TextInput",{attrs:{content:t.new_font_title,label_str:"font_name",required:!0,input_type:"text"},on:{"update:content":function(s){t.new_font_title=s}}}),e("br"),e("br"),e("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",disabled:t.new_font_title.length===0,type:"submit"},slot:"footer"},[t._v(" "+t._s(t.$t("create"))+" ")])],1)]):t._e()]],2)},m=[],$=a(g,f,m,!1,null,"b520a77d");const v=$.exports,b={props:{settings:Object,can_edit:Boolean},components:{},data(){return{selected_files:[],id:`admin_images_upload_${(Math.random().toString(36)+"00000000000000000").slice(2,5)}`,possible_types:[{key:"favicon_image_name",label:this.$t("favicon_image"),instructions:this.$t("favicon_image_instr")},{key:"topbar_image_name",label:this.$t("topbar_image"),instructions:this.$t("topbar_image_instr")},{key:"hero_image_name",label:this.$t("hero_image"),instructions:this.$t("hero_image_instr")}],layout_options:[{key:"image_text",label:"Image + texte"},{key:"text_image",label:"Texte + image"},{key:"image_text_overlay",label:"Image et texte superposés"}]}},created(){},async mounted(){},beforeDestroy(){},watch:{},computed:{settings_file(){var i;return(i=this.settings)==null?void 0:i.$files},editing_options(){if(!this.settings.$files||this.settings.$files.length===0)return[];let i=[];return i.push({key:"",label:"–"}),this.settings.$files.map(t=>{const e=this.makeRelativeURLFromThumbs({$thumbs:t.$thumbs,$type:t.$type,$path:"",resolution:640});i.push({key:t.$path,label:t.$path,thumb_src:e})}),i}},methods:{async saveNewHeroBgColor({$event:i,field:t}){await this.$api.updateMeta({path:this.settings.$path,new_meta:{[t]:i||""}})},updateInputFiles(i){this.selected_files=Array.from(i.target.files),i.target.value=""},imageSelected(i){return this.settings[i]},async updateImageField(i,t){await this.$api.updateMeta({path:this.settings.$path,new_meta:{[t]:i}})},async removeMedia(i){await this.$api.deleteItem({path:i})}}};var y=function(){var t=this,e=t._self._c;return e("div",[e("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("start_by_uploading_images"))+" ")]),e("div",{staticClass:"u-spacingBottom"}),e("DLabel",{attrs:{str:t.$t("images")}}),e("div",{staticClass:"u-spacingBottom"},[e("input",{staticClass:"inputfile-2",attrs:{type:"file",multiple:"multiple",id:t.id+"-add_file",name:"file",accept:"image/*"},on:{change:function(s){return t.updateInputFiles(s)}}}),e("label",{attrs:{for:t.id+"-add_file"}},[e("svg",{attrs:{width:"20",height:"17",viewBox:"0 0 20 17"}},[e("path",{attrs:{d:"M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"}})]),t._v(" "+t._s(t.$t("import"))+" ")]),t.selected_files.length>0?e("UploadFiles",{attrs:{files_to_import:t.selected_files,path:t.settings.$path},on:{close:function(s){t.selected_files=[]}}}):t._e()],1),t.settings.$files&&t.settings.$files.length>0?e("div",{staticClass:"u-spacingBottom _imagesList"},t._l(t.settings_file,function(s){return e("div",{key:s.$path,staticClass:"_imagesList--image"},[e("MediaContent",{attrs:{file:s,context:"preview",resolution:640}}),e("RemoveMenu",{staticClass:"_removeMedia",attrs:{show_button_text:!1},on:{remove:function(n){return t.removeMedia(s.$path)}}})],1)}),0):t._e(),t.settings.$files?e("div",t._l(t.possible_types,function(s){return e("div",{key:s.key,staticClass:"u-spacingBottom"},[e("RadioCheckboxField",{attrs:{label:s.label,instructions:s.instructions,field_name:s.key,input_type:"radio",content:t.settings[s.key],path:t.settings.$path,can_edit:t.can_edit,options:t.editing_options}})],1)}),0):t._e(),e("ColorInput",{staticClass:"u-spacingBottom",attrs:{label:t.$t("hero_background_color"),allow_transparent:!0,value:t.settings.hero_background_color},on:{save:function(s){return t.saveNewHeroBgColor({$event:s,field:"hero_background_color"})}}}),e("ColorInput",{staticClass:"u-spacingBottom",attrs:{label:t.$t("text_background_color"),allow_transparent:!0,value:t.settings.text_background_color},on:{save:function(s){return t.saveNewHeroBgColor({$event:s,field:"text_background_color"})}}}),e("div",{staticClass:"u-spacingBottom"},[e("RadioCheckboxField",{attrs:{label:t.$t("text_image_layout"),field_name:"text_image_layout",input_type:"radio",content:t.settings.text_image_layout,path:t.settings.$path,can_edit:t.can_edit,options:t.layout_options}})],1),e("div",{staticClass:"u-instructions"},[e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(s){return t.$emit("reloadPage")}}},[t._v(" "+t._s(t.$t("refresh_window_to_see_changes"))+" ")])])],1)},w=[],C=a(b,y,w,!1,null,"9fef6bd8");const k=C.exports,F={props:{settings:Object},components:{},data(){return{pages:void 0,path:"pages",is_loading:!0}},created(){},async mounted(){this.pages=await this.$api.getFolders({path:this.path}).catch(i=>{this.fetch_pages_error=i.response}),this.$api.join({room:this.path}),this.is_loading=!1},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{async createPage(i="terms"){await this.$api.createFolder({path:this.path,additional_meta:{title:this.$t(i),requested_slug:i,$status:"public"}}),this.show_create_page=!1},getPage(i){var t;return(t=this.pages)==null?void 0:t.find(e=>e.$path===`pages/${i}`)}}};var x=function(){var t=this,e=t._self._c;return e("div",[t.is_loading?e("div",{key:"loader",staticClass:"_spinner"},[e("LoaderSpinner")],1):e("div",[e("div",{staticClass:"u-instructions"},[e("p",{staticClass:"u-spacingBottom"},[t._v(t._s(t.$t("terms_confidentiality_infos")))]),e("p",{staticClass:"u-spacingBottom"},[t._v(t._s(t.$t("cookies_info")))])]),t._l(["terms","confidentiality"],function(s){return e("fieldset",{key:s},[e("legend",[t._v(t._s(t.$t(s)))]),t.getPage(s)?[s==="terms"?e("div",{staticClass:"u-spacingBottom"},[e("ToggleField",{attrs:{label:t.$t("users_must_accept_terms_to_signup"),field_name:"users_must_accept_terms_to_signup",content:t.settings.users_must_accept_terms_to_signup===!0,path:t.settings.$path,can_edit:!0}})],1):t._e(),s==="terms"?e("div",{staticClass:"u-spacingBottom"},[e("ToggleField",{attrs:{label:t.$t("terms_confidentiality_in_footer"),field_name:"terms_in_footer",content:t.settings.terms_in_footer===!0,path:t.settings.$path,can_edit:!0}})],1):s==="confidentiality"?e("div",{staticClass:"u-spacingBottom"},[e("ToggleField",{attrs:{label:t.$t("terms_confidentiality_in_footer"),field_name:"confidentiality_in_footer",content:t.settings.confidentiality_in_footer===!0,path:t.settings.$path,can_edit:!0}})],1):t._e(),e("router-link",{staticClass:"u-buttonLink",attrs:{to:t.createURLFromPath(t.getPage(s).$path)},nativeOn:{click:function(n){return t.$emit("close")}}},[s==="terms"?[t._v(" "+t._s(t.$t("open_terms_page"))+" ")]:[t._v(" "+t._s(t.$t("open_confidentiality_page"))+" ")]],2)]:[e("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(n){return t.createPage(s)}}},[t._v(" "+t._s(t.$t("create_this_page"))+" ")])]],2)})],2)])},B=[],P=a(F,x,B,!1,null,"ab37ed93");const S=P.exports,L={props:{},components:{},data(){return{pages:void 0,fetch_pages_error:void 0,show_create_page:!1,new_page_title:"",path:"pages"}},created(){},async mounted(){this.pages=await this.$api.getFolders({path:this.path}).catch(i=>{this.fetch_pages_error=i.response}),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{async createPage(){await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_page_title,requested_slug:this.new_page_title,$status:"public"}}),this.show_create_page=!1}}};var T=function(){var t=this,e=t._self._c;return e("div",[e("div",{staticClass:"_pagesList"},t._l(t.pages,function(s){return e("div",{key:s.$path,staticClass:"_pagesList--page"},[e("h3",[t._v(" "+t._s(s.title)+" ")]),e("router-link",{staticClass:"u-buttonLink",attrs:{to:t.createURLFromPath(s.$path)},nativeOn:{click:function(n){return t.$emit("close")}}},[t._v(" "+t._s(t.$t("open"))+" ")])],1)}),0),e("br"),e("button",{staticClass:"u-button u-button_bleuvert",class:{"is--active":t.show_create_page},attrs:{type:"button"},on:{click:function(s){t.show_create_page=!t.show_create_page}}},[t._v(" "+t._s(t.$t("add"))+" ")]),t.show_create_page?e("form",{staticClass:"input-validation-required",on:{submit:function(s){return s.preventDefault(),t.createPage.apply(null,arguments)}}},[e("fieldset",[e("legend",{staticClass:"u-label"},[t._v(t._s(t.$t("create_page")))]),e("TextInput",{attrs:{content:t.new_page_title,label_str:"title",required:!0,input_type:"text"},on:{"update:content":function(s){t.new_page_title=s}}}),e("br"),e("br"),e("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",disabled:t.new_page_title.length===0,type:"submit"},slot:"footer"},[t._v(" "+t._s(t.$t("create"))+" ")])],1)]):t._e()])},I=[],M=a(L,T,I,!1,null,"9315b031");const q=M.exports,R={props:{path:String},components:{},data(){return{category:void 0,is_loading:!0,new_list_of_suggestions:[],new_suggestion:""}},created(){},async mounted(){this.category=await this.$api.getFolder({path:this.path}),this.$api.join({room:this.path}),this.new_list_of_suggestions=this.category.list_of_suggestions||[],this.is_loading=!1},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{tag_type(){return this.path.split("/").at(-1)},new_keyword_already_exists(){return this.new_list_of_suggestions.some(i=>i.toLowerCase()===this.new_suggestion.toLowerCase())},new_keyword_contains_slash(){return this.new_suggestion.includes("/")}},methods:{removeSuggestion(i){this.new_list_of_suggestions=this.new_list_of_suggestions.filter(t=>t!==i)},newKeyword(){if(this.new_suggestion.length===0||this.new_keyword_already_exists||this.new_keyword_contains_slash)return!1;this.new_list_of_suggestions.push(this.new_suggestion),this.new_suggestion=""},cancel(){this.new_list_of_suggestions=this.category.list_of_suggestions,this.new_suggestion="",this.$emit("close")},async saveNewSuggestion(){await this.$api.updateMeta({path:this.path,new_meta:{list_of_suggestions:this.new_list_of_suggestions}}),this.$emit("close")},async saveNewColor(i){await this.$api.updateMeta({path:this.path,new_meta:{tag_color:i||""}})},async removeCat(){await this.$api.deleteItem({path:this.path}),this.$emit("close")}}};var D=function(){var t=this,e=t._self._c;return e("div",[e("div",{staticClass:"u-spacingBottom _top"},[e("div",[e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(s){return t.$emit("close")}}},[e("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("back"))+" ")],1)]),e("RemoveMenu",{attrs:{button_text:t.$t("remove_category")},on:{remove:t.removeCat}})],1),t.is_loading?e("div",{key:"loader",staticClass:"_spinner"},[e("LoaderSpinner")],1):e("div",[e("div",{staticClass:"u-spacingBottom"},[e("TitleField",{staticClass:"_title",attrs:{field_name:"title",content:t.category.title,path:t.category.$path,tag:"h3",required:!0,maxlength:20,can_edit:!1}})],1),e("div",{},[e("TagsField",{attrs:{label:t.$t("list_of_suggestions"),field_name:"list_of_suggestions",tag_type:t.tag_type,content:t.category.list_of_suggestions,path:t.path,never_shorten_list:!0,can_edit:!0}})],1)])])},z=[],N=a(R,D,z,!1,null,"e5a1df0d");const j=N.exports,O={props:{},components:{SingleCategory:j},data(){return{categories:void 0,show_create_category:!1,opened_category_path:!1,suggestion_list_cat:[{key:"machines",label:this.$t("machines")},{key:"materials",label:this.$t("materials")},{key:"keywords",label:this.$t("keywords")},{key:"accountgroup",label:this.$t("account_group")}],path:"categories"}},created(){},async mounted(){this.categories=await this.$api.getFolders({path:this.path}).catch(i=>{this.fetch_categories_error=i.response}),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{missing_suggested_categories(){return this.suggestion_list_cat.filter(i=>{var t;return!((t=this.categories)!=null&&t.some(e=>e.$path.endsWith("/"+i.key)))})}},methods:{async createCategory(i){const t=await this.$api.createFolder({path:this.path,additional_meta:{title:i.label,requested_slug:i.key,$status:"public"}});this.openCategory(this.path+"/"+t)},getCatSuggLength(i){var t;return((t=i.list_of_suggestions)==null?void 0:t.length)||0},openCategory(i){this.opened_category_path=i},categoryStyles(i){return i.tag_color?`
        --cat-color: ${i.tag_color}
      `:""}}};var A=function(){var t=this,e=t._self._c;return e("div",[t.opened_category_path?[e("SingleCategory",{attrs:{path:t.opened_category_path},on:{close:function(s){t.opened_category_path=!1}}})]:[e("div",t._l(t.categories,function(s){return e("div",{key:s.$path,staticClass:"_categoryRow",style:t.categoryStyles(s)},[e("div",{staticClass:"_title"},[e("strong",[t._v(t._s(s.title))]),t._v(" ("+t._s(t.getCatSuggLength(s))+") ")]),e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("open"))},on:{click:function(n){return t.openCategory(s.$path)}}})])}),0),t.missing_suggested_categories.length>0?e("button",{staticClass:"u-buttonLink",class:{"is--active":t.show_create_category},attrs:{type:"button"},on:{click:function(s){t.show_create_category=!t.show_create_category}}},[t._v(" "+t._s(t.$t("add_category"))+" ")]):t._e(),t.show_create_category?e("form",{staticClass:"input-validation-required"},[e("fieldset",[e("legend",{staticClass:"u-label"},[t._v(" "+t._s(t.$t("create_suggestion_list_for"))+" ")]),e("div",{staticClass:"u-sameRow"},t._l(t.missing_suggested_categories,function(s){return e("button",{key:s.key,staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(n){return t.createCategory(s)}}},[t._v(" "+t._s(s.label)+" ")])}),0)])]):t._e()]],2)},U=[],J=a(O,A,U,!1,null,"9cb4523f");const H=J.exports,K={props:{starting_tab:String},components:{FontsPanel:v,ImagesPanel:k,TermsPanel:S,PagesPanel:q,SuggestedCategories:H},data(){return{path_to_content:void 0,new_path_to_content:void 0,settings:void 0,is_loading:!0,current_tab:this.starting_tab||"informations",tabs:[{key:"informations",text:this.$t("informations")},{text:this.$t("logo_and_images"),key:"logo_and_images"},{text:this.$t("administration_and_access_control"),key:"administration_and_access_control"},{text:this.$t("fonts"),key:"fonts"},{text:this.$t("events"),key:"events"},{text:this.$t("terms"),key:"terms"},{text:this.$t("suggested_cat_kw"),key:"suggested_cat_kw"},{text:this.$t("storage"),key:"storage"}]}},created(){},async mounted(){this.settings=await this.$api.getFolder({path:""}).catch(i=>(this.is_loading=!1,i)),this.$api.join({room:this.settings.$path}),this.is_loading=!1},beforeDestroy(){this.$api.leave({room:this.settings.$path})},watch:{},computed:{},methods:{restartDodoc(){this.$api.restartDodoc()},reloadPage(){window.location.reload()},saveNewPathToContent(){},newTabShown(i){this.current_tab=i.detail.name},updateUploadMaxFileSizeInMo(i){this.$api.updateMeta({path:this.settings.$path,new_meta:{upload_max_file_size_in_mo:i}})}}};var V=function(){var t=this,e=t._self._c;return e("BaseModal2",{attrs:{title:t.$t("admin_settings"),size:"x-large"},on:{close:function(s){return t.$emit("close")}}},[e("div",{staticClass:"_adminSettings"},[t.is_loading?e("div",{key:"loader",staticClass:"_spinner"},[e("LoaderSpinner")],1):e("div",[e("div",[e("div",{staticClass:"_selectMenu"},[e("SelectField2",{attrs:{value:t.current_tab,options:t.tabs,can_edit:!0,hide_validation:!0},on:{change:function(s){t.current_tab=s}}})],1),e("div",{staticClass:"u-spacingBottom"}),e("transition",{attrs:{name:"fade",mode:"out-in"}},[t.current_tab==="informations"?e("div",[e("div",{staticClass:"u-spacingBottom"},[e("TitleField",{attrs:{field_name:"name_of_instance",label:t.$t("name_of_instance"),instructions:t.$t("name_of_instance_instructions"),content:t.settings.name_of_instance||"",path:t.settings.$path,tag:"h1",maxlength:40,can_edit:t.is_instance_admin}})],1),e("div",{staticClass:"u-spacingBottom"},[e("TitleField",{attrs:{label:t.$t("presentation_of_instance"),field_name:"presentation_of_instance",instructions:t.$t("presentation_of_instance_instructions"),input_type:"editor",custom_formats:["bold","italic","link"],content:t.settings.presentation_of_instance||"",path:t.settings.$path,can_edit:t.is_instance_admin}})],1),e("div",{staticClass:"u-spacingBottom"},[e("TitleField",{attrs:{field_name:"contactmail_of_instance",label:t.$t("contactmail_of_instance"),instructions:t.$t("contactmail_of_instance_instructions"),content:t.settings.contactmail_of_instance,path:t.settings.$path,required:!1,input_type:"email",can_edit:t.is_instance_admin}})],1),e("div",{staticClass:"u-instructions"},[e("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:t.reloadPage}},[t._v(" "+t._s(t.$t("refresh_window_to_see_changes"))+" ")])])]):t.current_tab==="logo_and_images"?e("div",[e("ImagesPanel",{attrs:{settings:t.settings,can_edit:t.is_instance_admin},on:{reloadPage:t.reloadPage}})],1):t.current_tab==="administration_and_access_control"?e("div",[e("AdminsAndContributorsField",{attrs:{folder:t.settings,can_edit:t.is_instance_admin,custom_label:t.$t("instance_admins_and_admins"),admin_label:t.$t("admin"),admin_instructions:t.$t("instance_admin_instructions"),contrib_instructions:t.$t("instance_contrib_instructions")}}),e("div",{staticClass:"u-spacingBottom"}),e("ToggleField",{attrs:{label:t.$t("require_signup_to_contribute"),field_name:"require_signup_to_contribute",content:t.settings.require_signup_to_contribute===!0,path:t.settings.$path,can_edit:t.is_instance_admin}}),e("div",{staticClass:"u-spacingBottom"}),e("ToggleField",{attrs:{label:t.$t("require_mail_to_signup"),field_name:"require_mail_to_signup",content:t.settings.require_mail_to_signup===!0,path:t.settings.$path,can_edit:t.is_instance_admin}}),e("div",{staticClass:"u-spacingBottom"}),e("TitleField",{attrs:{field_name:"general_password",label:t.$t("general_password"),instructions:t.$t("general_password_instructions"),content:t.settings.general_password,path:t.settings.$path,input_type:"password",required:!1,can_edit:t.is_instance_admin}}),e("div",{staticClass:"u-spacingBottom"}),e("TitleField",{attrs:{field_name:"signup_password",label:t.$t("signup_password"),instructions:t.$t("signup_password_instructions"),content:t.settings.signup_password,path:t.settings.$path,required:!1,can_edit:t.is_instance_admin}}),e("div",{staticClass:"u-spacingBottom"}),e("ToggleField",{attrs:{label:t.$t("enable_indexing"),field_name:"enable_indexing",content:t.settings.enable_indexing===!0,path:t.settings.$path,can_edit:t.is_instance_admin}}),e("div",{staticClass:"u-spacingBottom"}),e("div",{staticClass:"_setMaxFileSize"},[e("TitleField",{attrs:{field_name:"upload_max_file_size_in_mo",label:t.$t("upload_max_file_size_in_mo"),instructions:t.$t("umo_instructions"),content:t.settings.upload_max_file_size_in_mo,path:t.settings.$path,input_type:"number",required:!1,can_edit:t.is_instance_admin}})],1),e("div",{staticClass:"u-spacingBottom"}),e("ToggleField",{attrs:{label:t.$t("remove_permanently"),field_name:"remove_permanently",content:t.settings.remove_permanently===!0,path:t.settings.$path,options:{true:t.$t("remove_permanently_true"),false:t.$t("remove_permanently_false")},can_edit:t.is_instance_admin}}),e("div",{staticClass:"u-spacingBottom"}),e("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("restart_to_apply"))+" ")])],1):t.current_tab==="fonts"?e("FontsPanel"):t.current_tab==="events"?e("div",[e("DLabel",{attrs:{str:t.$t("events")}}),e("ToggleField",{attrs:{label:t.$t("enable_events"),field_name:"enable_events",content:t.settings.enable_events===!0,path:t.settings.$path,can_edit:t.is_instance_admin}})],1):t.current_tab==="terms"?e("TermsPanel",{attrs:{settings:t.settings},on:{close:function(s){return t.$emit("close")}}}):t.current_tab==="pages"?e("PagesPanel",{attrs:{settings:t.settings},on:{close:function(s){return t.$emit("close")}}}):t.current_tab==="suggested_cat_kw"?e("SuggestedCategories"):t.current_tab==="storage"?e("PickNativePath",{attrs:{can_edit:t.is_instance_admin&&t.$root.app_infos.is_electron}}):t._e()],1)],1)])])])},W=[],E=a(K,V,W,!1,null,"936b374b");const Q=E.exports;export{Q as default};
