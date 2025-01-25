import{n}from"../build.js";const a={props:{small_img:String,large_img:String,width:Number,ratio:Number},components:{},data(){return{is_zoomed:!1,ro:void 0,cont_width:void 0,cont_height:void 0,pos_x:void 0,pos_y:void 0,padding:100}},created(){},mounted(){this.updateContSize(),this.ro=new ResizeObserver(this.updateContSize),this.ro.observe(this.$el)},beforeDestroy(){this.ro.unobserve(this.$el)},watch:{is_zoomed(e){e?this.$emit("zoomingIn"):this.$emit("zoomingOut")}},computed:{pos_x_percent(){return this.pos_x/this.cont_width},pos_y_percent(){return this.pos_y/this.cont_height},image_styles(){if(this.is_zoomed){const e=this.width?Math.max(2,this.width/this.cont_width/2):2,t=this.cont_width*e,o=t*this.ratio,s=this.pos_x_percent*-1*(t-this.cont_width+this.padding)+this.padding/2,i=this.pos_y_percent*-1*(o-this.cont_height+this.padding)+this.padding/2;return`
        max-width: none;
        width: ${t}px;
        height: ${o}px;
        transform: translate(${s}px, ${i}px);
        pointer-events: none;
        `}return`
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: contain;
`}},methods:{toggleZoom(){this.is_zoomed=!this.is_zoomed},updateContSize(){this.cont_width=this.$el.offsetWidth,this.cont_height=this.$el.offsetHeight},mouseMoved(e){let{offsetX:t,offsetY:o}=e.touches?e.touches[0]:e;this.pos_x=t,this.pos_y=o}}};var h=function(){var t=this,o=t._self._c;return o("div",{staticClass:"_imageZoom",attrs:{"data-zoomed":t.is_zoomed},on:{click:t.toggleZoom,mousemove:t.mouseMoved}},[o("transition",{attrs:{name:"fade_fast",mode:"in-out"}},[t.is_zoomed?o("img",{key:"zoom-"+t.is_zoomed,style:t.image_styles,attrs:{src:t.large_img}}):o("img",{key:"zoom-"+t.is_zoomed,style:t.image_styles,attrs:{src:t.small_img}})]),o("transition",{attrs:{name:"slideupFade",mode:"out-in"}},[t.is_zoomed?t._e():o("div",{staticClass:"_clickToZoomBtn"},[o("button",{staticClass:"u-button u-button_white u-button_small",attrs:{type:"button"},on:{click:function(s){return s.stopPropagation(),t.toggleZoom.apply(null,arguments)}}},[o("b-icon",{attrs:{icon:"zoom-in"}}),t._v(" "+t._s(t.$t("click_to_zoom"))+" ")],1)])])],1)},r=[],_=n(a,h,r,!1,null,"e0c8136b");const m=_.exports;export{m as default};
