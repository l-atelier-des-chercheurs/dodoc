(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[87],{60087:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return r}});var n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"_mediaMap"},[a("DisplayOnMap",{staticClass:"_mapContainer",attrs:{pins:e.pins,is_small:!1},on:{"update:opened_pin_path":function(t){return e.pinClicked(t)}}})],1)},i=[],s=(a(70560),{props:{medias:Array},components:{DisplayOnMap:()=>a.e(392).then(a.bind(a,78392))},data(){return{}},created(){},mounted(){},beforeDestroy(){},watch:{},computed:{pins(){return this.medias.reduce(((e,t)=>{if(t.$location){const{latitude:a,longitude:n}=t.$location;a&&n&&e.push({latitude:a,longitude:n,path:t.$path})}return e}),[])}},methods:{pinClicked(e){this.$emit("toggleMediaFocus",e)}}}),c=s,o=(a(18368),a(1001)),p=(0,o.Z)(c,n,i,!1,null,"cecc21e8",null),r=p.exports},59815:function(e,t,a){"use strict";a.r(t);var n=a(8081),i=a.n(n),s=a(23645),c=a.n(s),o=c()(i());o.push([e.id,"._mediaMap[data-v-cecc21e8]{width:100%;height:90%}",""]),t["default"]=o},18368:function(e,t,a){var n=a(59815);n.__esModule&&(n=n.default),"string"===typeof n&&(n=[[e.id,n,""]]),n.locals&&(e.exports=n.locals);var i=a(20730).Z;i("ca1e00aa",n,!0,{sourceMap:!1,shadowMode:!1})}}]);