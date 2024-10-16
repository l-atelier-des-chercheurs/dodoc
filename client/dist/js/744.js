(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[744],{60744:function(t,e,s){"use strict";s.r(e),s.d(e,{default:function(){return $}});var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("BaseModal2",{attrs:{title:t.$t("settings")},on:{close:function(e){return t.$emit("close")}}},[s("div",{},[t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):s("div",[s("div",[s("div",{staticClass:"_selectMenu"},[s("SelectField2",{attrs:{value:t.current_tab,options:t.tabs,can_edit:!0,hide_validation:!0},on:{change:function(e){t.current_tab=e}}})],1),s("div",{staticClass:"u-spacingBottom"}),"informations"===t.current_tab?[s("div",{staticClass:"u-spacingBottom"},[s("TitleField",{attrs:{field_name:"name_of_instance",label:t.$t("name_of_instance"),instructions:t.$t("name_of_instance_instructions"),content:t.settings.name_of_instance||"",path:t.settings.$path,tag:"h1",required:!0,minlength:3,maxlength:40,can_edit:t.is_instance_admin}})],1),s("div",{staticClass:"u-spacingBottom"},[s("CollaborativeEditor2",{attrs:{label:t.$t("presentation_of_instance")+" (en français)",field_to_edit:"presentation_of_instance_fr",instructions:t.$t("presentation_of_instance_instructions"),content:t.settings.presentation_of_instance_fr,path:t.settings.$path,custom_formats:["bold","italic","link"],is_collaborative:!1,can_edit:t.is_instance_admin}})],1),s("div",{staticClass:"u-spacingBottom"},[s("CollaborativeEditor2",{attrs:{label:t.$t("presentation_of_instance")+" (en anglais)",field_to_edit:"presentation_of_instance_en",instructions:t.$t("presentation_of_instance_instructions"),content:t.settings.presentation_of_instance_en,path:t.settings.$path,custom_formats:["bold","italic","link"],is_collaborative:!1,can_edit:t.is_instance_admin}})],1)]:t._e(),"administration_and_access_control"===t.current_tab?[s("AdminsAndContributorsField",{attrs:{folder:t.settings,can_edit:t.is_instance_admin,custom_label:t.$t("instance_admins_and_admins"),admin_label:t.$t("admin"),admin_instructions:t.$t("instance_admin_instructions"),contrib_instructions:t.$t("instance_contrib_instructions")}}),s("br"),s("TitleField",{attrs:{field_name:"general_password",label:t.$t("general_password"),instructions:t.$t("general_password_instructions"),content:t.settings.general_password,path:t.settings.$path,input_type:"password",required:!1,can_edit:t.is_instance_admin}}),s("br"),s("TitleField",{attrs:{field_name:"signup_password",label:t.$t("signup_password"),instructions:t.$t("signup_password_instructions"),content:t.settings.signup_password,path:t.settings.$path,required:!1,can_edit:t.is_instance_admin}}),s("br"),s("ToggleField",{attrs:{label:t.$t("require_mail_to_signup"),field_name:"require_mail_to_signup",content:!0===t.settings.require_mail_to_signup,path:t.settings.$path,can_edit:t.is_instance_admin}}),s("br"),s("TitleField",{attrs:{field_name:"contactmail_of_instance",label:t.$t("contactmail_of_instance"),instructions:t.$t("contactmail_of_instance_instructions"),content:t.settings.contactmail_of_instance,path:t.settings.$path,required:!1,input_type:"email",can_edit:t.is_instance_admin}})]:t._e(),"suggested_cat_kw"===t.current_tab?[s("SuggestedCategories")]:t._e()],2)])])])},i=[],n=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[t.opened_category_path?[s("SingleCategory",{attrs:{path:t.opened_category_path},on:{close:function(e){t.opened_category_path=!1}}})]:[s("div",t._l(t.categories,(function(e){return s("div",{key:e.$path,staticClass:"_categoryRow",style:t.categoryStyles(e)},[s("div",{staticClass:"_title"},[t._v(" "+t._s(e.title)+" ")]),s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},domProps:{textContent:t._s(t.$t("open"))},on:{click:function(s){return t.openCategory(e.$path)}}})])})),0),s("button",{staticClass:"u-buttonLink",class:{"is--active":t.show_create_category},attrs:{type:"button"},on:{click:function(e){t.show_create_category=!t.show_create_category}}},[t._v(" "+t._s(t.$t("add_category"))+" ")]),t.show_create_category?s("form",{staticClass:"input-validation-required",on:{submit:function(e){return e.preventDefault(),t.createCategory.apply(null,arguments)}}},[s("fieldset",[s("legend",{staticClass:"u-label"},[t._v(t._s(t.$t("add_category")))]),s("TextInput",{staticClass:"u-spacingBottom",attrs:{content:t.new_category_title,label_str:"category_name",required:!0,input_type:"text"},on:{"update:content":function(e){t.new_category_title=e}}}),t._m(0),s("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",disabled:0===t.new_category_title.length,type:"submit"},slot:"footer"},[t._v(" "+t._s(t.$t("create"))+" ")])],1)]):t._e()]],2)},o=[function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"u-instructions"},[s("small",[t._v(" Tout en majuscule ")])])}],r=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",[s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(e){return t.$emit("close")}}},[s("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("back"))+" ")],1),s("div",{staticClass:"u-spacingBottom"}),t.is_loading?s("div",{key:"loader",staticClass:"_spinner"},[s("LoaderSpinner")],1):s("div",[s("div",{staticClass:"_top"},[s("div",{staticClass:"u-spacingBottom"},[s("TitleField",{staticClass:"_title",attrs:{label:t.$t("category_title"),field_name:"title",content:t.category.title,path:t.category.$path,tag:"h3",required:!0,maxlength:20,can_edit:!0}})],1),s("ColorInput",{attrs:{label:t.$t("custom_color"),default_value:"#000000",value:t.category.tag_color,can_toggle:!0},on:{save:t.saveNewColor}})],1),s("div",{staticClass:"u-spacingBottom _kwSimulation"},[s("SingleKeyword",{attrs:{keyword:t.category.title+"/couleur",cat_color:t.category.tag_color}})],1),s("div",{staticClass:"u-spacingBottom u-keywords"},t._l(t.new_list_of_suggestions,(function(e){return s("SingleKeyword",{key:e,attrs:{keyword:e,can_remove:!0},on:{remove:function(s){return t.removeSuggestion(e)}}})})),1),s("div",{staticClass:"u-spacingBottom"},[s("input",{directives:[{name:"model",rawName:"v-model",value:t.new_suggestion,expression:"new_suggestion"}],attrs:{type:"text",placeholder:"Nouveau mot-clé"},domProps:{value:t.new_suggestion},on:{keydown:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")||e.ctrlKey||e.shiftKey||e.altKey||e.metaKey?null:(e.preventDefault(),t.newKeyword.apply(null,arguments))},input:function(e){e.target.composing||(t.new_suggestion=e.target.value)}}}),t.new_keyword_already_exists?s("div",{staticClass:"u-instructions"},[s("small",[t._v("Ce mot-clé existe déjà, vous ne pouvez pas l’ajouter. Si vous souhaitez changer la case, supprimez le de la liste puis ajoutez le à nouveau.")])]):t.new_keyword_contains_slash?s("div",{staticClass:"u-instructions"},[s("small",[t._v('Ce mot-clé contient le caractère "/", qui est interdit.')])]):t.new_suggestion.length>0?s("div",{staticClass:"u-instructions"},[s("small",[t._v("Validez avec la touche entrée.")])]):t._e()]),0===t.new_suggestion.length?s("SaveCancelButtons",{staticClass:"_scb",on:{save:t.saveNewSuggestion,cancel:t.cancel}}):t._e(),s("RemoveMenu",{attrs:{remove_text:t.$t("remove")},on:{remove:t.removeCat}})],1)])},c=[],l=(s(76801),s(70560),s(95009)),_={props:{path:String},components:{SingleKeyword:l.Z},data(){return{category:void 0,is_loading:!0,new_list_of_suggestions:[],new_suggestion:""}},created(){},async mounted(){this.category=await this.$api.getFolder({path:this.path}),this.$api.join({room:this.path}),this.new_list_of_suggestions=this.category.list_of_suggestions||[],this.is_loading=!1},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{new_keyword_already_exists(){return this.new_list_of_suggestions.some((t=>t.toLowerCase()===this.new_suggestion.toLowerCase()))},new_keyword_contains_slash(){return this.new_suggestion.includes("/")}},methods:{removeSuggestion(t){this.new_list_of_suggestions=this.new_list_of_suggestions.filter((e=>e!==t))},newKeyword(){if(0===this.new_suggestion.length||this.new_keyword_already_exists||this.new_keyword_contains_slash)return!1;this.new_list_of_suggestions.push(this.new_suggestion),this.new_suggestion=""},cancel(){this.new_list_of_suggestions=this.category.list_of_suggestions,this.new_suggestion="",this.$emit("close")},async saveNewSuggestion(){await this.$api.updateMeta({path:this.path,new_meta:{list_of_suggestions:this.new_list_of_suggestions}}),this.$emit("close")},async saveNewColor(t){await this.$api.updateMeta({path:this.path,new_meta:{tag_color:t||""}})},async removeCat(){await this.$api.deleteItem({path:this.path}),this.$emit("close")}}},d=_,u=(s(87617),s(1001)),g=(0,u.Z)(d,r,c,!1,null,"3886d9c1",null),p=g.exports,h={props:{},components:{SingleCategory:p},data(){return{categories:void 0,show_create_category:!1,opened_category_path:!1,new_category_title:"",path:"categories"}},created(){},async mounted(){this.categories=await this.$api.getFolders({path:this.path}).catch((t=>{this.fetch_categories_error=t.response})),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{async createCategory(){const t=await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_category_title.toUpperCase(),requested_slug:this.new_category_title,$status:"public"}});this.openCategory(this.path+"/"+t)},openCategory(t){this.opened_category_path=t},categoryStyles(t){return t.tag_color?`\n        --cat-color: ${t.tag_color}\n      `:""}}},m=h,f=(s(56396),(0,u.Z)(m,n,o,!1,null,"72d46d30",null)),v=f.exports,y={props:{starting_tab:String},components:{SuggestedCategories:v},data(){return{settings:void 0,is_loading:!0,current_tab:"administration_and_access_control",tabs:[{key:"informations",text:this.$t("informations")},{text:this.$t("administration_and_access_control"),key:"administration_and_access_control"},{text:this.$t("suggested_cat_kw"),key:"suggested_cat_kw"}]}},created(){},async mounted(){this.settings=await this.$api.getFolder({path:""}).catch((t=>(this.is_loading=!1,t))),this.is_loading=!1,this.starting_tab&&setTimeout((()=>{this.$refs.tabgroup.show(this.starting_tab)}),100),this.$api.join({room:this.settings.$path})},beforeDestroy(){this.$api.leave({room:this.settings.$path})},watch:{},computed:{},methods:{newTabShown(t){this.current_tab=t.detail.name}}},w=y,b=(0,u.Z)(w,a,i,!1,null,"19c9253e",null),$=b.exports},95009:function(t,e,s){"use strict";s.d(e,{Z:function(){return l}});var a=function(){var t=this,e=t.$createElement,s=t._self._c||e;return s("div",{staticClass:"_singleKeyword",class:{"is--clickable":t.can_add},style:t.kw_styles},[s("div",{},[t.category?s("div",{staticClass:"_category"},[t._v(" "+t._s(t.category.toUpperCase())+" ")]):t._e(),s("div",{staticClass:"_name"},[t._v(" "+t._s(t.name)+" ")])]),t.count?s("div",{staticClass:"_count"},[t._v(" "+t._s(t.count)+" ")]):t._e(),t.can_remove?s("b-icon",{staticClass:"_white",attrs:{icon:"dash-circle"},on:{click:function(e){return t.$emit("remove")}}}):t._e(),t.can_add?s("button",{staticClass:"_addBtn",attrs:{type:"button"},on:{click:function(e){return t.$emit("add")}}}):t._e()],1)},i=[],n=(s(76801),s(92176),s(7961),{props:{keyword:String,count:Number,cat_color:String,can_remove:Boolean,can_add:Boolean},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{category(){return!!this.keyword.includes("/")&&this.keyword.split("/").at(0)},name(){return this.keyword.includes("/")?this.keyword.split("/").at(1):this.keyword},kw_styles(){let t=!1;if(this.cat_color)t=this.cat_color;else{const e=window.app_infos.custom_suggested_categories.find((t=>t.title===this.category));t=e?.tag_color}return t?`--cat-color: ${t}`:""}},methods:{}}),o=n,r=(s(42904),s(1001)),c=(0,r.Z)(o,a,i,!1,null,"f2ad472e",null),l=c.exports},38720:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._kwSimulation[data-v-3886d9c1]{display:flex}",""]),e["default"]=r},66635:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._categoryRow[data-v-72d46d30]{display:flex;justify-content:space-between;align-content:center;padding:calc(var(--spacing)/8) 0}._title[data-v-72d46d30]{padding:calc(var(--spacing)/4) calc(var(--spacing)/2);border-radius:4px;background:var(--cat-color,#fff);color:#000}",""]),e["default"]=r},87862:function(t,e,s){"use strict";s.r(e);var a=s(8081),i=s.n(a),n=s(23645),o=s.n(n),r=o()(i());r.push([t.id,"._singleKeyword[data-v-f2ad472e]{position:relative;padding:calc(var(--spacing)/4) calc(var(--spacing)/2);border-radius:4px;line-height:1.2;display:flex;flex-flow:row nowrap;align-items:center;gap:calc(var(--spacing)/1);background-color:var(--cat-color,#fff);color:#000;transition:all .1s cubic-bezier(.19,1,.22,1)}._singleKeyword.is--clickable[data-v-f2ad472e]:hover{opacity:.7}._category[data-v-f2ad472e]{font-size:80%}._name[data-v-f2ad472e]{font-size:110%}._addBtn[data-v-f2ad472e]{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;background:transparent}._count[data-v-f2ad472e]{border:1px solid currentColor;border-radius:10px;min-width:14px;height:14px;font-size:8px;display:flex;justify-content:center;align-items:center;font-weight:600}",""]),e["default"]=r},87617:function(t,e,s){var a=s(38720);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(20730).Z;i("e5633a46",a,!0,{sourceMap:!1,shadowMode:!1})},56396:function(t,e,s){var a=s(66635);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(20730).Z;i("66058d36",a,!0,{sourceMap:!1,shadowMode:!1})},42904:function(t,e,s){var a=s(87862);a.__esModule&&(a=a.default),"string"===typeof a&&(a=[[t.id,a,""]]),a.locals&&(t.exports=a.locals);var i=s(20730).Z;i("579a27ff",a,!0,{sourceMap:!1,shadowMode:!1})}}]);