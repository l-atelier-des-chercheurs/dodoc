(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[767],{82566:function(t,e,a){"use strict";a.d(e,{Z:function(){return w}});var o=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_keywordsField"},[t.label?a("DLabel",{staticClass:"_label",attrs:{str:t.label}}):t._e(),t.keywords.length>0?a("div",{staticClass:"u-keywords"},t._l(t.keywords,(function(t){return a("SingleKeyword",{key:t,attrs:{keyword:t}})})),1):t._e(),t.can_edit?a("EditBtn",{on:{click:t.enableEditMode}}):t._e(),t.edit_mode?a("BaseModal2",{attrs:{title:t.label},on:{close:function(e){t.edit_mode=!1}}},[t.new_keywords.length>0?a("div",{staticClass:"u-keywords"},t._l(t.new_keywords,(function(e){return a("SingleKeyword",{key:e,attrs:{keyword:e,can_remove:!0},on:{remove:function(a){return t.removeKeyword(e)}}})})),1):t._e(),a("hr"),a("KeywordsFieldEditor",{attrs:{keywords:t.new_keywords},on:{"update:keywords":function(e){t.new_keywords=e}}}),a("div",{attrs:{slot:"footer"},slot:"footer"},[a("SaveCancelButtons",{staticClass:"_scb",on:{save:t.updateKeywords,cancel:t.cancel}})],1)],1):t._e()],1)},i=[],s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_keywordsFieldEditor"},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.user_suggestion,expression:"user_suggestion"}],ref:"keywordField",attrs:{type:"text",required:"",placeholder:t.$t("keyword_materials_etc")},domProps:{value:t.user_suggestion},on:{keydown:[function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"esc",27,e.key,["Esc","Escape"])?null:(e.preventDefault(),t.$emit("cancelEdit"))},function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")||e.ctrlKey||e.shiftKey||e.altKey||e.metaKey?null:(e.preventDefault(),t.newKeyword.apply(null,arguments))},function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:e.shiftKey?e.ctrlKey||e.altKey||e.metaKey?null:(e.preventDefault(),t.submitFirstSuggestion.apply(null,arguments)):null}],input:function(e){e.target.composing||(t.user_suggestion=e.target.value)}}}),a("div",{staticClass:"u-instructions"},[a("small",[t.suggested_keywords.length>0?[t._v(" "+t._s(t.$t("validate_with_shift_enter"))+" ")]:t.user_suggestion.length>0?[t._v(t._s(t.$t("create_new_keyword_enter")))]:t._e()],2)]),a("div",{staticClass:"_catSug"},[t.suggestion_from_category?a("div",[a("button",{staticClass:"u-button _category",style:t.getCatColor(t.suggestion_from_category),attrs:{type:"button"},on:{click:function(e){return t.toggleCategory(t.suggestion_from_category)}}},[t._v(" "+t._s(t.suggestion_from_category)+" ("+t._s(t.matchingKeywordsWithCategory(t.suggestion_from_category).length)+")   "),a("b-icon",{attrs:{icon:"x-circle"}})],1)]):a("div",{staticClass:"_categories"},t._l(t.categories_with_keywords,(function(e){return a("button",{key:e,staticClass:"u-button _category",style:t.getCatColor(e),attrs:{type:"button"},on:{click:function(a){return t.toggleCategory(e)}}},[t._v(" "+t._s(e)+" ("+t._s(t.matchingKeywordsWithCategory(e).length)+") ")])})),0),t.suggested_keywords.length>0?a("div",{staticClass:"_suggestions"},[a("div",{staticClass:"u-keywords"},t._l(t.suggested_keywords,(function(e,o){return a("SingleKeyword",{key:e,class:{"is--first":0===o},attrs:{keyword:e,can_add:!0},on:{add:function(a){return t.addKeyword(e)}}})})),1)]):t._e()])])},r=[],n=(a(70560),a(76801),a(92176),a(7961),a(1895)),d={props:{keywords:Array},components:{SingleKeyword:n.Z},data(){return{user_suggestion:"",suggestion_from_category:!1,categories:[],path:"categories"}},i18n:{messages:{fr:{validate_with_shift_enter:"Validez la première suggestion avec SHIFT+ENTRÉE, ou créez un nouveau mot-clé avec ENTRÉE.",create_new_keyword_enter:"Créez un nouveau mot-clé avec ENTRÉE."},en:{validate_with_shift_enter:"Add first suggestion with SHIFT+ENTER, or create a new keyword with ENTER.",create_new_keyword_enter:"Create a new keyword with ENTER."}}},async created(){this.categories=await this.$api.getFolders({path:this.path}),this.$api.join({room:this.path})},async mounted(){},beforeDestroy(){this.$api.leave({room:this.path})},watch:{},computed:{all_categories(){return this.categories.map((t=>t.title))},all_keywords(){return this.categories.reduce(((t,e)=>(e.title&&e.list_of_suggestions&&e.list_of_suggestions.map((a=>{t.push(e.title+"/"+a)})),t)),[])},categories_with_keywords(){return this.all_categories.filter((t=>this.matchingKeywordsWithCategory(t).length>0))},suggested_keywords(){return this.matchingKeywordsWithCategory(this.suggestion_from_category)}},methods:{matchingKeywordsWithCategory(t){return this.all_keywords.filter((e=>{const a=!!e.includes("/")&&e.split("/").at(0),o=e.includes("/")?e.split("/").at(1):e;return!this.keywords.includes(e)&&((!t||t===a)&&(!(!t&&0===this.user_suggestion.length)&&this.twoStringsMatch(o,this.user_suggestion)))}))},toggleCategory(t){this.suggestion_from_category===t?this.suggestion_from_category=!1:this.suggestion_from_category=t},getCatColor(t){const e=window.app_infos.custom_suggested_categories.find((e=>e.title===t));if(e?.tag_color)return`--cat-color: ${e.tag_color}`},newKeyword(){this.user_suggestion.length>0&&this.addKeyword(this.user_suggestion)},submitFirstSuggestion(){if(0===this.suggested_keywords.length)return!1;const t=this.suggested_keywords.at(0);this.addKeyword(t)},keywordKey(t){return t.category+"/"+t.name},addKeyword(t){let e=this.keywords.slice();e.push(t),e.sort(((t,e)=>e)),this.$emit("update:keywords",e),this.user_suggestion="",this.$refs.keywordField.focus()}}},l=d,c=(a(78631),a(1001)),u=(0,c.Z)(l,s,r,!1,null,"bf8392da",null),_=u.exports,h={props:{field_name:String,label:String,path:String,keywords:{type:Array,default:()=>[]},can_edit:Boolean},components:{KeywordsFieldEditor:_,SingleKeyword:n.Z},data(){return{new_keywords:this.keywords||[],edit_mode:this.can_edit&&!this.path&&!this.field_name,is_saving:!1}},created(){},mounted(){},beforeDestroy(){},watch:{new_keywords(){this.$emit("update:keywords",this.new_keywords)}},computed:{},methods:{enableEditMode(){this.edit_mode=!0},async updateKeywords(){this.is_saving=!0,await new Promise((t=>setTimeout(t,50)));try{const t={[this.field_name]:this.new_keywords};await this.$api.updateMeta({path:this.path,new_meta:t}),this.edit_mode=!1,this.is_saving=!1}catch(t){this.is_saving=!1}},cancel(){this.new_keywords=this.keywords||[],this.edit_mode=!1},removeKeyword(t){this.new_keywords=this.new_keywords.filter((e=>e!==t))}}},g=h,y=(0,c.Z)(g,o,i,!1,null,"81aef24e",null),w=y.exports},1895:function(t,e,a){"use strict";a.d(e,{Z:function(){return l}});var o=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_singleKeyword",class:{"is--clickable":t.can_add},style:t.kw_styles},[a("div",{},[t.category?a("div",{staticClass:"_category"},[t._v(" "+t._s(t.category.toUpperCase())+" ")]):t._e(),a("div",{staticClass:"_name"},[t._v(" "+t._s(t.name)+" ")])]),t.count?a("div",{staticClass:"_count"},[t._v(" "+t._s(t.count)+" ")]):t._e(),t.can_remove?a("b-icon",{staticClass:"_white",attrs:{icon:"dash-circle"},on:{click:function(e){return t.$emit("remove")}}}):t._e(),t.can_add?a("button",{staticClass:"_addBtn",attrs:{type:"button"},on:{click:function(e){return t.$emit("add")}}}):t._e()],1)},i=[],s=(a(76801),a(92176),a(7961),{props:{keyword:String,count:Number,cat_color:String,can_remove:Boolean,can_add:Boolean},components:{},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{category(){return!!this.keyword.includes("/")&&this.keyword.split("/").at(0)},name(){return this.keyword.includes("/")?this.keyword.split("/").at(1):this.keyword},kw_styles(){let t=!1;if(this.cat_color)t=this.cat_color;else{const e=window.app_infos.custom_suggested_categories.find((t=>t.title===this.category));t=e?.tag_color}return t?`--cat-color: ${t}`:""}},methods:{}}),r=s,n=(a(38985),a(1001)),d=(0,n.Z)(r,o,i,!1,null,"f2ad472e",null),l=d.exports},36767:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return c}});var o=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"_agoraExport"},[a("div",{ref:"agoraView",staticClass:"_agoraExport--items",on:{scroll:t.onScroll}},t._l(t.section_modules_list,(function(e,o){return a("div",{key:e.$path,staticClass:"_item",style:t.slide_styles,attrs:{"data-modulepath":e.$path}},[a("transition",{attrs:{name:"fade",mode:"out-in"}},[o>t.currently_shown_module_index-t.number_of_modules_to_keep_visible_at_once?a("div",{staticClass:"_item--content",attrs:{"data-layout":t.getRandomLayout(o)}},[t.getFirstSourceMedia(e.source_medias)?[a("MediaContent",{attrs:{file:t.getFirstSourceMedia(e.source_medias),resolution:1600,context:"full",show_fs_button:!1}})]:[a("div",[t._v("Erreur au chargement du média")])]],2):t._e()])],1)})),0),a("div",{staticClass:"_agoraExport--bottom"},[a("div",{staticClass:"_progressBar"},t._l(t.section_modules_list,(function(e,o){return a("button",{key:e.$path,attrs:{type:"button","data-alreadyshown":o<=t.currently_shown_module_index},on:{click:function(e){return t.updateCurrentSlide(o)}}})})),0),a("div",{staticClass:"_keywords"},[t.currently_shown_module&&t.currently_shown_module.keywords?a("KeywordsField",{key:t.currently_shown_module.$path,attrs:{field_name:"keywords",keywords:t.currently_shown_module.keywords,can_edit:!1}}):t._e()],1)])])},i=[],s=a(82566),r={props:{publication:Object},components:{KeywordsField:s.Z},data(){return{scroll_y:0,scroll_height:void 0,window_width:void 0,window_height:void 0,number_of_modules_to_keep_visible_at_once:8,number_of_different_layouts:10,slide_to_show:0,random_layouts_options:[]}},created(){this.random_layouts_options=this.fillWithRandoms({items:100,number_of_different_layouts:10})},mounted(){this.$nextTick((()=>{this.onResize()})),window.addEventListener("resize",this.onResize),!0===this.publication.autoscroll&&this.$nextTick((()=>{this.startAutomaticScroll()})),history.scrollRestoration?history.scrollRestoration="manual":window.onbeforeunload=function(){window.scrollTo(0,0)}},beforeDestroy(){window.removeEventListener("resize",this.onResize)},watch:{slide_to_show(){this.$refs.agoraView.scrollTop=this.slide_to_show*window.innerHeight}},computed:{first_section(){const t=this.getSectionsWithProps({publication:this.publication,group:"sections_list"});return t[0]},section_modules_list(){return this.getModulesForSection({publication:this.publication,section:this.first_section}).map((({_module:t})=>t))},currently_shown_module_index(){return Math.ceil(this.scroll_y/this.scroll_height-.1)},currently_shown_module(){return this.section_modules_list[this.currently_shown_module_index]},slide_styles(){return{"--slide-width":this.window_width+"px","--slide-height":this.window_height+"px"}}},methods:{onResize(){this.$refs.agoraView&&(this.scroll_height=this.$refs.agoraView.offsetHeight),this.window_width=window.innerWidth,this.window_height=window.innerHeight},getRandomLayout(t){return this.random_layouts_options[t%this.random_layouts_options.length]},fillWithRandoms({items:t,number_of_different_layouts:e}){let a=[];while(a.length<t){const t=new Array(e).fill(1).map(((t,e)=>e+1)).sort((()=>Math.random()-.5));a=a.concat(t)}return a},getFirstSourceMedia(t){const e=t[0];return!!e&&this.getSourceMedia({source_media:{meta_filename:e.meta_filename},folder_path:this.publication.$path})},updateCurrentSlide(t){this.slide_to_show=t},onScroll(t){this.scroll_y=t.target.scrollTop},startAutomaticScroll(){console.log("showing slide",this.slide_to_show);const t=1e3*this.section_modules_list[this.slide_to_show]?.duration||5e3,e=1e3,a=t+e;setTimeout((()=>{const t=this.$el.querySelector(`[data-modulepath="${this.section_modules_list[this.slide_to_show].$path}"]`),e=t.querySelector("video");if(e){e.muted=!0;const a=t.querySelector("[data-plyr='play']");a&&a.click()}}),e),setTimeout((()=>{this.slide_to_show+=1,this.slide_to_show<this.section_modules_list.length?this.startAutomaticScroll():console.log("Last slide")}),a)}}},n=r,d=(a(48158),a(1001)),l=(0,d.Z)(n,o,i,!1,null,"25fadeb8",null),c=l.exports},45223:function(t,e,a){"use strict";a.r(e);var o=a(8081),i=a.n(o),s=a(23645),r=a.n(s),n=r()(i());n.push([t.id,"._keywordsFieldEditor[data-v-bf8392da]{margin-top:calc(var(--spacing)/4)}._suggestions[data-v-bf8392da]{margin-top:calc(var(--spacing)/2);padding-top:calc(var(--spacing)/2)}._suggestions ._keyword[data-v-bf8392da]{cursor:pointer}._catSug[data-v-bf8392da]{padding:calc(var(--spacing)/2) 0}._categories[data-v-bf8392da]{display:flex;flex-flow:row wrap;padding:0;gap:calc(var(--spacing)/4)}._category[data-v-bf8392da]{padding:calc(var(--spacing)/4) calc(var(--spacing)/2);border-radius:4px;font-weight:600;background:var(--cat-color)}",""]),e["default"]=n},11666:function(t,e,a){"use strict";a.r(e);var o=a(8081),i=a.n(o),s=a(23645),r=a.n(s),n=r()(i());n.push([t.id,"._singleKeyword[data-v-f2ad472e]{position:relative;padding:calc(var(--spacing)/4) calc(var(--spacing)/2);border-radius:4px;line-height:1.2;display:flex;flex-flow:row nowrap;align-items:center;gap:calc(var(--spacing)/1);background-color:var(--cat-color,#fff);color:#000;transition:all .1s cubic-bezier(.19,1,.22,1)}._singleKeyword.is--clickable[data-v-f2ad472e]:hover{opacity:.7}._category[data-v-f2ad472e]{font-size:80%}._name[data-v-f2ad472e]{font-size:110%}._addBtn[data-v-f2ad472e]{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;background:transparent}._count[data-v-f2ad472e]{border:1px solid currentColor;border-radius:10px;min-width:14px;height:14px;font-size:8px;display:flex;justify-content:center;align-items:center;font-weight:600}",""]),e["default"]=n},10856:function(t,e,a){"use strict";a.r(e);var o=a(8081),i=a.n(o),s=a(23645),r=a.n(s),n=r()(i());n.push([t.id,'._agoraExport--items[data-v-25fadeb8]{height:100vh;overflow-y:scroll;scroll-snap-type:y mandatory;scroll-behavior:smooth}._agoraExport--bottom[data-v-25fadeb8]{position:absolute;padding:calc(var(--spacing)/2);background-color:hsla(0,0%,100%,.3);bottom:0;width:100%;overflow:hidden;display:flex;flex-flow:column nowrap;gap:calc(var(--spacing)/2);align-items:center}._agoraExport--bottom[data-v-25fadeb8]  .u-keywords{font-size:1.1rem}._item[data-v-25fadeb8]{position:sticky;top:0;scroll-snap-align:center;width:var(--slide-width,100%);height:var(--slide-height,100%);overflow:hidden}._item[data-v-25fadeb8]  ._mediaContent{width:100%;height:100%}._item[data-v-25fadeb8]  ._mediaContent img{width:100%;height:100%}._item[data-v-25fadeb8]  ._mediaContent ._iframeStylePreview,._item[data-v-25fadeb8]  ._mediaContent ._mediaContent--iframe,._item[data-v-25fadeb8]  ._mediaContent ._mediaContent--image,._item[data-v-25fadeb8]  ._mediaContent .plyr--video,._item[data-v-25fadeb8]  ._mediaContent .plyr__poster{position:absolute;height:100%;width:100%;-o-object-fit:contain;object-fit:contain;background-size:contain}._item--content[data-v-25fadeb8]{width:100%;height:100%;padding:1cm}._item--content[data-layout="1"][data-v-25fadeb8],._item--content[data-layout="2"][data-v-25fadeb8]{width:calc(var(--slide-width)*.6666);height:calc(var(--slide-height)*.6666)}._item--content[data-layout="2"][data-v-25fadeb8]{margin-left:calc(var(--slide-width)*.3334)}._item--content[data-layout="3"][data-v-25fadeb8],._item--content[data-layout="4"][data-v-25fadeb8]{width:calc(var(--slide-width)*.6666);height:calc(var(--slide-height)*.6666);margin-top:calc(var(--slide-height)*.3334)}._item--content[data-layout="4"][data-v-25fadeb8]{margin-left:33.34%}._item--content[data-layout="5"][data-v-25fadeb8]{width:50%;height:50%;margin-top:25%;margin-left:25%}._item--content[data-layout="6"][data-v-25fadeb8]{width:50%;height:50%;margin-top:0;margin-left:25%}._item--content[data-layout="7"][data-v-25fadeb8]{width:50%;height:50%;margin-top:0;margin-left:50%}._item--content[data-layout="8"][data-v-25fadeb8]{width:50%;height:50%;margin-top:0;margin-left:0}._item--content[data-layout="9"][data-v-25fadeb8]{width:50%;height:50%;margin-top:25%;margin-left:50%}._item--content[data-layout="10"][data-v-25fadeb8]{width:50%;height:50%;margin-top:25%;margin-left:0}.slideupkeywords-enter-active[data-v-25fadeb8],.slideupkeywords-leave-active[data-v-25fadeb8]{transform:translateY(0);transition:all 1s ease-in-out}.slideupkeywords-enter[data-v-25fadeb8],.slideupkeywords-leave-to[data-v-25fadeb8]{transform:translateY(100%);transition:all 1s ease-in-out}._progressBar[data-v-25fadeb8]{width:100%;height:15px;display:flex;align-items:center;justify-content:space-around}._progressBar>button[data-v-25fadeb8]{width:20px;height:20px;padding:5px;background:transparent;display:block;pointer-events:none}._progressBar>button[data-v-25fadeb8]:before{content:"";display:block;width:5px;height:5px;border-radius:50%;background:transparent;transition:all .3s ease-in-out}._progressBar>button[data-alreadyshown=true][data-v-25fadeb8]:before{background:#000}._keywords[data-v-25fadeb8]{height:4rem}',""]),e["default"]=n},78631:function(t,e,a){var o=a(45223);o.__esModule&&(o=o.default),"string"===typeof o&&(o=[[t.id,o,""]]),o.locals&&(t.exports=o.locals);var i=a(31982).Z;i("9a1ab002",o,!0,{sourceMap:!1,shadowMode:!1})},38985:function(t,e,a){var o=a(11666);o.__esModule&&(o=o.default),"string"===typeof o&&(o=[[t.id,o,""]]),o.locals&&(t.exports=o.locals);var i=a(31982).Z;i("354422cf",o,!0,{sourceMap:!1,shadowMode:!1})},48158:function(t,e,a){var o=a(10856);o.__esModule&&(o=o.default),"string"===typeof o&&(o=[[t.id,o,""]]),o.locals&&(t.exports=o.locals);var i=a(31982).Z;i("74873e2c",o,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=767.js.map