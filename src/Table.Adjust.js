import Table from './Table';

const TABLE_ADJUST_LAYER_PREFIX = maptalks.INTERNAL_LAYER_PREFIX + '_table_adjust_layer';

const TOP_ADJUST_LINE_PREFIX = '__table_top_adjust_line_id_';

const LEFT_ADJUST_LINE_PREFIX = '__table_bottom_adjust_line_id_';

Table.include(/** @lends Table.prototype */{

    /**
    * Prepare to adjust
    */
    prepareAdjust() {
        if (!this.options['adjustable']) return;
        if (!this.getMap()) return;
        this._prepareEditLayer();
        this._bindTableEvent();
    },

    _prepareEditLayer() {
        let map = this.getMap();
        const coordinate = this.getCoordinates(), startViewPoint = map.coordinateToViewPoint(coordinate);
        let layerId = TABLE_ADJUST_LAYER_PREFIX;
        this._adjustLayer = map.getLayer(layerId);
        if (!this._adjustLayer) {
            this._adjustLayer = new maptalks.VectorLayer(layerId);
            map.addLayer(this._adjustLayer);
        } else {
            this._clearAdjustLayer();
            this._adjustLayer.bringToFront();
        }
        if (this.options['adjustable'] === 'x') {
            this._topLines = this._createTopHandleLine(startViewPoint);
        } else if (this.options['adjustable'] === 'y') {
            this._bottomLines = this._createBottomHandleLine(startViewPoint);
        } else {
            this._topLines = this._createTopHandleLine(startViewPoint);
            this._bottomLines = this._createBottomHandleLine(startViewPoint);
        }
    },

    _createTopHandleLine(startViewPoint) {
        let map = this.getMap();
        let height = this.getTableHeight();
        let handleLines = [];
        let width = 0;
        for (let i = 0; i < this.getColumnNum(); i++) {
            let monitorPoint = startViewPoint.add(new maptalks.Point(width + 10, 0));
            let monitorCoordinate = map.viewPointToCoordinate(monitorPoint);
            monitorPoint.y = 0;
            monitorCoordinate.y = 0;

            width += this.getColumnWidth(i);
            let start = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, 0)));
            let end = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, height)));
            let handleLine = new maptalks.LineString([start, end],
                {
                    'id' : TOP_ADJUST_LINE_PREFIX + i,
                    'draggable' : true,
                    'dragShadow' : false,
                    'dragOnAxis' : 'x',
                    'cursor' : 'ew-resize',
                    'symbol' : {
                        'lineColor' : '#ffffff',
                        'lineWidth' : 3,
                        'lineOpacity' : 0.3
                    }
                });
            let _table = this;
            handleLine.on('dragging', function (eventParam) {
                let lineId = handleLine.getId();
                if (!lineId) return;
                let columnNum = parseInt(lineId.substring(lineId.lastIndexOf('_') + 1));
                let coordOffset = eventParam['coordOffset'];
                let pointOffset = eventParam['pointOffset'];
                let nowCoordinate = eventParam['coordinate'];
                nowCoordinate.y = 0;
                if (nowCoordinate.x < monitorCoordinate.x) { //out of scope
                    coordOffset = monitorCoordinate.substract(nowCoordinate);
                    if (handleLine.options['dragShadow']) {
                        handleLine.draggable._shadow.translate(coordOffset);
                    } else {
                        handleLine.translate(coordOffset);
                    }
                    handleLine.draggable._endDrag(eventParam);

                    let columnWidth = _table.getColumnWidth(columnNum);
                    let startPoint = monitorPoint.add(new maptalks.Point(columnWidth - 10, 0));

                    let startCoordinate = map.viewPointToCoordinate(startPoint);

                    startCoordinate.y = 0;
                    coordOffset = monitorCoordinate.substract(startCoordinate);

                    pointOffset = monitorPoint.substract(startPoint);
                }
                _table._resizeCol(columnNum, pointOffset);
                //translate adjust line
                _table._translateTopHandleLine(columnNum, coordOffset);
            });
            handleLine.on('dragstart', function () {
                _table._isDragging = false;
                _table._removeBottomLines();
            });
            handleLine.on('dragend', function () {
                _table._isDragging = true;
                // _table._createBottomHandleLine(startViewPoint);
            });
            handleLine.on('mouseover', function () {
                handleLine.setSymbol({
                    'lineColor' : '#ff0000',
                    'lineWidth' : 2
                });
            });
            handleLine.on('mouseout', function () {
                handleLine.setSymbol({
                    'lineColor' : '#ffffff',
                    'lineWidth' : 3,
                    'lineOpacity' : 0.3
                });
            });
            handleLines.push(handleLine);
        }
        this._adjustLayer.addGeometry(handleLines);
        return handleLines;
    },

    _translateTopHandleLine(columnNum, coordOffset) {
        for (var i = columnNum + 1; i < this._topLines.length; i++) {
            this._topLines[i].translate(coordOffset);
        }
    },

    _createBottomHandleLine(startViewPoint) {
        let map = this.getMap();
        let width = this.getTableWidth();
        let handleLines = [];
        let height = 0;
        for (let i = 0; i < this.getRowsNum(); i++) {
            let monitorPoint = startViewPoint.add(new maptalks.Point(0, height + 10));
            let monitorCoordinate = map.viewPointToCoordinate(monitorPoint);

            height += this.getRowHeight(i);
            let start = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(0, height)));
            let end = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, height)));
            let handleLine = new maptalks.LineString([start, end],
                {
                    'id' : LEFT_ADJUST_LINE_PREFIX + i,
                    'draggable' : true,
                    'dragShadow' : false,
                    'dragOnAxis' : 'y',
                    'cursor' : 'ns-resize',
                    'symbol' : {
                        'lineColor' : '#ffffff',
                        'lineWidth' : 3,
                        'lineOpacity' : 0.3
                    }
                });
            let _table = this;
            handleLine.on('dragging', function (eventParam) {
                let lineId = handleLine.getId();
                if (!lineId) return;
                let rowNum = parseInt(lineId.substring(lineId.lastIndexOf('_') + 1));
                let coordOffset = eventParam['coordOffset'];
                let pointOffset = eventParam['pointOffset'];
                let nowCoordinate = new maptalks.Coordinate(0, eventParam['coordinate'].y);

                monitorPoint.x = 0;
                monitorCoordinate.x = 0;
                if (nowCoordinate.y > monitorCoordinate.y) { //out of scope
                    let offset = monitorCoordinate.substract(nowCoordinate);
                    if (handleLine.options['dragShadow']) {
                        handleLine.draggable._shadow.translate(offset);
                    } else {
                        handleLine.translate(offset);
                    }

                    handleLine.draggable._endDrag(eventParam);
                    let rowHeight = _table.getRowHeight(rowNum);
                    let startOffset = monitorPoint.add(new maptalks.Point(0, rowHeight - 10));

                    let startCoordinate = map.viewPointToCoordinate(startOffset);
                    startCoordinate.x = 0;
                    coordOffset = monitorCoordinate.substract(startCoordinate);
                    pointOffset = monitorPoint.substract(startOffset);
                }
                _table._resizeRow(rowNum, pointOffset);
                //translate adjust line
                _table._translateBottomHandleLine(rowNum, coordOffset);
            });
            handleLine.on('dragstart', function () {
                _table._isDragging = false;
                _table._removeTopLines();
            });
            handleLine.on('dragend', function () {
                _table._isDragging = true;
            });
            handleLine.on('mouseover', function () {
                handleLine.setSymbol({
                    'lineColor' : '#ff0000',
                    'lineWidth' : 2
                });
            });
            handleLine.on('mouseout', function () {
                handleLine.setSymbol({
                    'lineColor' : '#ffffff',
                    'lineWidth' : 3,
                    'lineOpacity' : 0.3
                });
            });
            handleLines.push(handleLine);
        }
        this._adjustLayer.addGeometry(handleLines);
        return handleLines;
    },

    _translateBottomHandleLine(rowNum, coordOffset) {
        for (var i = rowNum + 1; i < this._bottomLines.length; i++) {
            this._bottomLines[i].translate(coordOffset);
        }
    },

    _bindTableEvent() {
        let map = this.getMap();
        let _table = this;
        this.on('hide remove dragstart', function () {
            _table._clearAdjustLayer();
        });
        this.on('mouseout', function () {
            map.options['doubleClickZoom'] = true;
        });
        map.on('movestart zoomstart resize', function () {
            _table._clearAdjustLayer();
        });
    },

    _clearAdjustLayer() {
        if (this._adjustLayer) this._adjustLayer.clear();
    },

    _removeTopLines() {
        this._adjustLayer.removeGeometry(this._topLines);
        this._topLines.splice(0, this._topLines.length);
    },

    _removeBottomLines() {
        this._adjustLayer.removeGeometry(this._bottomLines);
        this._bottomLines.splice(0, this._bottomLines.length);
    },

    _resizeRow(rowNum, pointOffset) {
        var height = pointOffset['y'];
        var row, cell, symbol,
            newHeight = this._rowHeights[rowNum] + height;
        this.tableHeight += height;
        this._rowHeights[rowNum] = newHeight;
        for (var i = rowNum; i < this._rowNum; i++) {
            row = this._tableRows[i];
            for (var j = 0; j < this._colNum; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (i === rowNum) {
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
        let eventParam = {};
        eventParam['target'] = this;
        eventParam['row'] = rowNum;
        eventParam['heightOffset'] = pointOffset;
        this.fire('heightchanged', eventParam);
    },

    _resizeCol(columnNum, pointOffset) {
        let width = pointOffset['x'];
        let row, cell, symbol,
            newWidth = this._colWidths[columnNum] + width;
        this.tableWidth += width;
        this._colWidths[columnNum] = newWidth;

        for (let i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (let j = columnNum, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (j === columnNum) {
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
        let eventParam = {};
        eventParam['target'] = this;
        eventParam['columnNum'] = columnNum;
        eventParam['widthOffset'] = pointOffset;
        this.fire('widthchanged', eventParam);
    }

});
