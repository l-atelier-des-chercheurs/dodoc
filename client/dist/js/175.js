"use strict";(self["webpackChunkapp"]=self["webpackChunkapp"]||[]).push([[175],{18175:function(e,t,s){s.r(t),s.d(t,{default:function(){return g}});var n=function(){var e=this,t=e.$createElement,s=e._self._c||t;return e.filtered_suggestions.length>0?s("div",[0===e.new_tag_name.length?s("button",{staticClass:"u-buttonLink",attrs:{type:"button"},on:{click:function(t){e.show_suggestions=!e.show_suggestions}}},[e._v(" "+e._s(e.$t("suggestions"))+" ")]):e._e(),e.new_tag_name.length>0||e.show_suggestions?[e.filtered_suggestions.length>0?s("TagsList",{attrs:{tags:e.filtered_suggestions,tag_type:e.tag_type,addable:!0,clickable:!0},on:{tagClick:function(t){return e.$emit("newTag",t)}}}):e._e()]:e._e()],2):e._e()},i=[],a={machines:["Brodeuse numérique","Découpeuse laser","Découpeuse vinyle","Fraiseuse numérique","Imprimante 3D","Imprimante résine","Imprimante laser noir et blanc","Imprimante laser couleur","Arduino","micro:bit","Makey Makey","Machine à coudre","Raspberry Pi","Capteurs","Actuateurs","Fer à souder","Outils à bois","Perçeuse","Ponçeuse","Scie","Scie à chantourner"],materials:["Vinyle","Flex","Silicone","Bois CP 3mm","Bois CP 5mm","Palettes","Plexi/PMMA","Carton","Papier","Caoutchouc Tampon","Tissu","Cuir","Résine","Filament PLA","Filament PETG","Filament NYLON","Filament ABS","Fil électrique","câbles Dupont","câble USB","Piles LR3","Piles LR6","Batterie Lithium 3,6V","Batterie 9V"]},r={props:{tag_type:String,new_tag_name:String,tags_to_exclude:Array},components:{},data(){return{suggestions:a,show_suggestions:!1}},created(){},mounted(){},beforeDestroy(){},watch:{new_tag_name(){0===this.new_tag_name&&(this.show_suggestions=!1)}},computed:{suggestions_list(){const e=this.suggestions[this.tag_type]||[];return e.sort(((e,t)=>e.localeCompare(t)))},filtered_suggestions(){return this.suggestions_list.filter((e=>this.twoStringsMatch(e,this.new_tag_name)&&!this.tags_to_exclude.some((t=>t===e))))}},methods:{}},u=r,o=s(1001),l=(0,o.Z)(u,n,i,!1,null,"77e28c15",null),g=l.exports}}]);
//# sourceMappingURL=175.js.map