(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[299],{22299:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return d}});var s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"_mediaMap"},[a("DisplayOnMap",{staticClass:"_mapContainer",attrs:{pins:e.pins,is_small:!1},on:{"update:opened_pin_path":function(t){return e.pinClicked(t)}}})],1)},n=[],i=(a(57658),{props:{medias:Array},components:{DisplayOnMap:()=>a.e(313).then(a.bind(a,18313))},data(){return{}},i18n:{messages:{fr:{}}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{pins(){return this.medias.reduce(((e,t)=>{if(t.$infos?.gps){const{latitude:a,longitude:s}=t.$infos?.gps;a&&s&&e.push({latitude:a,longitude:s,path:t.$path})}return e}),[])}},methods:{pinClicked(e){this.$emit("toggleMediaFocus",e)}}}),p=i,r=(a(84767),a(1001)),u=(0,r.Z)(p,s,n,!1,null,"54573dbb",null),d=u.exports},60152:function(e,t,a){"use strict";a.r(t);var s=a(8081),n=a.n(s),i=a(23645),p=a.n(i),r=p()(n());r.push([e.id,"._mediaMap[data-v-54573dbb]{width:100%;height:90%}",""]),t["default"]=r},84767:function(e,t,a){var s=a(60152);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[e.id,s,""]]),s.locals&&(e.exports=s.locals);var n=a(31982).Z;n("3e6ba584",s,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=299.js.map