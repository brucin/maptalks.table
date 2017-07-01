import Table from './Table';

const TABLE_ADJUST_LAYER_PREFIX = maptalks.INTERNAL_LAYER_PREFIX + '_table_adjust_layer_';

const TABLE_ADJUST_LINE_PREFIX = '__table_adjust_line_id_';

Table.include(/** @lends Table.prototype */{

    /**
    * Prepare to adjust
    */
    prepareAdjust() {
        if(!this.getMap()) return;
        this._prepareEditLayer();
        // this.config('draggable', false);
    },

    _prepareEditLayer() {
        const map = this.getMap();
        const uid = maptalks.Util.UID();
        let layerId = TABLE_ADJUST_LAYER_PREFIX + uid;
        this._adjustLayer = map.getLayer(layerId);
        if(!this._adjustLayer) {
            this._adjustLayer = new maptalks.VectorLayer(layerId);
            map.addLayer(this._adjustLayer);
        }
        this._createTopHandle();
    },

    _createTopHandle() {
        const map = this.getMap();
        const coordinate = this.getCoordinates(), startViewPoint = map.coordinateToViewPoint(coordinate);
        // let width = this.getTableWidth(), height = 16;
        // let startPosition = map.viewPointToCoordinate(startPoint.add(new maptalks.Point(0, -24)));
        // let topRectangle = new maptalks.Marker(startPosition, {
        //     'symbol'    : {
        //         'markerType' : 'square',
        //         'markerLineColor': '#ffffff',
        //         'markerLineDasharray' : [5, 5, 2, 5],
        //         'markerFill': '#4e98dd',
        //         'markerFillOpacity' : 0.1,
        //         'markerWidth': width,
        //         'markerHeight': height,
        //         'markerDx' : width / 2,
        //         'markerDy' : height / 2
        //     }
        // });
        // let startViewPoint = map.coordinateToViewPoint(startPosition);
        let geometries = this._createTopHandleLine(startViewPoint);
        // geometries.push(topRectangle);
        this._adjustLayer.addGeometry(geometries);
        this._bindTableEvent(geometries);
    },

    _createTopHandleLine(startViewPoint) {
        let height = this._rowHeights[0];//header height
        let handleLines = [];
        let width = 0;
        for (let i = 0; i < this.getColumnNum(); i++) {
            let monitorPoint = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width + 10, 0)));
            width += this.getColumnWidth(i);
            let start = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, 0)));
            let end = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, height)));
            let handleLine = new maptalks.LineString([start, end], 
            {
                'id' : TABLE_ADJUST_LINE_PREFIX + i,
                'draggable' : true,
                'dragShadow' : false,
                'dragOnAxis' : 'x',
                'cursor' : 'ew-resize',
                'symbol' : {
                    'lineColor' : '#ffffff',
                    'lineWidth' : 1
                }
            });
            let _table = this;
            handleLine.on('dragging', function(eventParam) {
                let lineId = handleLine.getId();
                if (!lineId) return;
                let columnNum = parseInt(lineId.substring(lineId.lastIndexOf('_') + 1));
                let dragOffset = eventParam['dragOffset'];
                let coordinate = new maptalks.Coordinate(eventParam['coordinate'].x, 0);
                let monitorPosition = map.coordinateToViewPoint(monitorPoint);
                monitorPoint.y = 0;
                if(coordinate.x < monitorPoint.x) {//out of scope
                    let offset = monitorPoint.substract(coordinate);
                    if (handleLine.options['dragShadow']) {
                        handleLine.draggable._shadow.translate(offset);
                    } else {
                        handleLine.translate(offset);
                    }
                    handleLine.draggable._endDrag(eventParam);
                    let columnWidth = _table.getColumnWidth(columnNum);
                    let startPoint = map.viewPointToCoordinate(monitorPosition.add(new maptalks.Point(columnWidth - 10, 0)));
                    startPoint.y = 0;
                    dragOffset = monitorPoint.substract(startPoint);
                }
                _table._resizeCol(columnNum, dragOffset);
            });
            handleLines.push(handleLine);
        }
        return handleLines;
    },

    _bindTableEvent(geometries) {
        let _table = this;
        this.on('hide remove dragstart', function() {
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

    _resizeRow(dragOffset) {
        var pixel = this.getMap().coordinateToPoint(dragOffset);
        var height = pixel['y'];
        var row, cell, symbol,
            newHeight = this._rowHeights[this._stretchRowNum] + height;
        this.tableHeight += height;
        this._rowHeights[this._stretchRowNum] = newHeight;
        for (var i = this._stretchRowNum; i < this._rowNum; i++) {
            row = this._tableRows[i];
            for (var j = 0; j < this._colNum; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (i === this._stretchRowNum) {
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
