(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[754],{62709:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return f}});var s=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("div",{staticClass:"_formatView",class:{"is--serversidepreview":e.is_serversidepreview}},[r("transition",{attrs:{name:"fade_fast",mode:"out-in"}},[e.$root.is_loading?r("div",{key:"loader",staticClass:"u-divCentered"},[r("LoaderSpinner")],1):r("div",{key:"format",ref:"fsContainer"},[e.format.template&&"`story_with_sections`"!==e.format.template?e._e():r("div",[r("SectionWithPrint",{attrs:{publication:e.format}})],1)])])],1)},i=[],a={props:{},components:{SectionWithPrint:()=>r.e(156).then(r.bind(r,32156))},data(){return{format:null,is_fullscreen:!1,is_serversidepreview:!1}},created(){console.log("Loading FormatView")},async mounted(){let e;"true"===this.$route.query?.make_preview&&(this.is_serversidepreview=!0),this.$route.query?.sat&&(e=this.$route.query.sat),this.format=await this.$api.getPublicFolder({path:this.format_path,superadmintoken:e}).catch((e=>{this.fetch_format_error=e.response,this.$root.is_loading=!1})),this.$root.is_loading=!1},beforeDestroy(){},watch:{is_fullscreen(){}},computed:{format_path(){return`formats/${this.$route.params.format_slug}`}},methods:{}},o=a,n=(r(37017),r(1001)),u=(0,n.Z)(o,s,i,!1,null,"1f78149c",null),f=u.exports},98826:function(e,t,r){"use strict";r.r(t);var s=r(8081),i=r.n(s),a=r(23645),o=r.n(a),n=o()(i());n.push([e.id,"._formatView[data-v-1f78149c]{background:#fff;min-height:100%}",""]),t["default"]=n},37017:function(e,t,r){var s=r(98826);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[e.id,s,""]]),s.locals&&(e.exports=s.locals);var i=r(31982).Z;i("ef12e84a",s,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=FormatView.js.map