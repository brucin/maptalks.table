import Table from './Table';

Table.include(/** @lends Table.prototype */{

    createHeader() {
        let headerRow = [];
        let cellOffset, col, text, size, cell;
        for (let i = 0, len = this._columns.length; i < len; i++) {
            cellOffset = this.getCellOffset(0, i);
            col = this._columns[i];
            text = col['header'];
            size = new maptalks.Size(this._colWidths[i], this._rowHeights[0]);
            let symbol = this.tableSymbols['0_' + i];
            cell = this.createCell(text, cellOffset, size, symbol);
            cell._row = 0;
            cell._col = i;
            cell.dataIndex = col['dataIndex'];
            headerRow.push(cell);
        }
        return headerRow;
    },

    hideHeader() {
        this.showOrHideRow(0, false);
        this.config('hideHeader', true);
    },

    showHeader() {
        this.showOrHideRow(0, true);
        this.config('showHeader', false);
    }

});
