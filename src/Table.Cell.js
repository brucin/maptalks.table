import Table from './Table';

Table.include(/** @lends Table.prototype */{

    createCell: function (content, cellOffset, size, symbol) {
        let textSize = symbol['textSize'] || 12;
        let textLineSpacing = symbol['textLineSpacing'] || 8;
        let textPadding = symbol['textPadding'] || [8, 2];
        if(textPadding.width) {
            textPadding = [parseInt(textPadding.width), parseInt(textPadding.height)];
        }
        content = this._filterContent(content);
        let options = {
            'draggable' : false,
            'textStyle' : {
                'wrap' : true,
                'padding' : textPadding,
                'verticalAlignment' : symbol['textVerticalAlignment'] || 'middle',
                'horizontalAlignment' : symbol['textHorizontalAlignment'] || 'middle',
                'symbol' : {
                    'textFaceName' : symbol['textFaceName'] || 'microsoft yahei',
                    'textFill' : symbol['textFill'] || '#ff0000',
                    'textSize' : textSize,
                    'textLineSpacing' : textLineSpacing,
                    'textWeight' : symbol['textWeight'],
                    'textStyle' : symbol['textStyle'],
                    'textWrapWidth': symbol['textWrapWidth']
                }
            },
            'boxSymbol': {
                'markerType' : 'square',
                'markerFill' : symbol['fill'] || symbol['markerFill'] || '#4e98dd',
                'markerFillOpacity' : 0.9,
                'markerLineColor' : symbol['lineColor'] || symbol['markerLineColor'] || '#ffffff',
                'markerLineWidth' : 1,
                'markerDx': cellOffset['dx'] || 0,
                'markerDy': cellOffset['dy'] || 0
            }
        };
        let coordinate = this.options['position'];
        return new maptalks.TextBox(content, coordinate, size['width'], size['height'], options);
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
        let defaultSymbol = this.options['symbol'];
        if (this.tableSymbols) {
            let  symbol = this.tableSymbols[row + '_' + col];
            if (symbol) {
                if (!symbol['textLineSpacing']) {
                    symbol['textLineSpacing'] = defaultSymbol['textLineSpacing'];
                }
                defaultSymbol =  symbol;
            }
        }
        let textPadding = defaultSymbol['textPadding'];
        if (textPadding) {
            if(textPadding.width) {
                textPadding = [parseInt(textPadding.width), parseInt(textPadding.height)];
            }
        } else {
            textPadding = [8, 2];
        }
        defaultSymbol['textPadding'] = textPadding;
        return defaultSymbol;
    },

    _convertCellSymbol: function(cell) {
        return cell.getSymbol();
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
        table.tableSymbols[cell['_row'] + '_' + cell['_col']] = table._convertCellSymbol(cell);
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
        let options = this._convertCellSymbolToNumberOptions(cell)
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
            let options = this._convertCellSymbolToNumberOptions(cell);
            numberLabel.setBoxStyle(options.boxStyle);
            numberLabel.setTextSymbol(options.textSymbol);
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

    _convertCellSymbolToNumberOptions: function (cell) {
        let cellTextSymbol = cell.getSymbol();
        let textSymbol = {
            'textFaceName' : cellTextSymbol['textFaceName'] || 'microsoft yahei',
            'textFill' : cellTextSymbol['textFill'] || '#ff0000',
            'textSize' : cellTextSymbol['textSize'],
            'textLineSpacing' : cellTextSymbol['textLineSpacing'],
            'textWeight' : cellTextSymbol['textWeight'],
            'textStyle' : cellTextSymbol['textStyle']
        };
        let cellBoxStyle = cell.getBoxSymbol();
        let boxStyle = {
            'padding' : cellTextSymbol['padding'],
            'minWidth' : 20,
            'minHeight' : 20,
            'symbol' : {
              'markerType' : 'ellipse',
              'markerFill' : cellBoxStyle['markerFill'] || '#4e98dd',
              'markerFillOpacity' : cellBoxStyle['markerFillOpacity'] || 1,
              'markerLineColor' : '#ffffff',
              'markerLineWidth' : 0
            }
        };
        return {
            'boxStyle' : boxStyle,
            'textSymbol' : textSymbol
        };
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
