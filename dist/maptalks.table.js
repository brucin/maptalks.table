/*!
 * maptalks.table v0.1.0
 * LICENSE : MIT
 * (c) 2016-2017 maptalks.org
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks$1));
}(this, (function (exports,maptalks$1) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass);
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var defaultOptions = {
    'title': 'title',
    'columns': [{ header: 'Name', dataIndex: 'name', type: 'string', maxWidth: 50 }, { header: 'Birth', dataIndex: 'birth', type: 'data', maxWidth: 50 }, { header: 'Age', dataIndex: 'age', type: 'number', maxWidth: 50 }, { header: 'Marry', dataIndex: 'marry', type: 'boolean', trueText: 'Yes', falseText: 'No', maxWidth: 50 }],
    'data': [{ name: 'Tom', birth: '1990-1-1', age: 25, marry: 'true' }, { name: 'Peter', birth: '1985-5-1', age: 30, marry: 'true' }, { name: 'Mary', birth: '2000-6-1', age: 15, marry: 'false' }],
    'headerSymbol': {
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
    'startNum': 1,
    'dynamic': false,
    'layerId': null
};

var EXCEPTION_DEFS = {
    'NEED_DATA': 'You must set data to Table options.',
    'NEED_COLUMN': 'You must set columns to Table options.'
};

/**
 * @category table
 * Class for table.
 * @extends maptalks.Class
 * @mixes maptalks.Eventable
 * @mixes maptalks.Handlerable
 * @mixes maptalks.JSONAble
 */

var Table = function (_maptalks$JSONAble) {
    inherits(Table, _maptalks$JSONAble);

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
    function Table(options) {
        var _ret;

        classCallCheck(this, Table);

        var _this = possibleConstructorReturn(this, _maptalks$JSONAble.call(this, options));

        _this.options['width'] = _this.options['width'] || 300;
        _this.options['height'] = _this.options['height'] || 300;
        if (!_this.options['header'] && _this.options['header'] !== false) _this.options['header'] = true;
        if (!_this.options['order'] && _this.options['order'] !== false) _this.options['order'] = true;
        _this.options['visible'] = true;
        _this.options['editing'] = false;
        _this.options['showOrderNumber'] = true;
        _this.options['startNum'] = _this.options['startNum'] || 1;
        if (!_this.options['data'] && _this.options['data'].length === 0) {
            throw new Error(EXCEPTION_DEFS['NEED_DATA']);
        }
        if (!_this.options['columns'] && _this.options['columns'].length === 0) {
            throw new Error(EXCEPTION_DEFS['NEED_COLUMN']);
        }
        //包含序号列
        var orderTitle = _this.options['orderTitle'];
        if (!orderTitle) orderTitle = 'No.';
        if (_this.options['order']) {
            var startNum = parseInt(_this.options['startNum']);
            var orderCol = { header: orderTitle, dataIndex: 'maptalks_order', type: 'number' };
            _this.options['columns'].unshift(orderCol);

            var dataArray = _this.options['data'];
            for (var i = 0, len = dataArray.length; i < len; i++) {
                dataArray[i]['maptalks_order'] = i + startNum;
            }
        }
        _this._initalColumns = _this.options['columns'];
        _this._headAttributes = _this.options['attributes'];
        _this._columns = _this.getColumns();
        _this._colNum = _this._columns.length;
        _this._data = _this.options['data'];
        _this._initalData = _this._data; //this.options['data'];
        _this._rowNum = _this._data.length;
        //包含表头
        if (_this.options['header']) {
            _this._rowNum += 1;
        }
        _this.tableWidth = _this.options['width'] || 0;
        _this.tableHeight = 0;
        _this._cellWidth = _this.options['width'] / _this._colNum;
        _this._cellHeight = _this.options['height'] / _this._rowNum;
        _this._currentRow = -1;
        _this._currentCol = -1;
        _this._geometryNumLabels = [];
        _this._rowHeights = [];
        _this._colWidths = [];
        _this._initRowHeightAndColWidth();
        _this.tableSymbols = _this._initCellSymbol();
        return _ret = _this, possibleConstructorReturn(_this, _ret);
    }

    Table.prototype.toJSON = function toJSON() {
        return {
            'options': this.options,
            'colums': this._columns,
            'attributes': this._headAttributes,
            'colNum': this._colNum,
            'data': this._dataToJSON(),
            'rowNum': this._rowNum,
            'rowHeights': this._rowHeights,
            'colWidths': this._colWidths,
            'tableWidth': this.tableWidth,
            'tableHeight': this.tableHeight,
            'tableSymbols': this.tableSymbols
        };
    };

    Table.prototype._dataToJSON = function _dataToJSON() {
        var result = [];
        if (this.options['dynamic'] && this._data && this._data.length > 0) {
            var item;
            for (var i = 0, len = this._data.length; i < len; i++) {
                item = this._data[i];
                result.push(item);
            }
        } else {
            result = this._data;
        }
        return result;
    };

    Table.prototype.initByJson = function initByJson(json) {
        var options = json['options'];
        this._columns = json['colums'];
        this._colNum = json['colNum'];
        this._headAttributes = json['attributes'];
        this._data = [];
        //处理其中geometry
        var data = json['data'];
        if (options['dynamic'] && data && data.length > 0) {
            var item, geoJson, geometry;
            for (var i = 0, len = data.length; i < len; i++) {
                item = data[i];
                geoJson = item['geometry'];
                if (geoJson) {
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
        this._tableRows = this._data;
        this.tableSymbols = json['tableSymbols'] || this._initCellSymbol();
        return this;
    };

    Table.prototype.getId = function getId() {
        return this.options['id'];
    };

    Table.prototype.isDynamic = function isDynamic() {
        return this.options['dynamic'];
    };

    Table.prototype.getLayerId = function getLayerId() {
        return this.options['layerId'];
    };

    Table.prototype.getType = function getType() {
        return 'MAPTALKS_TABLE';
    };

    Table.prototype.getData = function getData() {
        var result = [];
        for (var i = 0; i < this._data.length; i++) {
            result.push(this._data[i]);
        }
        return result;
    };

    Table.prototype.getDataByRowNum = function getDataByRowNum(rowNum) {
        if (this.options['header']) {
            rowNum -= 1;
        }
        var data = this.getData();
        return data[rowNum];
    };

    Table.prototype.getMaxOrder = function getMaxOrder() {
        var maxNum = this._data.length + this.options['startNum'] || 1 - 1;
        return maxNum;
    };

    Table.prototype.setStartNum = function setStartNum(num) {
        var startNum = this.options['startNum'] || 1;
        if (this.options['order'] && num !== startNum) {
            this.options['startNum'] = num;
            this._resetOrderNum(num);
            this.fire('orderchanged', this);
        }
    };

    Table.prototype.getRowHeight = function getRowHeight(rowNum) {
        return this._rowHeights[rowNum];
    };

    Table.prototype.getColWidth = function getColWidth(colNum) {
        return this._colWidths[colNum];
    };

    /**
     * add table to layer.
     * @param {maptalks.Layer} layer
     */


    Table.prototype.addTo = function addTo(layer) {
        if (!layer) {
            return;
        }
        this._layer = layer;
        this._tableRows = this.createTable();
        this._addToLayer(this._tableRows, true);
        this.addStretchLine();
        this._addEventsToTable();
    };

    Table.prototype._addEventsToTable = function _addEventsToTable() {
        if (this.options['editable']) {
            this.on('dblclick', function (event) {
                var cell = event.context['cell'];
                if (cell) {
                    this._addEditEventToCell(cell);
                }
            });
        }
    };

    Table.prototype.getLayer = function getLayer() {
        return this._layer;
    };

    Table.prototype.getMap = function getMap() {
        if (this._layer) return this._layer.getMap();else return null;
    };

    Table.prototype.getCenter = function getCenter() {
        return this.getCoordinates();
    };

    Table.prototype.getCoordinates = function getCoordinates() {
        var postion = this.options['position'];
        return new maptalks.Coordinate(postion.x, postion.y);
    };

    Table.prototype.animate = function animate(style, options, callback) {
        var cells = this.getAllCells();
        if (cells && cells.length > 0) {
            for (var i = 0, length = cells.length; i < length; i++) {
                cells[i].animate(style, options, callback);
            }
        }
    };

    Table.prototype._initRowHeightAndColWidth = function _initRowHeightAndColWidth() {
        if (this._rowHeights.length === 0 || this._colWidths.length === 0) {
            for (var i = 0; i < this._colNum; i++) {
                this._colWidths[i] = 0;
            }
            for (var _i = 0; _i < this._rowNum; _i++) {
                this._rowHeights[_i] = 0;
            }
            if (this.options['header']) {
                this._calculateHeaderHeight();
            }
            this._calculateRowHeight();
        }
    };

    Table.prototype._calculateHeaderHeight = function _calculateHeaderHeight() {
        for (var i = 0, len = this._columns.length; i < len; i++) {
            var col = this._columns[i];
            var header = col['header'];
            var maxWidth = col['maxWidth'] || this._cellWidth;
            var style = this.getCellSymbol(0, i);
            var font = maptalks.StringUtil.getFont(style);
            var size = maptalks.StringUtil.stringLength(header, font);
            if (size['width'] <= maxWidth) {
                maxWidth = size['width'];
            }
            style['textWrapWidth'] = maxWidth;
            var row = maptalks.StringUtil.splitTextToRow(header, style);
            var rowSize = row['size'];
            if (this._colWidths[i] < rowSize['width']) {
                if (rowSize['width'] <= maxWidth) {
                    this._colWidths[i] = rowSize['width'];
                } else {
                    this._colWidths[i] = maxWidth;
                }
            }
            if (this._rowHeights[i] < rowSize['height']) {
                this._rowHeights[0] = rowSize['height'];
            }
        }
    };

    Table.prototype._calculateRowHeight = function _calculateRowHeight() {
        var start = 0;
        if (this.options['header']) {
            start = 1;
        }
        for (var i = 0, len = this._data.length; i < len; i++) {
            var row = this._data[i];
            for (var j = 0, length = this._columns.length; j < length; j++) {
                var col = this._columns[j];
                var content = row[col.dataIndex];
                var maxWidth = col.maxWidth || this._cellWidth,
                    width = 0;
                var style = this.getCellSymbol(i + start, j);
                var font = maptalks.StringUtil.getFont(style);
                var size = maptalks.StringUtil.stringLength(content, font);
                if (size['width'] >= maxWidth) {
                    width = maxWidth;
                } else if (size['width'] <= this._colWidths[j]) {
                    width = this._colWidths[j];
                } else {
                    width = size['width'];
                }
                style['textWrapWidth'] = width;
                this._colWidths[j] = width;
                var result = maptalks.StringUtil.splitTextToRow(content, style);
                var rowSize = result['size'];
                if (this._rowHeights[i + start] < rowSize['height']) {
                    this._rowHeights[i + start] = rowSize['height'];
                }
            }
        }
    };

    Table.prototype._initCellSymbol = function _initCellSymbol() {
        var tableSymbols = {};
        var headerSymbol = this.options['headerSymbol'] || this.options['symbol'];
        var defaultSymbol = this.options['symbol'];
        for (var i = 0; i < this._rowNum; i++) {
            if (i === 0 && this.options['header']) {
                for (var j = 0; j < this._colNum; j++) {
                    headerSymbol['textWrapWidth'] = this._colWidths[j];
                    tableSymbols[i + '_' + j] = headerSymbol;
                }
            } else {
                for (var _j = 0; _j < this._colNum; _j++) {
                    defaultSymbol['textWrapWidth'] = this._colWidths[_j];
                    tableSymbols[i + '_' + _j] = defaultSymbol;
                }
            }
        }
        return tableSymbols;
    };

    Table.prototype.hide = function hide() {
        var row;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                if (row[j].isEditingText()) {
                    row[j].endEditText();
                }
                row[j].hide();
            }
        }
        this.removeStretchLine();
        this.fire('hide', this);
        this.options['visible'] = false;
    };

    Table.prototype.show = function show() {
        var row;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].show();
            }
        }
        this.options['visible'] = true;
    };

    Table.prototype.isVisible = function isVisible() {
        return this.options['visible'];
    };

    Table.prototype.orderNumberIsVisible = function orderNumberIsVisible() {
        return this.options['showOrderNumber'];
    };

    Table.prototype.showOrderNumber = function showOrderNumber() {
        this._showNumLabel();
        this.options['showOrderNumber'] = true;
    };

    Table.prototype.hideOrderNumber = function hideOrderNumber() {
        this._hideNumLabel();
        this.options['showOrderNumber'] = false;
    };

    Table.prototype.getAllCells = function getAllCells() {
        var cells = [],
            row;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (row) {
                for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                    cells.push(row[j]);
                }
            }
        }
        if (this.options['dynamic'] && this.options['order']) {
            cells = cells.concat(this._geometryNumLabels);
        }
        return cells;
    };

    Table.prototype.remove = function remove() {
        this.stopEditTable();
        var row;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].remove();
            }
        }
        this._tableRows = [];
        //抛出事件
        this.fire('remove', this);
        //删除调整线
        this.removeStretchLine();
        //清理table上其它属性
        this._deleteTable();
    };

    Table.prototype.setZIndex = function setZIndex(index) {
        this._zindex = index;
        for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
            var row = this._tableRows[rowNum];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].setZIndex(index);
            }
        }
    };

    Table.prototype.getZIndex = function getZIndex() {
        return this._zindex;
    };

    Table.prototype.bringToFront = function bringToFront() {
        for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
            var row = this._tableRows[rowNum];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].bringToFront();
            }
        }
    };

    Table.prototype.bringToBack = function bringToBack() {
        for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
            var row = this._tableRows[rowNum];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].bringToBack();
            }
        }
    };

    Table.prototype.stopEditTable = function stopEditTable() {
        var row;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                if (row[j].isEditingText()) {
                    row[j].endEditText();
                }
            }
        }
    };

    Table.prototype.isEditing = function isEditing() {
        return this.options['editing'];
    };

    Table.prototype._deleteTable = function _deleteTable() {
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
    };

    Table.prototype.refreshData = function refreshData(dataArray, key) {
        var data = this.getData();
        var updateItems = this._getUpdateItems(data, dataArray, key),
            removeItems = this._getMinusItems(data, dataArray, key),
            newItems = this._getMinusItems(dataArray, data, key);
        for (var i = 0; i < updateItems.length; i++) {
            this.updateRow(updateItems[i]['maptalks_order'], updateItems[i]);
        }
        for (var j = removeItems.length - 1; j >= 0; j--) {
            this.removeRow(removeItems[j]['maptalks_order']);
        }
        var start = 0;
        if (this.options['header']) {
            start = 1;
        }
        var order = this.getData().length - 1;
        for (var m = 0; m < newItems.length; m++) {
            this.addRow(order + m + start, newItems[m], true);
        }
    };

    Table.prototype._uniquelize = function _uniquelize(a, key) {
        if (!key) return [];
        var result = [];
        for (var i = 0; i < a.length; i++) {
            var notContain = true;
            for (var j = 0; j < result.length; j++) {
                if (a[i][key] === result[j][key]) {
                    notContain = false;
                    break;
                }
            }
            if (notContain) {
                result.push(a[i]);
            }
        }
        return result;
    };

    Table.prototype._getUpdateItems = function _getUpdateItems(a, b, key) {
        if (!key) return [];
        var result = [];
        a = this._uniquelize(a, key);
        for (var i = 0; i < a.length; i++) {
            for (var j = 0; j < b.length; j++) {
                if (b[j][key] === a[i][key]) {
                    b[j]['maptalks_order'] = a[i]['maptalks_order'];
                    result.push(b[j]);
                    break;
                }
            }
        }
        return result;
    };

    Table.prototype._getMinusItems = function _getMinusItems(a, b, key) {
        if (!key) return [];
        var result = [];
        a = this._uniquelize(a, key);
        for (var i = 0; i < a.length; i++) {
            var notContain = true;
            for (var j = 0; j < b.length; j++) {
                if (b[j][key] === a[i][key]) {
                    notContain = false;
                }
            }
            if (notContain) {
                result.push(a[i]);
            }
        }
        return result;
    };

    Table.prototype.setCoordinates = function setCoordinates(coordinate) {
        var coorObj = new maptalks.Coordinate(coordinate.x, coordinate.y);
        var offset = coorObj.substract(this.getCenter());
        this._translate(offset);
    };

    Table.prototype._addToLayer = function _addToLayer(tableRow, init) {
        var row = void 0,
            cell = void 0;
        for (var i = 0, len = tableRow.length; i < len; i++) {
            row = tableRow[i];
            if (!row) return;
            for (var j = 0, rowNum = row.length; j < rowNum; j++) {
                cell = row[j];
                if (init) {
                    cell._row = i;
                    cell._col = j;
                }
                this._addEventsToCell(cell).addTo(this._layer);
            }
        }
    };

    Table.prototype._showHeaderItemMenu = function _showHeaderItemMenu(cell, coordinate) {
        var items = [];
        var attr = void 0,
            displayName = void 0,
            item = void 0;
        for (var i = 0, len = this._headAttributes.length; i < len; i++) {
            attr = this._headAttributes[i];
            displayName = attr['displayName'];
            item = { 'item': displayName, 'click': this._changeHeader.apply(this, cell) };
            items.push(item);
        }
        var menuOptions = {
            'width': 100,
            'style': 'grey',
            'items': items
        };
        this.getMap().setMenu(menuOptions).openMenu(coordinate);
    };

    Table.prototype._changeHeader = function _changeHeader(param, cell) {
        var index = param['index'];
        var attr = this._headAttributes[index];
        cell['dataIndex'] = attr['name'];
        cell.setContent(attr['displayName']);
        this._setColData(cell);
        var col = cell._col;
        this._columns[col] = { header: attr['displayName'], dataIndex: attr['name'], type: 'string' };
    };

    Table.prototype._setColData = function _setColData(cell) {
        var dataIndex = cell['dataIndex'];
        var colNum = cell._col;
        var newValues = [];
        var item = void 0;
        for (var i = 0, len = this._initalData.length; i < len; i++) {
            item = this._initalData[i];
            newValues[i + 1] = item[dataIndex];
        }
        var row = void 0;
        for (var _i2 = 1, _len = this._tableRows.length; _i2 < _len; _i2++) {
            row = this._tableRows[_i2];
            if (!row) return;
            cell = row[colNum];
            cell.setContent(newValues[_i2]);
        }
    };

    Table.prototype._dragTableStart = function _dragTableStart() {
        this.fire('dragstart', { 'target': this });
    };

    Table.prototype._dragTableEnd = function _dragTableEnd() {
        this.fire('dragend', { 'target': this });
    };

    Table.prototype._dragTable = function _dragTable() {
        var dragOffset = event['dragOffset'];
        this._translate(dragOffset);
        this.fire('moving dragging', { 'target': this });
    };

    Table.prototype._translate = function _translate(offset) {
        var row = void 0,
            cell = void 0;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                cell.translate(offset);
                if (i === 0 && j === 0) {
                    this.options['position'] = cell.getCenter();
                }
            }
        }
    };

    Table.prototype._addMouseoverEvent = function _addMouseoverEvent(event) {
        event['context'] = this;
        this['table'].fire('mouseover', event);
    };

    Table.prototype._addMouseoutEvent = function _addMouseoutEvent(event) {
        event['context'] = this;
        this['table'].fire('mouseout', event);
    };

    Table.prototype._addMousedownEvent = function _addMousedownEvent(event) {
        event['context'] = this;
        this['table'].fire('mousedown', event);
    };

    Table.prototype._addClickEvent = function _addClickEvent(event) {
        event['context'] = this;
        this['table'].fire('click', event);
    };

    Table.prototype._addDBLClickEvent = function _addDBLClickEvent(event) {
        event['context'] = this;
        this['table'].fire('dblclick', event);
    };

    Table.prototype._addContextmenuEvent = function _addContextmenuEvent(event) {
        event['context'] = this;
        this['table'].fire('contextmenu', event);
    };

    Table.prototype._addEditTableEvent = function _addEditTableEvent(event) {
        event['context'] = this;
        this['table'].fire('edittablestart', event);
        this['table'].options['editing'] = true;
    };

    Table.prototype.createTable = function createTable() {
        var dataset = [];
        var item;
        for (var i = 0; i < this._rowNum; i++) {
            if (i === 0 && this.options['header']) {
                dataset.push(this.createHeader());
                continue;
            }
            item = this._data[i];
            if (this._data && this._data.length > 0) {
                if (this.options['header']) {
                    item = this._data[i - 1];
                }
                if (item) {
                    dataset.push(this._createRow(i, item));
                }
            }
        }
        return dataset;
    };

    Table.prototype.getColumns = function getColumns() {
        var columns = this.options['columns'];
        if (!columns) {
            columns = [];
            var firstRow = this.options['data'];
            var type = void 0,
                column = void 0;
            for (var key in firstRow) {
                type = this._getDataType(firstRow[key]);
                column = { header: key, dataIndex: key, type: type };
                columns.push(column);
            }
        }
        return columns;
    };

    Table.prototype._getDataType = function _getDataType(value) {
        var type = 'string';
        if (maptalks.isNumber(value)) {
            type = 'number';
        }
        return type;
    };

    Table.prototype.setTableStyle = function setTableStyle(attr, value, isGlobal) {
        if (isGlobal) {
            for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
                this._setRowStyle(rowNum, attr, value);
            }
            this._changeDefaultSymbol(attr, value);
        } else {
            var _rowNum = this._currentRow;
            var colNum = this._currentCol;
            if (_rowNum > -1) {
                this._setRowStyle(_rowNum, attr, value);
            }
            if (colNum > -1) {
                this._setColStyle(colNum, attr, value);
            }
        }
    };

    Table.prototype._setRowStyle = function _setRowStyle(rowNum, attr, value) {
        var row = this._tableRows[rowNum];
        for (var j = 0, rowLength = row.length; j < rowLength; j++) {
            var cell = row[j];
            var symbol = cell.getSymbol();
            var style = value;
            if (attr === 'textFont') {
                style = value + ' ' + symbol['textSize'] + 'px ' + symbol['textFaceName'];
            }
            this._setStyleToCell(cell, attr, style);
        }
    };

    Table.prototype._setColStyle = function _setColStyle(colNum, attr, value) {
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            var row = this._tableRows[i];
            var cell = row[colNum];
            var symbol = cell.getSymbol();
            var style = value;
            if (attr === 'textFont') {
                style = value + ' ' + symbol['textSize'] + 'px ' + symbol['textFaceName'];
            }
            this._setStyleToCell(cell, attr, style);
        }
    };

    Table.prototype._setStyleToCell = function _setStyleToCell(cell, attr, value) {
        var symbol = cell.getSymbol();
        if (attr === 'textAlign') {
            symbol['textHorizontalAlignment'] = value;
            if (value === 'left') {
                symbol['textDx'] -= cell.getSize['width'] / 2;
            } else if (value === 'right') {
                symbol['textDx'] += cell.getSize['width'] / 2;
            }
            cell.setSymbol(symbol);
        } else {
            symbol[attr] = value;
            cell.setSymbol(symbol);
        }
    };

    Table.prototype._changeDefaultSymbol = function _changeDefaultSymbol(attr, value) {
        var symbol = this.options['symbol'];
        if (attr === 'textAlign') {
            symbol['textHorizontalAlignment'] = value;
        } else if (attr === 'textFont') {
            value = value + ' ' + symbol['textSize'] + 'px ' + symbol['textFaceName'];
        } else if (attr === 'markerFill') {
            symbol['fill'] = value;
        } else if (attr === 'markerLineColor') {
            symbol['lineColor'] = value;
        }
        symbol[attr] = value;
        this.options['symbol'] = symbol;
    };

    return Table;
}(maptalks.JSONAble(maptalks.Eventable(maptalks.Handlerable(maptalks.Class))));

Table.mergeOptions(defaultOptions);

Table.registerJSONType('Table');

Table.include( /** @lends Table.prototype */{

    createCell: function createCell(content, cellOffset, size, symbol) {
        var textSize = symbol['textSize'] || 12;
        var textLineSpacing = symbol['textLineSpacing'] || 8;
        content = this._filterContent(content);
        var options = {
            'symbol': {
                'markerLineColor': symbol['lineColor'] || '#ffffff',
                'markerLineWidth': 1,
                'markerLineOpacity': 0.9,
                'markerLineDasharray': null,
                'markerFill': symbol['fill'] || '#4e98dd',
                'markerFillOpacity': 0.9,
                'markerDx': cellOffset['dx'] || 0,
                'markerDy': cellOffset['dy'] || 0,

                'textFaceName': symbol['textFaceName'] || 'microsoft yahei',
                'textSize': textSize,
                'textFill': symbol['textFill'] || '#ff0000',
                'textOpacity': 1,
                'textSpacing': 30,
                'textWrapWidth': size['width'],
                'textWrapBefore': false,
                'textLineSpacing': textLineSpacing,
                'textHorizontalAlignment': symbol['textHorizontalAlignment'] || 'middle',
                'textVerticalAlignment': symbol['textVerticalAlignment'] || 'middle',
                'textWeight': symbol['textWeight'],
                'textStyle': symbol['textStyle'],
                'textDx': cellOffset['dx'] || 0,
                'textDy': cellOffset['dy'] || 0
            },
            'boxPadding': { 'width': 15, 'height': 8 },
            'draggable': false,
            'boxAutoSize': false,
            'boxMinWidth': size['width'],
            'boxMinHeight': size['height']
        };
        var coordinate = this.options['position'];
        return new maptalks.TextBox(content, coordinate, options);
    },

    getCellOffset: function getCellOffset(row, col) {
        var dx = 0,
            dy = 0,
            currentRowHeight = this._cellWidth / 2,
            currentColWidth = this._cellHeight / 2;
        if (this._rowHeights[row]) {
            currentRowHeight = this._rowHeights[row] / 2;
        }
        if (this._colWidths[col]) {
            currentColWidth = this._colWidths[col] / 2;
        }
        for (var i = 0; i < row; i++) {
            dy += this._rowHeights[i];
        }
        dy += currentRowHeight;
        for (var _i = 0; _i < col; _i++) {
            dx += this._colWidths[_i];
        }
        dx += currentColWidth;
        return { 'dx': dx, 'dy': dy };
    },

    getCellSymbol: function getCellSymbol(row, col) {
        var defaultSymbol = this.options['symbol'];
        if (this.tableSymbols) {
            var symbol = this.tableSymbols[row + '_' + col];
            if (symbol) {
                if (!symbol['textLineSpacing']) {
                    symbol['textLineSpacing'] = defaultSymbol['textLineSpacing'];
                }
                return symbol;
            }
        }
        return defaultSymbol;
    },

    getRowNum: function getRowNum(cell) {
        return cell._row;
    },

    getColNum: function getColNum(cell) {
        return cell._col;
    },

    _addEventsToCell: function _addEventsToCell(cell) {
        var context = {
            'table': this,
            'cell': cell,
            'row': cell._row,
            'col': cell._col,
            'dataIndex': cell.dataIndex
        };
        cell.on('mouseover', this._addMouseoverEvent, context).on('mouseout', this._addMouseoutEvent, context).on('mousedown', this._addMousedownEvent, context).on('click', this._addClickEvent, context).on('dblclick', this._addDBLClickEvent, context).on('contextmenu', this._addContextmenuEvent, context).on('symbolchange', this._cellSymbolChangeEvent, context).on('edittextstart', this._addEditTableEvent, context).on('edittextend', this._cellEditTextEnd, context);
        return cell;
    },

    _cellSymbolChangeEvent: function _cellSymbolChangeEvent(event) {
        event['context'] = this;
        var table = this['table'];
        var cell = this['cell'];
        table.fire('symbolchange', event);
        var symbol = this['cell'].getSymbol();
        table.tableSymbols[cell['_row'] + '_' + cell['_col']] = table.convertCellToSaveSymbol(symbol);
    },

    _cellEditTextEnd: function _cellEditTextEnd(event) {
        event['context'] = this;
        var table = this['table'];
        var cell = this['cell'];
        var rowNum = cell._row;
        var colNum = cell._col;
        var col = table._columns[colNum];
        var dataType = col['dataIndex'];
        if (table.options['header']) {
            if (rowNum > 0) {
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

    convertCellToSaveSymbol: function convertCellToSaveSymbol(symbol) {
        var saveSymbol = {
            fill: symbol['markerFill'],
            lineColor: symbol['markerLineColor'],
            textFaceName: symbol['textFaceName'],
            textFill: symbol['textFill'],
            textSize: symbol['textSize'],
            textWrapWidth: symbol['textWrapWidth'],
            textHorizontalAlignment: symbol['textHorizontalAlignment'],
            textWeight: symbol['textWeight'],
            textStyle: symbol['textStyle']
        };
        return saveSymbol;
    },

    removeNumLabelByRowNum: function removeNumLabelByRowNum(rowNum) {
        for (var i = this._geometryNumLabels.length - 1; i >= rowNum - 1; i--) {
            this._geometryNumLabels[i].remove();
            this._geometryNumLabels.splice(i, 1);
        }
    },

    _addEditEventToCell: function _addEditEventToCell(cell) {
        cell.startEditText();
        var textEditor = cell._textEditor;
        textEditor.focus();
        var value = textEditor.value;
        textEditor.value = '';
        if (value !== '空') {
            textEditor.value = value;
        }
        var me = this;
        cell.on('remove', function () {
            if (cell.isEditingText()) {
                cell.endEditText();
            }
        });
        cell.on('edittextend', function () {
            var content = cell.getContent();
            var row = cell._row;
            var col = cell._col;
            var colIndex = me._columns[col]['dataIndex'];
            if (me.options['header'] && row > 0) {
                me._data[row - 1][colIndex] = content;
            } else {
                me._columns[col]['header'] = content;
            }
        });
    },

    _addNumberLabelToGeometry: function _addNumberLabelToGeometry(coordinate, cell) {
        var _this = this;

        //设置label属性
        var cellSymbol = cell.getSymbol();
        var numberLabelId = this.getId() + '_' + this.getRowNum(cell);
        var options = {
            'id': numberLabelId,
            'symbol': this._convertCellSymbolToNumberSymbol(cellSymbol),
            'draggable': false,
            'boxAutoSize': false,
            'boxMinWidth': 20,
            'boxMinHeight': 20
        };
        //创建label
        var num = cell.getContent();
        var numberLabel = this.getLayer().getGeometryById(numberLabelId);
        if (!numberLabel) {
            numberLabel = new maptalks.Label(num, coordinate, options);
            this.getLayer().addGeometry(numberLabel);
        }
        this._geometryNumLabels.push(numberLabel);
        var me = this;
        cell.on('remove', function () {
            me._removeNumLabel(numberLabel);
            numberLabel.remove();
        }, this);
        cell.on('hide', function () {
            numberLabel.hide();
        }, this);
        cell.on('show', function () {
            numberLabel.show();
        }, this);
        cell.on('contentchange', function () {
            var start = 0;
            if (_this.options['header']) {
                start = -1;
            }
            var row = cell._row + start;
            var item = _this._data[row];
            var _coordiante = item.coordinate;
            if (_coordiante) numberLabel.setCoordinates(new maptalks.Coordinate(_coordiante.x, _coordiante.y));
        }, this);
        cell.on('symbolchange', function () {
            var symbol = _this._convertCellSymbolToNumberSymbol(cell.getSymbol());
            _this._changeNumLabelSymbol(numberLabel, symbol);
            numberLabel.setSymbol(symbol);
        }, this);
        cell.on('contentchange positionchanged', function () {
            var number = cell.getContent();
            _this._changeNumLabelContent(numberLabel, number);
            numberLabel.setContent(number);
        }, this);
    },

    _hideNumLabel: function _hideNumLabel() {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
            this._geometryNumLabels[i].hide();
        }
    },

    _showNumLabel: function _showNumLabel() {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
            this._geometryNumLabels[i].show();
        }
    },

    _removeNumLabel: function _removeNumLabel(label) {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
            if (label === this._geometryNumLabels[i]) {
                this._geometryNumLabels.splice(i, 1);
                break;
            }
        }
    },

    _changeNumLabelSymbol: function _changeNumLabelSymbol(label, symbol) {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
            if (label === this._geometryNumLabels[i]) {
                this._geometryNumLabels[i].setSymbol(symbol);
                break;
            }
        }
    },

    _changeNumLabelContent: function _changeNumLabelContent(label, content) {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
            if (label === this._geometryNumLabels[i]) {
                this._geometryNumLabels[i].setContent(content);
                break;
            }
        }
    },

    _convertCellSymbolToNumberSymbol: function _convertCellSymbolToNumberSymbol(cellSymbol) {
        var symbol = {
            'markerType': 'ellipse',
            'markerLineColor': '#ffffff', //cellSymbol['markerLineColor']||'#ffffff',
            'markerLineWidth': 0, //cellSymbol['markerLineWidth']||1,
            'markerLineOpacity': cellSymbol['markerLineOpacity'] || 0,
            'markerFill': cellSymbol['markerFill'] || '#4e98dd',
            'markerFillOpacity': cellSymbol['markerFillOpacity'] || 1,
            'markerDx': 0,
            'markerDy': 0,
            'markerHeight': 30,
            'markerWidth': 30,

            'textFaceName': cellSymbol['textFaceName'] || 'microsoft yahei',
            'textSize': cellSymbol['textSize'] || 12,
            'textFill': cellSymbol['textFill'] || '#ff0000',
            'textOpacity': cellSymbol['textOpacity'] || 1,
            'textSpacing': cellSymbol['textSpacing'] || 0,
            'textWrapBefore': false,
            'textLineSpacing': cellSymbol['textLineSpacing'] || 0,
            'textHorizontalAlignment': cellSymbol['textHorizontalAlignment'] || 'middle',
            'textVerticalAlignment': cellSymbol['textVerticalAlignment'] || 'middle',
            'textDx': 0,
            'textDy': 0
        };
        return symbol;
    },

    _filterContent: function _filterContent(content) {
        content = content + '';
        var result = content.replace(/\r/ig, '').replace(/\v/ig, '').replace(/\f/ig, '').replace(/\t/ig, '').replace(/\b/ig, '').replace(/\n\n/ig, '\n');
        return result;
    },

    isNumber: function isNumber(val) {
        return typeof val === 'number' && !isNaN(val);
    }

});

Table.include( /** @lends Table.prototype */{

    /**
     * 添加一列
     * @param {Number} colNum 添加新列的位置
     * @param {Object} data 添加的列数据
     * @param {Boolean} right :true,右侧;false,左侧
     */
    addCol: function addCol(colNum, data, right) {
        var insertColNum = colNum + 1;
        if (!right) {
            insertColNum = colNum;
        }
        this._createCol(insertColNum, data, true);
        return this;
    },

    _createCol: function _createCol(insertColNum, data, add) {
        this.removeStretchLine();
        var startCol = insertColNum; //调整起始列
        if (!data || data.length === 0) data = '';
        //insert column
        var cells = [];
        var insertColLength = 1;
        var colCell = void 0;
        if (maptalks.Util.isArrayHasData(data[0])) {
            insertColLength = data.length;
            colCell = [];
            for (var i = 0, len = data.length; i < len; i++) {
                for (var j = 0; j < this._rowNum; j++) {
                    var tempCell = this._addCellForColumn(data[i][0], data[i][j], j, insertColNum + i, add);
                    this._tableRows[j].splice(insertColNum + i, 0, tempCell);
                }
            }
            cells.push(colCell);
        } else {
            for (var _i = 0; _i < this._rowNum; _i++) {
                var _tempCell = this._addCellForColumn(data[0], data[_i], _i, insertColNum, add);
                this._tableRows[_i].splice(insertColNum, 0, _tempCell);
            }
        }
        this._colNum += insertColLength;
        //调整之后的列
        this._adjustDatasetForCol(startCol, insertColLength);
    },

    _addCellForColumn: function _addCellForColumn(header, item, rowNum, colNum, add) {
        var cellOffset = void 0,
            symbol = void 0,
            size = void 0,
            cellWidth = void 0,
            cell = void 0;
        if (add) {
            var prevColNum = colNum - 1;
            var offset = this.getCellOffset(rowNum, prevColNum);
            var prevCellWidth = this._colWidths[prevColNum];
            if (rowNum === 0) {
                cellOffset = {
                    'dx': offset.dx + (prevCellWidth + this._cellWidth) / 2,
                    'dy': offset.dy
                };
            } else {
                cellOffset = this.getCellOffset(rowNum, colNum);
            }
            symbol = this.options['symbol'];
            if (this.options['header'] && rowNum === 0) {
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
        if (rowNum === 0) {
            var column = { header: header, dataIndex: header, type: 'string' };
            this._columns.splice(colNum, 0, column);
            cell = this.createCell(header, cellOffset, size, symbol);
            this.tableWidth += cellWidth;
            this._colWidths.splice(colNum, 0, cellWidth);
        } else {
            cell = this.createCell(item, cellOffset, size, symbol);
            //update table data
            if (this.options['header']) {
                --rowNum;
            }
            this._data[rowNum][header] = item;
        }
        cell._row = rowNum;
        cell._col = colNum;
        cell.dataIndex = header;
        this.tableSymbols[rowNum + '_' + colNum] = symbol;
        this._addEventsToCell(cell).addTo(this._layer);
        return cell;
    },

    moveCol: function moveCol(sourceColNum, direction) {
        this.stopEditTable();
        this.removeStretchLine();
        var targetColNum = sourceColNum;
        if (direction === 'left') {
            if (sourceColNum > 0) {
                targetColNum = sourceColNum - 1;
            }
        } else if (direction === 'right') {
            if (sourceColNum < this._colNum - 1) {
                targetColNum = sourceColNum + 1;
            }
        }
        this._changeColOrder(sourceColNum, targetColNum);
    },

    _changeColOrder: function _changeColOrder(sourceColNum, targetColNum) {
        if (sourceColNum === targetColNum) {
            return;
        }
        // let start = 0;
        // if (this.options['header']) {
        //     start = -1;
        // }
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

        if (sourceColDx < targetColDx) {
            sourceColDx = sourceColDx + targetColWidth;
            targetColDx = targetColDx - sourceColWidth;
        } else {
            sourceColDx = sourceColDx - targetColWidth;
            targetColDx = targetColDx + sourceColWidth;
        }
        //调整列位置
        var row = void 0,
            sourceCellSymbol = void 0,
            targetCellSymbol = void 0,
            temp = void 0;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
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
        this._colWidths[sourceColNum] = this._colWidths[targetColNum];
        this._colWidths[targetColNum] = sourceColWidth;
        //调整列次序
        var sourceColumn = this._columns[sourceColNum];
        this._columns[sourceColNum] = this._columns[targetColNum];
        this._columns[targetColNum] = sourceColumn;
    },

    _adjustDatasetForCol: function _adjustDatasetForCol(start, insertColLength) {
        var startPoint = this.options['position'];
        var map = this._layer.getMap();
        var rowData = void 0,
            cell = void 0,
            colLine = void 0,
            size = void 0,
            symbol = void 0,
            dx = void 0,
            upPoint = void 0,
            downPoint = void 0;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            rowData = this._tableRows[i];
            if (!rowData) return;
            for (var j = start + 1, rowLength = rowData.length; j < rowLength; j++) {
                cell = rowData[j];
                cell._col += insertColLength;
                cell.fire('symbolchange', cell);
                this._translateDx(cell, this._cellWidth);
                //调整交互列
                if (i === 0) {
                    if (this._adjustCols) {
                        colLine = this._adjustCols[j];
                        size = cell.getSize();
                        symbol = cell.getSymbol();
                        dx = symbol['textDx'];
                        upPoint = map.locate(startPoint, map.pixelToDistance(size['width'] / 2 + dx, 0), map.pixelToDistance(0, size['height'] / 2));
                        downPoint = map.locate(upPoint, 0, -map.pixelToDistance(0, this.tableHeight));
                        colLine.setCoordinates([upPoint, downPoint]);
                    }
                }
            }
        }
    },

    /**
     * 删除列
     * @param {Number} colNum 列号
     */
    removeCol: function removeCol(colNum) {
        this.stopEditTable();
        this.removeStretchLine();
        var firstRow = this._tableRows[0];
        var removeCell = firstRow[colNum];
        var removeSize = removeCell.getSize();
        var startPoint = this.options['position'];
        var map = this._layer.getMap();
        var row = void 0,
            cell = void 0,
            colLine = void 0,
            size = void 0,
            symbol = void 0,
            dx = void 0,
            upPoint = void 0,
            downPoint = void 0;
        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = colNum, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                if (i === 0 && j === colNum) {
                    //表格宽度缩短
                    this.tableWidth -= removeSize['width'];
                }
                if (j > colNum) {
                    this._translateDx(cell, -removeSize['width'] + 1);
                    if (i === 0) {
                        if (this._adjustCols) {
                            colLine = this._adjustCols[cell._col];
                            size = cell.getSize();
                            symbol = cell.getSymbol();
                            dx = symbol['textDx'];
                            upPoint = map.locate(startPoint, map.pixelToDistance(size['width'] / 2 + dx, 0), map.pixelToDistance(0, size['height'] / 2));
                            downPoint = map.locate(upPoint, 0, -map.pixelToDistance(0, this.tableHeight));
                            colLine.setCoordinates([upPoint, downPoint]);
                        }
                    }
                    cell._col -= 1;
                } else {
                    cell.remove();
                }
            }
            //删除列数据
            this._tableRows[i].splice(colNum, 1);
            if (this.options['header']) {
                if (i > 0) {
                    delete this._data[i - 1][removeCell.dataIndex];
                }
            } else {
                delete this._data[i][removeCell.dataIndex];
            }
        }
        this._colWidths.splice(colNum, 1);
        //移除列数据
        this._columns.splice(colNum, 1);
        //移除列数据
        this._colNum -= 1;
    },

    _translateDx: function _translateDx(cell, width) {
        var symbol = cell.getSymbol();
        symbol['markerDx'] += width;
        symbol['textDx'] += width;
        cell.setSymbol(symbol);
    }

});

var DRAG_STAGE_LAYER_ID = maptalks.INTERNAL_LAYER_PREFIX + '_drag_stage';

var EVENTS = maptalks.Browser.touch ? 'touchstart mousedown' : 'mousedown';

/**
 * Drag handler for table.
 * @category handler
 * @extends Handler
 * @ignore
 */

var TableDragHandler = function (_maptalks$Handler) {
    inherits(TableDragHandler, _maptalks$Handler);

    /**
     * @param  {Geometry} target geometry target to drag
     */
    function TableDragHandler(target) {
        classCallCheck(this, TableDragHandler);
        return possibleConstructorReturn(this, _maptalks$Handler.call(this, target));
    }

    TableDragHandler.prototype.addHooks = function addHooks() {
        this.target.on(EVENTS, this._startDrag, this);
    };

    TableDragHandler.prototype.removeHooks = function removeHooks() {
        this.target.off(EVENTS, this._startDrag, this);
    };

    TableDragHandler.prototype._startDrag = function _startDrag(param) {
        var map = this.target.getMap();
        if (!map) {
            return;
        }
        if (this._isDragging) {
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
    };

    TableDragHandler.prototype._prepareMap = function _prepareMap() {
        var map = this.target.getMap();
        this._mapDraggable = map.options['draggable'];
        this._mapHitDetect = map.options['hitDetect'];
        map._trySetCursor('move');
        map.config({
            'hitDetect': false,
            'draggable': false
        });
    };

    TableDragHandler.prototype._prepareDragHandler = function _prepareDragHandler() {
        var map = this.target.getMap();
        this._dragHandler = new maptalks.DragHandler(map._panels.mapWrapper || map._containerDOM);
        this._dragHandler.on('dragging', this._dragging, this);
        this._dragHandler.on('mouseup', this._endDrag, this);
        this._dragHandler.enable();
    };

    TableDragHandler.prototype._prepareShadow = function _prepareShadow() {
        var target = this.target;
        this._prepareDragStageLayer();
        if (this._shadow) {
            this._shadow.remove();
        }
        var width = target.tableWidth,
            height = target.tableHeight;
        this._shadow = new maptalks.Marker(target.getCenter(), {
            'draggable': true,
            'symbol': {
                'markerType': 'square',
                'markerLineColor': '#ffffff',
                'markerLineDasharray': [5, 5, 2, 5],
                'markerFill': '#4e98dd',
                'markerFillOpacity': 0.2,
                'markerWidth': width,
                'markerHeight': height,
                'markerDx': width / 2,
                'markerDy': height / 2
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
    };

    TableDragHandler.prototype._onTargetUpdated = function _onTargetUpdated() {
        if (this._shadow) {
            this._shadow.setSymbol(this.target.getSymbol());
        }
    };

    TableDragHandler.prototype._prepareDragStageLayer = function _prepareDragStageLayer() {
        var map = this.target.getMap(),
            layer = this.target.getLayer();
        this._dragStageLayer = map.getLayer(DRAG_STAGE_LAYER_ID);
        if (!this._dragStageLayer) {
            this._dragStageLayer = new maptalks.VectorLayer(DRAG_STAGE_LAYER_ID, { 'drawImmediate': true });
            map.addLayer(this._dragStageLayer);
        }
        //copy resources to avoid repeat resource loading.
        this._dragStageLayer._getRenderer()._resources = layer._getRenderer()._resources;
    };

    TableDragHandler.prototype._dragging = function _dragging(param) {
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
    };

    TableDragHandler.prototype._endDrag = function _endDrag(param) {
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
            map.getLayer(DRAG_STAGE_LAYER_ID).removeGeometry(this._shadowConnectors);
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
    };

    return TableDragHandler;
}(maptalks.Handler);

Table.addInitHook('addHandler', 'draggable', TableDragHandler);

Table.include( /** @lends Table.prototype */{
    /**
     * Whether the table is being dragged.
     * @reutrn {Boolean}
     */
    isDragging: function isDragging() {
        if (!this._isDragging) {
            return false;
        }
        return true;
    }
});

Table.include( /** @lends Table.prototype */{

    createHeader: function createHeader() {
        var headerRow = [];
        var cellOffset = void 0,
            col = void 0,
            text = void 0,
            size = void 0,
            cell = void 0;
        for (var i = 0, len = this._columns.length; i < len; i++) {
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

Table.include( /** @lends Table.prototype */{

    /**
     * add Row for table
     * @param {Number} rowNum 添加新行的位置，包含表头
     * @param {Object} data 行数据
     * @param {Boolean} below : true,下方;false,上方
     */
    addRow: function addRow(rowNum, data, below) {
        var insertRowNum = rowNum;
        if (below) {
            insertRowNum = rowNum + 1;
        }
        //构造新加入的行
        var newDataset = [];
        if (!data || data.length === 0) {
            //添加空行
            newDataset.push(this._createRow(insertRowNum, data, true));
        } else if (maptalks.Util.isArrayHasData(data)) {
            var item = void 0;
            for (var i = 0, len = data.length; i < len; i++) {
                item = data[i];
                newDataset.push(this._createRow(insertRowNum, item, true));
                insertRowNum += 1;
            }
        } else {
            var row = this._createRow(insertRowNum, data, true);
            newDataset.push(row);
        }
        //添加新的数据集
        this._addToLayer(newDataset);
        //调整之前的数据集
        var startDataset = this._tableRows.slice(0, insertRowNum + 1);
        var lastDataset = this._tableRows.slice(insertRowNum + 1);
        this._adjustDatasetForRow(newDataset.length, lastDataset);
        this._tableRows = startDataset.concat(newDataset).concat(lastDataset);
        this._rowNum += newDataset.length;
        this.fire('addrow', this);
        this.fire('orderchanged', this);
        return this;
    },
    moveRow: function moveRow(sourceRowNum, direction) {
        this.stopEditTable();
        this.removeStretchLine();
        var targetRowNum = sourceRowNum;
        if (direction === 'up') {
            if (sourceRowNum > 0) {
                targetRowNum = sourceRowNum - 1;
            }
        } else if (direction === 'down') {
            if (sourceRowNum < this._rowNum - 1) {
                targetRowNum = sourceRowNum + 1;
            }
        }
        this._changeRowOrder(sourceRowNum, targetRowNum);
    },
    updateRow: function updateRow(rowNum, item) {
        this.removeStretchLine();
        rowNum = rowNum - parseInt(this.options['startNum'] || 1);
        var tableRowNum = rowNum;
        if (this.options['header']) {
            tableRowNum = rowNum + 1;
        }
        var row = this._tableRows[tableRowNum];
        if (!row) return;
        this._data[rowNum] = item;
        var dataIndex = void 0,
            text = void 0;
        for (var i = 0; i < this._colNum; i++) {
            var col = this._columns[i];
            dataIndex = col['dataIndex'];
            text = '';
            if (item && item[dataIndex]) {
                text = item[dataIndex];
            }
            var cell = row[i];
            if (cell) {
                if (this.options['order'] && dataIndex === 'maptalks_order') {
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
    removeRow: function removeRow(rowNum) {
        this.stopEditTable();
        this.removeStretchLine();
        var removeRow = this._tableRows[rowNum];
        var firstCell = removeRow[0];
        var size = firstCell.getSize();
        var row = void 0,
            cell = void 0;
        for (var i = rowNum, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                if (i > rowNum) {
                    cell._row -= 1;
                    if (this.options['order'] && this._columns[j]['dataIndex'] === 'maptalks_order') {
                        var startNum = this.options['startNum'] || 1;
                        if (startNum > 1) {
                            cell.setContent(cell._row + startNum);
                        } else {
                            cell.setContent(cell._row);
                        }
                    }
                    this._translateDy(cell, -size['height'] + 1);
                } else {
                    cell.remove();
                }
            }
        }
        this.tableHeight -= size['height'] + 1;
        //移除行数据
        this._tableRows.splice(rowNum, 1);
        this._rowHeights.splice(rowNum, 1);
        var adjustStartRow = 0;
        if (this.options['header']) {
            this._data.splice(rowNum - 1, 1);
            adjustStartRow = rowNum - 1;
        } else {
            this._data.splice(rowNum, 1);
            adjustStartRow = rowNum;
        }
        this.removeNumLabelByRowNum(rowNum);
        //调整data中删除行之后的数据
        for (var _i = adjustStartRow; _i < this._data.length; _i++) {
            this._data[_i]['maptalks_order'] -= 1;
        }
        //总行数减少
        this._rowNum -= 1;
        this.fire('removerow', this);
        this.fire('orderchanged', this);
    },
    getRow: function getRow(rowNum) {
        return this._tableRows[rowNum];
    },
    getRowHeight: function getRowHeight(rowNum) {
        return this._rowHeights[rowNum];
    },
    setRowHeight: function setRowHeight(rowNum, height) {
        var oldHeight = this._rowHeights[rowNum];
        var offset = height - oldHeight;
        this.setRowOffset(rowNum, offset);
    },
    setRowOffset: function setRowOffset(rowNum, heightOffset) {
        this._rowHeights[rowNum] += heightOffset;
        var height = this._rowHeights[rowNum];
        var row = void 0,
            cell = void 0,
            symbol = void 0;
        //reset row height
        for (var i = rowNum; i < this._rowNum; i++) {
            row = this._tableRows[i];
            for (var j = 0; j < this._colNum; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (i === rowNum) {
                    cell.options['boxMinHeight'] = height;
                    if (cell.options['boxMinHeight'] < symbol['markerHeight']) {
                        symbol['markerHeight'] = cell.options['boxMinHeight'];
                    }
                    symbol['textWrapWidth'] = height;
                    symbol['markerDy'] += heightOffset / 2;
                    symbol['textDy'] += heightOffset / 2;
                } else {
                    symbol['markerDy'] += heightOffset;
                    symbol['textDy'] += heightOffset;
                }
                cell.setSymbol(symbol);
                this.tableSymbols[i + '_' + j] = symbol;
            }
        }
        this.fire('heightchanged', this);
    },
    _createRow: function _createRow(index, item, add) {
        this.removeStretchLine();
        var cols = [];
        var col = void 0,
            dataIndex = void 0,
            text = void 0,
            cellOffset = void 0,
            size = void 0,
            cell = void 0,
            coordinate = void 0,
            symbol = void 0;
        var rowHeight = this._rowHeights[index];
        if (!rowHeight) rowHeight = this._cellHeight;
        for (var i = 0; i < this._colNum; i++) {
            col = this._columns[i];
            dataIndex = col['dataIndex'];
            text = '';
            if (item && item[dataIndex]) {
                text = item[dataIndex];
            }
            if (this.options['order'] && dataIndex === 'maptalks_order') {
                if (!text || text === '') {
                    var startNum = this.options['startNum'] || 1;
                    if (startNum > 1) {
                        text = index + startNum - 1;
                    } else {
                        text = index;
                    }
                }
                item[dataIndex] = text;
            }
            if (add) {
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
            this.tableWidth += this._colWidths[i];
            cell = this.createCell(text, cellOffset, size, symbol);
            cell._row = index;
            cell._col = i;
            cell.dataIndex = dataIndex;
            cols[i] = cell;
            this.tableSymbols[index + '_' + i] = symbol;
            if (this.options['dynamic'] && this.options['order'] && dataIndex === 'maptalks_order') {
                coordinate = item['coordinate'];
                if (coordinate) {
                    this._addNumberLabelToGeometry(new maptalks.Coordinate(coordinate.x, coordinate.y), cell);
                }
            }
        }
        this.tableHeight += rowHeight;
        if (add) {
            this._rowHeights.splice(index, 0, rowHeight);
            if (this.options['header']) {
                --index;
            }
            this._data.splice(index, 0, item);
        }
        return cols;
    },
    _changeRowOrder: function _changeRowOrder(sourceRowNum, targetRowNum) {
        if (sourceRowNum === targetRowNum) return;
        var start = 0;
        if (this.options['header']) {
            start = -1;
        }
        if (targetRowNum === 0) return;
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

        if (sourceRowDy < targetRowDy) {
            sourceRowDy = sourceRowDy + targetRowHeight;
            targetRowDy = targetRowDy - sourceRowHeight;
        } else {
            sourceRowDy = sourceRowDy - targetRowHeight;
            targetRowDy = targetRowDy + sourceRowHeight;
        }

        //调整行号
        for (var i = 0, len = sourceRow.length; i < len; i++) {
            var sourceSymbol = sourceRow[i].getSymbol();
            sourceRow[i]._row = targetRowNum;
            sourceSymbol['markerDy'] = sourceRowDy;
            sourceSymbol['textDy'] = sourceRowDy;
            sourceRow[i].setSymbol(sourceSymbol);
            if (this.options['order'] && this._columns[i]['dataIndex'] === 'maptalks_order') {
                sourceRow[i].setContent(targetRowNum);
                this._data[sourceRowNum + start]['maptalks_order'] = targetRowNum;
                sourceRow[i].fire('positionchanged', { target: sourceRow[i] });
            }
        }
        for (var _i2 = 0, _len = targetRow.length; _i2 < _len; _i2++) {
            var targetSymbol = targetRow[_i2].getSymbol();
            targetRow[_i2]._row = sourceRowNum;
            targetSymbol['markerDy'] = targetRowDy;
            targetSymbol['textDy'] = targetRowDy;
            targetRow[_i2].setSymbol(targetSymbol);
            if (this.options['order'] && this._columns[_i2]['dataIndex'] === 'maptalks_order') {
                targetRow[_i2].setContent(sourceRowNum);
                this._data[targetRowNum + start]['maptalks_order'] = sourceRowNum;
                targetRow[_i2].fire('positionchanged', { target: targetRow[_i2] });
            }
        }
        this._tableRows[targetRowNum] = sourceRow;
        this._tableRows[sourceRowNum] = targetRow;
        //调整table相关内存数组
        var sourceItem = this._data[sourceRowNum + start];
        this._data[sourceRowNum + start] = this._data[targetRowNum + start];
        this._data[targetRowNum + start] = sourceItem;

        this._rowHeights[sourceRowNum] = this._rowHeights[targetRowNum];
        this._rowHeights[targetRowNum] = sourceRowHeight;
    },


    /**
     * 调整插入行之后的cell位置
     * @param {Number} insertRowLength 插入行的数量
     * @param {Array} lastDataset 插入行之后的cell数组
     */
    _adjustDatasetForRow: function _adjustDatasetForRow(insertRowLength, lastDataset) {
        var row = void 0,
            start = 0;
        if (this.options['header']) {
            start = -1;
        }
        for (var i = 0, len = lastDataset.length; i < len; i++) {
            row = lastDataset[i];
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j]._row += insertRowLength;
                if (this.options['order'] && this._columns[j]['dataIndex'] === 'maptalks_order') {
                    var rowIndex = row[j]._row;
                    var startNum = this.options['startNum'] || 1;
                    if (startNum > 1) {
                        rowIndex = rowIndex + startNum;
                    }
                    row[j].setContent(rowIndex);
                    this._data[row[j]._row + start]['maptalks_order'] = rowIndex;
                }
                row[j].fire('symbolchange', row[j]);
                this._translateDy(row[j], this._cellHeight);
            }
        }
        return this;
    },
    _resetOrderNum: function _resetOrderNum(startNum) {
        if (!this.options['order']) return;
        var start = 0;
        if (this.options['header']) {
            start = -1;
        }
        var startIndex = 0;
        if (this.options['header']) {
            startIndex = 1;
        }
        for (var i = startIndex, len = this._tableRows.length; i < len; i++) {
            var row = this._tableRows[i];
            for (var j = 0; j < row.length; j++) {
                if (row[j]['dataIndex'] === 'maptalks_order') {
                    var content = i + startNum + start;
                    row[j].setContent(content);
                    row[j].fire('positionchanged', { target: row[j] });
                    this._data[i + start]['maptalks_order'] = content;
                    break;
                }
            }
        }
    },
    _translateDy: function _translateDy(cell, height) {
        var symbol = cell.getSymbol();
        symbol['markerDy'] += height;
        symbol['textDy'] += height;
        cell.setSymbol(symbol);
    }
});

Table.include( /** @lends Table.prototype */{

    addStretchLine: function addStretchLine() {
        var me = this;
        this.on('mouseover', function (event) {
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
        this.on('mouseout', function () {
            me.getMap().options['doubleClickZoom'] = true;
        }).on('dragstart', this.removeStretchLine);
        this.getMap().on('movestart dragstart zoomstart resize', this.removeStretchLine, this);
    },

    _checkPointOnBottomEdge: function _checkPointOnBottomEdge(point) {
        if (this._mouseMoveStartPoint) {
            var moveDistance = this._mouseMoveStartPoint.distanceTo(point);
            if (moveDistance > 2) {
                this._mouseMoveStartPoint = point;
                return false;
            }
        }
        this._mouseMoveStartPoint = point;
        var tableViewPoint = this._getStretchStartPoint(point);
        point = new maptalks.Point(tableViewPoint.x, point.y);
        var distance = tableViewPoint.distanceTo(point);
        var dy = 0,
            checkSign = false;
        for (var i = 0; i < this._rowHeights.length; i++) {
            dy += this._rowHeights[i];
            if (dy - 1 <= distance && distance <= dy + 1) {
                this._stretchRowNum = i;
                checkSign = dy;
                break;
            }
        }
        return checkSign;
    },

    _getStretchStartPoint: function _getStretchStartPoint() {
        var position = this.options['position'];
        return this.getMap().coordinateToViewPoint(position);
    },

    _createStretchLineForRow: function _createStretchLineForRow(map, point, dy) {
        if (this._colLine) {
            this._colLine.remove();
            delete this._colLine;
        }
        var tablePoint = this._getStretchStartPoint(point);
        var leftViewPoint = tablePoint.add(new maptalks.Point(0, dy));
        var leftPoint = map.viewPointToCoordinate(leftViewPoint);
        var rightPoint = map.locate(leftPoint, map.pixelToDistance(this.tableWidth, 0), 0);
        var coordiantes = [leftPoint, rightPoint];
        if (!this._rowLine) {
            this._rowLine = new maptalks.LineString(coordiantes, {
                draggable: true,
                dragOnAxis: 'y',
                cursor: 's-resize',
                symbol: {
                    'lineColor': '#ff0000',
                    'lineWidth': 2,
                    'lineDasharray': null, //[5,5,2,5],
                    'lineOpacity': 0.8
                }
            }).addTo(this.getLayer());
            var me = this;
            this._rowLine.on('dragstart', function (event) {
                me._startCoordinate = event['coordinate'];
                me._startViewPoint = event['viewPoint'];
            });
            this._rowLine.on('dragend', function (event) {
                var dragOffset = event['coordinate'].substract(me._startCoordinate);
                var currentPoint = event['viewPoint'];
                var offset = currentPoint.substract(me._startViewPoint);
                var cellHeight = me._rowHeights[me._stretchRowNum];
                if (cellHeight + offset.y > 5) {
                    dragOffset.x = 0;
                    me._resizeRow(dragOffset);
                } else {
                    dragOffset.x = dragOffset.x * -1;
                    dragOffset.y = dragOffset.y * -1;
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

    _resizeRow: function _resizeRow(dragOffset) {
        var pixel = this.getMap().coordinateToPoint(dragOffset);
        var height = pixel['y'];
        var row,
            cell,
            symbol,
            newHeight = this._rowHeights[this._stretchRowNum] + height;
        this.tableHeight += height;
        this._rowHeights[this._stretchRowNum] = newHeight;
        for (var i = this._stretchRowNum; i < this._rowNum; i++) {
            row = this._tableRows[i];
            for (var j = 0; j < this._colNum; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (i === this._stretchRowNum) {
                    cell.options['boxMinHeight'] = newHeight;
                    if (cell.options['boxMinHeight'] < symbol['markerHeight']) {
                        symbol['markerHeight'] = cell.options['boxMinHeight'];
                    }
                    symbol['markerDy'] += height / 2;
                    symbol['textDy'] += height / 2;
                } else {
                    symbol['markerDy'] += height;
                    symbol['textDy'] += height;
                }
                cell.setSymbol(symbol);
            }
        }
    },

    _checkPointOnRightEdge: function _checkPointOnRightEdge(point) {
        if (this._mouseMoveStartPoint) {
            var moveDistance = this._mouseMoveStartPoint.distanceTo(point);
            if (moveDistance > 2) {
                this._mouseMoveStartPoint = point;
                return false;
            }
        }
        this._mouseMoveStartPoint = point;
        var tableViewPoint = this._getStretchStartPoint(point);
        point = new maptalks.Point(point.x, tableViewPoint.y);
        var distance = tableViewPoint.distanceTo(point);
        var dx = 0,
            checkSign = false;
        for (var i = 0; i < this._colWidths.length; i++) {
            dx += this._colWidths[i];
            if (dx - 1 <= distance && distance <= dx + 1) {
                this._stretchColNum = i;
                checkSign = dx;
                break;
            }
        }
        return checkSign;
    },

    _createStretchLineForCol: function _createStretchLineForCol(map, point, dx) {
        if (this._rowLine) {
            this._rowLine.remove();
            delete this._rowLine;
        }
        var tablePoint = this._getStretchStartPoint(point);
        var upViewPoint = tablePoint.add(new maptalks.Point(dx, 0));
        var upPoint = map.viewPointToCoordinate(upViewPoint);
        var downPoint = map.locate(upPoint, 0, -map.pixelToDistance(0, this.tableHeight));
        var coordiantes = [upPoint, downPoint];
        if (!this._colLine) {
            this._colLine = new maptalks.LineString(coordiantes, {
                draggable: true,
                dragShadow: false,
                dragOnAxis: 'x',
                cursor: 'e-resize',
                symbol: {
                    'lineColor': '#ff0000',
                    'lineWidth': 2,
                    'lineDasharray': null,
                    'lineOpacity': 0.8
                }
            }).addTo(this.getLayer());

            var me = this;
            this._colLine.on('dragstart', function (event) {
                me._startCoordinate = event['coordinate'];
                me._startViewPoint = event['viewPoint'];
            });
            this._colLine.on('dragend', function (event) {
                var dragOffset = event['coordinate'].substract(me._startCoordinate);
                var currentPoint = event['viewPoint'];
                var offset = currentPoint.substract(me._startViewPoint);
                var cellWidth = me._colWidths[me._stretchColNum];
                if (cellWidth + offset.x > 8) {
                    dragOffset.y = 0;
                    me._resizeCol(dragOffset);
                } else {
                    dragOffset.x = dragOffset.x * -1;
                    dragOffset.y = dragOffset.y * -1;
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

    _resizeCol: function _resizeCol(dragOffset) {
        var pixel = this.getMap().coordinateToPoint(dragOffset);
        var width = pixel['x'];
        var row,
            cell,
            symbol,
            newWidth = this._colWidths[this._stretchColNum] + width;
        this.tableWidth += width;
        this._colWidths[this._stretchColNum] = newWidth;

        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = this._stretchColNum, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (j === this._stretchColNum) {
                    cell.options['boxMinWidth'] = newWidth;
                    symbol['markerWidth'] = cell.options['boxMinWidth'];
                    symbol['textWrapWidth'] = cell.options['boxMinWidth'];
                    symbol['markerDx'] += width / 2;
                    symbol['textDx'] += width / 2;
                } else {
                    symbol['markerDx'] += width;
                    symbol['textDx'] += width;
                }
                cell.setSymbol(symbol);
            }
        }
    },

    removeStretchLine: function removeStretchLine() {
        this.getMap().off('movestart dragstart zoomstart resize', this.removeStretchLine, this);
        if (this._rowLine) {
            this._rowLine.remove();
            delete this._rowLine;
        }
        if (this._colLine) {
            this._colLine.remove();
            delete this._colLine;
        }
    }

});

exports.Table = Table;

Object.defineProperty(exports, '__esModule', { value: true });

})));
