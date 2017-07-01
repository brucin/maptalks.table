import Table from './Table';

const TABLE_ADJUST_LAYER_PREFIX = maptalks.INTERNAL_LAYER_PREFIX + '_table_adjust_layer_';

const TOP_ADJUST_LINE_PREFIX = '__table_top_adjust_line_id_';

const LEFT_ADJUST_LINE_PREFIX = '__table_left_adjust_line_id_';

Table.include(/** @lends Table.prototype */{

    /**
    * Prepare to adjust
    */
    prepareAdjust() {
        if(!this.getMap()) return;
        if(!this.options['header']) return;
        if(this._adjustLaye && !maptalks.Util.isArrayHasData(this._adjustLayer.getGeometries())) return;
        this._prepareEditLayer();
        // this.config('draggable', false);
    },

    _prepareEditLayer() {
        const map = this.getMap();
        const coordinate = this.getCoordinates(), startViewPoint = map.coordinateToViewPoint(coordinate);
        const uid = maptalks.Util.UID();
        let layerId = TABLE_ADJUST_LAYER_PREFIX + uid;
        this._adjustLayer = map.getLayer(layerId);
        if(!this._adjustLayer) {
            this._adjustLayer = new maptalks.VectorLayer(layerId);
            map.addLayer(this._adjustLayer);
        }
        this._topLines = this._createTopHandleLine(startViewPoint);
        this._adjustLayer.addGeometry(this._topLines);
        this._leftLines = this._createLeftHandleLine(startViewPoint);
        this._adjustLayer.addGeometry(this._leftLines);
        this._bindTableEvent();
    },

    _createTopHandleLine(startViewPoint) {
        let height = this._rowHeights[0];//header height
        let handleLines = [];
        let width = 0;
        for (let i = 0; i < this.getColumnNum(); i++) {
            let monitorCoordinate = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width + 10, 0)));
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
                    'lineWidth' : 1.5
                }
            });
            let _table = this;
            handleLine.on('dragging', function(eventParam) {
                let lineId = handleLine.getId();
                if (!lineId) return;
                let columnNum = parseInt(lineId.substring(lineId.lastIndexOf('_') + 1));
                let dragOffset = eventParam['dragOffset'];
                let nowCoordinate = new maptalks.Coordinate(eventParam['coordinate'].x, 0);
                let monitorPosition = map.coordinateToViewPoint(monitorCoordinate);
                monitorCoordinate.y = 0;
                if(nowCoordinate.x < monitorCoordinate.x) {//out of scope
                    let offset = monitorCoordinate.substract(nowCoordinate);
                    if (handleLine.options['dragShadow']) {
                        handleLine.draggable._shadow.translate(offset);
                    } else {
                        handleLine.translate(offset);
                    }
                    handleLine.draggable._endDrag(eventParam);
                    let columnWidth = _table.getColumnWidth(columnNum);
                    let startCoordinate = map.viewPointToCoordinate(monitorPosition.add(new maptalks.Point(columnWidth - 10, 0)));
                    startCoordinate.y = 0;
                    dragOffset = monitorCoordinate.substract(startCoordinate);
                }
                _table._resizeCol(columnNum, dragOffset);
                //translate adjust line
                _table._translateTopHandleLine(columnNum, dragOffset);
            });
            handleLines.push(handleLine);
        }
        return handleLines;
    },

    _translateTopHandleLine(columnNum, dragOffset) {
        for (var i = columnNum + 1; i < this._topLines.length; i++) {
            this._topLines[i].translate(dragOffset);
        }
    },

    _createLeftHandleLine(startViewPoint) {
        let width = this.getTableWidth();
        let handleLines = [];
        let height = 0;
        for (let i = 0; i < this.getRowsNum(); i++) {
            let monitorCoordinate = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(0, height + 10)));
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
                    'lineWidth' : 1.5
                }
            });
            let _table = this;
            handleLine.on('dragging', function(eventParam) {
                let lineId = handleLine.getId();
                if (!lineId) return;
                let rowNum = parseInt(lineId.substring(lineId.lastIndexOf('_') + 1));
                let dragOffset = eventParam['dragOffset'];
                let nowCoordinate = new maptalks.Coordinate(0, eventParam['coordinate'].y);
                let monitorPosition = map.coordinateToViewPoint(monitorCoordinate);
                monitorCoordinate.x = 0;
                if(nowCoordinate.y > monitorCoordinate.y) {//out of scope
                    let offset = monitorCoordinate.substract(nowCoordinate);
                    if (handleLine.options['dragShadow']) {
                        handleLine.draggable._shadow.translate(offset);
                    } else {
                        handleLine.translate(offset);
                    }
                    handleLine.draggable._endDrag(eventParam);
                    let rowHeight = _table.getRowHeight(rowNum);
                    let startCoordinate = map.viewPointToCoordinate(monitorPosition.add(new maptalks.Point(0, rowHeight - 10)));
                    startCoordinate.x = 0;
                    dragOffset = monitorCoordinate.substract(startCoordinate);
                }
                _table._resizeRow(rowNum, dragOffset);
                //translate adjust line
                _table._translateLeftHandleLine(rowNum, dragOffset);
            });
            handleLines.push(handleLine);
        }
        return handleLines;
    },

    _translateLeftHandleLine(rowNum, dragOffset) {
        console.log('dragOffset:');
        console.log(dragOffset);
        for (var i = rowNum + 1; i < this._leftLines.length; i++) {
            this._leftLines[i].translate(dragOffset);
        }
    },

    _bindTableEvent() {
        let _table = this;
        this.on('hide remove dragstart movestart', function() {
            _table._remove();
        });
        this.on('mouseout', function () { 
            map.options['doubleClickZoom'] = true; 
        });
        map.on('movestart zoomstart resize', function() {
            _table._remove();
        });
    },

    _remove() {
        this._adjustLayer.clear();
    },

    _resizeRow(rowNum, dragOffset) {
        var pixel = this.getMap().coordinateToPoint(dragOffset);
        var height = pixel['y'];
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
    },

    _resizeCol(columnNum, dragOffset) {
        let pixel = this.getMap().coordinateToPoint(dragOffset);
        let width = pixel['x'];
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
    },

});
