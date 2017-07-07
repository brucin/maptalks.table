import Table from './Table';

Table.include(/** @lends Table.prototype */{

    linkTo(target) {
        if(!target instanceof maptalks.Table) return;
        if(target.getLinker()) return;
        if(target.getColumnNum() !== this.getColumnNum()) return;
        target.addLinker(this);
        this._linkTarget = target;
        this._moveToNewCoordinates();
        this._addLinkEvent();
        this._autoAdjustColumnWidth();
        this.config('draggable', false);
        this.config('adjustable', 'y');
    },

    unLink() {
        if(!this._linkTarget) return;
        this._removeLinkEvent();
        this._linkTarget.clearLinker();
        delete this._linkTarget;
        this.config('draggable', true);
        this.config('adjustable', true);
    },

    clearLinker() {
        this._linker = null;
        delete this._linker;
    },

    addLinker(linker) {
        if(linker instanceof maptalks.Table) return;
        if(this._linker) return;
        this._linker = linker;
    },

    getLinker() {
        return this._linker;
    },

    _autoAdjustColumnWidth() {
        let target = this._linkTarget;
        let columnNum = target.getColumnNum();
        for (var i = 0; i < columnNum; i++) {
            let targetWidth = target.getColumnWidth(i);
            let width = this.getColumnWidth(i);
            if(width) {
                let param = {
                    'columnNum' : i,
                    'widthOffset' : new maptalks.Point(targetWidth - width, 0)
                }
                this._adjustColumnWidth(param);
            }
        }
    },

    _adjustColumnWidth(eventParam) {
        let columnNum = eventParam['columnNum'];
        let widthOffset = eventParam['widthOffset'];
        this._resizeCol(columnNum, widthOffset);
    },

    _moveToNewCoordinates() {
        let map = this.getMap();
        let targetTableCoordinate = this._linkTarget.getCoordinates(),targetViewPoint = map.coordinateToViewPoint(targetTableCoordinate);
        let tableHeight = this._linkTarget.getTableHeight();
        let targetCoordinate = map.viewPointToCoordinate(targetViewPoint.add(new maptalks.Point(0, tableHeight)));
        this.setCoordinates(targetCoordinate);
        this.show();
    },

    _addLinkEvent() {
        let target = this._linkTarget;
        if(!target) return;
        target.on('dragstart', this.hide, this);
        target.on('hide', this.hide, this);
        target.on('dragend', this._moveToNewCoordinates, this);
        target.on('remove', this.unLink, this);
        target.on('heightchanged positonchanged', this._moveToNewCoordinates, this);
        target.on('widthchanged', this._adjustColumnWidth, this);
    },

    _removeLinkEvent() {
        let target = this._linkTarget;
        if(!target) return;
        target.off('dragstart', this.hide, this);
        target.off('hide', this.hide, this);
        target.off('dragend', this._moveToNewCoordinates, this);
        target.off('remove', this.unLink, this);
        target.off('heightchanged positonchanged', this._moveToNewCoordinates, this);
        target.off('widthchanged', this._adjustColumnWidth, this);
    }

});
