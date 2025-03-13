import{n as a}from"../build.js";const n={props:{publication:Object,force_layout_mode:String},components:{},data(){return{edit_mode:!1,is_saving:!1,can_edit:!0,new_layout_mode:void 0,new_page_width:void 0,new_page_height:void 0}},created(){},mounted(){this.initValues()},beforeDestroy(){},watch:{new_layout_mode(){const{width:s,height:t}=this.format_options[0];this.new_page_width||(this.new_page_width=s),this.new_page_height||(this.new_page_height=t)}},computed:{format_options(){return this.new_layout_mode==="print"?[{key:"A4_portrait",text:this.$t("A4_portrait"),width:210,height:297},{key:"A4_landscape",text:this.$t("A4_landscape"),width:297,height:210},{key:"A5_portrait",text:this.$t("A5_portrait"),width:148,height:210},{key:"A5_landscape",text:this.$t("A5_landscape"),width:210,height:148},{key:"custom",text:this.$t("custom")}]:[{key:"recommended",text:this.$t("recommended"),width:960,height:700},{key:"desktop1080",text:this.$t("desktop_1080"),width:1920,height:1080},{key:"desktop720",text:this.$t("desktop_720"),width:1280,height:720},{key:"custom",text:this.$t("custom")}]},predefined_format_from_width(){const s=this.format_options.find(t=>t.width===this.new_page_width&&t.height===this.new_page_height);return s?s.key:"custom"},unit(){return this.new_layout_mode==="screen"?"px":"mm"}},methods:{initValues(){this.force_layout_mode?this.new_layout_mode=this.force_layout_mode:this.new_layout_mode=this.publication.layout_mode||"print",this.new_page_width=this.publication.page_width||210,this.new_page_height=this.publication.page_height||297},enableEditMode(){this.edit_mode=!0},setSizeFromFormat(s){const t=s.target.value;if(t==="custom")return;const e=this.format_options.find(i=>i.key===t);this.new_page_width=e.width,this.new_page_height=e.height},cancel(){this.edit_mode=!1,this.is_saving=!1,this.initValues()},async updateSize(){this.is_saving=!0;try{const s={layout_mode:this.new_layout_mode,page_width:this.new_page_width,page_height:this.new_page_height};await this.$api.updateMeta({path:this.publication.$path,new_meta:s}),this.edit_mode=!1,this.is_saving=!1}catch(s){this.is_saving=!1,this.edit_mode=!1,this.$alertify.closeLogOnClick(!0).delay(4e3).error(this.$t("couldntbesaved")),this.$alertify.closeLogOnClick(!0).error(s.response.data)}}}};var o=function(){var t=this,e=t._self._c;return e("div",{staticClass:"_widthHeightField"},[e("fieldset",[e("legend",{staticClass:"u-label"},[t._v(t._s(t.$t("format")))]),t.force_layout_mode?t._e():[e("DLabel",{staticClass:"_label",attrs:{str:t.$t("document_type"),tag:"h3"}}),e("br"),t._l([{key:"print",label:t.$t("print"),instructions:t.$t("print_instr")},{key:"screen",label:t.$t("screen"),instructions:t.$t("screen_instr")}],function(i){return e("div",{key:i.key},[e("div",[e("input",{directives:[{name:"model",rawName:"v-model",value:t.new_layout_mode,expression:"new_layout_mode"}],attrs:{type:"radio",name:i.key,id:"radioi-lmode-"+i.key,disabled:!t.edit_mode},domProps:{value:i.key,checked:t._q(t.new_layout_mode,i.key)},on:{change:function(d){t.new_layout_mode=i.key}}}),e("label",{attrs:{for:"radioi-lmode-"+i.key}},[t._v(" "+t._s(i.label)),e("br"),e("small",{domProps:{innerHTML:t._s(i.instructions)}})])]),e("br")])})],e("transition",{attrs:{name:"fade",mode:"out-in"}},[e("div",{key:t.new_layout_mode},[e("DLabel",{staticClass:"_label",attrs:{str:t.$t("format"),tag:"h3",instructions:t.$t("format_instructions")}}),e("br"),[e("select",{attrs:{disabled:!t.edit_mode},domProps:{value:t.predefined_format_from_width},on:{change:t.setSizeFromFormat}},t._l(t.format_options,function(i){return e("option",{key:i.key,domProps:{value:i.key,textContent:t._s(i.text)}})}),0),e("br")],e("div",{staticClass:"u-sameRow"},[e("div",{},[e("DLabel",{attrs:{str:t.$t("width")}}),e("div",{staticClass:"u-inputGroup"},[e("input",{directives:[{name:"model",rawName:"v-model.number",value:t.new_page_width,expression:"new_page_width",modifiers:{number:!0}}],attrs:{type:"number",disabled:!t.edit_mode},domProps:{value:t.new_page_width},on:{input:function(i){i.target.composing||(t.new_page_width=t._n(i.target.value))},blur:function(i){return t.$forceUpdate()}}}),e("span",{staticClass:"u-suffix",domProps:{textContent:t._s(t.unit)}})])],1),e("div",{},[e("DLabel",{attrs:{str:t.$t("height")}}),e("div",{staticClass:"u-inputGroup"},[e("input",{directives:[{name:"model",rawName:"v-model.number",value:t.new_page_height,expression:"new_page_height",modifiers:{number:!0}}],attrs:{type:"number",disabled:!t.edit_mode},domProps:{value:t.new_page_height},on:{input:function(i){i.target.composing||(t.new_page_height=t._n(i.target.value))},blur:function(i){return t.$forceUpdate()}}}),e("span",{staticClass:"u-suffix",domProps:{textContent:t._s(t.unit)}})])],1)])],2)]),e("br"),t.can_edit&&!t.edit_mode?e("EditBtn",{on:{click:t.enableEditMode}}):t._e(),t.edit_mode?e("div",{staticClass:"_footer"},[e("SaveCancelButtons",{staticClass:"_scb",attrs:{is_saving:t.is_saving},on:{save:t.updateSize,cancel:t.cancel}})],1):t._e()],2)])},r=[],_=a(n,o,r,!1,null,"859b5dbe");const u=_.exports;export{u as W};
