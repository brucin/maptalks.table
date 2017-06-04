var TableToolbox = function(){

};

TableToolbox.prototype = {

    /**
     * 打开table样式设置面板
     */
    addTo: function(table) {
        this._width = 200;
        this._height = 38;
        this._table = table;
        this._tableData = table._tableRows;
        this._map = table.getMap();
        this.show(false);
        var me = this;
        this._table.on('dragend', function(){
            me.show(true);
        });
        this._table.on('hide dragstart', function(){
            me.hide();
        });
        this._table.on('contextmenu', function(event) {
            var context = event['context'];
            var cell = context['cell'];
            me.addContextmenuToCell(cell);
        });
        return this;
    },

    /**
     *显示label属性面板
     */
    show: function(isGlobal) {
        this.isGlobal = isGlobal;
        var center = this._table.getCenter();
        this._toolbox = this._createToolbox(this.isGlobal);
        this._toolbox.show(center);
        return this;
    },

    /**
     *hide table toolbox
     */
    hide: function() {
        this._toolbox.hide();
        return this;
    },

    /**
    * remove table toolbox
    */
    remove: function() {
        this.hide();
        delete this._width;
        delete this._height;
        delete this._map;
        delete this._toolbox;
    },

    _createToolbox: function(isGlobal) {
        var useCxColor = true;
        var table = this._table;
        var defaultSymbol = table.options['symbol'];
        if(!isGlobal) {
            var row = table._currentRow, col = table._currentCol;
            if(row < 0) row = 0;
            if(col < 0) col = 0;
            defaultSymbol = table.getCellSymbol(row, col);
        }
        //文字大小
        var textSizeInputDom = this._createTextSizeInputDom(defaultSymbol['textSize']);
        var me = this;
        var startPoint = this._table._getStretchStartPoint();
        var firstRowHeight = this._table._cellHeight;
        var isDynamic = this._table.isDynamic();
        var hideRefreshBtn = true;
        if(isGlobal&&isDynamic) {
            hideRefreshBtn = false;
        }
        var toolbox = new maptalks.Toolbox({
            dx : 0,
            dy : - firstRowHeight,
            autoPan : true,
            vertical : false,
            //工具项
            items: [
            {
                icon: 'demo/image/toolbox/trash.png',
                hidden: !isGlobal,
                width: 16,
                height: 16,
                mouseout: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/trash.png';
                },
                mouseover: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/trash_hover.png';
                },
                click : function(){
                    if(confirm('Are you sure delete this form?')){
                        me._table.remove();
                    }
                }
            }, {
                icon : 'demo/image/toolbox/paint.png',
                hidden: !useCxColor,
                width: 16,
                height: 16,
                html: true,
                click : function(event) {
                    me._showColorPanel(event, function(colorObj){
                        var color = colorObj.color();
                        if(color&&color!==''){
                            me._table.setTableStyle('markerFill', color, isGlobal);
                            me._table.setTableStyle('markerFillOpacity', 1, isGlobal);
                        } else {
                            me._table.setTableStyle('markerFillOpacity', 0.01, isGlobal);
                        }
                    });
                },
                mouseout: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/paint.png';
                },
                mouseover: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/paint_hover.png';
                }
            }, {
                icon: 'demo/image/toolbox/stroke.png',
                hidden: !useCxColor,
                width: 16,
                height: 16,
                html: true,
                click : function(event) {
                    me._showColorPanel(event, function(colorObj){
                        var color = colorObj.color();
                        if(color&&color!==''){
                            me._table.setTableStyle('markerLineColor',color, isGlobal);
                            me._table.setTableStyle('markerLineOpacity', 1, isGlobal);
                        } else {
                            me._table.setTableStyle('markerLineOpacity', 0.01, isGlobal);
                        }
                    });
                },
                mouseout: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/stroke.png';
                },
                mouseover: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/stroke_hover.png';
                }
            }, {
                icon: 'demo/image/toolbox/font.png',
                hidden: !useCxColor,
                width: 16,
                height: 16,
                html: true,
                trigger: 'click',
                click : function(event) {
                    me._showColorPanel(event, function(colorObj){
                        var color = colorObj.color();
                        if(color&&color!==''){
                            me._table.setTableStyle('textFill', color, isGlobal);
                        }
                    });
                },
                mouseout: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/font.png';
                },
                mouseover: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/font_hover.png';
                }
            }, {
                width: 25,
                height: 16,
                item: textSizeInputDom
            }, {
                icon: 'demo/image/toolbox/bold.png',
                width: 16,
                height: 16,
                trigger: 'click',
                mouseout: function(){
                    var target = me.getEventTarget(event);
                    if(target.nodeName.toLowerCase() === 'img' && target.src.indexOf('bold2normal.png')<0) {
                        target.src = 'demo/image/toolbox/bold.png';
                    }
                },
                mouseover: function(){
                    var target = me.getEventTarget(event);
                    if(target.nodeName.toLowerCase() === 'img' && target.src.indexOf('bold2normal.png')<0) {
                        target.src = 'demo/image/toolbox/bold_hover.png';
                    }
                },
                click : function(){
                    var target = me.getEventTarget(event);
                    var font = 'bolder';
                    var italicImage = target.parentNode.parentNode.nextSibling.firstChild.firstChild.src;
                    var italic;
                    if(italicImage.indexOf('italic2normal.png')>0) {
                        italic = ' italic';
                    }
                    if(target.src.indexOf('bold2normal.png')>0) {
                        font = 'normal';
                        target.src = 'demo/image/toolbox/bold.png';
                    } else {
                        target.src = 'demo/image/toolbox/bold2normal.png';
                    }
                    me._table.setTableStyle('textFont', font, isGlobal);
                    if(italic) {
                        if(font === 'normal') {
                            font = italic;
                        } else {
                            font += italic;
                        }
                        me._table.setTableStyle('textFont', font, isGlobal);
                    }
                }
            },
            {
                icon: 'demo/image/toolbox/italic.png',
                width: 16,
                height: 16,
                trigger: 'click',
                mouseout: function(){
                    var target = me.getEventTarget(event);
                    if(target.nodeName.toLowerCase() === 'img' && target.src.indexOf('italic2normal.png')<0) {
                        target.src = 'demo/image/toolbox/italic.png';
                    }
                },
                mouseover: function(){
                    var target = me.getEventTarget(event);
                    if(target.nodeName.toLowerCase() === 'img' && target.src.indexOf('italic2normal.png')<0) {
                        target.src = 'demo/image/toolbox/italic_hover.png';
                    }
                },
                click : function(){
                    var target = me.getEventTarget(event);
                    var font = 'italic';
                    var boldImage = target.parentNode.parentNode.previousSibling.firstChild.firstChild.src;
                    var bold;
                    if(boldImage.indexOf('bold2normal.png') >0) {
                        bold = ' bolder';
                    }
                    if(target.src.indexOf('italic2normal.png')>0) {
                        font = 'normal';
                        target.src = 'demo/image/toolbox/italic.png';
                    } else {
                        target.src = 'demo/image/toolbox/italic2normal.png';
                    }
                    if(bold) font += bold;
                    me._table.setTableStyle('textFont', font, isGlobal);
                }
            },
            {
                icon: 'demo/image/toolbox/left.png',
                width: 16,
                height: 16,
                trigger: 'click',
                click : function(){
                    me._table.setTableStyle('textAlign', 'left', isGlobal);
                }
            }, {
                icon: 'demo/image/toolbox/center.png',
                width: 16,
                height: 16,
                trigger: 'click',
                click : function(){
                    me._table.setTableStyle('textAlign', 'middle', isGlobal);
                }
            }, {
               icon: 'demo/image/toolbox/right.png',
               width: 16,
               height: 16,
               trigger: 'click',
                click : function(){
                   me._table.setTableStyle('textAlign', 'right', isGlobal);
               }
            }, {
                icon: 'demo/image/toolbox/close.png',
                width: 16,
                height: 16,
                mouseout: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/close.png';
                },
                mouseover: function(){
                    var target = event.target;
                    target.src = 'demo/image/toolbox/close_hover.png';
                },
                click : function(){
                    me._toolbox.hide();
                }
            }]
        });
        toolbox.addTo(this._table);
        return toolbox;
    },

    _showColorPanel: function(event, fn) {
        var top = event.clientY;
        var left = event.clientX;
        var location = {'top':top, 'left':left};
        this._createColorPanel(location, fn);
    },

    _createColorPanel: function(location, fn) {
        var inputDom = this._createColorInputDom();
        var me = this;
        var colorObj = $(inputDom).cxColor();
        colorObj.show(location['top'], location['left']);
        $(inputDom).on('change', function(){
            fn.call(me, colorObj);
            colorObj.remove();
        });
        me._table.getMap().on('mousedown', function() {
            colorObj.remove();
        },me);
        return inputDom;
    },

    _createColorInputDom: function() {
        var colorDom = maptalks.DomUtil.createEl('input', 'input_cxcolor');
        colorDom.readOnly = true;
        return colorDom;
    },

    _numberItems : function (callback) {
        var fn = callback;
        var nums =['12','14','16','18','20','30','60'];
        return this._createNumberMenuItems(nums,fn);
     },

     _createNumberMenuItems: function(nums,fn) {
         var items= new Array();
         for(var i=0,len=nums.length;i<len;i++) {
             var num = nums[i];
             var itemObj = {
                 item: this._createTextSizeSelectDom(num),
                 width: 20,
                 height: 20,
                 html: true,
                 click : function(param){
                     fn.call(this, param);
                 }
             };
             items.push(itemObj);
         }
         return items;
     },

    _createTextSizeSelectDom: function(textSize) {
        var textSizeDom = maptalks.DomUtil.createEl('span');
        textSizeDom.style.cssText = 'display:-moz-inline-box;display:inline-block;width:25px;height:16px;line-height:20px;color:#000000;font-weight:bolder;font-size:16px;';
        textSizeDom.innerText = textSize;
        return textSizeDom;
    },

     _createTextSizeInputDom: function(textSize) {
        var textSizeDom = maptalks.DomUtil.createEl('input');
        var textSize = textSize;
        textSizeDom.type = 'text';
        textSizeDom.maxLength = '2';
        textSizeDom.size = 2;
        textSizeDom.style.cssText = 'display:-moz-inline-box;display:inline-block;width:25px;height:16px;line-height:16px;color:#000000;font-weight:bolder;font-size:16px;';
        textSizeDom.value = textSize;
        var me = this;
        maptalks.DomUtil.on(textSizeDom, 'keyup', function(param){
            var target = param.target;
            var newValue = target.value;
            if(!parseInt(newValue)) {
                return;
            }
            var textSize = parseFloat(newValue);
            me._table.setTableStyle('textSize', textSize);
            textSizeDom.value=textSize;
        });
        return textSizeDom;
     },

    addContextmenuToCell: function(cell) {
        window.document.oncontextmenu = function(){ return false;}
        var menuWidth = 100;
        var colNum = cell._col;
        var rowNum = cell._row;
        var toolbox = this;
        var table = toolbox._table;
        var items = [];
        var x = event['clientX'];
        var y = event['clientY'];
        var screenPoint = new maptalks.Point(x, y);
        var coordinate = map.containerPointToCoordinate(screenPoint);
        if((rowNum === 0 && colNum === 0) || rowNum === 0) {
            /**
            * 显示header的动态图层，并且当前cell不是序号
            */
            if(table.options['header'] && table.options['dynamic'] && cell['dataIndex'] != 'maptalks_order'){
                items.push({'item': 'Setting Attr', 'click': function() {
                    setTimeout(function(){
                        table._showHeaderItemMenu(cell, coordinate);
                    },50);
                }});
                items.push('-');
            }
            if(colNum > 0) {
                items.push({'item': 'Add before', 'click': function() {
                    table.addCol(colNum, '', false);
                }});
            }
            items = items.concat([
                {'item': 'Add behind', 'click': function() {
                    table.addCol(colNum, '', true);
                }},
                '-',
                {'item': 'Move left', 'click': function() {
                    table.moveCol(colNum, 'left');
                }},
                {'item': 'Move right', 'click': function() {
                    table.moveCol(colNum, 'right');
                }},
                '-',
                {'item': 'Row style', 'click': function() {
                    table._currentRow = rowNum;
                    table._currentCol = -1;
                    toolbox.show(false);
                }},
                {'item': 'Column style', 'click': function() {
                    table._currentCol = colNum;
                    table._currentRow = -1;
                    toolbox.show(false);
                }},
                '-',
                {'item': 'Del column', 'click': function() {
                    table.removeCol(colNum);
                }}
            ]);
        } else if(colNum==0) {
            if(!table.options['dynamic']){
                items = items.concat([
                    {'item': 'Add above', 'click': function() {
                        table.addRow(rowNum, '', false);
                    }},
                    {'item': 'Add below', 'click': function() {
                        table.addRow(rowNum, '', true);
                    }},
                    '-'
                ]);
            }
            items = items.concat([
                    {'item': 'Move up', 'click': function() {
                        table.moveRow(rowNum, 'up');
                    }},
                    {'item': 'Move down', 'click': function() {
                        table.moveRow(rowNum, 'down');
                    }},
                    '-',
                    {'item': 'row style', 'click': function() {
                        table._currentRow = rowNum;
                        table._currentCol = -1;
                        toolbox.show(false);
                    }},
                    '-',
                    {'item': 'Del rows', 'click': function() {
                        table.removeRow(rowNum);
                    }}
            ]);
        } else {
            return false;
        }
        var menuOptions = {
            'width': menuWidth,
            'style': 'grey',
            'items' : items
        };
        cell.setMenu(menuOptions);
        cell.openMenu(coordinate);
    },

    getEventTarget: function (e){
         e=window.event || e;
        return e.srcElement || e.target;
    }
};
