(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[255],{76255:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return o}});var s=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"_mediaMap"},[a("DisplayOnMap",{staticClass:"_mapContainer",attrs:{pins:e.pins,is_small:!1},on:{"update:opened_pin_path":function(t){return e.pinClicked(t)}}})],1)},n=[],i=(a(57658),{props:{medias:Array},components:{DisplayOnMap:()=>a.e(842).then(a.bind(a,93842))},data(){return{}},i18n:{messages:{fr:{}}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{pins(){return this.medias.reduce(((e,t,a)=>{if(t.$infos?.gps){const{latitude:s,longitude:n}=t.$infos?.gps;s&&n&&e.push({latitude:s,longitude:n,path:t.$path,label:a})}return e}),[])}},methods:{pinClicked(e){this.$emit("toggleMediaFocus",e)}}}),p=i,r=(a(88778),a(1001)),u=(0,r.Z)(p,s,n,!1,null,"2fbb97b1",null),o=u.exports},95360:function(e,t,a){"use strict";a.r(t);var s=a(8081),n=a.n(s),i=a(23645),p=a.n(i),r=p()(n());r.push([e.id,"._mediaMap[data-v-2fbb97b1]{width:100%;height:90%}",""]),t["default"]=r},88778:function(e,t,a){var s=a(95360);s.__esModule&&(s=s.default),"string"===typeof s&&(s=[[e.id,s,""]]),s.locals&&(e.exports=s.locals);var n=a(31982).Z;n("50177b4f",s,!0,{sourceMap:!1,shadowMode:!1})}}]);
//# sourceMappingURL=255.js.map