import Table from './Table';

const TABLE_ADJUST_LAYER_PREFIX = maptalks.INTERNAL_LAYER_PREFIX + '_table_adjust_layer_';

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
        const coordinate = this.getCoordinates(), startPoint = map.coordinateToViewPoint(coordinate);
        let width = this.getTableWidth(), height = 16;
        let startPosition = map.viewPointToCoordinate(startPoint.add(new maptalks.Point(0, -24)));
        let topRectangle = new maptalks.Marker(startPosition, {
            'symbol'    : {
                'markerType' : 'square',
                'markerLineColor': '#ffffff',
                'markerLineDasharray' : [5, 5, 2, 5],
                'markerFill': '#4e98dd',
                'markerFillOpacity' : 0.1,
                'markerWidth': width,
                'markerHeight': height,
                'markerDx' : width / 2,
                'markerDy' : height / 2
            }
        });
        let startViewPoint = map.coordinateToViewPoint(startPosition);
        let geometries = this._createTopHandleLine(startViewPoint, height);
        geometries.push(topRectangle);
        this._adjustLayer.addGeometry(geometries);
        this._bindTableEvent(geometries);
    },

    _createTopHandleLine(startViewPoint, height) {
        let handleLines = [];
        let width = 0;
        for (let i = 0; i < this.getColumnNum(); i++) {
            width += this.getColumnWidth(i);
            let start = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, 0)));
            let end = map.viewPointToCoordinate(startViewPoint.add(new maptalks.Point(width, height)));
            let handleLine = new maptalks.LineString([start, end], 
            {
                'draggable' : true,
                'dragShadow' : false,
                'dragOnAxis' : 'x',
                'cursor' : 'ew-resize',
                'symbol' : {
                    'lineColor' : '#ffffff',
                    'lineWidth' : 1
                }
            });
            handleLines.push(handleLine);
        }
        return handleLines;
    },

    _bindTableEvent(geometries) {
        this.on('hide remove dragstart', function() {
            this._adjustLayer.clear();
        });
    },

    _remove() {
        this._adjustLayer.clear();
    }

});
