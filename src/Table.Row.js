import Table from './Table';

Table.include(/** @lends Table.prototype */{

  /**
   * add Row for table
   * @param {Number} rowNum 添加新行的位置，包含表头
   * @param {Object} data 行数据
   * @param {Boolean} below : true,下方;false,上方
   */
    addRow(rowNum, data, below) {
        let insertRowNum = rowNum;
        if (below) {
            insertRowNum = rowNum + 1;
        }
        //构造新加入的行
        let newDataset = [];
        if (!data || data.length === 0) { //添加空行
            newDataset.push(this._createRow(insertRowNum, data, true));
        } else if (maptalks.Util.isArrayHasData(data)) {
            let item;
            for (let i = 0, len = data.length; i < len; i++) {
                item = data[i];
                newDataset.push(this._createRow(insertRowNum, item, true));
                insertRowNum += 1;
            }
        } else {
            let row = this._createRow(insertRowNum, data, true);
            newDataset.push(row);
        }
        //添加新的数据集
        this._addToLayer(newDataset);
        //调整之前的数据集
        let startDataset = this._tableRows.slice(0, insertRowNum + 1);
        let lastDataset = this._tableRows.slice(insertRowNum + 1);
        this._adjustDatasetForRow(newDataset.length, lastDataset);
        this._tableRows = startDataset.concat(newDataset).concat(lastDataset);
        this._rowNum += newDataset.length;
        this.fire('addrow', this);
        this.fire('orderchanged', this);
        return this;
    },

    moveRow(sourceRowNum, direction) {
        this.stopEditTable();
        this.removeStretchLine();
        let targetRowNum = sourceRowNum;
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


    updateRow(rowNum, item) {
        this.removeStretchLine();
        rowNum = rowNum - parseInt(this.options['startNum'] || 1);
        let tableRowNum = rowNum;
        if (this.options['header']) {
            tableRowNum = rowNum + 1;
        }
        let row = this._tableRows[tableRowNum];
        if (!row) return;
        this._data[rowNum] = item;
        let dataIndex, text;
        for (let i = 0; i < this._colNum; i++) {
            let col = this._columns[i];
            dataIndex = col['dataIndex'];
            text = '';
            if (item && item[dataIndex]) {
                text = item[dataIndex];
            }
            let cell = row[i];
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
    removeRow(rowNum) {
        this.stopEditTable();
        this.removeStretchLine();
        let removeRow = this._tableRows[rowNum];
        let firstCell = removeRow[0];
        let size = firstCell.getSize();
        let row, cell;
        for (let i = rowNum, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                if (i > rowNum) {
                    cell._row -= 1;
                    if (this.options['order'] && this._columns[j]['dataIndex'] === 'maptalks_order') {
                        let startNum = this.options['startNum'] || 1;
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
        this.tableHeight -= (size['height'] + 1);
        //移除行数据
        this._tableRows.splice(rowNum, 1);
        this._rowHeights.splice(rowNum, 1);
        let adjustStartRow = 0;
        if (this.options['header']) {
            this._data.splice(rowNum - 1, 1);
            adjustStartRow = rowNum - 1;
        } else {
            this._data.splice(rowNum, 1);
            adjustStartRow = rowNum;
        }
        this.removeNumLabelByRowNum(rowNum);
        //调整data中删除行之后的数据
        for (let i = adjustStartRow; i < this._data.length; i++) {
            this._data[i]['maptalks_order'] -= 1;
        }
        //总行数减少
        this._rowNum -= 1;
        this.fire('removerow', this);
        this.fire('orderchanged', this);
    },

    getRow(rowNum) {
        return this._tableRows[rowNum];
    },

    getRowHeight(rowNum) {
        return this._rowHeights[rowNum];
    },

    setRowHeight(rowNum, height) {
        let oldHeight = this.getRowHeight(rowNum);
        let offset = height - oldHeight;
        this.setRowOffset(rowNum, offset);
    },

    setRowOffset(rowNum, heightOffset) {
        this._rowHeights[rowNum] += heightOffset;
        let height = this._rowHeights[rowNum];
        let row, cell, symbol;
        //reset row height
        for (let i = rowNum; i < this._rowNum; i++) {
            row = this._tableRows[i];
            for (let j = 0; j < this._colNum; j++) {
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
        this.tableHeight += heightOffset;
        this.fire('heightchanged', this);
    },

    _createRow(index, item, add) {
        this.removeStretchLine();
        let cols = [];
        let col, dataIndex, text, cellOffset, size, cell, coordinate, symbol;
        let rowHeight = this._rowHeights[index];
        if (!rowHeight) rowHeight = this._cellHeight;
        for (let i = 0; i < this._colNum; i++) {
            col = this._columns[i];
            dataIndex = col['dataIndex'];
            text = '';
            if (item && item[dataIndex]) {
                text = item[dataIndex];
            }
            if (this.options['order'] && dataIndex === 'maptalks_order') {
                if (!text || text === '') {
                    let startNum = this.options['startNum'] || 1;
                    if (startNum > 1) {
                        text = index + startNum - 1;
                    } else {
                        text = index;
                    }
                }
                item[dataIndex] = text;
            }
            if (add) {
                let offset = this.getCellOffset(index - 1, i);
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
            cell.dataIndex =  dataIndex;
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

    _changeRowOrder(sourceRowNum, targetRowNum) {
        if (sourceRowNum === targetRowNum) return;
        let start = 0;
        if (this.options['header']) {
            start = -1;
        }
        if (targetRowNum === 0) return;
        let sourceRow = this._tableRows[sourceRowNum];
        let targetRow = this._tableRows[targetRowNum];

        let firstSourceCell = sourceRow[0];
        let sourceCellRow = firstSourceCell._row;
        let sourceCellCol = firstSourceCell._col;
        let sourceRowHeight = this._rowHeights[sourceCellRow];
        let sourceRowDy = this.getCellOffset(sourceCellRow, sourceCellCol).dy;

        let firstTargetCell = targetRow[0];
        let targetCellRow = firstTargetCell._row;
        let targetCellCol = firstTargetCell._col;
        let targetRowHeight = this._rowHeights[targetCellRow];
        let targetRowDy = this.getCellOffset(targetCellRow, targetCellCol).dy;

        if (sourceRowDy < targetRowDy) {
            sourceRowDy = sourceRowDy + targetRowHeight;
            targetRowDy = targetRowDy - sourceRowHeight;
        } else {
            sourceRowDy = sourceRowDy - targetRowHeight;
            targetRowDy = targetRowDy + sourceRowHeight;
        }

      //调整行号
        for (let i = 0, len = sourceRow.length; i < len; i++) {
            let sourceSymbol = sourceRow[i].getSymbol();
            sourceRow[i]._row = targetRowNum;
            sourceSymbol['markerDy'] = sourceRowDy;
            sourceSymbol['textDy'] = sourceRowDy;
            sourceRow[i].setSymbol(sourceSymbol);
            if (this.options['order'] && this._columns[i]['dataIndex'] === 'maptalks_order') {
                sourceRow[i].setContent(targetRowNum);
                this._data[sourceRowNum + start]['maptalks_order'] = targetRowNum;
                sourceRow[i].fire('positionchanged', { target:sourceRow[i] });
            }
        }
        for (let i = 0, len = targetRow.length; i < len; i++) {
            let targetSymbol = targetRow[i].getSymbol();
            targetRow[i]._row = sourceRowNum;
            targetSymbol['markerDy'] = targetRowDy;
            targetSymbol['textDy'] = targetRowDy;
            targetRow[i].setSymbol(targetSymbol);
            if (this.options['order'] && this._columns[i]['dataIndex'] === 'maptalks_order') {
                targetRow[i].setContent(sourceRowNum);
                this._data[targetRowNum + start]['maptalks_order'] = sourceRowNum;
                targetRow[i].fire('positionchanged', { target:targetRow[i] });
            }
        }
        this._tableRows[targetRowNum] = sourceRow;
        this._tableRows[sourceRowNum] = targetRow;
        //调整table相关内存数组
        let sourceItem = this._data[sourceRowNum + start];
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
    _adjustDatasetForRow(insertRowLength, lastDataset) {
        let row, start = 0;
        if (this.options['header']) {
            start = -1;
        }
        for (let i = 0, len = lastDataset.length; i < len; i++) {
            row = lastDataset[i];
            for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                row[j]._row += insertRowLength;
                if (this.options['order'] && this._columns[j]['dataIndex'] === 'maptalks_order') {
                    let rowIndex = row[j]._row;
                    let startNum = this.options['startNum'] || 1;
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

    _resetOrderNum(startNum) {
        if (!this.options['order']) return;
        let start = 0;
        if (this.options['header']) {
            start = -1;
        }
        let startIndex = 0;
        if (this.options['header']) {
            startIndex = 1;
        }
        for (let i = startIndex, len = this._tableRows.length; i < len; i++) {
            let row = this._tableRows[i];
            for (let j = 0; j < row.length; j++) {
                if (row[j]['dataIndex'] === 'maptalks_order') {
                    let content = i + startNum + start;
                    row[j].setContent(content);
                    row[j].fire('positionchanged', { target:row[j] });
                    this._data[i + start]['maptalks_order'] = content;
                    break;
                }
            }
        }
    },

    _translateDy(cell, height) {
        let symbol = cell.getSymbol();
        symbol['markerDy'] += height;
        symbol['textDy'] += height;
        cell.setSymbol(symbol);
    }

});
