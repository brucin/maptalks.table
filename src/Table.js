const defaultOptions = {
    'title': 'title',
    'columns': [
            { header:'Name', dataIndex: 'name', type: 'string', maxWidth: 50 },
            { header:'Birth', dataIndex: 'birth', type: 'data', maxWidth: 50  },
            { header:'Age', dataIndex: 'age', type: 'number', maxWidth: 50  },
            { header:'Marry', dataIndex: 'marry', type: 'boolean', trueText:'Yes', falseText: 'No', maxWidth: 50  }
    ],
    'data': [
            { name:'Tom', birth:'1990-1-1', age: 25, marry: 'true' },
            { name:'Peter', birth:'1985-5-1', age: 30, marry: 'true' },
            { name:'Mary', birth:'2000-6-1', age: 15, marry: 'false' }
    ],
    'headerSymbol' :{
        'lineColor': '#ffffff',
        'fill': '#4e98dd',
        'textFaceName': 'monospace',
        'textSize': 12,
        'textFill': '#ebf2f9',
        'textWrapWidth': 100,
        'textPadding' : [8, 8]
    },
    'symbol': {
        'lineColor': '#ffffff',
        'fill': '#4e98dd',
        'textFaceName': 'monospace',
        'textSize': 12,
        'textFill': '#ebf2f9',
        'textWrapWidth': 100,
        'textPadding' :  [8, 8]
    },
    'position': {
        'x': 121.489935,
        'y': 31.24432
    },
    'width': 300,
    'height': 300,
    'draggable': true,
    'adjustable' : true,
    'editable': true,
    'header': true,
    'order': true,
    'startNum' : 1,
    'dynamic': false,
    'layerId' : null
};

const EXCEPTION_DEFS =  {
    'NEED_DATA':'You must set data to Table options.',
    'NEED_COLUMN':'You must set columns to Table options.'
};

/**
 * @category table
 * Class for table.
 * @extends maptalks.Class
 * @mixes maptalks.Eventable
 * @mixes maptalks.Handlerable
 * @mixes maptalks.JSONAble
 */
export default class Table extends maptalks.JSONAble(maptalks.Eventable(maptalks.Handlerable(maptalks.Class))) {

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
        'adjustable': true,
        'editable': true,
        'header': true,
        'order': true,
        'startNum' : 1,
        'dynamic': false,
        'layerId' : null
     }
     * @returns {maptalks.Table}
     */
    constructor(options) {
        super(options);
        this.options['width'] = this.options['width'] || 300;
        this.options['height'] = this.options['height'] || 300;
        if (!this.options['header'] && this.options['header'] !== false) this.options['header'] = true;
        if (!this.options['order'] && this.options['order'] !== false) this.options['order'] = true;
        this.options['visible'] = true;
        this.options['editing'] = false;
        this.options['adjustable'] = this.options['adjustable'] || true;
        this.options['showOrderNumber'] = true;
        this.options['startNum'] = this.options['startNum'] || 1;
        if (!this.options['data'] && this.options['data'].length === 0)  { throw new Error(EXCEPTION_DEFS['NEED_DATA']); }
        if (!this.options['columns'] && this.options['columns'].length === 0)  { throw new Error(EXCEPTION_DEFS['NEED_COLUMN']); }
        //包含序号列
        let orderTitle = this.options['orderTitle'];
        if (!orderTitle) orderTitle = 'No.';
        if (this.options['order']) {
            let addColumn = true;
            let cols = this.options['columns'];
            for (var i = 0; i < cols.length; i++) {
                if (cols[i].dataIndex === 'maptalks_order') {
                    addColumn = false;
                    break;
                }
            }
            if (addColumn) {
                let startNum = parseInt(this.options['startNum']);
                let orderCol = { header: orderTitle, dataIndex: 'maptalks_order', type: 'number' };
                this.options['columns'].unshift(orderCol);
                let dataArray = this.options['data'];
                for (let i = 0, len = dataArray.length; i < len; i++) {
                    dataArray[i]['maptalks_order'] = i + startNum;
                }
            }
        }
        this._initalColumns = this.options['columns'];
        this._headAttributes = this.options['attributes'];
        this._columns = this.getColumns();
        this._colNum = this._columns.length;
        this._data = this.options['data'];
        this._initalData = this._data;
        this._rowNum = this._data.length;
        //包含表头
        if (this.options['header']) {
            this._rowNum += 1;
        }
        this._cellWidth = this.options['width'] / this._colNum;
        this._cellHeight = this.options['height'] / this._rowNum;
        this._currentRow = -1;
        this._currentCol = -1;
        this._geometryNumLabels = [];
        this._rowHeights = [];
        this._colWidths = [];
        this.tableWidth = 0;
        this.tableHeight = 0;
        this._initRowHeightAndColWidth();
        this.tableSymbols = this._initCellSymbol();
        return this;
    }

    toJSON() {
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
            'tableSymbols': this._getTableSymbols()
        };
    }

    _dataToJSON() {
        let result = [];
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
    }

    initByJson(json) {
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
        // this.tableWidth = json['tableWidth'];
        this._tableRows = this._data;
        this.tableSymbols = json['tableSymbols'] || this._initCellSymbol();
        return this;
    }

    getId() {
        return this.options['id'];
    }

    isDynamic() {
        return this.options['dynamic'];
    }

    getLayerId() {
        return this.options['layerId'];
    }

    getType() {
        return 'MAPTALKS_TABLE';
    }

    getData() {
        let result = [];
        for (let i = 0; i < this._data.length; i++) {
            result.push(this._data[i]);
        }
        return result;
    }

    getDataByRowNum(rowNum) {
        if (this.options['header']) {
            rowNum -= 1;
        }
        let data = this.getData();
        return data[rowNum];
    }

    getMaxOrder() {
        var maxNum = this._data.length + this.options['startNum'] || 1 - 1;
        return maxNum;
    }

    setStartNum(num) {
        var startNum = this.options['startNum'] || 1;
        if (this.options['order'] && num !== startNum) {
            this.options['startNum'] = num;
            this._resetOrderNum(num);
            this.fire('orderchanged', this);
        }
    }

    getTableWidth() {
        return this.tableWidth;
    }

    getTableHeight() {
        return this.tableHeight;
    }

    /**
     * add table to layer.
     * @param {maptalks.Layer} layer
     */
    addTo(layer) {
        if (!layer) { return; }
        this._layer = layer;
        this._tableRows = this.createTable();
        this._addToLayer(this._tableRows, true);
        this._addEventsToTable();
        //
        if (this.options['hideHeader']) {
            this.hideHeader();
        }
    }

    _addEventsToTable() {
        if (this.options['editable']) {
            this.on('dblclick', function (event) {
                var cell = event.context['cell'];
                if (cell) {
                    this._addEditEventToCell(cell);
                }
            });
        }
        let _table = this;
        const map = this.getMap();
        this.on('click', function () {
            map.options['doubleClickZoom'] = false;
            _table.prepareAdjust();
        });
    }

    getLayer() {
        return this._layer;
    }

    getMap() {
        if (this._layer)
            return this._layer.getMap();
        else
            return null;
    }

    getCenter() {
        return this.getCoordinates();
    }

    getCoordinates() {
        let postion = this.options['position'];
        return new maptalks.Coordinate(postion.x, postion.y);
    }

    animate(style, options, callback) {
        let cells = this.getAllCells();
        if (cells && cells.length > 0) {
            for (let i = 0, length = cells.length; i < length; i++) {
                cells[i].animate(style, options, callback);
            }
        }
    }

    _initRowHeightAndColWidth() {
        if (this._rowHeights.length === 0 ||
            this._colWidths.length === 0) {
            for (let i = 0; i < this._colNum; i++) {
                this._colWidths[i] = 0;
            }
            for (let i = 0; i < this._rowNum; i++) {
                this._rowHeights[i] = 0;
            }
            if (this.options['header']) {
                this._calculateHeaderHeight();
            }
            this._calculateRowHeight();
        }
        for (let i = 0; i < this._rowHeights.length; i++) {
            this.tableHeight += this._rowHeights[i];
        }
        for (let i = 0; i < this._colWidths.length; i++) {
            this.tableWidth += this._colWidths[i];
        }
    }

    _calculateHeaderHeight() {
        for (let i = 0, len = this._columns.length; i < len; i++) {
            let col = this._columns[i];
            let header = col['header'];
            let style =  this.getCellSymbol(0, i);
            let font = maptalks.StringUtil.getFont(style);
            let size = maptalks.StringUtil.stringLength(header, font);
            this._colWidths[i] = size['width'];
            this._rowHeights[0] = size['height'];
        }
    }

    _calculateRowHeight() {
        let start = 0;
        if (this.options['header']) {
            start = 1;
        }
        for (let i = 0, len = this._data.length; i < len; i++) {
            let row = this._data[i];
            for (let j = 0, length = this._columns.length; j < length; j++) {
                let col = this._columns[j];
                let content = row[col.dataIndex];
                let style =  this.getCellSymbol(i + start, j);
                let font = maptalks.StringUtil.getFont(style);
                let size = maptalks.StringUtil.stringLength(content, font);
                let maxWidth = this._colWidths[j], width = maxWidth;
                if (size['width'] >= maxWidth) {
                    let rowNum = Math.ceil(Math.ceil(size['width'] / maxWidth) / 4);
                    width = maxWidth * rowNum;
                }
                style['textWrapWidth'] = width;
                this._colWidths[j] = width;
                let result = maptalks.StringUtil.splitTextToRow(content, style);
                let rowSize = result['size'], actualHeight = rowSize['height'];
                if (this._rowHeights[i + start] < actualHeight) {
                    this._rowHeights[i + start] = actualHeight;
                }
            }
        }
    }

    _initCellSymbol() {
        let tableSymbols = {};
        let headerSymbol = this.options['headerSymbol'] || this.options['symbol'];
        let defaultSymbol = this.options['symbol'];
        for (let i = 0; i < this._rowNum; i++) {
            if (i === 0 && this.options['header']) {
                for (let j = 0; j < this._colNum; j++) {
                    headerSymbol['textWrapWidth'] = this._colWidths[j];
                    tableSymbols[i + '_' + j] = headerSymbol;
                }
            } else {
                for (let j = 0; j < this._colNum; j++) {
                    defaultSymbol['textWrapWidth'] = this._colWidths[j];
                    tableSymbols[i + '_' + j] = defaultSymbol;
                }
            }
        }
        return tableSymbols;
    }

    _getTableSymbols() {
        let tableSymbols = {};
        for (let i = 0; i < this._tableRows.length; i++) {
            let row = this._tableRows[i];
            if (row) {
                for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                    tableSymbols[i + '_' + j] = row[j].getSymbol();
                }

            }
        }
        return tableSymbols;
    }

    hide() {
        let row, start = 0;
        if (this.options['hideHeader']) {
            start = 1;
        }
        for (let i = start, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                if (row[j].isEditingText()) {
                    row[j].endEditText();
                }
                row[j].hide();
            }
        }
        this.fire('hide', this);
        this.options['visible'] = false;
    }

    show() {
        let row, start = 0;
        if (this.options['hideHeader']) {
            start = 1;
        }
        for (let i = start, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].show();
            }
        }
        this.options['visible'] = true;
    }

    isVisible() {
        return this.options['visible'];
    }

    orderNumberIsVisible() {
        return this.options['showOrderNumber'];
    }

    showOrderNumber() {
        this._showNumLabel();
        this.options['showOrderNumber'] = true;
    }

    hideOrderNumber() {
        this._hideNumLabel();
        this.options['showOrderNumber'] = false;
    }

    getAllCells() {
        var cells = [], row;
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
    }

    remove() {
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
        //清理table上其它属性
        this._deleteTable();
        this.clearLinker();
        this.unLink();
    }

    setZIndex(index) {
        this._zindex = index;
        for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
            var row = this._tableRows[rowNum];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].setZIndex(index);
            }
        }
    }

    getZIndex() {
        return this._zindex;
    }

    bringToFront() {
        for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
            var row = this._tableRows[rowNum];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].bringToFront();
            }
        }
    }

    bringToBack() {
        for (var rowNum = 0; rowNum < this._rowNum; rowNum++) {
            var row = this._tableRows[rowNum];
            if (!row) return;
            for (var j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j].bringToBack();
            }
        }
    }

    stopEditTable() {
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
    }

    isEditing() {
        return this.options['editing'];
    }

    _deleteTable() {
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
        delete this._adjustLayer;
        delete this;
    }

    refreshData(dataArray, key) {
        let data = this.getData();
        let updateItems = this._getUpdateItems(data, dataArray, key),
            removeItems = this._getMinusItems(data, dataArray, key),
            newItems = this._getMinusItems(dataArray, data, key);
        for (let i = 0; i < updateItems.length; i++) {
            this.updateRow(updateItems[i]['maptalks_order'], updateItems[i]);
        }
        for (let j = removeItems.length - 1; j >= 0; j--) {
            this.removeRow(removeItems[j]['maptalks_order']);
        }
        let start = 0;
        if (this.options['header']) {
            start = 1;
        }
        let order = this.getData().length - 1;
        for (let m = 0; m < newItems.length; m++) {
            this.addRow(order + m + start, newItems[m], true);
        }
    }

    _uniquelize(a, key) {
        if (!key) return [];
        let result = [];
        for (let i = 0; i < a.length; i++) {
            let notContain = true;
            for (let j = 0; j < result.length; j++) {
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
    }

    _getUpdateItems(a, b, key) {
        if (!key) return [];
        let result = [];
        a = this._uniquelize(a, key);
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                if (b[j][key] === a[i][key]) {
                    b[j]['maptalks_order'] = a[i]['maptalks_order'];
                    result.push(b[j]);
                    break;
                }
            }
        }
        return result;
    }

    _getMinusItems(a, b, key) {
        if (!key) return [];
        let result = [];
        a = this._uniquelize(a, key);
        for (let i = 0; i < a.length; i++) {
            let notContain = true;
            for (let j = 0; j < b.length; j++) {
                if (b[j][key] === a[i][key]) {
                    notContain = false;
                }
            }
            if (notContain) {
                result.push(a[i]);
            }
        }
        return result;
    }

    setCoordinates(coordinate) {
        let coorObj = new maptalks.Coordinate(coordinate.x, coordinate.y);
        let offset = coorObj.substract(this.getCenter());
        this._translate(offset);
        this.fire('positonchanged', this);
    }

    _addToLayer(tableRow, init) {
        let row, cell;
        for (let i = 0, len = tableRow.length; i < len; i++) {
            row = tableRow[i];
            if (!row) return;
            for (let j = 0, rowNum = row.length; j < rowNum; j++) {
                cell = row[j];
                if (init) {
                    cell._row = i;
                    cell._col = j;
                }
                this._addEventsToCell(cell).addTo(this._layer);
            }
        }
    }

    _showHeaderItemMenu(cell, coordinate) {
        let items = [];
        let attr, displayName, item;
        let me = this;
        for (let i = 0, len = this._headAttributes.length; i < len; i++) {
            attr = this._headAttributes[i];
            displayName = attr['displayName'];
            item = { 'item': displayName, 'click': function (param) {
                me._changeHeader(param, cell);
            } };
            items.push(item);
        }
        let menuOptions = {
            'width': 160,
            'maxHeight' : 300,
            'items' : items
        };
        this.getMap().setMenu(menuOptions)
                 .openMenu(coordinate);
    }

    _changeHeader(param, cell) {
        let index = param['index'];
        let attr = this._headAttributes[index];
        cell['dataIndex'] = attr['name'];
        cell.setContent(attr['displayName']);
        this._setColData(cell);
        let col = cell._col;
        this._columns[col] = { header:attr['displayName'], dataIndex: attr['name'], type: 'string' };
    }

    _setColData(cell) {
        let dataIndex = cell['dataIndex'];
        let colNum = cell._col;
        let newValues = [];
        let item;
        for (let i = 0, len = this._initalData.length; i < len; i++) {
            item = this._initalData[i];
            newValues[i + 1] = item[dataIndex];
        }
        let row;
        for (let i = 1, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            cell = row[colNum];
            cell.setContent(newValues[i]);
        }
    }

    _translate(offset) {
        let row, cell;
        for (let i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                cell.translate(offset);
                if (i === 0 && j === 0) {
                    this.options['position'] = cell.getCenter();
                }
            }
        }
    }

    _addMouseoverEvent(event) {
        event['context'] = this;
        this['table'].fire('mouseover', event);
    }

    _addMouseoutEvent(event) {
        event['context'] = this;
        this['table'].fire('mouseout', event);
    }

    _addMousedownEvent(event) {
        event['context'] = this;
        this['table'].fire('mousedown', event);
    }

    _addClickEvent(event) {
        event['context'] = this;
        this['table'].fire('click', event);
    }

    _addDBLClickEvent(event) {
        event['context'] = this;
        this['table'].fire('dblclick', event);
    }

    _addContextmenuEvent(event) {
        event['context'] = this;
        this['table'].fire('contextmenu', event);
    }

    _addEditTableEvent(event) {
        event['context'] = this;
        this['table'].fire('edittablestart', event);
        this['table'].options['editing'] = true;
    }

    createTable() {
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
    }

    getColumns() {
        let columns = this.options['columns'];
        if (!columns) {
            columns = [];
            let firstRow = this.options['data'];
            let type, column;
            for (let key in firstRow) {
                type = this._getDataType(firstRow[key]);
                column = { header: key, dataIndex: key, type: type };
                columns.push(column);
            }
        }
        return columns;
    }

    _getDataType(value) {
        let type = 'string';
        if (maptalks.isNumber(value)) {
            type = 'number';
        }
        return type;
    }

    setTableStyle(attr, value, isGlobal) {
        if (isGlobal) {
            for (let rowNum = 0; rowNum < this._rowNum; rowNum++) {
                this._setRowStyle(rowNum, attr, value);
            }
            this._changeDefaultSymbol(attr, value);
        } else {
            let rowNum = this._currentRow;
            let colNum = this._currentCol;
            if (rowNum > -1) {
                this._setRowStyle(rowNum, attr, value);
            }
            if (colNum > -1) {
                this._setColStyle(colNum, attr, value);
            }
        }
    }

    _setRowStyle(rowNum, attr, value) {
        let row = this._tableRows[rowNum];
        for (let j = 0, rowLength = row.length; j < rowLength; j++) {
            let cell = row[j];
            let symbol = cell.getSymbol();
            let style = value;
            if (attr === 'textFont') {
                style = value + ' ' + symbol['textSize'] + 'px ' + symbol['textFaceName'];
            }
            this._setStyleToCell(cell, attr, style);
        }
    }

    _setColStyle(colNum, attr, value) {
        for (let i = 0, len = this._tableRows.length; i < len; i++) {
            let row = this._tableRows[i];
            let cell = row[colNum];
            let symbol = cell.getSymbol();
            let style = value;
            if (attr === 'textFont') {
                style = value + ' ' + symbol['textSize'] + 'px ' + symbol['textFaceName'];
            }
            this._setStyleToCell(cell, attr, style);
        }
    }

    _setStyleToCell(cell, attr, value) {
        let symbol = cell.getSymbol();
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
    }

    _changeDefaultSymbol(attr, value) {
        let symbol = this.options['symbol'];
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
    }

}

Table.mergeOptions(defaultOptions);

Table.registerJSONType('Table');
