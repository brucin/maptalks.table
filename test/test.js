describe('Table', function () {
    let container, eventContainer, map, layer, tableOptions, dynamicLayer, dynamicTableOptions, marker;
    let center = new maptalks.Coordinate(118.846825, 32.046534);

    function dragTable(table, isMove) {
        map.removeLayer('DRAG_LAYER');
        let layer = new maptalks.VectorLayer('DRAG_LAYER');
        map.addLayer(layer);

        table.addTo(layer);
        let spy = sinon.spy();
        table.on('mousedown', spy);
        //getPagePosition
        let domPosition = getPagePosition(container);
        let point = map.coordinateToContainerPoint(table.getCoordinates()).add(domPosition);
        happen.mousedown(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
        expect(spy.called).to.be.ok();
        if (isMove === undefined || isMove) {
            for (var i = 0; i < 10; i++) {
                happen.mousemove(document, {
                    'clientX':point.x + i,
                    'clientY':point.y + i
                });
            }
        }
        happen.mouseup(document);
    }

    function getPagePosition(obj) {
        var docEl = document.documentElement;
        var rect = obj.getBoundingClientRect();
        return new maptalks.Point(rect['left'] + docEl['scrollLeft'], rect['top'] + docEl['scrollTop']);
    }

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        let option = {
            zoomAnimation: false,
            zoom: 15,
            center: center
        };
        map = new maptalks.Map(container, option);
        layer = new maptalks.VectorLayer('vector').addTo(map);
        map.config('panAnimation', false);
        eventContainer = map._panels.canvasContainer;
        let columns = [
            { header:'表头', dataIndex: 'titleOne', type: 'string', maxWidth: 50 },
            { header:'表头', dataIndex: 'titleTwo', type: 'string', maxWidth: 50 },
            { header:'表头', dataIndex: 'titleThree', type: 'string', maxWidth: 50 }
        ];
        let headerSymbol = {
            'lineColor': '#cccccc',
            'fill': '#2F373E',
            'textFaceName': 'microsoft yahei',
            'textSize': 14,
            'textFill': '#FFFFFF',
            'textWrapWidth': 100,
            'textLineSpacing': 1
        };
        let symbol = {
            'lineColor': '#cccccc',
            'fill': '#eeeeee',
            'textFaceName': 'microsoft yahei',
            'textSize': 14,
            'textFill': '#333333',
            'textWrapWidth': 100,
            'textLineSpacing': 1
        };
        tableOptions = {
            'id': 'TEST_TABLE_ID',
            'title': 'title',
            'orderTitle': '序号',
            'columns': columns,
            'data': [
                { titleOne:'1', titleTwo:'1', titleThree: '1' },
                { titleOne:'2', titleTwo:'2', titleThree: '2' },
                { titleOne:'3', titleTwo:'3', titleThree: '3' }
            ],
            'headerSymbol': headerSymbol,
            'symbol': symbol,
            'position': center,
            'width': 300,
            'height': 80,
            'draggable': true,
            'editable' : true,
            'header': true,
            'order': true,
            'startNum': 1
        };
        //dynamic table options
        dynamicLayer = new maptalks.VectorLayer('DYNAMIC_LAYER').addTo(map);
        marker = new maptalks.Marker(center, {
            'properties' : { 'id' : 1, 'titleOne':'1', 'titleTwo':'1', 'titleThree': '1' }
        }).addTo(dynamicLayer);
        let prop = marker.getProperties();
        prop['coordinate'] = center;
        dynamicTableOptions = {
            'id': 'TEST_DYNAMIC_TABLE_ID',
            'title': 'title',
            'orderTitle': '序号',
            'columns': columns,
            'data': [prop],
            'headerSymbol': headerSymbol,
            'symbol': symbol,
            'position': center,
            'width': 300,
            'height': 80,
            'draggable': true,
            'editable' : true,
            'header': true,
            'order': true,
            'startNum': 1,
            'dynamic': true,
            'layerId' :'DYNAMIC_LAYER'
        };
    });

    afterEach(function () {
        maptalks.DomUtil.removeDomNode(container);
        document.body.innerHTML = '';
    });

    it('add talbe to layer', function () {
        let table = new maptalks.Table(tableOptions);
        table.addTo(layer);
        expect(table.isVisible()).to.be.ok();
        table.hide();
        expect(table.isVisible()).not.to.be.ok();
        table.remove();
    });

    describe('drag table', function () {
        it('can drag talbe', function () {
            let table = new maptalks.Table(tableOptions);
            dragTable(table);
            expect(table.getCoordinates()).not.to.be.closeTo(center);
            table.remove();
        });

        it('disable table dragable', function () {
            let table = new maptalks.Table(tableOptions);
            table.config('draggable', false);
            dragTable(table);
            expect(table.getCoordinates()).to.be.closeTo(center);
            table.remove();
        });
    });

    describe('modify table rows', function () {
        it('add one row to the table', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let data = { 'titleOne' : 'newOne', 'titleTwo' : 'newTwo', 'titleThree' : 'newThree' };
            table.addRow(3, data, true);
            expect(table.getData().length).to.be.equal(4);
            table.remove();
        });

        it('add multi rows to the table', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let data = [{ 'titleOne' : 'one', 'titleTwo' : 'two', 'titleThree' : 'three' },
                        { 'titleOne' : 'otherOne', 'titleTwo' : 'otherTwo', 'titleThree' : 'otherThree' }];
            table.addRow(3, data, true);
            expect(table.getData().length).to.be.equal(5);
            table.remove();
        });

        it('delete row from the table', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            table.removeRow(3);
            expect(table.getData().length).to.be.equal(2);
            table.remove();
        });

        it('update row', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let updateData = { 'titleOne' : 'one', 'titleTwo' : 'two', 'titleThree' : 'three' };
            table.updateRow(1, updateData);
            expect(table.getDataByRowNum(1)).to.be.equal(updateData);
            table.remove();
        });

        it('change row order', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            table.moveRow(1, 'down');
            expect(table.getDataByRowNum(2)['titleOne']).to.be.equal('1');
            table.remove();
        });
    });

    describe('modify table columns', function () {
        it('add one column to the table', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let data = ['newTitle', '1', '2', '3'];
            table.addCol(3, data, true);
            expect(table.getDataByRowNum(1).newTitle).to.be.equal('1');
            table.remove();
        });

        it('add multi columns to the table', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let data = [
                ['newTitle', '1', '2', '3'],
                ['otherTitle', '11', '22', '33']
            ];
            table.addCol(3, data, true);
            expect(table.getDataByRowNum(1).otherTitle).to.be.equal('11');
            table.remove();
        });

        it('delete column from table', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            table.removeCol(1);
            expect(table.getDataByRowNum(1).hasOwnProperty('titleOne')).not.to.be.ok();
            table.remove();
        });

        it('change column order', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            table.moveCol(1, 'right');
            expect(table.getColumns()[2].dataIndex).to.be.equal('titleOne');
            table.remove();
        });
    });

    describe('dynamic table', function () {
        it('add dynamic table to map', function () {
            let table = new maptalks.Table(dynamicTableOptions);
            table.addTo(layer);
            expect(table.isVisible()).to.be.ok();
            table.remove();
        });

        it('refresh dynamic table', function () {
            let table = new maptalks.Table(dynamicTableOptions);
            table.addTo(dynamicLayer);
            new maptalks.Marker(center.add(new maptalks.Coordinate(0.05, 0.01)), {
                'properties' : { 'id' : 2, 'titleOne':'2', 'titleTwo':'2', 'titleThree': '2' }
            }).addTo(dynamicLayer);
            let geometries = dynamicLayer.getGeometries();
            let data = [];
            for (let i = 0; i < geometries.length; i++) {
                let geometry = geometries[i];
                if (geometry.isVisible()) {
                    let item = {};
                    let properties = geometry.getProperties();
                    if (properties) {
                        if (properties['id'] === 1) {
                            geometry.setProperties({ 'titleOne':'11', 'titleTwo':'11', 'titleThree': '11' });
                            properties = geometry.getProperties();
                        }
                        for (let key in properties) {
                            item[key] = properties[key];
                        }
                        item['coordinate'] = geometry.getCenter();
                        data.push(item);
                    }
                }
            }
            table.refreshData(data, 'id');
            expect(table.getData().length).to.be.equal(2);
            expect(table.getDataByRowNum(1).titleOne).to.be.equal('11');
            expect(table.getDataByRowNum(2).id).to.be.equal(2);
            table.remove();
        });

        it('change geometry position', function () {
            let table = new maptalks.Table(dynamicTableOptions);
            table.addTo(dynamicLayer);
            let numberLabelId = table.getId() + '_1';
            let numberLabel = dynamicLayer.getGeometryById(numberLabelId);
            expect(numberLabel.getCenter()).to.be.closeTo(center);
            let newPosition = new maptalks.Coordinate(119.846825, 30.046534);
            marker.setCoordinates(newPosition);
            expect(numberLabel.getCenter()).not.to.be.closeTo(marker.getCenter());
            let prop = marker.getProperties();
            prop['coordinate'] = newPosition;
            table.refreshData([prop], 'id');
            expect(dynamicLayer.getGeometryById(numberLabelId).getCenter()).to.be.closeTo(marker.getCenter());
            table.remove();
        });

        it('change geometry position in the table which start num larger than 1', function () {
            let table = new maptalks.Table(dynamicTableOptions);
            dynamicTableOptions['startNum'] = 2;
            table.addTo(dynamicLayer);
            let numberLabelId = table.getId() + '_1';
            let numberLabel = dynamicLayer.getGeometryById(numberLabelId);
            expect(numberLabel.getCenter()).to.be.closeTo(center);
            let newPosition = new maptalks.Coordinate(119.846825, 30.046534);
            marker.setCoordinates(newPosition);
            expect(numberLabel.getCenter()).not.to.be.closeTo(marker.getCenter());
            let prop = marker.getProperties();
            prop['coordinate'] = newPosition;
            table.refreshData([prop], 'id');
            expect(dynamicLayer.getGeometryById(numberLabelId).getCenter()).to.be.closeTo(marker.getCenter());
            table.remove();
            dynamicTableOptions['startNum'] = 1;
        });
    });

    describe('automatic alignment', function () {
        it('automatic row height', function () {
            tableOptions['data'] = [{ titleOne:'1', titleTwo:'This is a long sentence.', titleThree: '1' }];
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            expect(table.getRowHeight(1)).to.be.above(14);
            expect(table.getColWidth(2)).to.be.equal(50);
            table.remove();
        });

        it('set row height', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let oldRow = table.getRow(2);
            let oldDy = oldRow[0].getSymbol().markerDy;
            let oldRowHeight = table.getRowHeight(1);
            table.setRowHeight(1, 60);
            expect(table.getRowHeight(1)).to.be.equal(60);
            let newRow = table.getRow(2);
            let newDy = newRow[0].getSymbol().markerDy;
            expect(newDy - oldDy).to.be.equal(60 - oldRowHeight);
            table.remove();
        });

        it('set column width', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let oldColumn = table.getColumn(2);
            let oldDx = oldColumn[0].getSymbol().markerDx;
            let oldColumnWidth = table.getColumnWidth(1);
            table.setColumnWidth(1, 100);
            expect(table.getColumnWidth(1)).to.be.equal(100);
            let newColumn = table.getColumn(2);
            let newDx = newColumn[0].getSymbol().markerDx;
            expect(newDx - oldDx).to.be.equal(100 - oldColumnWidth);
            table.remove();
        });
    });
});
