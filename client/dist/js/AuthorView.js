(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[317],{20269:function(t,a,s){"use strict";s.r(a),s.d(a,{default:function(){return d}});var o=function(){var t=this,a=t._self._c;return a("div",{staticClass:"_authorView"},[a("div",{staticClass:"_backBtn"},[a("router-link",{staticClass:"u-buttonLink",attrs:{to:"/"}},[a("b-icon",{attrs:{icon:"arrow-left-short"}}),t._v(" "+t._s(t.$t("home"))+" ")],1),a("router-link",{staticClass:"u-buttonLink",attrs:{to:"/@"}},[a("b-icon",{attrs:{icon:"slash"}}),t._v(" "+t._s(t.$t("list_of_accounts"))+" ")],1)],1),t.is_loading?a("div",{key:"loader",staticClass:"_spinner"},[a("LoaderSpinner")],1):[a("div",{staticClass:"_card"},[a("AuthorCard",{key:t.author.$path,staticClass:"u-spacingBottom",attrs:{author:t.author,context:"full"}})],1)]],2)},r=[],i=s(90098),e={props:{},components:{AuthorCard:i.A},data(){return{author:void 0,is_loading:!0,fetch_author_error:!1}},created(){},async mounted(){await this.listAuthor(),this.$api.join({room:this.author.$path})},beforeDestroy(){this.$api.leave({room:this.author.$path})},watch:{},computed:{},methods:{async listAuthor(){const t=this.createPath({author_slug:this.$route.params.author_slug}),a=await this.$api.getFolder({path:t}).catch((t=>{this.fetch_author_error=t.response,this.is_loading=!1}));this.is_loading=!1,this.author=a}}},n=e,c=(s(87928),s(81656)),u=(0,c.A)(n,o,r,!1,null,"d6d59ade",null),d=u.exports},88342:function(t,a,s){"use strict";s.r(a);var o=s(31601),r=s.n(o),i=s(76314),e=s.n(i),n=e()(r());n.push([t.id,"._authorView[data-v-d6d59ade]{padding:calc(var(--spacing)*1);padding-bottom:calc(var(--spacing)*6)}._card[data-v-d6d59ade]{max-width:400px;margin:0 auto}._backBtn[data-v-d6d59ade]{display:flex;gap:calc(var(--spacing)/4);margin-bottom:calc(var(--spacing)*2)}",""]),a["default"]=n},87928:function(t,a,s){var o=s(88342);o.__esModule&&(o=o.default),"string"===typeof o&&(o=[[t.id,o,""]]),o.locals&&(t.exports=o.locals);var r=s(43197).A;r("db0ff8a2",o,!0,{sourceMap:!1,shadowMode:!1})}}]);