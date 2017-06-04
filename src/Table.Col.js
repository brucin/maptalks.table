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
