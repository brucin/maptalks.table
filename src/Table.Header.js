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
