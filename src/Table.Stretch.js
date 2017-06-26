import Table from './Table';

Table.include(/** @lends Table.prototype */{

    addStretchLine: function () {
        var me = this;
        this.on('mouseover', function (event) {
            var map = me.getMap();
            map.options['doubleClickZoom'] = false;
            var viewPoint = event['viewPoint'];
            var showStretchLine = me._checkPointOnBottomEdge(viewPoint);
            if (showStretchLine) {
                me._createStretchLineForRow(map, viewPoint, showStretchLine);
                return;
            }
            showStretchLine = me._checkPointOnRightEdge(viewPoint);
            if (showStretchLine) {
                me._createStretchLineForCol(map, viewPoint, showStretchLine);
                return;
            }
        });
        this.on('mouseout', function () { me.getMap().options['doubleClickZoom'] = true; });
        .on('dragstart', this.removeStretchLine);
        this.getMap().on('movestart dragstart zoomstart resize', this.removeStretchLine, this);
    },

    _checkPointOnBottomEdge: function (point) {
        if (this._mouseMoveStartPoint) {
            var moveDistance = this._mouseMoveStartPoint.distanceTo(point);
            if (moveDistance > 2) {
                this._mouseMoveStartPoint = point;
                return false;
            }
        }
        this._mouseMoveStartPoint = point;
        var tableViewPoint = this._getStretchStartPoint(point);
        point = new maptalks.Point(tableViewPoint.x, point.y);
        var distance = tableViewPoint.distanceTo(point);
        var dy = 0, checkSign = false;
        for (var i = 0; i < this._rowHeights.length; i++) {
            dy += this._rowHeights[i];
            if ((dy - 1 <= distance) && (distance <= dy + 1)) {
                this._stretchRowNum = i;
                checkSign = dy;
                break;
            }
        }
        return checkSign;
    },

    _getStretchStartPoint: function () {
        var position = this.options['position'];
        return this.getMap().coordinateToViewPoint(position);
    },

    _createStretchLineForRow: function (map, point, dy) {
        if (this._colLine) {
            this._colLine.remove();
            delete this._colLine;
        }
        var tablePoint = this._getStretchStartPoint(point);
        var leftViewPoint = tablePoint.add(new maptalks.Point(0, dy));
        var leftPoint = map.viewPointToCoordinate(leftViewPoint);
        var rightPoint = map.locate(leftPoint, map.pixelToDistance(this.tableWidth, 0), 0);
        var coordiantes = [leftPoint, rightPoint];
        if (!this._rowLine) {
            this._rowLine = new maptalks.LineString(coordiantes, {
                draggable:true,
                dragOnAxis: 'y',
                cursor:'s-resize',
                symbol:{
                    'lineColor' : '#ff0000',
                    'lineWidth' : 2,
                    'lineDasharray' : null, //[5,5,2,5],
                    'lineOpacity' : 0.8
                }
            }).addTo(this.getLayer());
            var me = this;
            this._rowLine.on('dragstart', function (event) {
                me._startCoordinate = event['coordinate'];
                me._startViewPoint = event['viewPoint'];
            });
            this._rowLine.on('dragend', function (event) {
                var dragOffset = event['coordinate'].substract(me._startCoordinate);
                var currentPoint = event['viewPoint'];
                var offset = currentPoint.substract(me._startViewPoint);
                var cellHeight = me._rowHeights[me._stretchRowNum];
                if ((cellHeight + offset.y) > 5) {
                    dragOffset.x = 0;
                    me._resizeRow(dragOffset);
                } else {
                    dragOffset.x = dragOffset.x * -1;
                    dragOffset.y = dragOffset.y * -1;
                    me._rowLine.translate(dragOffset);
                }
                me.getMap().config({
                    'draggable': true
                });
            });
        } else {
            this._rowLine.setCoordinates(coordiantes);
        }
        this._rowLine.show();
        this._rowLine.bringToFront();
    },

    _resizeRow: function (dragOffset) {
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

    _checkPointOnRightEdge: function (point) {
        if (this._mouseMoveStartPoint) {
            var moveDistance = this._mouseMoveStartPoint.distanceTo(point);
            if (moveDistance > 2) {
                this._mouseMoveStartPoint = point;
                return false;
            }
        }
        this._mouseMoveStartPoint = point;
        var tableViewPoint = this._getStretchStartPoint(point);
        point = new maptalks.Point(point.x, tableViewPoint.y);
        var distance = tableViewPoint.distanceTo(point);
        var dx = 0, checkSign = false;
        for (var i = 0; i < this._colWidths.length; i++) {
            dx += this._colWidths[i];
            if ((dx - 1 <= distance) && (distance <= dx + 1)) {
                this._stretchColNum = i;
                checkSign = dx;
                break;
            }
        }
        return checkSign;
    },

    _createStretchLineForCol: function (map, point, dx) {
        if (this._rowLine) {
            this._rowLine.remove();
            delete this._rowLine;
        }
        var tablePoint = this._getStretchStartPoint(point);
        var upViewPoint = tablePoint.add(new maptalks.Point(dx, 0));
        var upPoint = map.viewPointToCoordinate(upViewPoint);
        var downPoint = map.locate(upPoint, 0, -map.pixelToDistance(0, this.tableHeight));
        var coordiantes = [upPoint, downPoint];
        if (!this._colLine) {
            this._colLine = new maptalks.LineString(coordiantes, {
                draggable:true,
                dragShadow:false,
                dragOnAxis: 'x',
                cursor:'e-resize',
                symbol:{
                    'lineColor' : '#ff0000',
                    'lineWidth' : 2,
                    'lineDasharray' : null,
                    'lineOpacity' : 0.8
                }
            }).addTo(this.getLayer());

            var me = this;
            this._colLine.on('dragstart', function (event) {
                me._startCoordinate = event['coordinate'];
                me._startViewPoint = event['viewPoint'];
            });
            this._colLine.on('dragend', function (event) {
                var dragOffset = event['coordinate'].substract(me._startCoordinate);
                var currentPoint = event['viewPoint'];
                var offset = currentPoint.substract(me._startViewPoint);
                var cellWidth = me._colWidths[me._stretchColNum];
                if ((cellWidth + offset.x) > 8) {
                    dragOffset.y = 0;
                    me._resizeCol(dragOffset);
                } else {
                    dragOffset.x = dragOffset.x * -1;
                    dragOffset.y = dragOffset.y * -1;
                    me._colLine.translate(dragOffset);
                }
                me.getMap().config({
                    'draggable': true
                });
            });
        } else {
            this._colLine.setCoordinates(coordiantes);
        }
        this._colLine.show();
        this._colLine.bringToFront();
    },

    _resizeCol: function (dragOffset) {
        var pixel = this.getMap().coordinateToPoint(dragOffset);
        var width = pixel['x'];
        var row, cell, symbol,
            newWidth = this._colWidths[this._stretchColNum] + width;
        this.tableWidth += width;
        this._colWidths[this._stretchColNum] = newWidth;

        for (var i = 0, len = this._tableRows.length; i < len; i++) {
            row = this._tableRows[i];
            if (!row) return;
            for (var j = this._stretchColNum, rowLength = row.length; j < rowLength; j++) {
                cell = row[j];
                symbol = cell.getSymbol();
                if (j === this._stretchColNum) {
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

    removeStretchLine: function () {
        this.getMap().off('movestart dragstart zoomstart resize', this.removeStretchLine, this);
        if (this._rowLine) {
            this._rowLine.remove();
            delete this._rowLine;
        }
        if (this._colLine) {
            this._colLine.remove();
            delete this._colLine;
        }
    }


});
