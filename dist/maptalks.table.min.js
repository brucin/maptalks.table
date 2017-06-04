(function () {
'use strict';
'0.1.1';
(function () {
    'use strict';

    var maptalks;

    var nodeEnv = typeof module !== 'undefined' && module.exports;
    if (nodeEnv)  {
        maptalks = require('maptalks');
    } else {
        maptalks = window.maptalks;
    }

    /**
     * @classdesc
     * Represents a table component for geometries.
     * @class
     * @extends maptalks.Class
     * @name Table
     */
    maptalks.Table = maptalks.Class.extend({
        includes: [maptalks.Eventable, maptalks.Handlerable],

        /**
         * @cfg {Object} exceptionDefs 异常信息定义
         */
        'exceptionDefs':{
            'en-US':{
                'NEED_DATA':'You must set data to Table options.',
                'NEED_COLUMN':'You must set columns to Table options.'
            },
            'zh-CN':{
                'NEED_DATA':'你必须为Table指定data。',
                'NEED_COLUMN':'你必须为Table指定columns。'
            }
        },

        options:{
             'draggable': true
        },

        /**
         * 表格构造函数
         * @constructor
         * @param {Object} options 设置
         {
            'title': 'title',
            'columns': [
                {header:'Name', dataIndex: 'name', type: 'string'},
                {header:'Birth', dataIndex: 'birth', type: 'data'},
                {header:'Age', dataIndex: 'age', type: 'number'},
                {header:'Marry', dataIndex: 'marry', type: 'boolean', trueText:'Yes', falseText: 'No'}
            ],
            'data': [
                {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'},
                {name:'Peter', birth:'1985-5-1', age: 30, marry: 'true'},
                {name:'Mary', birth:'2000-6-1', age: 15, marry: 'false'}
            ],
            'headerSymbol' :{
                'lineColor': '#ffffff',
                'fill': '#4e98dd',
                'textFaceName': 'monospace',
                'textSize': 12,
                'textFill': '#ebf2f9',
                'textWrapWidth': 100
            },
            'symbol': {
                'lineColor': '#ffffff',
                'fill': '#4e98dd',
                'textFaceName': 'monospace',
                'textSize': 12,
                'textFill': '#ebf2f9',
                'textWrapWidth': 100
            },
            'position': {
                'x': 121.489935,
                'y': 31.24432
            },
            'width': 300,
            'height': 300,
            'draggable': true,
            'editable': true,
            'header': true,
            'order': true,
            'startNum' : 1,
            'dynamic': false,
            'layerId' : null
         }
         * @returns {maptalks.Table}
         */
        initialize: function(options) {
            this.setOptions(options);
            this.options['visible'] = true;
            this.options['editing'] = false;
            this.options['showOrderNumber'] = true;
            this.options['startNum'] = this.options['startNum'] || 1;
            if(!this.options['data']&&this.options['data'].length==0)  {throw new Error(this.exceptions['NEED_DATA']);}
            if(!this.options['columns']&&this.options['columns'].length==0)  {throw new Error(this.exceptions['NEED_COLUMN']);}
            //包含序号列
            var orderTitle = this.options['orderTitle'];
            if(!orderTitle) orderTitle = 'No.'
            if(this.options['order']) {
                var startNum = parseInt(this.options['startNum']);
                var orderCol = {header: orderTitle, dataIndex: 'maptalks_order', type: 'number'};
                this.options['columns'].unshift(orderCol);

                // var dataArray = this.options['data'];
                // for(var i = 0, len = dataArray.length; i < len; i ++) {
                //     dataArray[i]['maptalks_order'] = i + startNum;
                // }
            }
            this._initalColumns = this.options['columns'];
            this._headAttributes = this.options['attributes'];
            this._columns = this._getColumns();
            this._colNum = this._columns.length;
            this._data = this.options['data'];
            this._initalData = this.options['data'];
            this._rowNum = this._data.length;
            //包含表头
            if(this.options['header']) {
                this._rowNum += 1;
            }
            this.tableWidth = this.options['width']||100;
            this.tableHeight = 0;
            this._cellWidth = this.options['width']/this._colNum;
            this._cellHeight = this.options['height']/this._rowNum;
            this._currentRow = -1;
            this._currentCol = -1;
            this._geometryNumLabels = new Array();
            this._rowHeights = new Array();
            this._colWidths = new Array();
            return this;
        },

        toJSON: function(){
            return {
                'options': this.options,
                'colums' : this._columns,
                'attributes' : this._headAttributes,
                'colNum': this._colNum,
                'data': this._dataToJSON(),
                'rowNum': this._rowNum,
                'rowHeights': this._rowHeights,
                'colWidths': this._colWidths,
                'tableWidth' : this.tableWidth,
                'tableHeight' : this.tableHeight,
                'tableSymbols': this.tableSymbols
            };
        },

        _dataToJSON :function () {
            var result = new Array();
           if(this.options['dynamic'] && this._data && this._data.length > 0) {
                var item;
                for(var i = 0, len = this._data.length; i < len; i++) {
                    item = this._data[i];
                    result.push(item);
                }
            } else {
                result = this._data;
            }
            return result;
        },

        initByJson: function(json) {
            var options = json['options'];
            this._columns = json['colums'];
            this._colNum = json['colNum'];
            this._headAttributes = json['attributes'];
            this._data = [];
            //处理其中geometry
            var data = json['data'];
            if(options['dynamic'] && data && data.length > 0) {
                var item, geoJson, geometry;
                for(var i = 0, len = data.length; i < len; i++) {
                    item = data[i];
                    geoJson = item['geometry'];
                    if(geoJson) {
                        geometry = maptalks.Geometry.fromJSON(geoJson);
                        item['coordinate'] = geometry.getCenter();
                        item['geometry'] = null;
                        delete item['geometry'];
                    }
                    this._data.push(item);
                }
            } else {
                this._data = data;
            }
            this._rowNum = json['rowNum'];
            this._rowHeights = json['rowHeights'];
            this._colWidths = json['colWidths'];
            this.tableWidth = json['tableWidth'];
            // this.tableHeight = json['tableHeight'];
            this._tableRows = this._data;
            this.tableSymbols = json['tableSymbols'];
            return this;
        },

        getId: function() {
            return this.options['id'];
        },

        isDynamic: function() {
            return this.options['dynamic'];
        },

        getLayerId: function() {
            return this.options['layerId'];
        },

        getType: function() {
            return 'MAPTALKS_TABLE';
        },

        getData: function() {
            var result = new Array();
            for (var i = 0; i < this._data.length; i++) {
                result.push(this._data[i]);
            }
            return result;
        },

        getMaxOrder: function() {
            var maxNum = this._data.length + this.options['startNum'] || 1 - 1;
            return maxNum;
        },

        setStartNum: function(num) {
            var startNum = this.options['startNum'] || 1;
            if(this.options['order'] && num !== startNum) {
                this.options['startNum'] = num;
                this._resetOrderNum(num);
                this.fire('orderchanged', this);
            }
        },

        /**
         * add table to layer.
         * @param {maptalks.Layer} layer
         */
        addTo: function (layer) {
            if(!layer) {return;}
            this._layer = layer;
            //init row height and col width
            this._initRowHeightAndColWidth();
            if(!this.tableSymbols) {
                this.tableSymbols = this._initCellSymbol();
            }
            this._tableRows = this.createTable();
            this._addToLayer(this._tableRows,true);
            this.addStretchLine();
            this._addEventsToTable();
            return this;
        },

        _addEventsToTable: function() {
            if(this.options['editable']) {
                this.on('dblclick', function(event) {
                    var cell = event.context['cell'];
                    if(cell) {
                        this._addEditEventToCell(cell);
                    }
                });
            }
        },

        getLayer: function() {
            return this._layer;
        },

        getMap: function() {
            if(this._layer)
                return this._layer.getMap();
            else
                return null;
        },

        getCenter: function() {
            return this.getCoordinates();
        },

        getCoordinates: function() {
            var postion = this.options['position'];
            var coordiante = new maptalks.Coordinate(postion.x, postion.y);
            return coordiante;
        },

        animate: function(style, options, callback) {
            var cells = this.getAllCells();
            if(cells && cells.length>0) {
                for(var i=0,length=cells.length;i<length;i++) {
                    cells[i].animate(style, options, callback);
                }
            }
        },

        _initRowHeightAndColWidth: function() {
            if(this._rowHeights.length === 0) {
                var rowNum = this._rowNum;
                for(var i=0; i< rowNum; i++) {
                    this._rowHeights[i] = this._cellHeight;
                }
            }
            if(this._colWidths.length === 0) {
                for(var i=0;i<this._colNum;i++) {
                    this._colWidths[i] = this._cellWidth;
                }
            }
        },

        _initCellSymbol: function() {
            var tableSymbols = {};
            var headerSymbol = this.options['headerSymbol'] || this.options['symbol'];
            var defaultSymbol = this.options['symbol'];
            for(var i = 0; i < this._rowNum; i++) {
                if(i ===0 &&this.options['header']) {
                    for(var j = 0; j < this._colNum;j++) {
                        tableSymbols[i+'_'+j] = headerSymbol;
                    }
                } else {
                    for(var j = 0; j < this._colNum;j++) {
                        tableSymbols[i+'_'+j] = defaultSymbol;
                    }
                }
            }
            return tableSymbols;
        },

        /**
         * set options.
         * @param {Object} options
         * @expose
         */
        setOptions: function(options) {
            maptalks.Util.setOptions(this, options);
            if (!this.options['width']) this.options['width'] = 300;
            if (!this.options['height']) this.options['width'] = 300;
            if (!this.options['header'] && this.options['header']!==false) this.options['header'] = true;
            if (!this.options['order'] && this.options['order']!==false) this.options['order'] = true;
            return this;
        },

        hide: function(){
            var row;
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(!row) return;
                for(var j=0,rowLength=row.length;j<rowLength;j++) {
                    if(row[j].isEditingText()) {
                        row[j].endEditText();
                    }
                    row[j].hide();
                }
            }
            this.removeStretchLine();
            this.fire('hide', this);
            this.options['visible'] = false;
        },

        show: function(){
            var row;
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(!row) return;
                for(var j=0,rowLength=row.length;j<rowLength;j++) {
                    row[j].show();
                }
            }
            this.options['visible'] = true;
        },

        isVisible:function () {
            return this.options['visible'];
        },

        orderNumberIsVisible: function () {
            return this.options['showOrderNumber'];
        },

        showOrderNumber: function () {
            this._showNumLabel();
            this.options['showOrderNumber'] = true;
        },

        hideOrderNumber: function () {
            this._hideNumLabel();
            this.options['showOrderNumber'] = false;
        },

        getAllCells: function() {
            var cells = [], row;
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(row) {
                    for(var j=0,rowLength=row.length;j<rowLength;j++) {
                        cells.push(row[j]);
                    }
                }
            }
            if(this.options['dynamic'] && this.options['order']) {
                cells = cells.concat(this._geometryNumLabels);
            }
            return cells;
        },

        remove: function(){
            this.stopEditTable();
            var row;
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(!row) return;
                for(var j=0,rowLength=row.length;j<rowLength;j++) {
                    row[j].remove();
                }
            }
            this._tableRows = [];
            //抛出事件
            this.fire('remove',this);
            //删除调整线
            this.removeStretchLine();
            //清理table上其它属性
            this._deleteTable();
        },

        setZIndex: function(index) {
            this._zindex = index;
            for(var rowNum = 0; rowNum < this._rowNum; rowNum++) {
                var row = this._tableRows[rowNum];
                if(!row) return;
                for(var j = 0, rowLength = row.length; j < rowLength; j++) {
                    row[j].setZIndex(index);
                }
            }
        },

        getZIndex: function() {
            return this._zindex;
        },

        bringToFront: function () {
            for(var rowNum = 0; rowNum < this._rowNum; rowNum++) {
                var row = this._tableRows[rowNum];
                if(!row) return;
                for(var j = 0, rowLength = row.length; j < rowLength; j++) {
                    row[j].bringToFront();
                }
            }
        },

        bringToBack: function () {
            for(var rowNum = 0; rowNum < this._rowNum; rowNum++) {
                var row = this._tableRows[rowNum];
                if(!row) return;
                for(var j = 0, rowLength = row.length; j < rowLength; j++) {
                    row[j].bringToBack();
                }
            }
        },

        stopEditTable: function() {
            var row;
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(!row) return;
                for(var j=0,rowLength=row.length;j<rowLength;j++) {
                    if(row[j].isEditingText()) {
                        row[j].endEditText();
                    }
                }
            }
        },

        isEditing: function() {
            return this.options['editing'];
        },

        refreshData: function(dataArray, key) {
            var data = this.getData();
            var updates = this._getUpdateItems(data, dataArray, key);
            var removes = this._getMinusItems(data, dataArray, key);
            var news = this._getMinusItems(dataArray, data, key);

            for (var i = 0; i < updates.length; i++) {
                this.updateRow(updates['maptalks_order'], updates[i]);
            }

            for(var j = removes.length - 1; j >= 0; j--) {
                this.removeRow(removes[j]['maptalks_order']);
            }
            var start = 0;
            if(this.options['header']) {
                start = 1;
            }
            var order = this.getData().length - 1;
            for(var m = 0; m < news.length; m++) {
                this.addRow(order + m + start, news[m], true);
            }
        },

        _uniquelize: function(a, key) {
            if(!key) return;
            var result = [];
            for(var i = 0; i < a.length; i++) {
                var notContain = true;
                for(var j = 0; j < result.length; j++) {
                    if(a[i][key] === result[j][key]) {
                        notContain = false;
                        break;
                    }
                }
                if(notContain) {
                    result.push(a[i]);
                }
            }
            return result;
        },

        _getUpdateItems : function(a, b, key){
            if(!key) return;
            var result = [];
            a = this._uniquelize(a, key);
            for(var i = 0; i < a.length; i++) {
                for(var j = 0; j < b.length; j++) {
                    if(b[j][key] === a[i][key]) {
                        b[j]['maptalks_order'] = a[i]['maptalks_order'];
                        result.push(b[i]);
                        break;
                    }
                }
            }        
            return result;
        },

        _getMinusItems : function(a, b, key){  
             if(!key) return;
             var result = [];
             a = this._uniquelize(a, key);
             for(var i = 0; i < a.length; i++) {
                var notContain = true;
                for(var j = 0; j < b.length; j++) {
                    if(b[j][key] === a[i][key]) {
                        notContain = false;
                    }
                }
                if(notContain) {
                    result.push(a[i]);
                }
             }
            return result  
        },  

        _deleteTable: function() {
            delete this._initalColumns;
            delete this._headAttributes;
            delete this._columns;
            delete this._colNum;
            delete this._data;
            delete this._initalData;
            delete this._rowNum;
            delete this.tableWidth;
            delete this.tableHeight;
            delete this._cellWidth;
            delete this._cellHeight;
            delete this._currentRow;
            delete this._currentCol;
            delete this._rowHeights;
            delete this._colWidths;
            delete this.options;
            delete this._tableRows;
            delete this._layer;
            delete this;
        },

        setCoordinates: function(coordinate) {
            var coorObj = new maptalks.Coordinate(coordinate.x, coordinate.y);
            var offset = coorObj.substract(this.getCenter());
            this._translate(offset);
        },

        _addToLayer: function(tableRow, init) {
            var me = this;
            var row,cell;
            for(var i = 0, len = tableRow.length; i < len; i++) {
                row = tableRow[i];
                if(!row) return;
                for(var j = 0, rowNum = row.length; j < rowNum; j++) {
                    cell = row[j];
                    if(init) {
                        cell._row = i;
                        cell._col = j;
                    }
                    this._addEventsToCell(cell).addTo(this._layer);
                }
            }
        },

        _showHeaderItemMenu: function(cell, coordinate) {
            var cellDataIndex = cell['dataIndex'];
            var items = [];
            var me = this;
            var attr,displayName,name,item,index;
            for(var i=0,len=this._headAttributes.length;i<len;i++) {
                attr = this._headAttributes[i];
                displayName = attr['displayName'];
                name = attr['name'];
                // if(cellDataIndex!==name) {
                    item = {'item': displayName, 'click': function(param) {
                        index = param['index'];
                        attr = me._headAttributes[index];
                        cell['dataIndex'] = attr['name'];
                        cell.setContent(attr['displayName']);
                        me._setColData(cell);
                        var col = cell._col;
                        //{header:'Name', dataIndex: 'name', type: 'string'},
                        me._columns[col] = {header:attr['displayName'], dataIndex: attr['name'], type: 'string'};
                    }};
                    items.push(item);
                // }
            }
            var menuOptions = {
                'width': 100,
                'style': 'grey',
                'items' : items
            };
            this.getMap().setMenu(menuOptions)
                     .openMenu(coordinate);
        },

        _setColData: function(cell) {
            var dataIndex = cell['dataIndex'];
            var colNum = cell._col;
            var newValues = [];
            var item;
            for(var i=0,len=this._initalData.length;i<len;i++) {
                item = this._initalData[i];
                newValues[i+1] = item[dataIndex];
            }
            var row;
            for(var i=1,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(!row) return;
                cell = row[colNum];
                cell.setContent(newValues[i]);
            }
        },

        _dragTableStart: function(event) {
            this.fire('dragstart', {'target':this});
        },

        _dragTableEnd: function(event) {
            this.fire('dragend', {'target':this});
        },

        _dragTable: function(event) {
            var dragOffset = event['dragOffset'];
            this._translate(dragOffset);
            this.fire('moving dragging', {'target' : this});
        },

        _translate: function(offset) {
            var row,cell;
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                row = this._tableRows[i];
                if(!row) return;
                for(var j=0,rowLength=row.length;j<rowLength;j++) {
                    cell = row[j];
                    cell.translate(offset);
                    if(i==0&&j==0) {
                        this.options['position'] = cell.getCenter();
                    }
                }
            }
        },

        _addMouseoverEvent: function(event) {
            event['context'] = this;
            this['table'].fire('mouseover', event);
        },

        _addMouseoutEvent: function(event) {
            event['context'] = this;
            this['table'].fire('mouseout', event);
        },

        _addMousedownEvent: function(event) {
            event['context'] = this;
            this['table'].fire('mousedown', event);
        },

        _addClickEvent: function(event) {
            event['context'] = this;
            this['table'].fire('click', event);
        },

        _addDBLClickEvent: function(event) {
            event['context'] = this;
            this['table'].fire('dblclick', event);
        },

        _addContextmenuEvent: function(event) {
            event['context'] = this;
            this['table'].fire('contextmenu', event);
        },

        _addEditTableEvent: function(event) {
            event['context'] = this;
            this['table'].fire('edittablestart', event);
            this['table'].options['editing'] = true;
        },

        createTable: function() {
            var dataset = new Array();
            var item;
            for(var i = 0; i < this._rowNum; i++) {
                if(i == 0 && this.options['header']) {
                    dataset.push(this.createHeader());
                    continue;
                }
                item = this._data[i];
                if(this._data && this._data.length > 0) {
                    if(this.options['header']) {
                        item = this._data[i-1];
                    }
                    if(item) {
                        dataset.push(this._createRow(i, item));   
                    }
                }
            }
            return dataset;
        },

        _getColumns: function() {
            var columns = this.options['columns'];
            if(!columns) {
                columns = [];
                var firstRow = this.options['data'];
                var type,column;
                for(var key in firstRow) {
                    type = this._getDataType(firstRow[key]);
                    column = {header: key,dataIndex: key,type: type};
                    columns.push(column);
                }
            }
            return columns;
        },

        _getDataType: function(value) {
            var type = 'string';
            if(maptalks.isNumber(value)) {
                type = 'number';
            }
            return type;
        },

        setTableStyle: function(attr, value, isGlobal) {
            if(isGlobal) {
                for(var rowNum = 0; rowNum < this._rowNum; rowNum++) {
                    this._setRowStyle(rowNum, attr, value);
                }
                this._changeDefaultSymbol(attr, value);
            } else {
                var rowNum = this._currentRow;
                var colNum = this._currentCol;
                if(rowNum > -1) {
                    this._setRowStyle(rowNum, attr, value);
                }
                if(colNum > -1) {
                    this._setColStyle(colNum, attr, value);
                }
            }
        },

        _setRowStyle: function(rowNum, attr, value) {
            var row = this._tableRows[rowNum];
            for(var j = 0, rowLength = row.length; j < rowLength; j++) {
                var cell = row[j];
                var symbol = cell.getSymbol();
                var style = value;
                if(attr === 'textFont') {
                    style = value +' '+symbol['textSize'] +'px '+ symbol['textFaceName'];
                }
                this._setStyleToCell(cell, attr, style);
            }
        },

        _setColStyle: function(colNum, attr, value) {
            for(var i=0,len=this._tableRows.length;i<len;i++) {
                var row = this._tableRows[i];
                var cell = row[colNum];
                var symbol = cell.getSymbol();
                var style = value;
                if(attr=='textFont') {
                    style = value +' '+symbol['textSize'] +'px '+ symbol['textFaceName'];
                }
                this._setStyleToCell(cell,attr,style);
            }
        },

        _setStyleToCell: function(cell, attr, value) {
            var symbol = cell.getSymbol();
            if(attr==='textAlign') {
                symbol['textHorizontalAlignment'] = value;
                if(value === 'left') {
                    symbol['textDx'] -= cell.getSize['width']/2
                } else if (value === 'right') {
                    symbol['textDx'] += cell.getSize['width']/2
                }
                cell.setSymbol(symbol);
            } else {
                symbol[attr] = value;
                cell.setSymbol(symbol);
            }
        },

        _changeDefaultSymbol: function(attr, value) {
            var symbol = this.options['symbol'];
            if(attr === 'textAlign') {
                symbol['textHorizontalAlignment'] = value;
            } else if (attr === 'textFont') {
                 value = value +' '+symbol['textSize'] +'px '+ symbol['textFaceName'];
            } else if (attr === 'markerFill') {
                symbol['fill'] = value;
            } else if (attr === 'markerLineColor') {
                symbol['lineColor'] = value;
            }
            symbol[attr] = value;
            this.options['symbol'] = symbol;
        }

    });

    if (nodeEnv) {
        exports = module.exports = maptalks.Table;
    }

})();

maptalks.Table.Drag = maptalks.Handler.extend({

    dragStageLayerId : maptalks.internalLayerPrefix + '_drag_table_stage',

    START: maptalks.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],

    addHooks: function () {
        this.target.on(this.START.join(' '), this._startDrag, this);

    },
    removeHooks: function () {
        this.target.off(this.START.join(' '), this._startDrag, this);

    },

    _startDrag: function (param) {
        var map = this.target.getMap();
        if (!map) {
            return;
        }
        if (this.isDragging()) {
            return;
        }
        var domEvent = param['domEvent'];
        if (domEvent.touches && domEvent.touches.length > 1) {
            return;
        }
        this.target.on('click', this._endDrag, this);
        this.target.removeStretchLine();
        this._lastPos = param['coordinate'];
        this._prepareMap();
        this._prepareDragHandler();
        this._dragHandler.onMouseDown(param['domEvent']);
        this._moved = false;
        /**
         * drag start event
         * @event maptalks.Table#dragstart
         * @type {Object}
         * @property {String} type                    - dragstart
         * @property {String} target                  - the table fires event
         * @property {maptalks.Coordinate} coordinate - coordinate of the event
         * @property {maptalks.Point} containerPoint  - container point of the event
         * @property {maptalks.Point} viewPoint       - view point of the event
         * @property {Event} domEvent                 - dom event
         */
        this.target.fire('dragstart', param);
    },

    _prepareMap:function () {
        var map = this.target.getMap();
        this._mapDraggable = map.options['draggable'];
        this._mapHitDetect = map.options['hitDetect'];
        map._trySetCursor('move');
        map.config({
            'hitDetect' : false,
            'draggable' : false
        });
    },

    _prepareDragHandler:function () {
        var map = this.target.getMap();
        this._dragHandler = new maptalks.Handler.Drag(map._panels.mapWrapper || map._containerDOM);
        this._dragHandler.on('dragging', this._dragging, this);
        this._dragHandler.on('mouseup', this._endDrag, this);
        this._dragHandler.enable();
    },

    _prepareShadow:function () {
        var target = this.target;
        this._prepareDragStageLayer();
        if (this._shadow) {
            this._shadow.remove();
        }
        var map = target.getMap();
        var offset = target.getCellOffset(0,0);
        var width = target.tableWidth, height = target.tableHeight;
        this._shadow = new maptalks.Marker(target.getCenter(), {
            'draggable' : true,
            'symbol'    : {
                'markerType' : 'square',
                'markerLineColor': '#ffffff',
                'markerLineDasharray' : [5,5,2,5],
                'markerFill': '#4e98dd',
                'markerFillOpacity' : 0.2,
                'markerWidth': width,
                'markerHeight': height,
                'markerDx' : width/2,
                'markerDy' : height/2
            }
        });
        var shadow = this._shadow;
        if (target.options['dragShadow']) {
            var symbol = maptalks.Util.decreaseSymbolOpacity(shadow._getInternalSymbol(), 0.5);
            shadow.setSymbol(symbol);
        }
        shadow.setId(null);
        var shadowConnectors = [];
        this._shadowConnectors = shadowConnectors;
        this._dragStageLayer.bringToFront().addGeometry(shadowConnectors.concat(shadow));
    },

    _onTargetUpdated:function () {
        if (this._shadow) {
            this._shadow.setSymbol(this.target.getSymbol());
        }
    },

    _prepareDragStageLayer:function () {
        var map = this.target.getMap(),
            layer = this.target.getLayer();
        this._dragStageLayer = map.getLayer(this.dragStageLayerId);
        if (!this._dragStageLayer) {
            this._dragStageLayer = new maptalks.VectorLayer(this.dragStageLayerId, {'drawImmediate' : true});
            map.addLayer(this._dragStageLayer);
        }
        //copy resources to avoid repeat resource loading.
        this._dragStageLayer._getRenderer()._resources = layer._getRenderer()._resources;
    },

    _dragging: function (param) {
        var target = this.target;
        var map = target.getMap(),
            eventParam = map._parseEvent(param['domEvent']);

        var domEvent = eventParam['domEvent'];
        if (domEvent.touches && domEvent.touches.length > 1) {
            return;
        }

        if (!this._moved) {
            this._moved = true;
            target.on('symbolchange', this._onTargetUpdated, this);
            this._prepareMap();
            this._isDragging = true;
            this._prepareShadow();
            this._shadow._fireEvent('dragstart', eventParam);
            return;
        }
        if (!this._shadow) {
            return;
        }
        var currentPos = eventParam['coordinate'];
        if (!this._lastPos) {
            this._lastPos = currentPos;
        }
        var dragOffset = currentPos.substract(this._lastPos);

        var axis = this._shadow.options['dragOnAxis'];
        if (axis === 'x') {
            dragOffset.y = 0;
        } else if (axis === 'y') {
            dragOffset.x = 0;
        }
        this._lastPos = currentPos;
        this._shadow.translate(dragOffset);

        eventParam['dragOffset'] = dragOffset;
        this._shadow._fireEvent('dragging', eventParam);

        /**
         * dragging event
         * @event maptalks.Table#dragging
         * @type {Object}
         * @property {String} type                    - dragging
         * @property {String} target                  - the table fires event
         * @property {maptalks.Coordinate} coordinate - coordinate of the event
         * @property {maptalks.Point} containerPoint  - container point of the event
         * @property {maptalks.Point} viewPoint       - view point of the event
         * @property {Event} domEvent                 - dom event
         */
        target.fire('dragging', eventParam);

    },

    _endDrag: function (param) {
        var target = this.target,
            map = target.getMap();
        if (this._dragHandler) {
            target.off('click', this._endDrag, this);
            this._dragHandler.disable();
            delete this._dragHandler;
        }
        if (!map) {
            return;
        }
        var eventParam;
        if (map) {
            eventParam = map._parseEvent(param['domEvent']);
        }
        target.off('symbolchange', this._onTargetUpdated, this);

        var shadow = this._shadow;
        if (shadow) {
            target.setCoordinates(shadow.getCoordinates());
            shadow._fireEvent('dragend', eventParam);
            shadow.remove();
            delete this._shadow;
        }
        if (this._shadowConnectors) {
            map.getLayer(this.dragStageLayerId).removeGeometry(this._shadowConnectors);
            delete this._shadowConnectors;
        }
        delete this._lastPos;

        //restore map status
        map._trySetCursor('default');
        if (maptalks.Util.isNil(this._mapDraggable)) {
            this._mapDraggable = true;
        }
        map.config({
            'hitDetect': this._mapHitDetect,
            'draggable': true
        });

        delete this._autoBorderPanning;
        delete this._mapDraggable;
        this._isDragging = false;
        /**
         * dragend event
         * @event maptalks.Table#dragend
         * @type {Object}
         * @property {String} type                    - dragend
         * @property {String} target                  - the table fires event
         * @property {maptalks.Coordinate} coordinate - coordinate of the event
         * @property {maptalks.Point} containerPoint  - container point of the event
         * @property {maptalks.Point} viewPoint       - view point of the event
         * @property {Event} domEvent                 - dom event
         */
        target.fire('dragend', eventParam);
    },

    isDragging:function () {
        if (!this._isDragging) {
            return false;
        }
        return true;
    }
});

maptalks.Table.addInitHook('addHandler', 'draggable', maptalks.Table.Drag);


maptalks.Table.include(/** @lends maptalks.Table.prototype */{

    createCell: function(content, cellOffset, size, symbol) {
        var textSize = symbol['textSize']||12;
        var textLineSpacing = symbol['textLineSpacing']||8;
        content = this._filterContent(content);
        var options = {
               'symbol': {
                   'markerLineColor': symbol['lineColor']||'#ffffff',
                   'markerLineWidth': 1,
                   'markerLineOpacity': 0.9,
                   'markerLineDasharray': null,
                   'markerFill': symbol['fill']||'#4e98dd',
                   'markerFillOpacity': 0.9,
                   'markerDx': cellOffset['dx']||0,
                   'markerDy': cellOffset['dy']||0,

                   'textFaceName': symbol['textFaceName']||'microsoft yahei',
                   'textSize': textSize,
                   'textFill': symbol['textFill']||'#ff0000',
                   'textOpacity': 1,
                   'textSpacing': 30,
                   'textWrapWidth': size['width'],
                   'textWrapBefore': false,
                   'textLineSpacing': textLineSpacing,
                   'textHorizontalAlignment': 'middle',
                   'textVerticalAlignment': 'middle',
                   'textDx': cellOffset['dx']||0,
                   'textDy': cellOffset['dy']||0
               },
               'boxPadding'   :   {'width' : 15, 'height' : 8},
               'draggable': false,
               'boxAutoSize': false,
               'boxMinWidth': size['width'],
               'boxMinHeight': size['height']
        };
        var coordinate = this.options['position'];
        return new maptalks.TextBox(content, coordinate, options);
    },

    getCellOffset: function(row, col) {
        var dx = 0, dy = 0, 
            currentRowHeight = this._cellWidth/2,
            currentColWidth = this._cellHeight/2;
        if(this._rowHeights[row]) {
          currentRowHeight = this._rowHeights[row]/2;;
        }
        if(this._colWidths[col]) {
          currentColWidth = this._colWidths[col]/2;
        }
        if(this._tableRows) {
            for(var i = 0; i < row; i++) {
                dy += this._rowHeights[i];
            }
            dy += currentRowHeight;
            for(var i = 0; i < col; i++) {
                dx += this._colWidths[i];
            }
            dx += currentColWidth;
        } else {
            dx = this._cellWidth*col + this._cellWidth/2;
            dy = this._cellHeight*row + this._cellHeight/2;
        }
        return  {'dx' : dx, 'dy' : dy};
    },

    getCellSymbol: function(row, col) {
        var defaultSymbol = this.options['symbol'];
        if(this.tableSymbols) {
          var  symbol = this.tableSymbols[row+'_'+col];
          if(symbol) {
            if(!symbol['textLineSpacing']) {
                symbol['textLineSpacing'] = defaultSymbol['textLineSpacing'];
            }
            return symbol;
          }
        }
        return defaultSymbol;
    },

    _addEventsToCell: function(cell) {
      var context = {
        'table' : this,
        'cell'  : cell,
        'row'   : cell._row,
        'col'   : cell._col,
        'dataIndex' : cell.dataIndex
      };
      cell.on('mouseover', this._addMouseoverEvent, context)
          .on('mouseout', this._addMouseoutEvent, context)
          .on('mousedown', this._addMousedownEvent, context)
          .on('click', this._addClickEvent, context)
          .on('dblclick', this._addDBLClickEvent, context)
          .on('contextmenu', this._addContextmenuEvent, context)
          .on('symbolchange', this._cellSymbolChangeEvent, context)
          .on('edittextstart', this._addEditTableEvent, context)
          .on('edittextend', this._cellEditTextEnd, context);
      return cell;
    },

    _cellSymbolChangeEvent: function(event) {
        event['context'] = this;
        var table = this['table'];
        var cell = this['cell'];
        table.fire('symbolchange', event);
        var symbol = this['cell'].getSymbol();
        table.tableSymbols[cell['_row']+'_'+cell['_col']] = table.convertCellToSaveSymbol(symbol);
    },

    _cellEditTextEnd: function(event) {
        event['context'] = this;
        var table = this['table'];
        var cell = this['cell'];
        var rowNum = cell._row;
        var colNum = cell._col;
        var col = table._columns[colNum];
        var dataType = col['dataIndex']
        if(table.options['header']) {
          if(rowNum > 0) {
            rowNum -= 1;
            table._data[rowNum][dataType] = cell.getContent();
          } else {
            table._columns[colNum]['header'] = cell.getContent();
          }
        } else {
          table._data[rowNum][dataType] = cell.getContent();
        }
        this['table'].fire('edittableend', event);
        this['table'].options['editing'] = false;
    },

    convertCellToSaveSymbol: function(symbol) {
        var saveSymbol = {
              fill: symbol['markerFill'],
              lineColor: symbol['markerLineColor'],
              textFaceName: symbol['textFaceName'],
              textFill: symbol['textFill'],
              textSize: symbol['textSize'],
              textWrapWidth: symbol['textWrapWidth']
        };
        return saveSymbol;
    },

    _addEditEventToCell: function(cell) {
        cell.startEditText();
        var textEditor = cell._textEditor;
        textEditor.focus();
        var value = textEditor.value;
        textEditor.value = '';
        if(value!='空') {
            textEditor.value = value;
        }
        var me = this;
        cell.on('remove', function() {
          if(cell.isEditingText()) {
            cell.endEditText();
          }
        });
        cell.on('edittextend', function(){
            var content = cell.getContent();
            var row = cell._row;
            var col = cell._col;
            var colIndex = me._columns[col]['dataIndex'];
            if(this.options['header'] && row >0) {
              me._data[row-1][colIndex] = content;
            } else {
              me._columns[col]['header'] = content;
            }
        });
    },

    _addNumberLabelToGeometry: function(coordinate, cell) {
        //设置label属性
        var cellSymbol = cell.getSymbol();
        var options = {
            'symbol': this._convertCellSymbolToNumberSymbol(cellSymbol),
            'draggable': false,
            'boxAutoSize': false,
            'boxMinWidth': 20,
            'boxMinHeight': 20
        };
        //创建label
        var num = cell.getContent();
        var numberLabel = new maptalks.Label(num, coordinate, options);
        this._layer.addGeometry(numberLabel);
        this._geometryNumLabels.push(numberLabel);
        var me = this;
        cell.on('remove', function(){
            me._removeNumLabel(numberLabel);
            numberLabel.remove();
        }, this);
        cell.on('hide', function() {
          numberLabel.hide();
        }, this);
        cell.on('show', function() {
          numberLabel.show();
        }, this);
        var me = this;
        cell.on('contentchange', function() {
          var start = 0;
          if(me.options['header']) {
              start = -1;
          }
          var row = cell._row + start;
          var item = me._data[row];
          var _coordiante = item.coordinate;
          if(_coordiante) numberLabel.setCoordinates(new maptalks.Coordinate(_coordiante.x, _coordiante.y));
        }, this);
        var me = this;
        cell.on('symbolchange', function(){
            var symbol = me._convertCellSymbolToNumberSymbol(cell.getSymbol());
            me._changeNumLabelSymbol(numberLabel, symbol);
            numberLabel.setSymbol(symbol);
        },this);
        cell.on('contentchange positionchanged', function(){
            var number = cell.getContent();
            me._changeNumLabelContent(numberLabel, number);
            numberLabel.setContent(number);
        },this);
    },

    _hideNumLabel: function () {
      for (var i = 0; i < this._geometryNumLabels.length; i++) {
        this._geometryNumLabels[i].hide();
      }
    },

    _showNumLabel: function () {
      for (var i = 0; i < this._geometryNumLabels.length; i++) {
        this._geometryNumLabels[i].show();
      }
    },

    _removeNumLabel: function(label) {
      for (var i = 0; i < this._geometryNumLabels.length; i++) {
        if(label ===  this._geometryNumLabels[i]) {
          this._geometryNumLabels.splice(i, 1);
          break;
        }
      }
    },

    _changeNumLabelSymbol: function(label, symbol) {
      for (var i = 0; i < this._geometryNumLabels.length; i++) {
        if(label ===  this._geometryNumLabels[i]) {
          this._geometryNumLabels[i].setSymbol(symbol);
          break;
        }
      }
    },

    _changeNumLabelContent: function(label, content) {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
          if(label ===  this._geometryNumLabels[i]) {
            this._geometryNumLabels[i].setContent(content);
            break;
          }
        }
    },

    _convertCellSymbolToNumberSymbol: function(cellSymbol){
        var symbol = {
            'markerType' : 'ellipse',
            'markerLineColor': '#ffffff',//cellSymbol['markerLineColor']||'#ffffff',
            'markerLineWidth': 0,//cellSymbol['markerLineWidth']||1,
            'markerLineOpacity': cellSymbol['markerLineOpacity']||0,
            'markerFill': cellSymbol['markerFill']||'#4e98dd',
            'markerFillOpacity': cellSymbol['markerFillOpacity']||1,
            'markerDx': 0,
            'markerDy': 0,
            'markerHeight' : 30,
            'markerWidth': 30,

            'textFaceName': cellSymbol['textFaceName']||'microsoft yahei',
            'textSize': cellSymbol['textSize']||12,
            'textFill': cellSymbol['textFill']||'#ff0000',
            'textOpacity': cellSymbol['textOpacity']||1,
            'textSpacing': cellSymbol['textSpacing']||0,
            'textWrapBefore': false,
            'textLineSpacing': cellSymbol['textLineSpacing']||0,
            'textHorizontalAlignment': cellSymbol['textHorizontalAlignment']||'middle',
            'textVerticalAlignment': cellSymbol['textVerticalAlignment']||'middle',
            'textDx': 0,
            'textDy': 0
        };
        return symbol;
    },

    _filterContent: function (content) {
        content = content+"";
        var result = content.replace(/\r/ig, "").replace(/\v/ig, "").replace(/\f/ig, "").replace(/\t/ig, "").replace(/\b/ig, "")
                 .replace(/\n\n/ig, "\n");
        return result;
    },

    isNumber:function (val) {
        return (typeof val === 'number') && !isNaN(val);
    }

});

maptalks.Table.include(/** @lends maptalks.Table.prototype */{

    createHeader: function() {
        var headerRow = new Array();
        var cellOffset,col,text,size,cell;
        for(var i=0,len=this._columns.length;i<len;i++) {
            cellOffset = this.getCellOffset(0, i);
            col = this._columns[i];
            text = col['header'];
            size = new maptalks.Size(this._colWidths[i], this._rowHeights[0]);
            var symbol = this.getCellSymbol(0, i);
            cell = this.createCell(text, cellOffset, size, symbol);
            cell._row = 0;
            cell._col = i;
            cell.dataIndex = col['dataIndex'];
            headerRow.push(cell);
        }
        this.tableHeight += this._rowHeights[0];
        return headerRow;
    }

});

maptalks.Table.include(/** @lends maptalks.Table.prototype */{

  /**
   * add Row for table
   * @param {Number} rowNum 添加新行的位置，包含表头
   * @param {Object} data 行数据
   * @param {Boolean} below : true,下方;false,上方
   */
  addRow: function(rowNum, data, below) {
      var insertRowNum = rowNum;
      if(below) {
          insertRowNum = rowNum + 1;
      }
      //构造新加入的行
      var newDataset = new Array();
      if(!data||data.length===0) {//添加空行
          newDataset.push(this._createRow(insertRowNum, data, true));
      } else {
          if(maptalks.Util.isArray(data)){
              var item,row;
              for(var i=0,len=data.length;i<len;i++) {
                  item = data[i];
                  newDataset.push(this._createRow(insertRowNum, item, true));
                  insertRowNum += 1;
              }
          } else {
              var row = this._createRow(insertRowNum, data, true);
              newDataset.push(row);
          }
      }
      //添加新的数据集
      this._addToLayer(newDataset);
      //调整之前的数据集
      var startDataset = this._tableRows.slice(0,insertRowNum+1);
      var lastDataset = this._tableRows.slice(insertRowNum+1);
      this._adjustDatasetForRow(newDataset.length, lastDataset);
      this._tableRows = startDataset.concat(newDataset).concat(lastDataset);
      this._rowNum += newDataset.length;
      this.fire('addrow', this);
      this.fire('orderchanged', this);
      return this;
  },

  moveRow: function(sourceRowNum, direction) {
      this.stopEditTable();
      this.removeStretchLine();
      var targetRowNum = sourceRowNum;
      if(direction === 'up') {
          if(sourceRowNum > 0) {
              targetRowNum = sourceRowNum - 1;
          }
      } else if (direction === 'down') {
          if(sourceRowNum < this._rowNum - 1) {
              targetRowNum = sourceRowNum + 1;
          }
      }
      this._changeRowOrder(sourceRowNum, targetRowNum);
  },

  updateRow: function(rowNum, item) {
    this.removeStretchLine();
    var row = this._tableRows[rowNum];
    if(!row) return;
    var start = 1;
    if(this.options['header']) {
        start = 0;
        rowNum -= 1;
    }
    this._data[rowNum] = item;
    var dataType,dataIndex,text;
    for(var i = 0; i < this._colNum; i++) {
          var col = this._columns[i];
          dataType = col['type'];
          dataIndex = col['dataIndex'];
          text = '';
          if(item && item[dataIndex]) {
              text = item[dataIndex];
          }
          var cell = row[i];
          if(cell) {
            if(this.options['order'] && dataIndex==='maptalks_order'){
              text = cell.getContent();
            }
            cell.setContent(text);
          }
      }
  },

  /**
   * remove row
   * @param {Number} rowNum 行号
   */
  removeRow: function(rowNum) {
      this.stopEditTable();
      this.removeStretchLine();
      var removeRow = this._tableRows[rowNum];
      var firstCell = removeRow[0];
      var size = firstCell.getSize();
      var row, cell, cellOffset;
      for(var i = rowNum, len = this._tableRows.length; i < len; i++) {
          row = this._tableRows[i];
          if(!row) return;
          for(var j = 0, rowLength = row.length; j < rowLength; j++) {
              cell = row[j];
              if(i > rowNum) {
                  cellOffset = this.getCellOffset(i, 0);
                  cell._row -= 1;
                  if(this.options['order'] && this._columns[j]['dataIndex'] === 'maptalks_order'){
                      var startNum = this.options['startNum'] || 1;
                      if(startNum > 1) {
                        cell.setContent(cell._row + startNum);
                      } else {
                        cell.setContent(cell._row);
                      }
                  }
                  this._translateDy(cell, -size['height']+1);
              } else {
                  cell.remove();
              }
          }
      }
      this.tableHeight -= (size['height'] + 1);
      //移除行数据
      this._tableRows.splice(rowNum, 1);
      this._rowHeights.splice(rowNum, 1);
      var adjustStartRow = 0;
      if(this.options['header']) {
        this._data.splice(rowNum - 1, 1);
        adjustStartRow = rowNum - 1;
      } else {
        this._data.splice(rowNum, 1);
        adjustStartRow = rowNum;
      }
      //调整data中删除行之后的数据
      for (var i = adjustStartRow; i < this._data.length; i++) {
        this._data[i]['maptalks_order'] -= 1;
      }
      //总行数减少
      this._rowNum -= 1;
      this.fire('removerow', this);
      this.fire('orderchanged', this);
  },

  _createRow: function(index, item, add) {
      this.removeStretchLine();
      var cols = new Array();
      var col,dataIndex,dataType,text,cellOffset,size,cell,rowData,geometry,coordinate,symbol;
      var rowHeight = this._rowHeights[index];
      if (!rowHeight) rowHeight = this._cellHeight;
      // var dataItem = {};
      for(var i = 0; i < this._colNum; i++) {
          col = this._columns[i];
          dataType = col['type'];
          dataIndex = col['dataIndex'];
          text = '';
          if(item && item[dataIndex]) {
              text = item[dataIndex];
          }
          if(this.options['order'] && dataIndex === 'maptalks_order'){
            if(!text || text==='') {
                var startNum = this.options['startNum'] || 1;
                if(startNum > 1) {
                  text = index + startNum - 1;
                } else {
                  text = index;
                }
            }
            item[dataIndex] = text;
          }
          if(add) {
            var offset = this.getCellOffset(index - 1, i);
            cellOffset = {
              'dx': offset.dx,
              'dy': offset.dy + rowHeight
            };
            symbol = this.options['symbol'];
            size = new maptalks.Size(this._colWidths[i], rowHeight);
          } else {
            cellOffset = this.getCellOffset(index, i);
            symbol = this.getCellSymbol(index, i);
            size = new maptalks.Size(this._colWidths[i], rowHeight);
          }
          cell = this.createCell(text, cellOffset, size, symbol);
          cell._row = index;
          cell._col = i;
          cell.dataIndex =  dataIndex
          cols[i] = cell;
          this.tableSymbols[index+'_'+i] = symbol;
          if(this.options['dynamic'] && this.options['order'] && dataIndex==='maptalks_order') {
              var coordinate = item['coordinate'];
              if(coordinate) {
                this._addNumberLabelToGeometry(new maptalks.Coordinate(coordinate.x, coordinate.y), cell);
              }
          }
      }
      if(add) {
        this.tableHeight += this._cellHeight;
      } else {
        this.tableHeight += rowHeight;
      }
      if(add) {
        this._rowHeights.splice(index, 0, this._cellHeight);
        if(this.options['header']) {
          --index;
        }
        this._data.splice(index, 0, item);
      }
      return cols;
  },

  _changeRowOrder: function(sourceRowNum, targetRowNum) {
      if(sourceRowNum === targetRowNum) return;
      var start = 0;
      if(this.options['header']) {
        start = -1;
      }
      if(sourceRowNum + start === 0) return;
      var sourceRow = this._tableRows[sourceRowNum];
      var targetRow = this._tableRows[targetRowNum];

      var firstSourceCell = sourceRow[0];
      var sourceCellRow = firstSourceCell._row;
      var sourceCellCol = firstSourceCell._col;
      var sourceRowHeight = this._rowHeights[sourceCellRow];
      var sourceRowDy = this.getCellOffset(sourceCellRow, sourceCellCol).dy;

      var firstTargetCell = targetRow[0];
      var targetCellRow = firstTargetCell._row;
      var targetCellCol = firstTargetCell._col;
      var targetRowHeight = this._rowHeights[targetCellRow];
      var targetRowDy = this.getCellOffset(targetCellRow, targetCellCol).dy;

      if(sourceRowDy < targetRowDy) {
          sourceRowDy = sourceRowDy + targetRowHeight;
          targetRowDy = targetRowDy - sourceRowHeight;
      } else {
          sourceRowDy = sourceRowDy - targetRowHeight;
          targetRowDy = targetRowDy + sourceRowHeight;
      }

      //调整行号
      for(var i = 0, len = sourceRow.length; i < len; i++) {
          var sourceSymbol = sourceRow[i].getSymbol();
          sourceRow[i]._row = targetRowNum;
          sourceSymbol['markerDy'] = sourceRowDy;
          sourceSymbol['textDy'] = sourceRowDy;
          sourceRow[i].setSymbol(sourceSymbol);
          if(this.options['order'] && this._columns[i]['dataIndex'] === 'maptalks_order'){
              sourceRow[i].setContent(targetRowNum);
              this._data[sourceRowNum + start]['maptalks_order'] = targetRowNum;
              sourceRow[i].fire('positionchanged',{target:sourceRow[i]});
          }
      }
      for(var i = 0, len = targetRow.length; i < len; i++) {
          var targetSymbol = targetRow[i].getSymbol();
          targetRow[i]._row = sourceRowNum;
          targetSymbol['markerDy'] = targetRowDy;
          targetSymbol['textDy'] = targetRowDy;
          targetRow[i].setSymbol(targetSymbol);
          if(this.options['order'] && this._columns[i]['dataIndex'] === 'maptalks_order'){
              targetRow[i].setContent(sourceRowNum);
              this._data[targetRowNum + start]['maptalks_order'] = sourceRowNum;
              targetRow[i].fire('positionchanged',{target:targetRow[i]});
          }
      }
      this._tableRows[targetRowNum] = sourceRow;
      this._tableRows[sourceRowNum] = targetRow;
      //调整table相关内存数组
      var sourceItem = this._data[sourceRowNum + start];
      this._data[sourceRowNum + start] = this._data[targetRowNum + start];
      this._data[targetRowNum + start] = sourceItem;
      var sourceRowHeight = this._rowHeights[sourceRowNum];
      this._rowHeights[sourceRowNum] = this._rowHeights[targetRowNum];
      this._rowHeights[targetRowNum] = sourceRowHeight;
  },

  /**
   * 调整插入行之后的cell位置
   * @param {Number} insertRowLength 插入行的数量
   * @param {Array} lastDataset 插入行之后的cell数组
   */
  _adjustDatasetForRow: function(insertRowLength, lastDataset, height) {
      var row;
      var start = 0;
      if(this.options['header']) {
        start = -1;
      }
      for(var i = 0, len = lastDataset.length; i < len; i++) {
          row = lastDataset[i];
          for(var j = 0, rowLength = row.length; j < rowLength; j++) {
              row[j]._row += insertRowLength;
              if(this.options['order'] && this._columns[j]['dataIndex']==='maptalks_order'){
                  var rowIndex = row[j]._row;
                  var startNum = this.options['startNum'] || 1;
                  if(startNum > 1) {
                    rowIndex = rowIndex + startNum;
                  }
                  row[j].setContent(rowIndex);
                  this._data[row[j]._row+start]['maptalks_order'] = rowIndex;
              }
              row[j].fire('symbolchange', row[j]);
              this._translateDy(row[j], this._cellHeight);
          }
      }
      return this;
  },

  _resetOrderNum: function(startNum) {
    if(!this.options['order']) return;
    var start = 0;
    if(this.options['header']) {
      start = -1;
    }
    var startIndex = 0;
    if(this.options['header']) {
      startIndex = 1;
    }
    for(var i = startIndex, len = this._tableRows.length; i < len; i++) {
        var row = this._tableRows[i];
        for (var j = 0; j < row.length; j++) {
          if(row[j]['dataIndex'] === 'maptalks_order'){
              var content = i + startNum + start;
              row[j].setContent(content);
              row[j].fire('positionchanged',{target:row[j]});
              this._data[i+start]['maptalks_order'] = content;
              break;
          }
        }
    }
  },

  _translateDy: function(cell, height){
      var symbol = cell.getSymbol();
      symbol['markerDy'] += height;
      symbol['textDy'] += height;
      cell.setSymbol(symbol);
  }

});

maptalks.Table.include(/** @lends maptalks.Table.prototype */{

  /**
   * 添加一列
   * @param {Number} colNum 添加新列的位置
   * @param {Object} data 添加的列数据
   * @param {Boolean} right :true,右侧;false,左侧
   */
  addCol: function(colNum, data, right) {
      var insertColNum = colNum + 1;
      if(!right) {
          insertColNum = colNum;
      }
      this._createCol(insertColNum, data, true);
      return this;
  },

  _createCol: function(insertColNum, data, add) {
      this.removeStretchLine();
      var startCol = insertColNum;//调整起始列
      if(!data||data.length==0) data = '';
      //insert column
      var cells = new Array();
      var insertColLength = 1;
      var colCell;
      for(var i = 0; i < this._rowNum; i++) {
          if(maptalks.Util.isArray(data)){
              insertColLength = data.length;
              colCell = new Array();
              for(var j = 0, len = data.length; j < len; j++) {
                  colCell.push(this._addCellForColumn(data[j], i, insertColNum + j, add));
              }
              cells.push(colCell);
          } else {
              cells.push(this._addCellForColumn(data, i, insertColNum, add));
          }
      }
      for(var i = 0, len = this._tableRows.length; i < len; i++) {
          var dataLength = data.length;
          if(dataLength>0) {
              for(var j=0;j<dataLength;j++){
                  this._tableRows[i].splice(insertColNum+j,0,cells[i]);
              }
          } else {
              this._tableRows[i].splice(insertColNum,0,cells[i]);
          }
      }
      this._colNum += insertColLength;
      //调整之后的列
      this._adjustDatasetForCol(startCol, insertColLength);
  },

  _addCellForColumn: function(item, rowNum, colNum, add) {
    var cellOffset, symbol, size, cellWidth,cell;
    if(add) {
      var prevColNum = colNum - 1;
      var offset = this.getCellOffset(rowNum, prevColNum);
      var prevCellWidth = this._colWidths[prevColNum];
      if(rowNum === 0) {
        cellOffset = {
          'dx': offset.dx + (prevCellWidth + this._cellWidth)/2,
          'dy': offset.dy
        };
      } else {
        cellOffset = this.getCellOffset(rowNum, colNum);
      }
      symbol = this.options['symbol'];
      if(this.options['header'] && rowNum ===0) {
        symbol = this.options['headerSymbol'];
      }
      cellWidth = this._cellWidth;
      size = new maptalks.Size(this._cellWidth, this._rowHeights[rowNum]);
    } else {
      cellOffset = this.getCellOffset(rowNum, colNum);
      symbol = this.getCellSymbol(rowNum, colNum);
      cellWidth = this._colWidths[colNum];
      size = new maptalks.Size(cellWidth, this._rowHeights[rowNum]);
    }
    var dataIndex = 'header_'+maptalks.Util.GUID();
    if(rowNum===0) {
        var header = item;
        var column = {header:header, dataIndex: dataIndex, type: 'string'};
        this._columns.splice(colNum, 0, column);
        cell = this.createCell(header, cellOffset, size, symbol);
        this.tableWidth += cellWidth;
        this._colWidths.splice(colNum, 0, cellWidth);
    } else {
      cell = this.createCell(item, cellOffset, size, symbol);
    }
    cell._row = rowNum;
    cell._col = colNum;
    cell.dataIndex = dataIndex;
    this.tableSymbols[rowNum +'_'+ colNum] = symbol;
    this._addEventsToCell(cell).addTo(this._layer);
    return cell;
  },

  moveCol: function(sourceColNum, direction) {
      this.stopEditTable();
      this.removeStretchLine();
      var targetColNum = sourceColNum;
      if(direction==='left') {
          if(sourceColNum>0) {
              targetColNum = sourceColNum-1;
          }
      } else if (direction==='right') {
          if(sourceColNum<this._colNum-1) {
              targetColNum = sourceColNum+1;
          }
      }
      this._changeColOrder(sourceColNum, targetColNum);
  },

  _changeColOrder: function(sourceColNum, targetColNum) {
      if(sourceColNum===targetColNum) {return;}
      var start = 0;
      if(this.options['header']) {
        start = -1;
      }
      var firstRow = this._tableRows[0];
      var firstSourceCell = firstRow[sourceColNum];
      var sourceCellRow = firstSourceCell._row;
      var sourceCellCol = firstSourceCell._col;
      var sourceColWidth = this._colWidths[sourceColNum];
      var sourceColDx = this.getCellOffset(sourceCellRow, sourceCellCol).dx;

      var firstTargetCell = firstRow[targetColNum];
      var targetCellRow = firstTargetCell._row;
      var targetCellCol = firstTargetCell._col;
      var targetColWidth = this._colWidths[targetColNum];
      var targetColDx = this.getCellOffset(targetCellRow, targetCellCol).dx;

      if(sourceColDx < targetColDx) {
          sourceColDx = sourceColDx + targetColWidth;
          targetColDx = targetColDx - sourceColWidth;
      } else {
          sourceColDx = sourceColDx - targetColWidth;
          targetColDx = targetColDx + sourceColWidth;
      }
      //调整列位置
      var row,sourceCellSymbol,targetCellSymbol,temp;
      for(var i=0,len=this._tableRows.length;i<len;i++) {
          row = this._tableRows[i];
          if(!row) return;
          sourceCellSymbol = row[sourceColNum].getSymbol();
          sourceCellSymbol['markerDx'] = sourceColDx;
          sourceCellSymbol['textDx'] = sourceColDx;
          row[sourceColNum].setSymbol(sourceCellSymbol);
          row[sourceColNum]._col = targetColNum;

          targetCellSymbol = row[targetColNum].getSymbol();
          targetCellSymbol['markerDx'] = targetColDx;
          targetCellSymbol['textDx'] = targetColDx;
          row[targetColNum].setSymbol(targetCellSymbol);
          row[targetColNum]._col = sourceColNum;
          temp = row[sourceColNum];
          row[sourceColNum] = row[targetColNum];
          row[targetColNum] = temp;
      }
      //调整table相关的内存数组
      var sourceColWidth = this._colWidths[sourceColNum];
      this._colWidths[sourceColNum] = this._colWidths[targetColNum];
      this._colWidths[targetColNum] = sourceColWidth;
      //调整列次序
      var sourceColumn = this._columns[sourceColNum];
      this._columns[sourceColNum] = this._columns[targetColNum];
      this._columns[targetColNum] = sourceColumn;
  },

    _adjustDatasetForCol: function(start, insertColLength) {
        var startPoint = this.options['position'];
        var map = this._layer.getMap();
        var rowData,cell,colLine,size,symbol,dx,upPoint,downPoint;
        for(var i=0,len=this._tableRows.length;i<len;i++) {
            rowData = this._tableRows[i];
            if(!rowData) return;
            for(var j = start + 1,rowLength = rowData.length; j < rowLength;j++) {
                cell = rowData[j];
                cell._col += insertColLength;
                cell.fire('symbolchange', cell);
                this._translateDx(cell, this._cellWidth);
                //调整交互列
                if(i==0){
                    if(this._adjustCols) {
                        colLine = this._adjustCols[j];
                        size = cell.getSize();
                        symbol = cell.getSymbol();
                        dx = symbol['textDx'];
                        upPoint = map.locate(startPoint,map.pixelToDistance(size['width']/2+dx,0),map.pixelToDistance(0,size['height']/2));
                        downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this.tableHeight));
                        colLine.setCoordinates([upPoint,downPoint]);
                    }
                }
            }
        }
    },

    /**
     * 删除列
     * @param {Number} colNum 列号
     */
    removeCol: function(colNum) {
        this.stopEditTable();
        this.removeStretchLine();
        var firstRow = this._tableRows[0];
        var removeCell = firstRow[colNum];
        var removeSize = removeCell.getSize();
        var startPoint = this.options['position'];
        var map = this._layer.getMap();
        var row,j,cell,width,colLine,size,symbol,dx,upPoint,downPoint;
        for(var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if(!row) return;
            for(var j = colNum, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                width = 0;
                if(i == 0 && j == colNum) {
                    //表格宽度缩短
                    this.tableWidth -= removeSize['width'];
                }
                if(j > colNum) {
                    this._translateDx(cell, -removeSize['width']+1);
                    if(i == 0) {
                        if(this._adjustCols) {
                            colLine = this._adjustCols[cell._col];
                            size = cell.getSize();
                            symbol = cell.getSymbol();
                            dx = symbol['textDx'];
                            upPoint = map.locate(startPoint,map.pixelToDistance(size['width']/2+dx,0),map.pixelToDistance(0,size['height']/2));
                            downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this.tableHeight));
                            colLine.setCoordinates([upPoint,downPoint]);
                        }
                    }
                    cell._col -= 1;
                } else {
                    cell.remove();
                }
            }
            //删除列数据
            this._tableRows[i].splice(colNum, 1);
        }
        this._colWidths.splice(colNum, 1);
        //移除列数据
        this._columns.splice(colNum, 1);
        //移除列数据
        this._colNum-=1;
    },

    _translateDx: function(cell, width){
        var symbol = cell.getSymbol();
        symbol['markerDx'] += width;
        symbol['textDx'] += width;
        cell.setSymbol(symbol);
    }

});

maptalks.Table.include(/** @lends maptalks.Table.prototype */{

   addStretchLine: function(event) {
    var me = this;
    this.on('mouseover', function(event) {
      var map = me.getMap();
      map.options['doubleClickZoom'] = false;
      var viewPoint = event['viewPoint'];
      var showStretchLine = me._checkPointOnBottomEdge(viewPoint);
      if (showStretchLine) {
        me._createStretchLineForRow(map, viewPoint, showStretchLine);
        return;
      }
      showStretchLine = me._checkPointOnRightEdge(viewPoint);
      if (showStretchLine) {
        me._createStretchLineForCol(map, viewPoint, showStretchLine);
        return;
      }
    });
    this.on('mouseout', function(event) {me.getMap().options['doubleClickZoom'] = true;})
        .on('dragstart', this.removeStretchLine);
    this.getMap().on('movestart dragstart zoomstart resize', this.removeStretchLine, this);
   },

   _checkPointOnBottomEdge: function(point) {
    if(this._mouseMoveStartPoint) {
      var moveDistance = this._mouseMoveStartPoint.distanceTo(point);
      if(moveDistance > 2) {
        this._mouseMoveStartPoint = point;
        return false;
      }
    }
    this._mouseMoveStartPoint = point;
    var tableViewPoint = this._getStretchStartPoint(point);
    point = new maptalks.Point(tableViewPoint.x, point.y);
    var distance = tableViewPoint.distanceTo(point);
    var dy = 0, checkSign = false;
    for(var i = 0; i < this._rowHeights.length; i++) {
        dy += this._rowHeights[i];
        if((dy-1 <= distance) && (distance <= dy+1)) {
          this._stretchRowNum = i;
          checkSign = dy;
          break;
        }
    }
    return checkSign;
   },

  _getStretchStartPoint: function(point) {
    var position = this.options['position'];
    return this.getMap().coordinateToViewPoint(position);
  },

  _createStretchLineForRow: function(map, point, dy) {
      if(this._colLine) {
        this._colLine.remove();
        delete this._colLine;
      }
      var tablePoint = this._getStretchStartPoint(point);
      var leftViewPoint = tablePoint.add(new maptalks.Point(0, dy));
      var leftPoint = map.viewPointToCoordinate(leftViewPoint)
      var rightPoint = map.locate(leftPoint,map.pixelToDistance(this.tableWidth,0),0);
      var coordiantes = [leftPoint, rightPoint];
      if(!this._rowLine) {
          this._rowLine = new maptalks.LineString(coordiantes,{
          draggable:true,
          dragOnAxis: 'y',
          cursor:'s-resize',
          symbol:{
              'lineColor' : '#ff0000',
              'lineWidth' : 2,
              'lineDasharray' : null,//[5,5,2,5],
              'lineOpacity' : 0.8
          }
        }).addTo(this.getLayer());
        var me = this;
        this._rowLine.on('dragstart',function(event){
            me._startCoordinate = event['coordinate'];
            me._startViewPoint = event['viewPoint'];
        });
        this._rowLine.on('dragend',function(event){
          var dragOffset = event['coordinate'].substract(me._startCoordinate);
          var currentPoint = event['viewPoint'];
          var offset = currentPoint.substract(me._startViewPoint);
          var cellHeight = me._rowHeights[me._stretchRowNum];
          if((cellHeight + offset.y) > 5) {
            dragOffset.x = 0;
            me._resizeRow(dragOffset);
          } else {
            dragOffset.x = dragOffset.x*-1;
            dragOffset.y = dragOffset.y*-1;
            me._rowLine.translate(dragOffset);
          }
          me.getMap().config({
            'draggable': true
          });
        });
      } else {
        this._rowLine.setCoordinates(coordiantes);
      }
      this._rowLine.show();
      this._rowLine.bringToFront();
  },

  _resizeRow: function(dragOffset) {
      var pixel = this.getMap().coordinateToPoint(dragOffset);
      var height = pixel['y'];
      var row,cell,symbol,
          newHeight = this._rowHeights[this._stretchRowNum] + height;
      this.tableHeight += height;
      this._rowHeights[this._stretchRowNum] = newHeight;
      for(var i = this._stretchRowNum; i < this._rowNum; i++) {
          row = this._tableRows[i];
          for(var j = 0; j < this._colNum; j++) {
              cell = row[j];
              symbol = cell.getSymbol();
              if(i === this._stretchRowNum) {
                  cell.options['boxMinHeight'] = newHeight;
                  if(cell.options['boxMinHeight'] < symbol['markerHeight']) {
                      symbol['markerHeight'] = cell.options['boxMinHeight'];
                  }
                  symbol['markerDy'] += height/2;
                  symbol['textDy'] += height/2;
              } else {
                  symbol['markerDy'] += height;
                  symbol['textDy'] += height;
              }
              cell.setSymbol(symbol);
          }
      }
  },

  _checkPointOnRightEdge: function(point) {
    if(this._mouseMoveStartPoint) {
      var moveDistance = this._mouseMoveStartPoint.distanceTo(point);
      if(moveDistance > 2) {
        this._mouseMoveStartPoint = point;
        return false;
      }
    }
    this._mouseMoveStartPoint = point;
    var tableViewPoint = this._getStretchStartPoint(point);
    point = new maptalks.Point(point.x, tableViewPoint.y);
    var distance = tableViewPoint.distanceTo(point);
    var dx = 0, checkSign = false;
    for(var i = 0; i < this._colWidths.length; i++) {
        dx += this._colWidths[i];
        if((dx-1 <= distance) && (distance <= dx+1)) {
          this._stretchColNum = i;
          checkSign = dx;
          break;
        }
    }
    return checkSign;
   },

  _createStretchLineForCol: function(map, point, dx) {
      if(this._rowLine) {
          this._rowLine.remove();
          delete this._rowLine;
      }
      var tablePoint = this._getStretchStartPoint(point);
      var upViewPoint = tablePoint.add(new maptalks.Point(dx, 0));
      var upPoint = map.viewPointToCoordinate(upViewPoint);
      var downPoint = map.locate(upPoint,0,-map.pixelToDistance(0,this.tableHeight));
      var coordiantes = [upPoint, downPoint];
      if(!this._colLine) {
          this._colLine = new maptalks.LineString(coordiantes,{
          draggable:true,
          dragShadow:false,
          dragOnAxis: 'x',
          cursor:'e-resize',
          symbol:{
              'lineColor' : '#ff0000',
              'lineWidth' : 2,
              'lineDasharray' : null,
              'lineOpacity' : 0.8
          }
        }).addTo(this.getLayer());

      var me = this;
      this._colLine.on('dragstart',function(event){
          me._startCoordinate = event['coordinate'];
          me._startViewPoint = event['viewPoint'];
      });
      this._colLine.on('dragend',function(event){
        var dragOffset = event['coordinate'].substract(me._startCoordinate);
        var currentPoint = event['viewPoint'];
        var offset = currentPoint.substract(me._startViewPoint);
        var cellWidth = me._colWidths[me._stretchColNum];
        if((cellWidth + offset.x) > 8) {
          dragOffset.y = 0;
          me._resizeCol(dragOffset);
        } else {
          dragOffset.x = dragOffset.x*-1;
          dragOffset.y = dragOffset.y*-1;
          me._colLine.translate(dragOffset);
        }
        me.getMap().config({
          'draggable': true
        });
      });
      } else {
        this._colLine.setCoordinates(coordiantes);
      }
      this._colLine.show();
      this._colLine.bringToFront();
  },

  _resizeCol: function(dragOffset) {
      var pixel = this.getMap().coordinateToPoint(dragOffset);
      var width = pixel['x'];
      var row, cell, symbol,
          newWidth = this._colWidths[this._stretchColNum] + width;
      this.tableWidth += width;
      this._colWidths[this._stretchColNum] = newWidth;

      for(var i = 0, len = this._tableRows.length; i < len; i++) {
          row = this._tableRows[i];
          if(!row) return;
          for(var j = this._stretchColNum, rowLength = row.length; j < rowLength; j++) {
              cell = row[j];
              symbol = cell.getSymbol();
              if(j === this._stretchColNum) {
                  cell.options['boxMinWidth'] = newWidth;
                  symbol['markerWidth'] = cell.options['boxMinWidth'];
                  symbol['textWrapWidth'] = cell.options['boxMinWidth'];
                  symbol['markerDx'] += width/2;
                  symbol['textDx'] += width/2;
              } else {
                  symbol['markerDx'] += width;
                  symbol['textDx'] += width;
              }
              cell.setSymbol(symbol);
          }
      }
  },

  removeStretchLine: function() {
    this.getMap().off('movestart dragstart zoomstart resize', this.removeStretchLine, this);
    if(this._rowLine) {
        this._rowLine.remove();
        delete this._rowLine;
    }
    if(this._colLine) {
      this._colLine.remove();
      delete this._colLine;
    }
  }


});

})();