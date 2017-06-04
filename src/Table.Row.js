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
