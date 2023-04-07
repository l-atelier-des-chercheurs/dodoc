(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[32],{1064:function(t,e,a){"use strict";a.d(e,{Z:function(){return ot}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_projectInfos",class:{"is--list":"list"===t.context,"is--tiny":"tiny"===t.context,"u-card":"list"===t.context,"is--linkToProject":"full"!==t.context,"is--mobileView":t.$root.is_mobile_view}},[a("div",{staticClass:"_projectInfos--cover"},[a("CoverField",{staticClass:"_coverPicker",attrs:{context:t.context,cover:t.project.$cover,path:t.project.$path,can_edit:t.can_edit_project}})],1),a("div",{staticClass:"_projectInfos--infos"},["invisible"===t.project.$status?a("sl-badge",{attrs:{variant:"neutral"}},[t._v(" "+t._s(t.$t("invisible"))+" ")]):t._e(),"tiny"!==t.context&&"list"!==t.context?a("AuthorField",{attrs:{label:"full"===t.context?t.$t("contributors"):"",authors_paths:t.project.$authors,path:t.project.$path,can_edit:t.can_edit_project,instructions:t.$t("project_author_instructions")}}):t._e(),a("TitleField",{staticClass:"_title",attrs:{field_name:"title",label:"full"===t.context?t.$t("title"):"",content:t.project.title,path:t.project.$path,required:!0,maxlength:40,tag:"full"===t.context?"h1":"h3",can_edit:t.can_edit_project,instructions:t.$t("project_title_instructions")}}),"list"===t.context?[t.project.description?a("button",{staticClass:"u-buttonLink _showDescription",attrs:{type:"button"},domProps:{innerHTML:t._s(t.show_description?t.$t("hide_description"):t.$t("show_description"))},on:{click:function(e){t.show_description=!t.show_description}}}):a("small",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("no_description"))+" ")])]:t._e(),"tiny"!==t.context&&t.show_description?a("TitleField",{staticClass:"_description",attrs:{field_name:"description",label:"full"===t.context&&(t.project.description||t.can_edit_project)?t.$t("description"):"",content:t.project.description,path:t.project.$path,maxlength:1280,can_edit:t.can_edit_project,instructions:t.$t("project_desc_instructions")}}):t._e()],2),a("transition",{attrs:{name:"fade"}},[(t.context,t._e())]),"full"===t.context?a("div",{staticClass:"_projectInfos--meta",class:{"is--hidden":!t.show_meta}},[a("CardCompetences",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardMachines",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardKeywords",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardFiles",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardLicense",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardMeta",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardStatus",{attrs:{project:t.project,can_edit:t.can_edit_project}})],1):t._e(),"list"===t.context||"tiny"===t.context?a("div",{staticClass:"_projectInfos--open"},[a("router-link",{attrs:{to:{path:t.createURLFromPath(t.project.$path)}}},[a("div",{staticClass:"_clickZone"})])],1):t._e()],1)},o=[],i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("informations"),icon:"info-square"}},[a("DateField",{attrs:{title:t.$t("date_created"),date:t.project.$date_created}}),a("br"),a("DateField",{attrs:{title:t.$t("date_modified"),date:t.project.$date_modified}}),a("br"),a("div",{},[t.can_edit?a("RemoveMenu",{attrs:{remove_text:t.$t("remove_project")},on:{remove:t.removeProject}}):t._e()],1)],1)},n=[],r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("details",{staticClass:"_projectCard"},[a("summary",[a("div",{staticClass:"_icon"},[t.icon?a("sl-icon",{attrs:{name:t.icon}}):t._e()],1),t._v(" "+t._s(t.header)+" ")]),a("div",{staticClass:"_content"},[t._t("default")],2)])},c=[],l={props:{header:String,icon:String},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},d=l,p=(a(9179),a(1001)),_=(0,p.Z)(d,r,c,!1,null,"8e3a6f50",null),u=_.exports,h={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{edit_mode:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{enableEditMode(){this.edit_mode=!0},async removeProject(){this.fetch_status="pending",this.fetch_error=null;try{const t=await this.$api.deleteItem({path:this.project.$path});this.response=t.data,this.fetch_status="success"}catch(t){this.fetch_status="error",this.fetch_error=t.response.data}}}},f=h,m=(0,p.Z)(f,i,n,!1,null,"4992e298",null),v=m.exports,b=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("keywords"),icon:"tag"}},[a("div",{},[a("TagsField",{attrs:{field_name:"keywords",content:t.project.keywords,path:t.project.$path,can_edit:t.can_edit}})],1)])},g=[],w={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},j=w,x=(0,p.Z)(j,b,g,!1,null,"d26c444a",null),y=x.exports,$=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("levels_and_competences"),icon:"bookmark-star"}},[a("div",{},[a("SelectField",{attrs:{field_name:"level",content:t.project.level,path:t.project.$path,can_edit:t.can_edit,grouped_options:t.competences}})],1)])},C=[],k=JSON.parse('[{"label":"Cycle 1","options":["Mobiliser le langage dans toutes ses dimensions","Agir, s’exprimer, comprendre à travers l’activité physique Agir, s\'exprimer, comprendre à travers les activités artistiques","Acquérir les premiers outils mathématiques","Explorer le monde","Se repérer dans le temps et l\'espace","Explorer le monde du vivant, des objets et de la matière","Utiliser des outils numériques","Apprendre ensemble et vivre ensemble","Domaines complémentaires : Langue vivante 1","Domaines complémentaires : Langue vivante 2","Domaines complémentaires : Education à la sécurité routière","Domaines complémentaires : Formation aux premiers secours","Compétences transversales"]},{"label":"Cycle 2 et 3","options":["Français : Comprendre et s’exprimer à l’oral","Français : Lire","Français : Écrire","Français : Comprendre le fonctionnement de la langue","Mathématiques : Modéliser","Mathématiques : Représenter","Mathématiques : Raisonner","Mathématiques : Calculer","Mathématiques : Communiquer","Nombres et calculs","Grandeurs et mesures","Espace et géométrie","Education physique et sportive","Art plastique","Éducation musicale","Histoire des arts","Questionner le monde","Vivant, matières, objets","Espace , temps","Enseignement moral et civique","Langue vivante","Technique d l’information et de la communication","Éducation à la sécurité routière","Éducation aux premiers secours","Compétences transversales"]}]'),P={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{competences:k}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},F=P,I=(0,p.Z)(F,$,C,!1,null,"29554f3c",null),M=I.exports,S=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("machines_and_materials"),icon:"tools"}},[a("div",{},[a("TagsField",{attrs:{field_name:"materials",content:t.project.materials,path:t.project.$path,can_edit:t.can_edit}})],1)])},L=[],D={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},q=D,Z=(0,p.Z)(q,S,L,!1,null,"68fd6dab",null),T=Z.exports,E=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("visibility"),icon:"globe"}},[a("div",[t._v(" "+t._s(t.$t("visibility_text"))+" ")]),a("br"),a("div",{},[a("DLabel",{attrs:{str:t.$t("status")}}),a("SelectField",{attrs:{field_name:"$status",content:t.project.$status,path:t.project.$path,can_edit:t.can_edit,options:t.status_options}})],1)])},O=[],A={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{status_options:[{key:"draft",text:this.$t("draft"),instruction:this.$t("draft_status_explanations")},{key:"finished",text:this.$t("finished"),instruction:this.$t("finished_status_explanations")},{key:"invisible",text:this.$t("invisible"),instruction:this.$t("invisible_status_explanations_projects")}],visible_value:this.project.status}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},B=A,z=(0,p.Z)(B,E,O,!1,null,"6b8a5057",null),N=z.exports,R=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("license_and_authors"),icon:"people"}},[a("DLabel",{attrs:{str:t.$t("license"),instructions:t.can_edit?t.$t("licence_instructions"):""}}),a("div",{},[a("RadioField",{attrs:{field_name:"license",content:t.project.license,path:t.project.$path,can_edit:t.can_edit,options:t.license_options}})],1),a("br"),a("div",{},[a("TitleField",{attrs:{label:t.$t("authors"),field_name:"authors_list",content:t.project.authors_list,path:t.project.$path,can_edit:t.can_edit}})],1)],1)},V=[],U={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{license_options:[{key:"creativecommons_by_nc_sa",text:"creativecommons_by_nc_sa_explanations"},{key:"all_rights_reserved",text:"all_rights_reserved_explanations"},{key:"copyleft",text:"copyleft_explanations"},{key:"custom_license",text:"custom_license_explanations"}]}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},H=U,J=(0,p.Z)(H,R,V,!1,null,"9041b734",null),K=J.exports,Y=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("files"),icon:"file-earmark-arrow-down"}},[a("div",{staticClass:"_fileList"},[t._l(t.files,(function(e,s){return a("div",{key:s,staticClass:"_file"},[e&&e.$path?a("div",{staticClass:"u-sameRow"},[a("DownloadFile",{staticClass:"_link",attrs:{file:e}},[a("sl-icon",{attrs:{name:"file-earmark-arrow-down"}}),t._v(" "+t._s(e.$media_filename)+" ")],1)],1):t._e(),t.can_edit?a("sl-icon-button",{attrs:{name:"x",size:"small"},on:{click:function(e){return e.preventDefault(),t.removeFile(s)}}}):t._e()],1)})),a("div",{},[t.can_edit?a("button",{staticClass:"u-button u-button_small u-button_bleuvert _addFile",attrs:{type:"button"},on:{click:function(e){t.show_picker=!t.show_picker}}},[t._v(" "+t._s(t.$t("add"))+" ")]):t._e(),t.show_picker?a("PickMediaFromProjects",{attrs:{path:t.project.$path},on:{selectMedia:t.selectMedia,close:function(e){t.show_picker=!1}}}):t._e()],1)],2)])},G=[],Q=(a(7658),{props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{show_picker:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{files(){return this.project.downloadable_files?this.project.downloadable_files.map((t=>this.getMediaInFolder({folder_path:this.project.$path,meta_filename:t}))):[]}},methods:{async selectMedia({path_to_source_media:t}){const e=this.getFilename(t),a=this.project.downloadable_files.slice()||[];a.push(e),this.updateFiles(a)},async removeFile(t){const e=this.project.downloadable_files.slice().splice(t+1,1);this.updateFiles(e)},async updateFiles(t){await this.$api.updateMeta({path:this.project.$path,new_meta:{downloadable_files:t}})}}}),W=Q,X=(a(1453),(0,p.Z)(W,Y,G,!1,null,"5279c0e8",null)),tt=X.exports,et={props:{project:Object,context:String,can_edit_project:Boolean},components:{CardMeta:v,CardKeywords:y,CardCompetences:M,CardMachines:T,CardStatus:N,CardLicense:K,CardFiles:tt},data(){return{new_title:this.project.title,fetch_status:null,fetch_error:null,response:null,show_meta:!0,show_description:!0}},created(){"list"===this.context&&(this.show_description=!1)},mounted(){},beforeDestroy(){},watch:{"$root.is_mobile_view"(){this.$root.is_mobile_view&&(this.show_meta=!0)}},computed:{},methods:{}},at=et,st=(a(8037),(0,p.Z)(at,s,o,!1,null,"52578dc3",null)),ot=st.exports},7296:function(t,e,a){"use strict";a.d(e,{Z:function(){return d}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("transition-group",{staticClass:"_projectsList",attrs:{tag:"section",name:"StoryModules",appear:""}},[0===t.projects.length?a("div",{key:"noprojects",staticClass:"u-instructions _projectsNotice"},[t._v(" "+t._s(t.$t("no_projects"))+" ")]):t._l(t.projects,(function(t){return a("ProjectPresentation",{key:t.$path,staticClass:"_project",attrs:{project:t,context:"list"}})}))],2)},o=[],i=a(1064),n={props:{projects:Array},components:{ProjectPresentation:i.Z},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},r=n,c=(a(8826),a(1001)),l=(0,c.Z)(r,s,o,!1,null,"3ed05fc4",null),d=l.exports},3355:function(t,e,a){"use strict";a.d(e,{Z:function(){return l}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_spacePresentation"},[a("div",{staticClass:"_coverField"},[a("CoverField",{attrs:{context:t.context,cover:t.space.$cover,path:t.space.$path,can_edit:t.can_edit}})],1),a("div",{staticClass:"_title"},[a("TitleField",{attrs:{field_name:"title",tag:"h1",label:t.can_edit?t.$t("title"):void 0,content:t.space.title,path:t.space.$path,maxlength:280,can_edit:t.can_edit}}),t.can_edit||t.space.subtitle?a("TitleField",{staticClass:"_subtitle",attrs:{field_name:"subtitle",label:t.can_edit?t.$t("subtitle"):void 0,content:t.space.subtitle,path:t.space.$path,maxlength:280,can_edit:t.can_edit}}):t._e(),a("br")],1),t.can_edit||t.space.description?a("TitleField",{staticClass:"_description",attrs:{field_name:"description",label:t.can_edit?t.$t("description"):void 0,content:t.space.description,path:t.space.$path,maxlength:480,can_edit:t.can_edit}}):t._e(),"list"===t.context||"tiny"===t.context?a("div",{staticClass:"_openSpace"},[a("router-link",{attrs:{to:{path:t.createURLFromPath(t.space.$path)}}},[a("div",{staticClass:"_clickZone"})])],1):t._e()],1)},o=[],i={props:{space:Object,context:String,can_edit:Boolean},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},n=i,r=(a(3969),a(1001)),c=(0,r.Z)(n,s,o,!1,null,"520d90df",null),l=c.exports},7346:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return Z}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_homeView"},[a("div",{staticClass:"_homeView--content"},[t.show_settings_modal?a("AdminSettings",{on:{close:function(e){t.show_settings_modal=!1}}}):t._e(),a("img",{staticClass:"_logo",attrs:{src:t.$root.publicPath+"logo-je-fabrique.svg"}}),a("h1",{domProps:{innerHTML:t._s(t.name||t.$t("welcome_to_dodoc"))}}),a("p",{domProps:{innerHTML:t._s(t.description||t.$t("admins_edit_text_here"))}}),t.$root.app_infos.contactmail_of_instance?a("p",[t._v(" "+t._s(t.$t("contactmail_of_instance"))+" "),a("a",{attrs:{href:"mailto:"+t.$root.app_infos.contactmail_of_instance,target:"_blank"}},[t._v(" "+t._s(t.$root.app_infos.contactmail_of_instance)+" ")])]):t._e(),a("img",{staticClass:"_bandeau",attrs:{src:t.$root.publicPath+"bandeau-logos-jefabrique.png"}})],1),a("div",{staticClass:"_bottomCont"},[a("RadioSwitch",{attrs:{content:t.current_mode,options:[{label:t.$t("spaces"),value:"spaces"},{label:t.$t("all_projects"),value:"projects"}]},on:{"update:content":function(e){t.current_mode=e}}}),a("br"),"spaces"===t.current_mode?[a("div",{staticClass:"u-instructions _content"},[a("small",{domProps:{innerHTML:t._s(t.$t("spaces_instr"))}})]),a("SpacesList")]:"projects"===t.current_mode?[a("div",{staticClass:"u-instructions _content"},[a("small",{domProps:{innerHTML:t._s(t.$t("all_projects_instr"))}})]),a("AllProjects")]:t._e()],2),a("div",{},[a("small",{staticClass:"_versionNumber"},[t.is_admin?a("button",{staticClass:"u-button u-button_bleuvert",attrs:{type:"button"},on:{click:function(e){t.show_settings_modal=!t.show_settings_modal}}},[a("sl-icon",{attrs:{name:"gear-fill"}}),t._v("  "+t._s(t.$t("settings"))+" ")],1):t._e(),t.is_admin?[t._v(" – ")]:t._e(),t._v(" version "+t._s(t.$root.app_infos.version)+" ")],2)])])},o=[],i=(a(4916),a(5306),function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.$t("settings")},on:{close:function(e){return t.$emit("close")}}},[a("div",{},[a("sl-tab-group",[a("sl-tab",{attrs:{slot:"nav",panel:"informations"},slot:"nav"},[t._v(" "+t._s(t.$t("informations"))+" ")]),a("sl-tab",{attrs:{slot:"nav",panel:"access_control"},slot:"nav"},[t._v(" "+t._s(t.$t("access_control"))+" ")]),a("sl-tab",{attrs:{slot:"nav",panel:"storage"},slot:"nav"},[t._v(" "+t._s(t.$t("storage"))+" ")]),a("sl-tab-panel",{attrs:{name:"informations"}},[a("TitleField",{attrs:{field_name:"name_of_instance",label:t.$t("name_of_instance"),instructions:t.$t("name_of_instance_instructions"),content:t.settings.name_of_instance,path:"_admin",tag:"h1",required:!0,minlength:3,maxlength:40,can_edit:t.is_admin}}),a("br"),a("TitleField",{attrs:{field_name:"presentation_of_instance",label:t.$t("presentation_of_instance"),instructions:t.$t("presentation_of_instance_instructions"),content:t.settings.presentation_of_instance,path:"_admin",required:!1,can_edit:t.is_admin}}),a("br"),a("TitleField",{attrs:{field_name:"contactmail_of_instance",label:t.$t("contactmail_of_instance"),instructions:t.$t("contactmail_of_instance_instructions"),content:t.settings.contactmail_of_instance,path:"_admin",required:!1,input_type:"email",can_edit:t.is_admin}}),a("br"),a("DLabel",{attrs:{str:t.$t("logo")}}),a("div",{staticClass:"u-wips"}),a("br"),a("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("restart_to_apply"))+" ")])],1),a("sl-tab-panel",{attrs:{name:"access_control"}},[a("TitleField",{attrs:{field_name:"general_password",label:t.$t("general_password"),instructions:t.$t("general_password_instructions"),content:t.settings.general_password,path:"_admin",input_type:"password",required:!1,can_edit:t.is_admin}}),a("br"),a("TitleField",{attrs:{field_name:"signup_password",label:t.$t("signup_password"),instructions:t.$t("signup_password_instructions"),content:t.settings.signup_password,path:"_admin",required:!1,can_edit:t.is_admin}}),a("br"),a("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("restart_to_apply"))+" ")])],1),a("sl-tab-panel",{attrs:{name:"storage"}},[a("PickNativePath",{attrs:{field_name:"pathToUserContent",label:t.$t("path_to_content"),instructions:t.$t("path_to_content_instructions"),content:t.settings.pathToUserContent,path:"_admin",required:!0,can_edit:t.is_admin&&t.$root.is_electron}}),a("br"),a("div",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("restart_to_apply"))+" ")])],1)],1)],1)])}),n=[],r={props:{},components:{},data(){return{path_to_content:void 0,new_path_to_content:void 0,settings:{}}},created(){},async mounted(){this.settings=await this.$api.getSettings(),this.$api.join({room:"_admin"})},beforeDestroy(){this.$api.leave({room:"_admin"})},watch:{},computed:{},methods:{restartDodoc(){this.$api.restartDodoc()},saveNewPathToContent(){}}},c=r,l=a(1001),d=(0,l.Z)(c,i,n,!1,null,"25fccfa7",null),p=d.exports,_=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_spacesList"},[a("div",{},[t.connected_as?a("button",{staticClass:"u-button u-button_red u-button_small",attrs:{type:"button"},on:{click:function(e){t.show_create_modal=!0}}},[a("svg",{staticStyle:{"enable-background":"new 0 0 168 168"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 168 168","xml:space":"preserve"}},[a("path",{staticStyle:{fill:"#fc4b60"},attrs:{d:"M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7\n\t\tC110.5-8.2,57.5-8.2,24.6,24.4z"}}),a("polygon",{staticStyle:{fill:"#ffffff"},attrs:{points:"132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 \n\t\t73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 \t\t"}})]),t._v(" "+t._s(t.$t("create"))+" ")]):t._e()]),t.show_create_modal?a("CreateSpace",{on:{close:function(e){t.show_create_modal=!1},openNewSpace:t.openNewSpace}}):t._e(),a("div",{staticClass:"_list"},t._l(t.spaces,(function(t){return a("SpacePresentation",{key:t.$path,attrs:{space:t,context:"list",can_edit:!1}})})),1)],1)},u=[],h=(a(2262),a(4506),a(7658),a(3355)),f=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.$t("create_a_space")},on:{close:function(e){return t.$emit("close")}}},[a("form",{staticClass:"input-validation-required",on:{submit:function(e){return e.preventDefault(),t.createSpace.apply(null,arguments)}}},[a("DLabel",{attrs:{str:t.$t("title")}}),a("TextInput",{attrs:{content:t.new_space_title,maxlength:40,required:!0},on:{"update:content":function(e){t.new_space_title=e},toggleValidity:function(e){return t.allow_save=e}}}),a("br"),a("div",{},[a("ToggleInput",{attrs:{content:t.new_space_is_invisible,label:t.$t("invisible"),options:{true:t.$t("invisible_status_explanations_spaces"),false:t.$t("visible_status_explanations_spaces")}},on:{"update:content":function(e){t.new_space_is_invisible=e}}})],1),a("br"),a("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",type:"submit",loading:t.is_creating_space},slot:"footer"},[t._v(" "+t._s(t.$t("create_and_open"))+" ")]),t.error_msg?[a("br"),a("br"),a("div",{staticClass:"u-errorMsg",domProps:{textContent:t._s(t.error_msg)}})]:t._e()],2)])},m=[],v={props:{},components:{},data(){return{new_space_title:"",new_space_is_invisible:!1,is_creating_space:!1,allow_save:!1,error_msg:""}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async createSpace(){this.is_creating_space=!0;try{const t=await this.$api.createFolder({path:this.createPath(),additional_meta:{title:this.new_space_title,requested_slug:this.new_space_title,status:"draft",license:"CC",$status:!0===this.new_space_is_invisible?"invisible":"draft",$authors:[this.$api.tokenpath.token_path]}});setTimeout((()=>{this.$emit("openNewSpace",t)}),50)}catch(t){this.error_msg="Error: "+t.message,setTimeout((()=>{this.error_msg=""}),5e3),this.is_creating_space=!1}}}},b=v,g=(0,l.Z)(b,f,m,!1,null,"2152a7fd",null),w=g.exports,j={props:{},components:{SpacePresentation:h.Z,CreateSpace:w},data(){return{spaces:void 0,new_space_title:"",path:"spaces",fetch_spaces_error:void 0,show_create_modal:!1}},created(){},async mounted(){this.spaces=await this.$api.getFolders({path:this.path}).catch((t=>{this.fetch_spaces_error=t.response})),this.$api.join({room:this.path})},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{},methods:{getSlug(t){return t.split("/").at(-1)},async createSpace(){try{await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_space_title,requested_slug:this.new_space_title,$authors:[this.$api.tokenpath.token_path]}})}catch(t){}},openNewSpace(t){this.show_create_modal=!1;const e=this.createURLFromPath(this.path+"/"+t);this.$router.push(e)}}},x=j,y=(a(7849),(0,l.Z)(x,_,u,!1,null,"12fabfe8",null)),$=y.exports,C=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_allProjects"},[a("transition",{attrs:{name:"fade_fast",duration:150,mode:"out-in"}},[t.is_loading?a("LoaderSpinner"):a("div",[a("div",{staticClass:"_cont"},[a("div",{staticClass:"_sidebar"},[a("div",{staticClass:"u-sameRow",staticStyle:{width:"100%"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.search_project,expression:"search_project"}],attrs:{type:"text",placeholder:t.$t("search_by_title")},domProps:{value:t.search_project},on:{input:function(e){e.target.composing||(t.search_project=e.target.value)}}}),t.search_project.length>0?a("button",{staticClass:"u-button u-button_bleumarine",staticStyle:{flex:"0 0 auto"},attrs:{type:"button"},on:{click:function(e){t.search_project=""}}},[a("sl-icon",{attrs:{name:"x-lg"}})],1):t._e()]),a("br"),a("DLabel",{attrs:{str:t.$t("keywords")}}),t._l(t.all_keywords,(function(e){return a("button",{key:e,staticClass:"u-button u-button_orange u-button_small",attrs:{type:"button"},on:{click:function(a){return t.toggleFilter({type:"keywords",value:e})}}},[t._v(" "+t._s(e)+" ")])})),a("br"),a("DLabel",{attrs:{str:t.$t("machines_and_materials")}}),t._l(t.all_materials,(function(e){return a("button",{key:e,staticClass:"u-button u-button_bleumarine u-button_small",attrs:{type:"button"},on:{click:function(a){return t.toggleFilter({type:"materials",value:e})}}},[t._v(" "+t._s(e)+" ")])})),a("br"),a("DLabel",{attrs:{str:t.$t("levels_and_competences")}}),t._l(t.all_levels,(function(e){return a("button",{key:e,staticClass:"u-button u-button_bleuvert u-button_small",attrs:{type:"button"},on:{click:function(a){return t.toggleFilter({type:"level",value:e})}}},[t._v(" "+t._s(e)+" ")])}))],2),a("div",{staticClass:"_listOfProjects"},[t.active_filters.length>0?a("div",{staticClass:"_tagList"},t._l(t.active_filters,(function(e){return a("button",{key:Object.keys(e)[0],staticClass:"u-button u-button_small",class:t.btnClassForMedia(Object.keys(e)[0]),attrs:{type:"button"},on:{click:function(a){t.toggleFilter({type:Object.keys(e)[0],value:Object.values(e)[0]})}}},[t._v(" "+t._s(Object.values(e)[0])+" "),a("sl-icon",{attrs:{name:"x"}})],1)})),0):t._e(),a("ProjectsList",{attrs:{projects:t.filtered_projects}})],1)])])],1)],1)},k=[],P=(a(6699),a(7296)),F={props:{},components:{ProjectsList:P.Z},data(){return{all_projects:[],is_loading:!0,search_project:""}},created(){},async mounted(){await this.loadAllProjects(),this.is_loading=!1},beforeDestroy(){},watch:{},computed:{all_keywords(){return this.extractArr(this.all_projects,"keywords")},all_materials(){return this.extractArr(this.all_projects,"materials")},all_levels(){return this.extractArr(this.all_projects,"level")},active_filters(){return this.$route.query?Object.entries(this.$route.query).map((([t,e])=>({[t]:decodeURI(e)}))):[]},sorted_projects(){return(this.all_projects.clone().sort(((t,e)=>+new Date(e.$date_created)-+new Date(t.$date_created)))||[]).reverse()},filtered_projects(){return this.all_projects.filter((t=>{if(0===this.active_filters.length&&0===this.search_project.length)return!0;for(const e of this.active_filters){const a=Object.keys(e).at(0),s=Object.values(e).at(0);if(!Object.prototype.hasOwnProperty.call(t,a))return!1;if(Array.isArray(t[a])&&!t[a].includes(s))return!1;if("string"===typeof t[a]&&t[a]!==s)return!1}return!this.search_project||t.title.toLowerCase().includes(this.search_project.toLowerCase())}))}},methods:{async loadAllProjects(){const t=await this.$api.getFolders({path:"spaces"}).catch((t=>{this.fetch_spaces_error=t.response}));if(0!==t.length)for(const e of t){const t=await this.$api.getFolders({path:e.$path+"/projects"});t.length>0&&(this.all_projects=this.all_projects.concat(t))}},btnClassForMedia(t){return"keywords"===t?"u-button_orange":"materials"===t?"u-button_bleumarine":"level"===t?"u-button_bleuvert":void 0},toggleFilter({type:t,value:e}){let a={};this.$route.query&&(a=JSON.parse(JSON.stringify(this.$route.query))),e&&a[t]!==encodeURI(e)?a[t]=encodeURI(e):delete a[t],this.$router.push({query:a})}}},I=F,M=(a(1795),(0,l.Z)(I,C,k,!1,null,"29174e4e",null)),S=M.exports,L={props:{},components:{AdminSettings:p,SpacesList:$,AllProjects:S},data(){return{show_settings_modal:!1,current_mode:"spaces"}},computed:{name(){return this.$root.app_infos.name_of_instance},description(){return this.$root.app_infos.presentation_of_instance.replace(/(?:\r\n|\r|\n)/g,"<br />")}},methods:{}},D=L,q=(a(8365),(0,l.Z)(D,s,o,!1,null,"0e0c4946",null)),Z=q.exports},4027:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,'._projectCard[data-v-8e3a6f50]{border-bottom:1px solid var(--c-gris_clair);border-left:2px solid transparent}._projectCard[open][data-v-8e3a6f50]{border-left-color:var(--c-gris_fonce);margin-bottom:1px}._projectCard[data-v-8e3a6f50] ::marker{display:none;content:""}._projectCard summary[data-v-8e3a6f50]{display:flex;flex-flow:row nowrap;align-items:center;font-size:var(--sl-font-size-medium);padding:calc(var(--spacing)/2);font-weight:600;gap:calc(var(--spacing)/2);cursor:pointer}._projectCard summary[data-v-8e3a6f50]:focus,._projectCard summary[data-v-8e3a6f50]:hover{background-color:var(--c-gris_clair)}._projectCard[open] summary[data-v-8e3a6f50]{background-color:var(--c-gris)}._projectCard ._content[data-v-8e3a6f50]{padding:calc(var(--spacing)/2)}._icon[data-v-8e3a6f50]{font-size:144%;background-color:var(--c-gris);border-radius:4px;padding:calc(var(--spacing)/1);line-height:0;width:50px;height:50px;transition:all .25s cubic-bezier(.19,1,.22,1)}._projectCard[open] ._icon[data-v-8e3a6f50]{background-color:var(--c-gris_fonce)}',""]),e["default"]=r},785:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,"._project[data-v-52578dc3],._projectInfos[data-v-52578dc3]{position:relative}._projectInfos[data-v-52578dc3]{display:flex;flex-flow:row nowrap;align-items:stretch;margin:0 auto;max-width:180ch;max-width:var(--max-column-width);overflow:hidden;background:#fff;transition:all .4s cubic-bezier(.19,1,.22,1)}._projectInfos.is--linkToProject[data-v-52578dc3]:hover{transform:translateY(-12px);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}._projectInfos.is--list[data-v-52578dc3],._projectInfos.is--tiny[data-v-52578dc3]{box-shadow:0 1px 4px rgba(0,0,0,.2);border-radius:4px}._projectInfos.is--list ._description[data-v-52578dc3],._projectInfos.is--list ._title[data-v-52578dc3],._projectInfos.is--tiny ._description[data-v-52578dc3],._projectInfos.is--tiny ._title[data-v-52578dc3]{font-size:90%}._projectInfos.is--list[data-v-52578dc3]{display:block}._projectInfos.is--mobileView[data-v-52578dc3]{flex-flow:row wrap}._projectInfos>*[data-v-52578dc3]{flex:10 1 320px;transition:all .4s cubic-bezier(.19,1,.22,1)}._projectInfos>._projectInfos--meta[data-v-52578dc3]{flex:1 0 260px}._projectInfos>._projectInfos--meta.is--hidden[data-v-52578dc3]{flex:0 0 0;opacity:0}._projectInfos.is--mobileView ._projectInfos--meta[data-v-52578dc3]{flex:0 0 100%}._projectInfos--infos[data-v-52578dc3]{display:flex;flex-flow:column nowrap;place-content:center;gap:calc(var(--spacing)/1);padding:calc(var(--spacing)/1);transition:all .4s}.is--list ._projectInfos--infos[data-v-52578dc3],.is--tiny ._projectInfos--infos[data-v-52578dc3]{gap:calc(var(--spacing)/4);order:0;padding-top:calc(var(--spacing)/2);pointer-events:none}.is--list ._projectInfos--infos ._showDescription[data-v-52578dc3],.is--tiny ._projectInfos--infos ._showDescription[data-v-52578dc3]{pointer-events:auto}._projectInfos--infos>*[data-v-52578dc3]{max-width:56ch}._imageSelect[data-v-52578dc3]{background:#fff;position:relative}._projectInfos--cover[data-v-52578dc3]{position:relative;aspect-ratio:1/1;width:45vh;height:45vh;flex:0 0 45vh}@supports not (aspect-ratio:1/1){._projectInfos--cover[data-v-52578dc3]{width:500px;height:500px}}.is--list ._projectInfos--cover[data-v-52578dc3]{padding:2px;width:100%;height:auto}.is--mobileView ._projectInfos--cover[data-v-52578dc3]{flex:1 1 auto;max-height:40vh;max-width:40vh;height:auto}._projectInfos--meta[data-v-52578dc3]{display:flex;flex-flow:column nowrap;font-size:90%;overflow-x:hidden;overflow-y:auto;height:45vh}._projectInfos--meta[data-v-52578dc3]::-webkit-scrollbar{height:18px;width:18px;background-color:transparent}._projectInfos--meta[data-v-52578dc3]::-webkit-scrollbar-thumb,._projectInfos--meta[data-v-52578dc3]::-webkit-scrollbar-track{border:6px solid hsla(0,0%,100%,0);border-radius:24px;background-clip:padding-box;-webkit-transition:all .4s;transition:all .4s}._projectInfos--meta[data-v-52578dc3]::-webkit-scrollbar-track{background-color:transparent}._projectInfos--meta[data-v-52578dc3]::-webkit-scrollbar-thumb{background-color:var(--c-noir)}._projectInfos--meta[data-v-52578dc3]::-webkit-scrollbar-thumb:hover{background-color:var(--c-gris);border:6px solid hsla(0,0%,100%,0)}.is--mobileView ._projectInfos--meta[data-v-52578dc3]{flex-flow:row nowrap;max-height:none;overflow-x:auto;overflow-y:hidden;height:auto}._projectInfos--meta>*[data-v-52578dc3]{flex:0 0 auto;min-width:220px}.is--mobileView ._projectInfos--meta>*[data-v-52578dc3]{flex:1 0 220px}._projectInfos--open[data-v-52578dc3]{display:flex;justify-content:center}._projectInfos--open ._clickZone[data-v-52578dc3]{position:absolute;top:0;left:0;width:100%;height:100%}._projectInfos--open ._openBtn[data-v-52578dc3]{text-decoration:underline;position:relative;margin:calc(var(--spacing)/2);transition:all .25s cubic-bezier(.19,1,.22,1)}._projectInfos--open ._openBtn[data-v-52578dc3]:focus,._projectInfos--open ._openBtn[data-v-52578dc3]:hover{transform:translateY(-4px) rotate(-2deg);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}._coverPicker[data-v-52578dc3]{margin:calc(var(--spacing)*1);margin:2px;border-radius:3px}._showMeta[data-v-52578dc3]{position:absolute;top:0;right:0;z-index:100;background:#fff;margin:calc(var(--spacing)/4)}._showDescription[data-v-52578dc3]{position:relative;z-index:100;padding:0;text-align:left}",""]),e["default"]=r},4170:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,"._projectsNotice[data-v-3ed05fc4]{width:100%;text-align:center}._projectsList[data-v-3ed05fc4]{display:grid;grid-auto-rows:max-content;grid-gap:calc(var(--spacing)/1);align-items:stretch;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}._projectsList>*[data-v-3ed05fc4]{margin:0}._project[data-v-3ed05fc4]{box-shadow:0 1px 4px rgba(0,0,0,.1);cursor:pointer}._project[data-v-3ed05fc4]  ._projectInfos{min-height:100%}",""]),e["default"]=r},1971:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,'._allProjects[data-v-29174e4e]{width:100%;max-width:calc(var(--max-column-width));margin:calc(var(--spacing)*1) auto;padding:calc(var(--spacing)*1)}._cont[data-v-29174e4e]{flex-flow:row wrap;gap:calc(var(--spacing)/1)}._cont[data-v-29174e4e],._sidebar[data-v-29174e4e]{display:flex;align-items:flex-start}._sidebar[data-v-29174e4e]{flex:0 0 240px;position:sticky;overflow:hidden;top:0;flex-flow:column nowrap;justify-content:flex-start;gap:calc(var(--spacing)/4);padding-top:calc(var(--spacing)*1)}._sidebar[data-v-29174e4e]  button{white-space:nowrap;overflow:hidden;text-overflow:" [..]"}._listOfProjects[data-v-29174e4e]{flex:1 1 auto;padding-top:calc(var(--spacing)*1)}._tagList[data-v-29174e4e]{display:flex;gap:calc(var(--spacing)/2);margin-bottom:calc(var(--spacing)*1)}',""]),e["default"]=r},1848:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,"._fileList[data-v-5279c0e8]{padding:0;margin:0}._fileList>._file[data-v-5279c0e8]{padding:0;border-radius:2px;min-height:2em;display:flex;flex-flow:row nowrap;justify-content:center;word-break:break-word;align-items:center;gap:calc(var(--spacing)/4);justify-content:space-between}._fileList>._file ._preview[data-v-5279c0e8]{width:2rem;aspect-ratio:1/1;flex:0 0 auto}._fileList>._file ._link[data-v-5279c0e8]{display:block;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-variant:none;font-weight:400;letter-spacing:0;font-size:var(--sl-font-size-small)}._addFile[data-v-5279c0e8]{margin-top:calc(var(--spacing)/2)}",""]),e["default"]=r},116:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,"._spacePresentation[data-v-520d90df]{position:relative;display:flex;flex-flow:row wrap;align-items:center;background:#fff;overflow:hidden;background:var(--panel-color);box-shadow:var(--panel-shadows);border-radius:var(--panel-radius);margin-bottom:calc(var(--spacing)/2)}._spacePresentation>*[data-v-520d90df]{flex:1 1 33%}._coverField[data-v-520d90df]{position:relative;aspect-ratio:1/1;flex:0 1 120px}._title[data-v-520d90df]{padding:calc(var(--spacing)/1);flex:8 1 33%}._subtitle[data-v-520d90df]{color:var(--c-gris_fonce);font-weight:500}._description[data-v-520d90df]{padding:calc(var(--spacing)/1);display:block;max-width:66ch}._openSpace[data-v-520d90df]{display:flex;justify-content:center}._openSpace[data-v-520d90df],._openSpace ._clickZone[data-v-520d90df]{position:absolute;top:0;left:0;width:100%;height:100%}",""]),e["default"]=r},6935:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,"._create[data-v-12fabfe8]{max-width:400px}._spacesList[data-v-12fabfe8]{width:100%;margin:0 auto;max-width:var(--max-column-width);padding:calc(var(--spacing)*1)}._list>*[data-v-12fabfe8]{margin:calc(var(--spacing)*1) 0}",""]),e["default"]=r},5397:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),i=a(3645),n=a.n(i),r=n()(o());r.push([t.id,"._bandeau[data-v-0e0c4946],._logo[data-v-0e0c4946]{width:100%;max-width:500px;margin-bottom:calc(var(--spacing)*2)}._homeView[data-v-0e0c4946]{min-height:calc(100vh - 60px);max-height:-webkit-fill-available}._homeView--content[data-v-0e0c4946]{max-width:600px;width:100%;min-height:40vh;min-height:calc(80vh - 60px);margin:0 auto;padding:calc(var(--spacing)*2);display:flex;flex-flow:column nowrap;justify-content:center}._content[data-v-0e0c4946]{max-width:86ch;margin:0 auto;width:100%;padding:0 calc(var(--spacing)*1);text-align:center}._versionNumber[data-v-0e0c4946]{display:block;margin-top:calc(var(--spacing)*4);text-align:center;padding:calc(var(--spacing)/4)}._floatinProjectBtn[data-v-0e0c4946]{position:fixed;bottom:0;left:0;width:100%;padding:10vh 20vw;pointer-events:none;display:flex;justify-content:center}._floatinProjectBtn>*[data-v-0e0c4946]{pointer-events:auto}._bottomCont[data-v-0e0c4946]{min-height:70vh}",""]),e["default"]=r},9179:function(t,e,a){var s=a(4027);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("4b3efd70",s,!0,{sourceMap:!1,shadowMode:!1})},8037:function(t,e,a){var s=a(785);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("1ad4df05",s,!0,{sourceMap:!1,shadowMode:!1})},8826:function(t,e,a){var s=a(4170);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("260353fc",s,!0,{sourceMap:!1,shadowMode:!1})},1795:function(t,e,a){var s=a(1971);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("576dd77b",s,!0,{sourceMap:!1,shadowMode:!1})},1453:function(t,e,a){var s=a(1848);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("48be0322",s,!0,{sourceMap:!1,shadowMode:!1})},3969:function(t,e,a){var s=a(116);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("01a9ebba",s,!0,{sourceMap:!1,shadowMode:!1})},7849:function(t,e,a){var s=a(6935);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("df1a6694",s,!0,{sourceMap:!1,shadowMode:!1})},8365:function(t,e,a){var s=a(5397);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("5a2af267",s,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=HomeView.js.map