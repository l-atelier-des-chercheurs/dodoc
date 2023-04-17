(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[119],{3324:function(t,e,a){"use strict";a.d(e,{Z:function(){return st}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_projectInfos",class:{"is--list":"list"===t.context,"is--tiny":"tiny"===t.context,"u-card":"list"===t.context,"is--linkToProject":"full"!==t.context,"is--mobileView":t.$root.is_mobile_view}},[a("div",{staticClass:"_projectInfos--cover"},[a("CoverField",{staticClass:"_coverPicker",attrs:{context:t.context,cover:t.project.$cover,path:t.project.$path,can_edit:t.can_edit_project}}),"finished"===t.project.$status?a("sl-icon",{staticClass:"_icon _check",attrs:{name:"check-circle-fill"}}):"invisible"===t.project.$status?a("sl-icon",{staticClass:"_icon _invisible",attrs:{name:"file-lock2-fill"}}):t._e()],1),a("div",{staticClass:"_projectInfos--infos"},["full"===t.context?a("StatusTag",{attrs:{status:t.project.$status,path:t.project.$path,can_edit:t.can_edit_project}}):t._e(),"tiny"!==t.context&&"list"!==t.context?a("AuthorField",{attrs:{label:"full"===t.context?t.$t("contributors"):"",authors_paths:t.project.$authors,path:t.project.$path,can_edit:t.can_edit_project,instructions:t.$t("project_author_instructions")}}):t._e(),a("TitleField",{staticClass:"_title",attrs:{field_name:"title",label:"full"===t.context?t.$t("title"):"",content:t.project.title,path:t.project.$path,required:!0,maxlength:40,tag:"full"===t.context?"h1":"h3",can_edit:t.can_edit_project,instructions:t.$t("project_title_instructions")}}),"list"===t.context?[t.project.description?a("button",{staticClass:"u-buttonLink _showDescription",attrs:{type:"button"},domProps:{innerHTML:t._s(t.show_description?t.$t("hide_description"):t.$t("show_description"))},on:{click:function(e){t.show_description=!t.show_description}}}):a("small",{staticClass:"u-instructions"},[t._v(" "+t._s(t.$t("no_description"))+" ")])]:t._e(),"tiny"!==t.context&&t.show_description?a("TitleField",{staticClass:"_description",attrs:{field_name:"description",label:"full"===t.context&&(t.project.description||t.can_edit_project)?t.$t("description"):"",content:t.project.description,path:t.project.$path,maxlength:1280,can_edit:t.can_edit_project,instructions:t.$t("project_desc_instructions")}}):t._e()],2),a("transition",{attrs:{name:"fade"}},[(t.context,t._e())]),"full"===t.context?a("div",{staticClass:"_projectInfos--meta",class:{"is--hidden":!t.show_meta}},[a("CardCompetences",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardMachines",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardKeywords",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardFiles",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardLicense",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardMeta",{attrs:{project:t.project,can_edit:t.can_edit_project}}),a("CardStatus",{attrs:{project:t.project,can_edit:t.can_edit_project}})],1):t._e(),"list"===t.context||"tiny"===t.context?a("div",{staticClass:"_projectInfos--open"},[a("router-link",{attrs:{to:{path:t.createURLFromPath(t.project.$path)}}},[a("div",{staticClass:"_clickZone"})])],1):t._e()],1)},o=[],r=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("informations"),icon:"info-square"}},[a("DateField",{attrs:{title:t.$t("date_created"),date:t.project.$date_created}}),a("br"),a("DateField",{attrs:{title:t.$t("date_modified"),date:t.project.$date_modified}}),a("br"),a("div",{},[t.can_edit?a("RemoveMenu",{attrs:{remove_text:t.$t("remove_project")},on:{remove:t.removeProject}}):t._e()],1)],1)},i=[],c=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("details",{staticClass:"_projectCard"},[a("summary",[a("div",{staticClass:"_icon"},[t.icon?a("sl-icon",{attrs:{name:t.icon}}):t._e()],1),t._v(" "+t._s(t.header)+" ")]),a("div",{staticClass:"_content"},[t._t("default")],2)])},n=[],l={props:{header:String,icon:String},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},d=l,p=(a(4832),a(1001)),_=(0,p.Z)(d,c,n,!1,null,"91dc885a",null),u=_.exports,f={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{edit_mode:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{enableEditMode(){this.edit_mode=!0},async removeProject(){this.fetch_status="pending",this.fetch_error=null;try{const t=await this.$api.deleteItem({path:this.project.$path});this.response=t.data,this.fetch_status="success"}catch(t){this.fetch_status="error",this.fetch_error=t.response.data}}}},h=f,v=(0,p.Z)(h,r,i,!1,null,"4992e298",null),m=v.exports,b=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("keywords"),icon:"tag"}},[a("div",{},[a("TagsField",{attrs:{field_name:"keywords",content:t.project.keywords,path:t.project.$path,can_edit:t.can_edit}})],1)])},j=[],g={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},w=g,x=(0,p.Z)(w,b,j,!1,null,"d26c444a",null),y=x.exports,$=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("levels_and_competences"),icon:"bookmark-star"}},[a("div",{},[a("SelectField",{attrs:{field_name:"level",content:t.project.level,path:t.project.$path,can_edit:t.can_edit,options:t.basic_competences}})],1)])},k=[],C={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{basic_competences:[{key:"",text:"–"},{key:"beginner",text:this.$t("beginner")},{key:"intermediate",text:this.$t("intermediate")},{key:"experienced",text:this.$t("experienced")},{key:"expert",text:this.$t("novice")}]}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},I=C,P=(0,p.Z)(I,$,k,!1,null,"5e9f29d6",null),F=P.exports,M=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("machines_and_materials"),icon:"tools"}},[a("div",{},[a("TagsField",{attrs:{field_name:"materials",content:t.project.materials,path:t.project.$path,can_edit:t.can_edit}})],1)])},L=[],S={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},D=S,Z=(0,p.Z)(D,M,L,!1,null,"68fd6dab",null),O=Z.exports,B=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("visibility"),icon:"globe"}},[a("div",[t._v(" "+t._s(t.$t("visibility_text"))+" ")]),a("br"),a("div",{},[a("DLabel",{attrs:{str:t.$t("status")}}),a("SelectField",{attrs:{field_name:"$status",content:t.project.$status,path:t.project.$path,can_edit:t.can_edit,options:t.status_options}})],1)])},z=[],E={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{status_options:[{key:"draft",text:this.$t("draft"),instruction:this.$t("draft_status_explanations")},{key:"finished",text:this.$t("finished"),instruction:this.$t("finished_status_explanations")},{key:"invisible",text:this.$t("invisible"),instruction:this.$t("invisible_status_explanations_projects")}],visible_value:this.project.status}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},T=E,R=(0,p.Z)(T,B,z,!1,null,"6b8a5057",null),A=R.exports,N=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("license_and_authors"),icon:"people"}},[a("DLabel",{attrs:{str:t.$t("license"),instructions:t.can_edit?t.$t("licence_instructions"):""}}),a("div",{},[a("RadioField",{attrs:{field_name:"license",content:t.project.license,path:t.project.$path,can_edit:t.can_edit,options:t.license_options}})],1),a("br"),a("div",{},[a("TitleField",{attrs:{label:t.$t("authors"),field_name:"authors_list",content:t.project.authors_list,path:t.project.$path,can_edit:t.can_edit}})],1)],1)},q=[],V={props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{license_options:[{key:"creativecommons_by_nc_sa",text:"creativecommons_by_nc_sa_explanations"},{key:"all_rights_reserved",text:"all_rights_reserved_explanations"},{key:"copyleft",text:"copyleft_explanations"},{key:"custom_license",text:"custom_license_explanations"}]}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},U=V,H=(0,p.Z)(U,N,q,!1,null,"9041b734",null),W=H.exports,J=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ProjectCard",{attrs:{header:t.$t("files"),icon:"file-earmark-arrow-down"}},[a("div",{staticClass:"_fileList"},[t._l(t.files,(function(e,s){return a("div",{key:s,staticClass:"_file"},[e&&e.$path?a("div",{staticClass:"u-sameRow"},[a("DownloadFile",{staticClass:"_link",attrs:{file:e}},[a("sl-icon",{attrs:{name:"file-earmark-arrow-down"}}),t._v(" "+t._s(e.$media_filename)+" ")],1)],1):t._e(),t.can_edit?a("sl-icon-button",{attrs:{name:"x",size:"small"},on:{click:function(e){return e.preventDefault(),t.removeFile(s)}}}):t._e()],1)})),a("div",{},[t.can_edit?a("button",{staticClass:"u-button u-button_small u-button_bleuvert _addFile",attrs:{type:"button"},on:{click:function(e){t.show_picker=!t.show_picker}}},[t._v(" "+t._s(t.$t("add"))+" ")]):t._e(),t.show_picker?a("PickMediaFromProjects",{attrs:{path:t.project.$path},on:{selectMedia:t.selectMedia,close:function(e){t.show_picker=!1}}}):t._e()],1)],2)])},K=[],Y=(a(7658),{props:{project:Object,can_edit:Boolean},components:{ProjectCard:u},data(){return{show_picker:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{files(){return this.project.downloadable_files?this.project.downloadable_files.map((t=>this.getMediaInFolder({folder_path:this.project.$path,meta_filename:t}))):[]}},methods:{async selectMedia({path_to_source_media:t}){const e=this.getFilename(t),a=this.project.downloadable_files.slice()||[];a.push(e),this.updateFiles(a)},async removeFile(t){const e=this.project.downloadable_files.slice().splice(t+1,1);this.updateFiles(e)},async updateFiles(t){await this.$api.updateMeta({path:this.project.$path,new_meta:{downloadable_files:t}})}}}),G=Y,Q=(a(3299),(0,p.Z)(G,J,K,!1,null,"0f0dd6c8",null)),X=Q.exports,tt={props:{project:Object,context:String,can_edit_project:Boolean},components:{CardMeta:m,CardKeywords:y,CardCompetences:F,CardMachines:O,CardStatus:A,CardLicense:W,CardFiles:X},data(){return{new_title:this.project.title,fetch_status:null,fetch_error:null,response:null,show_meta:!0,show_description:!0}},created(){"list"===this.context&&(this.show_description=!1)},mounted(){},beforeDestroy(){},watch:{"$root.is_mobile_view"(){this.$root.is_mobile_view&&(this.show_meta=!0)}},computed:{},methods:{}},et=tt,at=(a(5048),(0,p.Z)(et,s,o,!1,null,"79fefacd",null)),st=at.exports},1663:function(t,e,a){"use strict";a.d(e,{Z:function(){return v}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("section",{staticClass:"_projectsListWithFilter"},[a("div",{staticClass:"_filterSortBar"},[a("button",{staticClass:"u-button u-button_small u-button_bleumarine",class:{"is--active":t.show_sidebar},attrs:{type:"button"},on:{click:function(e){t.show_sidebar=!t.show_sidebar}}},[t._v(" "+t._s(t.$t("filters"))+" ")]),a("select",{directives:[{name:"model",rawName:"v-model",value:t.order_key,expression:"order_key"}],staticClass:"_orderSelect",attrs:{size:"small"},on:{change:function(e){var a=Array.prototype.filter.call(e.target.options,(function(t){return t.selected})).map((function(t){var e="_value"in t?t._value:t.value;return e}));t.order_key=e.target.multiple?a:a[0]}}},t._l(t.order_options,(function(e){return a("option",{key:e.key,domProps:{value:e.key,textContent:t._s(e.text)}})})),0)]),a("div",{staticClass:"_cont"},[t.show_sidebar?a("div",{staticClass:"_sidebar"},[a("div",{staticClass:"u-switch u-switch-xs"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.show_only_finished,expression:"show_only_finished"}],attrs:{id:"only_finished",type:"checkbox"},domProps:{checked:Array.isArray(t.show_only_finished)?t._i(t.show_only_finished,null)>-1:t.show_only_finished},on:{change:function(e){var a=t.show_only_finished,s=e.target,o=!!s.checked;if(Array.isArray(a)){var r=null,i=t._i(a,r);s.checked?i<0&&(t.show_only_finished=a.concat([r])):i>-1&&(t.show_only_finished=a.slice(0,i).concat(a.slice(i+1)))}else t.show_only_finished=o}}}),a("label",{staticClass:"u-label",attrs:{for:"only_finished"}},[t._v(t._s(t.$t("only_finished")))])]),a("br"),a("div",{staticClass:"u-sameRow",staticStyle:{width:"100%"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.search_project,expression:"search_project"}],attrs:{type:"text",placeholder:t.$t("search_by_title")},domProps:{value:t.search_project},on:{input:function(e){e.target.composing||(t.search_project=e.target.value)}}}),t.search_project.length>0?a("button",{staticClass:"u-button u-button_bleumarine",staticStyle:{flex:"0 0 auto"},attrs:{type:"button"},on:{click:function(e){t.search_project=""}}},[a("sl-icon",{attrs:{name:"x-lg"}})],1):t._e()]),a("br"),a("DLabel",{attrs:{str:t.$t("keywords")}}),t._l(t.all_keywords,(function(e){return a("button",{key:e,staticClass:"u-button u-button_orange u-button_small",attrs:{type:"button"},on:{click:function(a){return t.toggleFilter({type:"keywords",value:e})}}},[t._v(" "+t._s(e)+" ")])})),a("br"),a("DLabel",{attrs:{str:t.$t("machines_and_materials")}}),t._l(t.all_materials,(function(e){return a("button",{key:e,staticClass:"u-button u-button_bleumarine u-button_small",attrs:{type:"button"},on:{click:function(a){return t.toggleFilter({type:"materials",value:e})}}},[t._v(" "+t._s(e)+" ")])})),a("br"),a("DLabel",{attrs:{str:t.$t("levels_and_competences")}}),t._l(t.all_levels,(function(e){return a("button",{key:e,staticClass:"u-button u-button_bleuvert u-button_small",attrs:{type:"button"},on:{click:function(a){return t.toggleFilter({type:"level",value:e})}}},[t._v(" "+t._s(t.$t(e))+" ")])}))],2):t._e(),a("div",{staticClass:"_listOfProjects"},[t.active_filters.length>0?a("div",{staticClass:"_tagList"},t._l(t.active_filters,(function(e){return a("button",{key:Object.keys(e)[0],staticClass:"u-button u-button_small",class:t.btnClassForMedia(Object.keys(e)[0]),attrs:{type:"button"},on:{click:function(a){t.toggleFilter({type:Object.keys(e)[0],value:Object.values(e)[0]})}}},[t._v(" "+t._s(Object.values(e)[0])+" "),a("sl-icon",{attrs:{name:"x"}})],1)})),0):t._e(),a("ProjectsList",{attrs:{projects:t.filtered_projects}})],1)])])},o=[],r=(a(2262),a(4506),a(6699),a(7658),function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("transition-group",{staticClass:"_projectsList",attrs:{tag:"section",name:"projectsList",appear:""}},[0===t.projects.length?a("div",{key:"noprojects",staticClass:"u-instructions _projectsNotice"},[t._v(" "+t._s(t.$t("no_projects"))+" ")]):t._l(t.projects,(function(t){return a("ProjectPresentation",{key:t.$path,staticClass:"_project",attrs:{project:t,context:"list"}})}))],2)}),i=[],c=a(3324),n={props:{projects:Array},components:{ProjectPresentation:c.Z},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},l=n,d=(a(5781),a(1001)),p=(0,d.Z)(l,r,i,!1,null,"5579f80a",null),_=p.exports,u={props:{projects:Array},components:{ProjectsList:_},data(){return{show_sidebar:!1,search_project:"",show_only_finished:!1,order_key:"$date_created",order_options:[{key:"$date_created",text:this.$t("date_created")},{key:"$date_modified",text:this.$t("date_modified")},{key:"alphabetical",text:this.$t("alphabetical")}]}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{all_keywords(){return this.extractArr(this.projects,"keywords")},all_materials(){return this.extractArr(this.projects,"materials")},all_levels(){return this.extractArr(this.projects,"level")},active_filters(){return this.$route.query?Object.entries(this.$route.query).map((([t,e])=>({[t]:decodeURI(e)}))):[]},sorted_projects(){return this.projects?this.projects.slice().filter((t=>this.canLoggedinSeeFolder({folder:t}))).sort(((t,e)=>"$date_created"===this.order_key?+new Date(e.$date_created)-+new Date(t.$date_created):"$date_modified"===this.order_key?+new Date(e.$date_modified)-+new Date(t.$date_modified):"alphabetical"===this.order_key?t.title.localeCompare(e.title):void 0)):[]},filtered_projects(){return this.sorted_projects.filter((t=>{if(0===this.active_filters.length&&0===this.search_project.length&&!1===this.show_only_finished)return!0;if(this.show_only_finished&&"finished"!==t.$status)return!1;for(const e of this.active_filters){const a=Object.keys(e).at(0),s=Object.values(e).at(0);if(!Object.prototype.hasOwnProperty.call(t,a))return!1;if(Array.isArray(t[a])&&!t[a].includes(s))return!1;if("string"===typeof t[a]&&t[a]!==s)return!1}return!this.search_project||t.title.toLowerCase().includes(this.search_project.toLowerCase())}))}},methods:{btnClassForMedia(t){return"keywords"===t?"u-button_orange":"materials"===t?"u-button_bleumarine":"level"===t?"u-button_bleuvert":void 0},toggleFilter({type:t,value:e}){let a={};this.$route.query&&(a=JSON.parse(JSON.stringify(this.$route.query))),e&&a[t]!==encodeURI(e)?a[t]=encodeURI(e):delete a[t],this.$router.push({query:a})}}},f=u,h=(a(8882),(0,d.Z)(f,s,o,!1,null,"f45af2de",null)),v=h.exports},7560:function(t,e,a){"use strict";a.d(e,{Z:function(){return l}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_spacePresentation"},[a("div",{staticClass:"_coverField"},[a("CoverField",{attrs:{context:t.context,cover:t.space.$cover,path:t.space.$path,can_edit:t.can_edit}}),"invisible"===t.space.$status?a("sl-icon",{staticClass:"_icon _invisible",attrs:{name:"file-lock2-fill"}}):t._e()],1),a("div",{staticClass:"_title"},[t.can_edit?a("StatusTag",{attrs:{status:t.space.$status,status_options:["invisible","visible"],path:t.space.$path,can_edit:t.can_edit}}):t._e(),a("TitleField",{attrs:{field_name:"title",tag:"h1",content:t.space.title,path:t.space.$path,maxlength:280,can_edit:t.can_edit}}),t.can_edit||t.space.subtitle?a("TitleField",{staticClass:"_subtitle",attrs:{field_name:"subtitle",content:t.space.subtitle,path:t.space.$path,maxlength:280,can_edit:t.can_edit}}):t._e()],1),t.can_edit||t.space.description?a("TitleField",{staticClass:"_description",attrs:{field_name:"description",label:t.can_edit?t.$t("description"):void 0,content:t.space.description,path:t.space.$path,maxlength:480,can_edit:t.can_edit}}):t._e(),"list"===t.context||"tiny"===t.context?a("div",{staticClass:"_openSpace"},[a("router-link",{attrs:{to:{path:t.createURLFromPath(t.space.$path)}}},[a("div",{staticClass:"_clickZone"})])],1):t._e()],1)},o=[],r={props:{space:Object,context:String,can_edit:Boolean},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{}},i=r,c=(a(1086),a(1001)),n=(0,c.Z)(i,s,o,!1,null,"1722681b",null),l=n.exports},2502:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return m}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_spaceView"},[t.space?a("div",[a("div",{staticClass:"_topSpace"},[a("SpacePresentation",{attrs:{space:t.space,context:"full",can_edit:t.can_edit_space}}),a("div",{staticClass:"_removeBtn"},[t.can_edit_space?a("RemoveMenu",{attrs:{remove_text:t.$t("remove")},on:{remove:t.removeSpace}}):t._e()],1),a("div",{staticClass:"_contributors"},[a("AuthorField",{attrs:{label:t.$t("contributors"),authors_paths:t.space.$authors,path:t.space.$path,can_edit:t.can_edit_space,tag:"h2",instructions:t.$t("space_contrib_instr")}})],1)],1),a("div",{staticClass:"_projectsList"},[a("div",{staticClass:"u-sameRow"},[a("DLabel",{attrs:{str:t.$t("list_of_projects"),tag:"h2"}}),t.can_edit_space?a("button",{staticClass:"u-button u-button_red u-button_small",attrs:{type:"button"},on:{click:function(e){t.show_create_modal=!0}}},[a("svg",{staticStyle:{"enable-background":"new 0 0 168 168"},attrs:{version:"1.1",xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink",x:"0px",y:"0px",viewBox:"0 0 168 168","xml:space":"preserve"}},[a("path",{staticStyle:{fill:"#fc4b60"},attrs:{d:"M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7\n\t\tC110.5-8.2,57.5-8.2,24.6,24.4z"}}),a("polygon",{staticStyle:{fill:"#ffbe32"},attrs:{points:"132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 \n\t\t73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 \t\t"}})]),t._v(" "+t._s(t.$t("create_a_project"))+" ")]):t._e()],1),t.show_create_modal?a("CreateProject",{attrs:{path:t.projects_path},on:{close:function(e){t.show_create_modal=!1},openNewProject:t.openNewProject}}):t._e(),void 0!==t.projects?a("ProjectsListWithFilter",{attrs:{projects:t.projects}}):t._e()],1)]):t._e()])},o=[],r=(a(7658),function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("BaseModal2",{attrs:{title:t.$t("create_a_project")},on:{close:function(e){return t.$emit("close")}}},[a("form",{staticClass:"input-validation-required",on:{submit:function(e){return e.preventDefault(),t.createProject.apply(null,arguments)}}},[a("DLabel",{attrs:{str:t.$t("title")}}),a("TextInput",{attrs:{content:t.new_project_title,maxlength:40,required:!0},on:{"update:content":function(e){t.new_project_title=e},toggleValidity:function(e){return t.allow_save=e}}}),a("br"),a("div",{},[a("ToggleInput",{attrs:{content:t.new_project_is_invisible,label:t.$t("invisible"),options:{true:t.$t("invisible_status_explanations_projects"),false:t.$t("visible_status_explanations_projects")}},on:{"update:content":function(e){t.new_project_is_invisible=e}}})],1),a("br"),a("button",{staticClass:"u-button u-button_bleuvert",attrs:{slot:"footer",type:"submit",loading:t.is_creating_project},slot:"footer"},[t._v(" "+t._s(t.$t("create_and_open"))+" ")]),t.error_msg?[a("br"),a("br"),a("div",{staticClass:"u-errorMsg",domProps:{textContent:t._s(t.error_msg)}})]:t._e()],2)])}),i=[],c={props:{path:String},components:{},data(){return{new_project_title:"",new_project_is_invisible:!1,is_creating_project:!1,allow_save:!1,error_msg:""}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async createProject(){this.is_creating_project=!0;try{const t=await this.$api.createFolder({path:this.path,additional_meta:{title:this.new_project_title,requested_slug:this.new_project_title,status:"draft",license:"CC",$status:!0===this.new_project_is_invisible?"invisible":"draft",$authors:[this.$api.tokenpath.token_path]}});setTimeout((()=>{this.$emit("openNewProject",t)}),50)}catch(t){this.error_msg="Error: "+t.message,setTimeout((()=>{this.error_msg=""}),5e3),this.is_creating_project=!1}}}},n=c,l=a(1001),d=(0,l.Z)(n,r,i,!1,null,"79db495e",null),p=d.exports,_=a(1663),u=a(7560),f={props:{},components:{CreateProject:p,ProjectsListWithFilter:_.Z,SpacePresentation:u.Z},data(){return{space:void 0,projects:void 0,show_create_modal:!1}},created(){},async mounted(){await this.getSpace(),this.$api.join({room:this.space_path}),this.$eventHub.$emit("received.space",this.space),await this.getProjects(),this.$api.join({room:this.projects_path}),this.$eventHub.$on("folder.removed",this.closeOnRemove)},beforeDestroy(){this.$api.leave({room:this.space_path}),this.$api.leave({room:this.projects_path}),this.$eventHub.$off("folder.removed",this.closeOnRemove)},watch:{},computed:{space_path(){return this.createPath({space_slug:this.$route.params.space_slug})},projects_path(){return this.space_path+"/projects"},can_edit_space(){return this.canLoggedinEditFolder({folder_authors:this.space.$authors})}},methods:{async getSpace(){this.space=await this.$api.getFolder({path:this.space_path}).catch((()=>{}))},async getProjects(){this.projects=await this.$api.getFolders({path:this.projects_path}).catch((()=>{}))},openNewProject(t){this.show_create_modal=!1;const e=this.createURLFromPath(this.projects_path+"/"+t);this.$router.push(e)},closeOnRemove({path:t}){t===this.space.$path&&(this.$alertify.closeLogOnClick(!0).delay(4e3).log(this.$t("notifications.space_was_removed")),this.$router.push("/"))},async removeSpace(){this.fetch_status="pending",this.fetch_error=null;try{const t=await this.$api.deleteItem({path:this.space.$path});this.response=t.data,this.fetch_status="success"}catch(t){this.fetch_status="error",this.fetch_error=t.response.data}}}},h=f,v=(a(8890),(0,l.Z)(h,s,o,!1,null,"b7328dba",null)),m=v.exports},8164:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,'._projectCard[data-v-91dc885a]{border-bottom:1px solid var(--c-gris_clair);border-left:2px solid transparent}._projectCard[open][data-v-91dc885a]{border-left-color:var(--c-gris_fonce);margin-bottom:1px}._projectCard[data-v-91dc885a] ::marker{display:none;content:""}._projectCard summary[data-v-91dc885a]{display:flex;flex-flow:row nowrap;align-items:center;font-size:var(--sl-font-size-medium);padding:calc(var(--spacing)/2);font-weight:500;gap:calc(var(--spacing)/2);cursor:pointer}._projectCard summary[data-v-91dc885a]:focus,._projectCard summary[data-v-91dc885a]:hover{background-color:var(--c-gris_clair)}._projectCard[open] summary[data-v-91dc885a]{background-color:var(--c-gris)}._icon[data-v-91dc885a],._projectCard ._content[data-v-91dc885a]{padding:calc(var(--spacing)/2)}._icon[data-v-91dc885a]{font-size:110%;background-color:var(--c-gris);border-radius:4px;line-height:0;width:30px;height:30px;transition:all .25s cubic-bezier(.19,1,.22,1)}._projectCard[open] ._icon[data-v-91dc885a]{background-color:#fff}',""]),e["default"]=c},2599:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,"._project[data-v-79fefacd],._projectInfos[data-v-79fefacd]{position:relative}._projectInfos[data-v-79fefacd]{display:flex;flex-flow:row nowrap;align-items:stretch;margin:0 auto;max-width:180ch;max-width:var(--max-column-width);overflow:hidden;background:#fff;transition:all .4s cubic-bezier(.19,1,.22,1)}._projectInfos.is--linkToProject[data-v-79fefacd]:hover{transform:translateY(-12px);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}._projectInfos.is--list[data-v-79fefacd],._projectInfos.is--tiny[data-v-79fefacd]{box-shadow:0 1px 4px rgba(0,0,0,.2);border-radius:4px}._projectInfos.is--list ._description[data-v-79fefacd],._projectInfos.is--list ._title[data-v-79fefacd],._projectInfos.is--tiny ._description[data-v-79fefacd],._projectInfos.is--tiny ._title[data-v-79fefacd]{font-size:90%}._projectInfos.is--list[data-v-79fefacd]{display:block}._projectInfos.is--mobileView[data-v-79fefacd]{flex-flow:row wrap}._projectInfos>*[data-v-79fefacd]{flex:10 1 320px;transition:all .4s cubic-bezier(.19,1,.22,1)}._projectInfos>._projectInfos--meta[data-v-79fefacd]{flex:1 0 260px}._projectInfos>._projectInfos--meta.is--hidden[data-v-79fefacd]{flex:0 0 0;opacity:0}._projectInfos.is--mobileView ._projectInfos--meta[data-v-79fefacd]{flex:0 0 100%}._projectInfos--infos[data-v-79fefacd]{display:flex;flex-flow:column nowrap;place-content:center;gap:calc(var(--spacing)/1);padding:calc(var(--spacing)/1);transition:all .4s}.is--list ._projectInfos--infos[data-v-79fefacd],.is--tiny ._projectInfos--infos[data-v-79fefacd]{gap:calc(var(--spacing)/4);order:0;padding-top:calc(var(--spacing)/2);pointer-events:none}.is--list ._projectInfos--infos ._showDescription[data-v-79fefacd],.is--tiny ._projectInfos--infos ._showDescription[data-v-79fefacd]{pointer-events:auto}._imageSelect[data-v-79fefacd]{background:#fff;position:relative}._projectInfos--cover[data-v-79fefacd]{position:relative;aspect-ratio:1/1;width:45vh;height:45vh;flex:0 0 45vh}@supports not (aspect-ratio:1/1){._projectInfos--cover[data-v-79fefacd]{width:500px;height:500px}}.is--list ._projectInfos--cover[data-v-79fefacd]{padding:2px;width:100%;height:auto}.is--mobileView ._projectInfos--cover[data-v-79fefacd]{flex:1 1 auto;max-height:40vh;max-width:40vh;height:auto}._projectInfos--cover ._icon[data-v-79fefacd]{position:absolute;top:0;right:0;margin:calc(var(--spacing)/1);font-size:125%}._projectInfos--cover ._check[data-v-79fefacd]{color:var(--c-bleuvert)}._projectInfos--meta[data-v-79fefacd]{display:flex;flex-flow:column nowrap;font-size:90%;overflow-x:hidden;overflow-y:auto;height:45vh}._projectInfos--meta[data-v-79fefacd]::-webkit-scrollbar{height:18px;width:18px;background-color:transparent}._projectInfos--meta[data-v-79fefacd]::-webkit-scrollbar-thumb,._projectInfos--meta[data-v-79fefacd]::-webkit-scrollbar-track{border:6px solid hsla(0,0%,100%,0);border-radius:24px;background-clip:padding-box;-webkit-transition:all .4s;transition:all .4s}._projectInfos--meta[data-v-79fefacd]::-webkit-scrollbar-track{background-color:transparent}._projectInfos--meta[data-v-79fefacd]::-webkit-scrollbar-thumb{background-color:var(--c-noir)}._projectInfos--meta[data-v-79fefacd]::-webkit-scrollbar-thumb:hover{background-color:var(--c-gris);border:6px solid hsla(0,0%,100%,0)}.is--mobileView ._projectInfos--meta[data-v-79fefacd]{flex-flow:row nowrap;max-height:none;overflow-x:auto;overflow-y:hidden;height:auto}._projectInfos--meta>*[data-v-79fefacd]{flex:0 0 auto;min-width:220px}.is--mobileView ._projectInfos--meta>*[data-v-79fefacd]{flex:1 0 220px}._projectInfos--open[data-v-79fefacd]{display:flex;justify-content:center}._projectInfos--open ._clickZone[data-v-79fefacd]{position:absolute;top:0;left:0;width:100%;height:100%}._projectInfos--open ._openBtn[data-v-79fefacd]{text-decoration:underline;position:relative;margin:calc(var(--spacing)/2);transition:all .25s cubic-bezier(.19,1,.22,1)}._projectInfos--open ._openBtn[data-v-79fefacd]:focus,._projectInfos--open ._openBtn[data-v-79fefacd]:hover{transform:translateY(-4px) rotate(-2deg);box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}._coverPicker[data-v-79fefacd]{margin:calc(var(--spacing)*1);margin:2px;border-radius:3px}._showMeta[data-v-79fefacd]{position:absolute;top:0;right:0;z-index:100;background:#fff;margin:calc(var(--spacing)/4)}._showDescription[data-v-79fefacd]{position:relative;z-index:100;padding:0;text-align:left}",""]),e["default"]=c},7287:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,"._projectsNotice[data-v-5579f80a]{width:100%;text-align:center}._projectsList[data-v-5579f80a]{display:grid;grid-auto-rows:max-content;grid-gap:calc(var(--spacing)/1);align-items:stretch;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}._projectsList>*[data-v-5579f80a]{margin:0}._project[data-v-5579f80a]{box-shadow:0 1px 4px rgba(0,0,0,.1);cursor:pointer}._project[data-v-5579f80a]  ._projectInfos{min-height:100%}",""]),e["default"]=c},8781:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,'._projectsListWithFilter[data-v-f45af2de]{margin-top:calc(var(--spacing)*1)}._cont[data-v-f45af2de]{flex-flow:row wrap;gap:calc(var(--spacing)/1)}._cont[data-v-f45af2de],._sidebar[data-v-f45af2de]{display:flex;align-items:flex-start}._sidebar[data-v-f45af2de]{flex:0 0 240px;position:sticky;overflow:hidden;top:0;flex-flow:column nowrap;justify-content:flex-start;gap:calc(var(--spacing)/4);padding-top:calc(var(--spacing)*1)}._sidebar[data-v-f45af2de]  button{white-space:nowrap;overflow:hidden;text-overflow:" [..]"}._listOfProjects[data-v-f45af2de]{flex:1 1 auto;margin-top:calc(var(--spacing)/1)}._tagList[data-v-f45af2de]{display:flex;gap:calc(var(--spacing)/2);margin-bottom:calc(var(--spacing)*1)}._orderSelect[data-v-f45af2de]{max-width:22ch}._filterSortBar[data-v-f45af2de]{display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;gap:calc(var(--spacing)/2)}',""]),e["default"]=c},1208:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,"._fileList[data-v-0f0dd6c8]{padding:0;margin:0}._fileList>._file[data-v-0f0dd6c8]{padding:0;border-radius:2px;min-height:2em;display:flex;flex-flow:row nowrap;justify-content:center;word-break:break-word;align-items:center;gap:calc(var(--spacing)/4);justify-content:space-between}._fileList>._file ._preview[data-v-0f0dd6c8]{width:2rem;aspect-ratio:1/1;flex:0 0 auto}._fileList>._file ._link[data-v-0f0dd6c8]{display:block;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-variant:none;font-weight:400;letter-spacing:0;font-size:var(--sl-font-size-small)}._addFile[data-v-0f0dd6c8]{margin-top:calc(var(--spacing)/2)}",""]),e["default"]=c},2725:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,"._spacePresentation[data-v-1722681b]{position:relative;display:flex;flex-flow:row wrap;align-items:center;background:#fff;overflow:hidden;background:var(--panel-color);box-shadow:var(--panel-shadows);border-radius:var(--panel-radius);margin-bottom:calc(var(--spacing)/2)}._spacePresentation>*[data-v-1722681b]{flex:1 1 33%}._coverField[data-v-1722681b]{position:relative;aspect-ratio:1/1;flex:0 1 120px}._title[data-v-1722681b]{padding:calc(var(--spacing)/2) calc(var(--spacing)/1)}._subtitle[data-v-1722681b]{color:var(--c-gris_fonce);font-weight:500}._description[data-v-1722681b]{padding:calc(var(--spacing)/1);display:block;max-width:66ch;flex:4 1 33%}._openSpace[data-v-1722681b]{display:flex;justify-content:center}._openSpace[data-v-1722681b],._openSpace ._clickZone[data-v-1722681b]{position:absolute;top:0;left:0;width:100%;height:100%}._icon[data-v-1722681b]{position:absolute;top:0;right:0;margin:calc(var(--spacing)/1)}",""]),e["default"]=c},8546:function(t,e,a){"use strict";a.r(e);var s=a(8081),o=a.n(s),r=a(3645),i=a.n(r),c=i()(o());c.push([t.id,"._spaceView[data-v-b7328dba],._topSpace[data-v-b7328dba]{margin:0 auto}._topSpace[data-v-b7328dba]{max-width:var(--max-column-width);padding:calc(var(--spacing)*2)}._removeBtn[data-v-b7328dba]{display:flex;justify-content:flex-end}._projectsList[data-v-b7328dba]{padding:calc(var(--spacing)*1)}._contributorsList[data-v-b7328dba]{display:grid;grid-auto-rows:max-content;grid-gap:calc(var(--spacing)/2);align-items:stretch;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}._contributorsList>*[data-v-b7328dba]{background:#fff;display:flex;flex-flow:row nowrap;align-items:center;gap:calc(var(--spacing)/2);padding:calc(var(--spacing)/1)}",""]),e["default"]=c},4832:function(t,e,a){var s=a(8164);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("1c73d14d",s,!0,{sourceMap:!1,shadowMode:!1})},5048:function(t,e,a){var s=a(2599);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("65e117b2",s,!0,{sourceMap:!1,shadowMode:!1})},5781:function(t,e,a){var s=a(7287);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("4b44b77d",s,!0,{sourceMap:!1,shadowMode:!1})},8882:function(t,e,a){var s=a(8781);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("01e33bd7",s,!0,{sourceMap:!1,shadowMode:!1})},3299:function(t,e,a){var s=a(1208);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("9dc3937e",s,!0,{sourceMap:!1,shadowMode:!1})},1086:function(t,e,a){var s=a(2725);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("2b525cb2",s,!0,{sourceMap:!1,shadowMode:!1})},8890:function(t,e,a){var s=a(8546);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var o=a(1982).Z;o("2324357a",s,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=SpaceView.js.map