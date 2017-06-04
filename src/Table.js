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
