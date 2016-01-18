/**
 * @fileoverview Tooltip，连接Tooltip和其触发节点，并根据屏幕空间计算显示位置
 * @author neekey<ni184775761@gmail.com>
 * @module tooltip
 **/
KISSY.add(function ( S, Node ) {

    var ARROW_HOOK = '.J_TooltipArrow';
    var REFER_POS = 'center';
    var TOOLTIP_ALIGN = 'center';
    var GAP = 0;
    var ARROW_CLSES = {
        top: 'arrow-top',
        left: 'arrow-left',
        right: 'arrow-right',
        bottom: 'arrow-bottom'
    };
    var TOOLTIP_DISAPPEAR_DELAY = 200;
    var TOOLTIP_DISAPPEAR_TIMER_ATTR = 'data-hide-timer';

    /**
     * 添加静态方法
     */
    return {

        attach: function( cfg ){
            var self = this;
            var triggers = Node.all( cfg.trigger );
            var tooltip = Node.all( cfg.tooltip );
            var onShow = cfg.onShow;

            triggers.each(function( trigger ){
                trigger = Node.one( trigger );
                // 参考点只能有一个
                var refer = Node.one( trigger.all( cfg.refer ) ) || trigger;

                cfg.onShow = function( t, tl ){
                    self.locate( refer, tooltip, cfg );
                    onShow && onShow( t, tl );
                };

                self.connect( trigger, tooltip, cfg );
            });
        },

        freeze: function( cfg ){
            var tooltip = Node.one( cfg.tooltip );
            var refer = Node.one( cfg.refer );
            this.locate( refer, tooltip, cfg );
            Node.one( tooltip ).show();
        },

        /**
         * 连接触发节点和tooltip，hover上trigger时，显示tooltip，移开后不马上消失..等烦躁的逻辑
         * @param trigger
         * @param tooltip
         * @param option
         * @param {Function} option.onHide 当Tooltip显示时的逻辑
         * @param {Function} option.onShow 当Tooltip消失时逻辑
         */
        connect: function( trigger, tooltip, option ){
            trigger = Node.one( trigger );
            tooltip = Node.one( tooltip );
            option = option || {};
            var hideCb = option.onHide;
            var showCb = option.onShow;
            var beforeShow = option.beforeShow;

            trigger.on( 'mouseenter', function(){
                beforeShow && beforeShow( trigger, tooltip );
                showCb && showCb( trigger, tooltip );
                clearTimeout( tooltip.attr( TOOLTIP_DISAPPEAR_TIMER_ATTR ) );
                tooltip.show();
            });

            trigger.on( 'mouseleave', function(){
                tooltip.attr( TOOLTIP_DISAPPEAR_TIMER_ATTR, setTimeout(function(){
                    hideCb && hideCb( trigger, tooltip );
                    tooltip.hide();
                }, TOOLTIP_DISAPPEAR_DELAY));
            });

            tooltip.on( 'mouseover', function(){
                tooltip.show();
                clearTimeout( tooltip.attr( TOOLTIP_DISAPPEAR_TIMER_ATTR ) );
            });

            tooltip.on( 'mouseleave', function(){
                hideCb && hideCb( trigger, tooltip );
                tooltip.hide();
            });
        },

        /**
         * 根据参考点位置确定Tooltip的显示位置
         * @param {Element} refer 参考点
         * @param {Element} tooltip 作为Tooltip的节点
         * @param option
         * @param {CSSSelector} option.arrowHook 作为Tooltip中箭头的钩子
         * @param {String} option.arrow Align箭头与参考节点的位置关系
         * @param {String} option.align Tooltip和参考节点的位置关系
         * @param {Element=body} option.container Tooltip的显示相对节点（插入节点）
         * @param {String} option.position （可以强制制定tooltip的显示位置）
         */
        locate: function( refer, tooltip, option ){

            refer = Node.one( refer );
            tooltip = Node.one( tooltip );
            option = option || {};
            var container = Node.one( option.container );
            var customPosition = option.position;

            // 默认显示Tooltip，以计算宽高
            tooltip.css( {
                visibility: 'hidden',
                position: 'absolute'
            });
            tooltip.show();

            var gap = option.gap || GAP;
            var arrowHook = option.arrowHook || ARROW_HOOK;
            var referPos = option.arrowAlign || REFER_POS;
            var tooltipAlign = option.align || TOOLTIP_ALIGN;
            // 箭头
            var tooltipArrow = tooltip.all( arrowHook );

            // 获取窗口/页面高度，页面滚动信息等
            var winHeight = Node.one( window ).height();
            var winWidth = Node.one( window ).width();
            var docScrollTop = S.DOM.scrollTop();
            var docScrollLeft = S.DOM.scrollLeft();

            // 若指定了父容器
            if( container ){
                winHeight = container.outerHeight();
                winWidth = container.outerWidth();
                docScrollTop = container.scrollTop();
                docScrollLeft = container.scrollLeft();
            }

            // 获取refer的位置，宽高
            // 位置： { left:, top: }
            var referCoord = refer.offset();
            var referWidth = refer.outerWidth();
            var referHeight = refer.outerHeight();

            if( container ){
                referCoord.left = referCoord.left - container.offset().left;
                referCoord.top = referCoord.top - container.offset().top;
            }

            // 获取tooltip的信息
            var tooltipWidth = tooltip.outerWidth();
            var tooltipHeight = tooltip.outerHeight();
            var arrowWidth = tooltipArrow.outerWidth();
            var arrowHeight = tooltipArrow.outerHeight() / 2;

            // 用于调试，打印相关计算数据
//            console.log( referCoord, referWidth, referHeight );
//            console.log( tooltipWidth, tooltipHeight, arrowWidth, arrowHeight );

            tooltip.hide();
            tooltip.css( 'visibility', 'visible' );

            // 这是结果
            var result = {
                top: null,
                left: null,
                arrowPos: null,
                arrowTop: null,
                arrowLeft: null
            };

            var results = {};

            // 计算各个位置的可行

            // 下方
            // ----------------

            result = {};

            result.top = referCoord.top + referHeight + gap + arrowHeight;

            // 居中
            if( tooltipAlign == 'center' ){
                result.left = referCoord.left + ( referWidth - tooltipWidth ) / 2;
            }
            // 左对齐
            else if( tooltipAlign == 'left' ){
                result.left = referCoord.left;
            }
            // 右对齐
            else {
                result.left = referCoord.left + ( referWidth - tooltipWidth );
            }

            result.arrowPos = 'top';

            if( referPos == 'center' ){
                result.arrowLeft = referCoord.left + ( referWidth / 2 ) - ( arrowWidth / 2 );
            }
            else if( referPos == 'left' ){
                result.arrowLeft = referCoord.left - ( arrowWidth / 2 );
            }
            else {
                result.arrowLeft = referCoord.left + referWidth - ( arrowWidth / 2 )
            }

            results.bottom = result;

            // 上方
            // --------------
            result = {};
            result.top = referCoord.top -  gap - tooltipHeight - arrowHeight;

            // 居中
            if( tooltipAlign == 'center' ){
                result.left = referCoord.left + ( referWidth - tooltipWidth ) / 2;
            }
            // 左对齐
            else if( tooltipAlign == 'left' ){
                result.left = referCoord.left;
            }
            // 右对齐
            else {
                result.left = referCoord.left + ( referWidth - tooltipWidth );
            }

            result.arrowPos = 'bottom';

            if( referPos == 'center' ){
                result.arrowLeft = referCoord.left + ( referWidth / 2 ) - ( arrowWidth / 2 );
            }
            else if( referPos == 'left' ){
                result.arrowLeft = referCoord.left - ( arrowWidth / 2 );
            }
            else {
                result.arrowLeft = referCoord.left + referWidth - ( arrowWidth / 2 )
            }

            results.top = result;

            // 左边
            // --------------

            result = {};
            result.left = referCoord.left -  gap - tooltipWidth - arrowWidth;

            // 居中
            if( tooltipAlign == 'center' ){
                result.top = referCoord.top + ( referHeight - tooltipHeight ) / 2;
            }
            // left 在这个场景中对应的是 上对齐
            else if( tooltipAlign == 'left' ){
                result.top = referCoord.top;
            }
            // 右对齐
            else {
                result.top = referCoord.top + ( referHeight - tooltipHeight );
            }

            result.arrowPos = 'right';

            // 箭头居中
            if( referPos == 'center' ){
                result.arrowTop = referCoord.top + ( referHeight / 2 ) - ( arrowHeight / 2 );
            }
            // left 在这个场景中对应的是 上对齐
            else if( referPos == 'left' ){
                result.arrowTop = referCoord.top - ( arrowHeight / 2 );
            }
            else {
                result.arrowTop = referCoord.top + referHeight - ( arrowHeight / 2 )
            }

            results.left = result;

            // 右边
            // ----------------

            result = {};
            result.left = referCoord.left + referWidth + gap + arrowWidth;

            // 居中
            if( tooltipAlign == 'center' ){
                result.top = referCoord.top + ( referHeight - tooltipHeight ) / 2;
            }
            // left 在这个场景中对应的是 上对齐
            else if( tooltipAlign == 'left' ){
                result.top = referCoord.top;
            }
            // 右对齐
            else {
                result.top = referCoord.top + ( referHeight - tooltipHeight );
            }

            result.arrowPos = 'left';

            // 箭头居中
            if( referPos == 'center' ){
                result.arrowTop = referCoord.top + ( referHeight / 2 ) - ( arrowHeight / 2 );
            }
            // left 在这个场景中对应的是 上对齐
            else if( referPos == 'left' ){
                result.arrowTop = referCoord.top - ( arrowHeight / 2 );
            }
            else {
                result.arrowTop = referCoord.top + referHeight - ( arrowHeight / 2 )
            }

            results.right = result;

            // 根据上面四个方向的计算结果，进行决定使用哪个位置进行展示
            // 若已经制定了显示位置，则使用显示位置
            if( customPosition && results[ customPosition ] ){
                result = results[ customPosition ];
            }
            else {
                // 针对四种情况，做权衡，使用哪一种（哪一种呈现的面积最大）
                var resultPos;
                var resultArea;
                var maxArea;
                var maxPos;

                for( resultPos in results ){
                    result = results[ resultPos ];
                    resultArea = this._calculateArea( docScrollTop, docScrollLeft, winWidth, winHeight, result.top, result.left, tooltipWidth, tooltipHeight );
                    resultArea = resultArea.area;
                    if( !maxPos || resultArea > maxArea ){
                        maxPos = resultPos;
                        maxArea = resultArea;
                    }
                }

                result = results[ maxPos ];
            }

            // 处理箭头坐标（相对Tooltip）
            if( result.arrowTop !== null ){
                if( result.top > result.arrowTop ){
                    result.arrowTop = result.top + arrowHeight;
                }
                if( result.arrowTop + arrowHeight > result.top + tooltipHeight ){
                    result.arrowTop = result.top + tooltipHeight - arrowHeight * 3;
                }
            }

            if( result.arrowTop !== null ){
                // 重新计算相对于tooltip的top
                result.arrowTop = result.arrowTop - result.top;
            }

            if( result.arrowLeft !== null ) {
                if(result.left > result.arrowLeft ){
                    result.arrowLeft = result.left + arrowWidth;
                }
                if( result.arrowLeft + arrowWidth > result.left + tooltipWidth ){
                    result.arrowLeft = result.left + tooltipWidth - arrowWidth * 3;
                }
            }

            if( result.arrowLeft !== null ){
                // 重新计算相对于tooltip的left
                result.arrowLeft = result.arrowLeft - result.left;
            }

            // 渲染结果
            // ------------------

            // 首先将Tooltip放置到全局下
            if( container ){
                container.css( 'position', 'relative' );
                container.append( tooltip );
            }
            else {
                Node.one( document.body ).append( tooltip );
            }

            // 设置Tooltip位置
            tooltip.css({
                top: result.top,
                left: result.left
            });

            // 设置Arrow方向
            tooltipArrow.removeClass( ARROW_CLSES.top );
            tooltipArrow.removeClass( ARROW_CLSES.left );
            tooltipArrow.removeClass( ARROW_CLSES.right );
            tooltipArrow.removeClass( ARROW_CLSES.bottom );
            tooltipArrow.addClass( ARROW_CLSES[ result.arrowPos ] );

            // 设置Arrow位置
            // 使用 '' 来清楚行内样式，这样当某个属性没有被设置过时，则自然使用class的样式
            tooltipArrow.css({
                top: result.arrowTop || '',
                left: result.arrowLeft || ''
            });
        },

        /**
         * 计算两个正方形的重叠面积
         * @param conTop
         * @param conLeft
         * @param conWidth
         * @param conHeight
         * @param top
         * @param left
         * @param width
         * @param height
         * @returns {{area: number, ifIn: boolean}}
         */
        _calculateArea: function( conTop, conLeft, conWidth, conHeight, top, left, width, height ){

            var TOP = conTop < top ? top : conTop;
            var TOP_IN = TOP == top;
            var LEFT = conLeft < left ? left : conLeft;
            var LEFT_IN = LEFT == left;
            var BOTTOM = conTop + conHeight > top + height ? top + height : conTop + conHeight;
            var BOTTOM_IN = BOTTOM == top + height;
            var RIGHT = conLeft + conWidth > left + width ? left + width : conLeft + conWidth;
            var RIGHT_IN = RIGHT == left + width;

            return {
                area: ( RIGHT - LEFT ) * ( BOTTOM - TOP ),
                ifIn: ( TOP_IN && LEFT_IN && BOTTOM_IN && RIGHT_IN )
            };
        }
    };
}, { requires: [
    'node'
]});