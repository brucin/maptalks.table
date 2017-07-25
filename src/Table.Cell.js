import Table from './Table';

Table.include(/** @lends Table.prototype */{

    createCell: function (content, cellOffset, size, symbol) {
        let textSize = symbol['textSize'] || 12;
        let textLineSpacing = symbol['textLineSpacing'] || 8;
        let boxPadding = symbol['textPadding'] || { 'width' : 8, 'height' : 8 };
        content = this._filterContent(content);
        let options = {
            'symbol': {
                'markerLineColor': symbol['lineColor'] || symbol['markerLineColor'] || '#ffffff',
                'markerLineWidth': 1,
                'markerLineOpacity': 0.9,
                'markerLineDasharray': null,
                'markerFill': symbol['fill'] ||  symbol['markerFill']  || '#4e98dd',
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
            'boxPadding'   :   boxPadding,
            'draggable': false,
            'boxAutoSize': false,
            'boxMinWidth': size['width'],
            'boxMinHeight': size['height']
        };
        let coordinate = this.options['position'];
        return new maptalks.TextBox(content, coordinate, options);
    },

    getCellOffset: function (row, col) {
        let dx = 0, dy = 0,
            currentRowHeight = this._cellWidth / 2,
            currentColWidth = this._cellHeight / 2;
        if (this._rowHeights[row]) {
            currentRowHeight = this._rowHeights[row] / 2;
        }
        if (this._colWidths[col]) {
            currentColWidth = this._colWidths[col] / 2;
        }
        for (let i = 0; i < row; i++) {
            dy += this._rowHeights[i];
        }
        dy += currentRowHeight;
        for (let i = 0; i < col; i++) {
            dx += this._colWidths[i];
        }
        dx += currentColWidth;
        return  { 'dx' : dx, 'dy' : dy };
    },

    getCellSymbol: function (row, col) {
        var defaultSymbol = this.options['symbol'];
        if (this.tableSymbols) {
            var  symbol = this.tableSymbols[row + '_' + col];
            if (symbol) {
                if (!symbol['textLineSpacing']) {
                    symbol['textLineSpacing'] = defaultSymbol['textLineSpacing'];
                }
                defaultSymbol =  symbol;
            }
        }
        if(!defaultSymbol['textPadding']) {
            defaultSymbol['textPadding'] = { 'width' : 8, 'height' : 8 };
        }
        return defaultSymbol;
    },

    getRowNum: function (cell) {
        return cell._row;
    },

    getColNum: function (cell) {
        return cell._col;
    },

    _addEventsToCell: function (cell) {
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

    _cellSymbolChangeEvent: function (event) {
        event['context'] = this;
        var table = this['table'];
        var cell = this['cell'];
        table.fire('symbolchange', event);
        var symbol = this['cell'].getSymbol();
        table.tableSymbols[cell['_row'] + '_' + cell['_col']] = table.convertCellToSaveSymbol(symbol);
    },

    _cellEditTextEnd: function (event) {
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

    convertCellToSaveSymbol: function (symbol) {
        let saveSymbol = {
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

    _addEditEventToCell: function (cell) {
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

    _addNumberLabelToGeometry: function (coordinate, cell) {
        //设置label属性
        let cellSymbol = cell.getSymbol();
        let options = {
            'symbol': this._convertCellSymbolToNumberSymbol(cellSymbol),
            'draggable': false,
            'boxAutoSize': false,
            'boxMinWidth': 20,
            'boxMinHeight': 20
        };
        //创建label
        let num = cell.getContent();
        let numberLabel = new maptalks.Label(num, coordinate, options);
        this.getLayer().addGeometry(numberLabel);
        this._geometryNumLabels.push(numberLabel);
        let me = this;
        cell.on('remove', function () {
            me._removeNumLabel(numberLabel);
        }, this);
        cell.on('hide', function () {
            numberLabel.hide();
        }, this);
        cell.on('show', function () {
            numberLabel.show();
        }, this);
        cell.on('contentchange', () => {
            let start = 0;
            if (this.options['header']) {
                start = -1;
            }
            let row = cell._row + start;
            let item = this._data[row];
            let _coordiante = item.coordinate;
            if (_coordiante) numberLabel.setCoordinates(new maptalks.Coordinate(_coordiante.x, _coordiante.y));
        }, this);
        cell.on('symbolchange', () => {
            let symbol = this._convertCellSymbolToNumberSymbol(cell.getSymbol());
            numberLabel.setSymbol(symbol);
        }, this);
        cell.on('positionchanged contentchange', () => {
            let number = cell.getContent();
            numberLabel.setContent(number);
        }, this);
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

    _removeNumLabel: function (label) {
        for (var i = 0; i < this._geometryNumLabels.length; i++) {
            if (label.getContent() ===  this._geometryNumLabels[i].getContent()) {
                this._geometryNumLabels[i].remove();
                this._geometryNumLabels.splice(i, 1);
                break;
            }
        }
    },

    _convertCellSymbolToNumberSymbol: function (cellSymbol) {
        var symbol = {
            'markerType' : 'ellipse',
            'markerLineColor': '#ffffff', //cellSymbol['markerLineColor']||'#ffffff',
            'markerLineWidth': 0, //cellSymbol['markerLineWidth']||1,
            'markerLineOpacity': cellSymbol['markerLineOpacity'] || 0,
            'markerFill': cellSymbol['markerFill'] || '#4e98dd',
            'markerFillOpacity': cellSymbol['markerFillOpacity'] || 1,
            'markerDx': 0,
            'markerDy': 0,
            'markerHeight' : 30,
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

    _filterContent: function (content) {
        content = content + '';
        var result = content.replace(/\r/ig, '').replace(/\v/ig, '').replace(/\f/ig, '').replace(/\t/ig, '').replace(/\b/ig, '')
                 .replace(/\n\n/ig, '\n');
        return result;
    },

    isNumber:function (val) {
        return (typeof val === 'number') && !isNaN(val);
    }

});
