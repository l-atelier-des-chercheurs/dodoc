(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[835],{16835:function(t,e,a){"use strict";a.r(e),a.d(e,{default:function(){return c}});var s=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("DLabel",{attrs:{str:"routine"}}),t.routine_is_started?[a("button",{staticClass:"u-button u-button_red u-button_big",attrs:{type:"button"},on:{click:t.stopRoutine}},[t._v(" stop routine ")])]:[a("button",{staticClass:"u-button u-button_red u-button_big",attrs:{type:"button"},on:{click:t.startRoutine}},[t._v(" start ")])]],2)},n=[],o={props:{path:String},components:{},data(){return{routine_is_started:!1}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{},methods:{async startRoutine(){this.routine_is_started=!0;await this.$api.createFolder({path:this.path,additional_meta:{title:"Z test project "+ +new Date,$admins:"everyone"}});this.routine_is_started&&this.startRoutine()},async stopRoutine(){this.routine_is_started=!1}}},r=o,u=(a(54994),a(1001)),i=(0,u.Z)(r,s,n,!1,null,"a9deb14a",null),c=i.exports},82624:function(t,e,a){"use strict";a.r(e);var s=a(8081),n=a.n(s),o=a(23645),r=a.n(o),u=r()(n());u.push([t.id,"._topLabel[data-v-a9deb14a]{text-align:left}",""]),e["default"]=u},54994:function(t,e,a){var s=a(82624);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[t.id,s,""]]),s.locals&&(t.exports=s.locals);var n=a(20730).Z;n("e6c175c2",s,!0,{sourceMap:!1,shadowMode:!1})}}]);