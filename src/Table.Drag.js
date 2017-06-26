import Table from './Table';

const DRAG_STAGE_LAYER_ID = maptalks.INTERNAL_LAYER_PREFIX + '_drag_stage';

const EVENTS = maptalks.Browser.touch ? 'touchstart mousedown' : 'mousedown';

/**
 * Drag handler for table.
 * @category handler
 * @extends Handler
 * @ignore
 */
class TableDragHandler extends maptalks.Handler  {

    /**
     * @param  {Geometry} target geometry target to drag
     */
    constructor(target) {
        super(target);
    }

    addHooks() {
        this.target.on(EVENTS, this._startDrag, this);
    }

    removeHooks() {
        this.target.off(EVENTS, this._startDrag, this);
    }

    _startDrag(param) {
        var map = this.target.getMap();
        if (!map) {
            return;
        }
        if (this._isDragging) {
            return;
        }
        var domEvent = param['domEvent'];
        if (domEvent.touches && domEvent.touches.length > 1) {
            return;
        }
        this.target.on('click', this._endDrag, this);
        // this.target.removeStretchLine();
        this._lastPos = param['coordinate'];
        this._prepareMap();
        this._prepareDragHandler();
        this._dragHandler.onMouseDown(param['domEvent']);
        this._moved = false;
        /**
         * drag start event
         * @event maptalks.Table#dragstart
         * @type {Object}
         * @property {String} type                    - dragstart
         * @property {String} target                  - the table fires event
         * @property {maptalks.Coordinate} coordinate - coordinate of the event
         * @property {maptalks.Point} containerPoint  - container point of the event
         * @property {maptalks.Point} viewPoint       - view point of the event
         * @property {Event} domEvent                 - dom event
         */
        this.target.fire('dragstart', param);
    }

    _prepareMap() {
        var map = this.target.getMap();
        this._mapDraggable = map.options['draggable'];
        this._mapHitDetect = map.options['hitDetect'];
        map._trySetCursor('move');
        map.config({
            'hitDetect' : false,
            'draggable' : false
        });
    }

    _prepareDragHandler() {
        var map = this.target.getMap();
        this._dragHandler = new maptalks.DragHandler(map._panels.mapWrapper || map._containerDOM);
        this._dragHandler.on('dragging', this._dragging, this);
        this._dragHandler.on('mouseup', this._endDrag, this);
        this._dragHandler.enable();
    }

    _prepareShadow() {
        var target = this.target;
        this._prepareDragStageLayer();
        if (this._shadow) {
            this._shadow.remove();
        }
        var width = target.tableWidth, height = target.tableHeight;
        this._shadow = new maptalks.Marker(target.getCenter(), {
            'draggable' : true,
            'symbol'    : {
                'markerType' : 'square',
                'markerLineColor': '#ffffff',
                'markerLineDasharray' : [5, 5, 2, 5],
                'markerFill': '#4e98dd',
                'markerFillOpacity' : 0.2,
                'markerWidth': width,
                'markerHeight': height,
                'markerDx' : width / 2,
                'markerDy' : height / 2
            }
        });
        var shadow = this._shadow;
        if (target.options['dragShadow']) {
            var symbol = maptalks.Util.decreaseSymbolOpacity(shadow._getInternalSymbol(), 0.5);
            shadow.setSymbol(symbol);
        }
        shadow.setId(null);
        var shadowConnectors = [];
        this._shadowConnectors = shadowConnectors;
        this._dragStageLayer.bringToFront().addGeometry(shadowConnectors.concat(shadow));
    }

    _onTargetUpdated() {
        if (this._shadow) {
            this._shadow.setSymbol(this.target.getSymbol());
        }
    }

    _prepareDragStageLayer() {
        var map = this.target.getMap(),
            layer = this.target.getLayer();
        this._dragStageLayer = map.getLayer(DRAG_STAGE_LAYER_ID);
        if (!this._dragStageLayer) {
            this._dragStageLayer = new maptalks.VectorLayer(DRAG_STAGE_LAYER_ID, { 'drawImmediate' : true });
            map.addLayer(this._dragStageLayer);
        }
        //copy resources to avoid repeat resource loading.
        this._dragStageLayer._getRenderer()._resources = layer._getRenderer()._resources;
    }

    _dragging(param) {
        var target = this.target;
        var map = target.getMap(),
            eventParam = map._parseEvent(param['domEvent']);

        var domEvent = eventParam['domEvent'];
        if (domEvent.touches && domEvent.touches.length > 1) {
            return;
        }

        if (!this._moved) {
            this._moved = true;
            target.on('symbolchange', this._onTargetUpdated, this);
            this._prepareMap();
            this._isDragging = true;
            this._prepareShadow();
            this._shadow._fireEvent('dragstart', eventParam);
            return;
        }
        if (!this._shadow) {
            return;
        }
        var currentPos = eventParam['coordinate'];
        if (!this._lastPos) {
            this._lastPos = currentPos;
        }
        var dragOffset = currentPos.substract(this._lastPos);

        var axis = this._shadow.options['dragOnAxis'];
        if (axis === 'x') {
            dragOffset.y = 0;
        } else if (axis === 'y') {
            dragOffset.x = 0;
        }
        this._lastPos = currentPos;
        this._shadow.translate(dragOffset);

        eventParam['dragOffset'] = dragOffset;
        this._shadow._fireEvent('dragging', eventParam);

        /**
         * dragging event
         * @event maptalks.Table#dragging
         * @type {Object}
         * @property {String} type                    - dragging
         * @property {String} target                  - the table fires event
         * @property {maptalks.Coordinate} coordinate - coordinate of the event
         * @property {maptalks.Point} containerPoint  - container point of the event
         * @property {maptalks.Point} viewPoint       - view point of the event
         * @property {Event} domEvent                 - dom event
         */
        target.fire('dragging', eventParam);

    }

    _endDrag(param) {
        var target = this.target,
            map = target.getMap();
        if (this._dragHandler) {
            target.off('click', this._endDrag, this);
            this._dragHandler.disable();
            delete this._dragHandler;
        }
        if (!map) {
            return;
        }
        var eventParam;
        if (map) {
            eventParam = map._parseEvent(param['domEvent']);
        }
        target.off('symbolchange', this._onTargetUpdated, this);

        var shadow = this._shadow;
        if (shadow) {
            target.setCoordinates(shadow.getCoordinates());
            shadow._fireEvent('dragend', eventParam);
            shadow.remove();
            delete this._shadow;
        }
        if (this._shadowConnectors) {
            map.getLayer(DRAG_STAGE_LAYER_ID).removeGeometry(this._shadowConnectors);
            delete this._shadowConnectors;
        }
        delete this._lastPos;

        //restore map status
        map._trySetCursor('default');
        if (maptalks.Util.isNil(this._mapDraggable)) {
            this._mapDraggable = true;
        }
        map.config({
            'hitDetect': this._mapHitDetect,
            'draggable': true
        });

        delete this._autoBorderPanning;
        delete this._mapDraggable;
        this._isDragging = false;
        /**
         * dragend event
         * @event maptalks.Table#dragend
         * @type {Object}
         * @property {String} type                    - dragend
         * @property {String} target                  - the table fires event
         * @property {maptalks.Coordinate} coordinate - coordinate of the event
         * @property {maptalks.Point} containerPoint  - container point of the event
         * @property {maptalks.Point} viewPoint       - view point of the event
         * @property {Event} domEvent                 - dom event
         */
        target.fire('dragend', eventParam);
    }
}

Table.addInitHook('addHandler', 'draggable', TableDragHandler);

Table.include(/** @lends Table.prototype */ {
    /**
     * Whether the table is being dragged.
     * @reutrn {Boolean}
     */
    isDragging() {
        if (!this._isDragging) {
            return false;
        }
        return true;
    }
});

export default TableDragHandler;

