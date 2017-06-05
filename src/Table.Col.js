import Table from './Table';

Table.include(/** @lends Table.prototype */{

  /**
   * add column
   * @param {Number} colNum 添加新列的位置
   * @param {Object} data 添加的列数据
   * @param {Boolean} right :true,右侧;false,左侧
   */
    addCol(colNum, data, right) {
        let insertColNum = colNum + 1;
        if (!right) {
            insertColNum = colNum;
        }
        this._createCol(insertColNum, data, true);
        return this;
    },

    /**
     * 删除列
     * @param {Number} colNum 列号
     */
    removeCol(colNum) {
        this.stopEditTable();
        this.removeStretchLine();
        let firstRow = this._tableRows[0];
        let removeCell = firstRow[colNum];
        let removeSize = removeCell.getSize();
        let startPoint = this.options['position'];
        let map = this._layer.getMap();
        let row, cell, colLine, size, symbol, dx, upPoint, downPoint;
        for (let i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = colNum, rowLength = row.length; j < rowLength; j++) {
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

    moveCol(sourceColNum, direction) {
        this.stopEditTable();
        this.removeStretchLine();
        let targetColNum = sourceColNum;
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

    getColumn(colNum) {
        let result = [];
        for (let i = 0; i < this._rowNum; i++) {
            result.push(this._tableRows[i][colNum]);
        }
        return result;
    },

    getColumnWidth(colNum) {
        return this._colWidths[colNum];
    },

    setColumnWidth(colNum, width) {
        let oldWidth = this.getColumnWidth(colNum);
        let offset = width - oldWidth;
        this.setColumnOffset(colNum, offset);        
    },

    setColumnOffset(colNum, widthOffset) {
        this._colWidths[colNum] += widthOffset;
        let newWidth = this._colWidths[colNum];
        let row, cell, symbol;
        for (let i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = colNum, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (j === colNum) {
                    cell.options['boxMinWidth'] = newWidth;
                    symbol['markerWidth'] = cell.options['boxMinWidth'];
                    symbol['textWrapWidth'] = cell.options['boxMinWidth'];
                    symbol['markerDx'] += widthOffset / 2;
                    symbol['textDx'] += widthOffset / 2;
                } else {
                    symbol['markerDx'] += widthOffset;
                    symbol['textDx'] += widthOffset;
                }
                cell.setSymbol(symbol);
            }
        }
        this.tableWidth += widthOffset;
        this.fire('widthchanged', this);
    },

    _createCol(insertColNum, data, add) {
        this.removeStretchLine();
        let startCol = insertColNum;//调整起始列
        if (!data || data.length === 0) data = '';
        //insert column
        let cells = [];
        let insertColLength = 1;
        let colCell;
        if (maptalks.Util.isArrayHasData(data[0])) {
            insertColLength = data.length;
            colCell = [];
            for (let i = 0, len = data.length; i < len; i++) {
                for (let j = 0; j < this._rowNum; j++) {
                    let tempCell = this._addCellForColumn(data[i][0], data[i][j], j, insertColNum + i, add);
                    this._tableRows[j].splice(insertColNum + i, 0, tempCell);
                }
            }
            cells.push(colCell);
        } else {
            for (let i = 0; i < this._rowNum; i++) {
                let tempCell = this._addCellForColumn(data[0], data[i], i, insertColNum, add);
                this._tableRows[i].splice(insertColNum, 0, tempCell);
            }
        }
        this._colNum += insertColLength;
        //调整之后的列
        this._adjustDatasetForCol(startCol, insertColLength);
    },

    _addCellForColumn(header, item, rowNum, colNum, add) {
        let cellOffset, symbol, size, cellWidth, cell;
        if (add) {
            let prevColNum = colNum - 1;
            let offset = this.getCellOffset(rowNum, prevColNum);
            let prevCellWidth = this._colWidths[prevColNum];
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
            let column = { header: header, dataIndex: header, type: 'string' };
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

    _changeColOrder(sourceColNum, targetColNum) {
        if (sourceColNum === targetColNum) { return; }
        // let start = 0;
        // if (this.options['header']) {
        //     start = -1;
        // }
        let firstRow = this._tableRows[0];
        let firstSourceCell = firstRow[sourceColNum];
        let sourceCellRow = firstSourceCell._row;
        let sourceCellCol = firstSourceCell._col;
        let sourceColWidth = this._colWidths[sourceColNum];
        let sourceColDx = this.getCellOffset(sourceCellRow, sourceCellCol).dx;

        let firstTargetCell = firstRow[targetColNum];
        let targetCellRow = firstTargetCell._row;
        let targetCellCol = firstTargetCell._col;
        let targetColWidth = this._colWidths[targetColNum];
        let targetColDx = this.getCellOffset(targetCellRow, targetCellCol).dx;

        if (sourceColDx < targetColDx) {
            sourceColDx = sourceColDx + targetColWidth;
            targetColDx = targetColDx - sourceColWidth;
        } else {
            sourceColDx = sourceColDx - targetColWidth;
            targetColDx = targetColDx + sourceColWidth;
        }
        //调整列位置
        let row, sourceCellSymbol, targetCellSymbol, temp;
        for (let i = 0, len = this._tableRows.length; i < len; i++) {
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
        let sourceColumn = this._columns[sourceColNum];
        this._columns[sourceColNum] = this._columns[targetColNum];
        this._columns[targetColNum] = sourceColumn;
    },

    _adjustDatasetForCol(start, insertColLength) {
        let startPoint = this.options['position'];
        let map = this._layer.getMap();
        let rowData, cell, colLine, size, symbol, dx, upPoint, downPoint;
        for (let i = 0, len = this._tableRows.length; i < len; i++) {
            rowData = this._tableRows[i];
            if (!rowData) return;
            for (let j = start + 1, rowLength = rowData.length; j < rowLength; j++) {
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

    _translateDx(cell, width) {
        let symbol = cell.getSymbol();
        symbol['markerDx'] += width;
        symbol['textDx'] += width;
        cell.setSymbol(symbol);
    }

});
