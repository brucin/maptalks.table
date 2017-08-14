describe('#Table', function () {
    let container, eventContainer, map, layer, dragLayer, tableOptions, dynamicLayer, dynamicTableOptions, marker;
    const center = new maptalks.Coordinate(118.846825, 32.046534);

    function dragTable(table, isMove) {
        dragLayer = map.getLayer('DRAG_LAYER').clear(); 

        let spy = sinon.spy();
        table.on('mousedown', spy);
        //getPagePosition
        const domPosition = getPagePosition(container);
        const point = map.coordinateToContainerPoint(table.getCoordinates()).add(domPosition);
        happen.mousedown(eventContainer, {
            'clientX' : point.x,
            'clientY' : point.y
        });
        expect(spy.called).to.be.ok();
        if (isMove === undefined || isMove) {
            for (let i = 0; i < 10; i++) {
                happen.mousemove(document, {
                    'clientX':point.x + i,
                    'clientY':point.y + i
                });
            }
        }
        happen.mouseup(document);
    }

    function getPagePosition(obj) {
        const docEl = document.documentElement;
        const rect = obj.getBoundingClientRect();
        return new maptalks.Point(rect['left'] + docEl['scrollLeft'], rect['top'] + docEl['scrollTop']);
    }

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        const option = {
            zoomAnimation: false,
            zoom: 15,
            center: center
        };
        map = new maptalks.Map(container, option);
        layer = new maptalks.VectorLayer('vector').addTo(map);
        dragLayer = new maptalks.VectorLayer('DRAG_LAYER').addTo(map);
        map.config('panAnimation', false);
        eventContainer = map._panels.canvasContainer;
        const columns = [
            { header:'表头', dataIndex: 'titleOne', type: 'string', maxWidth: 50 },
            { header:'表头', dataIndex: 'titleTwo', type: 'string', maxWidth: 50 },
            { header:'表头', dataIndex: 'titleThree', type: 'string', maxWidth: 50 }
        ];
        const headerSymbol = {
            'lineColor': '#cccccc',
            'fill': '#2F373E',
            'textFaceName': 'microsoft yahei',
            'textSize': 14,
            'textFill': '#FFFFFF',
            'textWrapWidth': 100,
            'textLineSpacing': 1
        };
        const symbol = {
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
        const prop = marker.getProperties();
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

    it('add table to layer', function () {
        const table = new maptalks.Table(tableOptions);
        table.addTo(layer);
        expect(table.isVisible()).to.be.ok();
        table.hide();
        expect(table.isVisible()).not.to.be.ok();
        table.remove();
    });

    describe('drag table', function () {
        it('can drag table', function () {
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

        it('check next row position after add new row', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let oldRow = table.getRow(1);
            let oldDy = oldRow[0].getSymbol().markerDy;
            let data = { 'titleOne' : 'newOne', 'titleTwo' : 'newTwo', 'titleThree' : 'newThree' };
            table.addRow(1, data, true);
            let newRow = table.getRow(2);
            let newDy = newRow[0].getSymbol().markerDy;
            let newRowHeight = table.getRowHeight(1);
            expect(newDy - oldDy).to.be.equal(newRowHeight);
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
            let numberLabel = table._geometryNumLabels[0];
            expect(numberLabel.getCenter()).to.be.closeTo(center);
            let newPosition = new maptalks.Coordinate(119.846825, 30.046534);
            marker.setCoordinates(newPosition);
            expect(numberLabel.getCenter()).not.to.be.closeTo(marker.getCenter());
            let prop = marker.getProperties();
            prop['coordinate'] = newPosition;
            table.refreshData([prop], 'id');
            expect(numberLabel.getCenter()).to.be.closeTo(marker.getCenter());
            table.remove();
        });

        it('change geometry position in the table which start num larger than 1', function () {
            let table = new maptalks.Table(dynamicTableOptions);
            dynamicTableOptions['startNum'] = 2;
            table.addTo(dynamicLayer);
            let numberLabel = table._geometryNumLabels[0];
            expect(numberLabel.getCenter()).to.be.closeTo(center);
            let newPosition = new maptalks.Coordinate(119.846825, 30.046534);
            marker.setCoordinates(newPosition);
            expect(numberLabel.getCenter()).not.to.be.closeTo(marker.getCenter());
            let prop = marker.getProperties();
            prop['coordinate'] = newPosition;
            table.refreshData([prop], 'id');
            expect(numberLabel.getCenter()).to.be.closeTo(marker.getCenter());
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

    describe('Link', function () {
        it('link to table', function () {
            let targetTable = new maptalks.Table(tableOptions);
            targetTable.addTo(layer);
            let linker = new maptalks.Table(dynamicTableOptions);
            linker.addTo(layer);

            let map = linker.getMap();
            let targetTableCoordinate = targetTable.getCoordinates(),
                targetViewPoint = map.coordinateToViewPoint(targetTableCoordinate);
            let tableHeight = targetTable.getTableHeight();
            let targetCoordinate = map.viewPointToCoordinate(targetViewPoint.add(new maptalks.Point(0, tableHeight)));
            linker.linkTo(targetTable);
            expect(linker.getCoordinates()).to.be.closeTo(targetCoordinate);
            targetTable.remove();
            linker.remove();
        });

        it('drag the table which has linker', function () {
            let targetTable = new maptalks.Table(tableOptions);
            targetTable.addTo(layer);
            let linker = new maptalks.Table(dynamicTableOptions);
            linker.addTo(layer);
            linker.linkTo(targetTable);
            let startCoordinate = linker.getCoordinates();
            //drag target table
            dragTable(targetTable);
            expect(linker.getCoordinates()).not.to.be.closeTo(startCoordinate);

            let map = linker.getMap();
            let targetTableCoordinate = targetTable.getCoordinates(),
                targetViewPoint = map.coordinateToViewPoint(targetTableCoordinate);
            let tableHeight = targetTable.getTableHeight();
            let targetCoordinate = map.viewPointToCoordinate(targetViewPoint.add(new maptalks.Point(0, tableHeight)));
            expect(linker.getCoordinates()).to.be.closeTo(targetCoordinate);

            targetTable.remove();
            linker.remove();
        });

        it('drag table after unlink', function () {
            let targetTable = new maptalks.Table(tableOptions);
            targetTable.addTo(layer);
            let linker = new maptalks.Table(dynamicTableOptions);
            linker.addTo(layer);
            linker.linkTo(targetTable);

            let map = linker.getMap();
            let targetTableCoordinate = targetTable.getCoordinates(),
                targetViewPoint = map.coordinateToViewPoint(targetTableCoordinate);
            let tableHeight = targetTable.getTableHeight();
            let targetCoordinate = map.viewPointToCoordinate(targetViewPoint.add(new maptalks.Point(0, tableHeight)));
            expect(linker.getCoordinates()).to.be.closeTo(targetCoordinate);
            linker.unLink();
            //drag target table
            dragTable(targetTable);

            targetTableCoordinate = targetTable.getCoordinates();
            targetViewPoint = map.coordinateToViewPoint(targetTableCoordinate);
            let newCoordinate = map.viewPointToCoordinate(targetViewPoint.add(new maptalks.Point(0, tableHeight)));
            let linkerCoordinate = linker.getCoordinates();
            expect(linkerCoordinate).not.to.be.closeTo(newCoordinate);
            expect(linkerCoordinate).to.be.closeTo(targetCoordinate);

            targetTable.remove();
            linker.remove();
        });

        it('change the table "row height" which has linker', function () {
            let targetTable = new maptalks.Table(tableOptions);
            targetTable.addTo(layer);
            let linker = new maptalks.Table(dynamicTableOptions);
            linker.addTo(layer);
            linker.linkTo(targetTable);


            let map = linker.getMap();
            let targetTableCoordinate = targetTable.getCoordinates(),
                targetViewPoint = map.coordinateToViewPoint(targetTableCoordinate);
            let tableHeight = targetTable.getTableHeight();
            let firstRowHeight = targetTable.getRowHeight(1);
            targetTable.setRowHeight(1, 100);

            let targetCoordinate = map.viewPointToCoordinate(targetViewPoint.add(new maptalks.Point(0, tableHeight + (100 - firstRowHeight))));
            expect(linker.getCoordinates()).to.be.closeTo(targetCoordinate);

            targetTable.remove();
            linker.remove();
        });

        it('change the table "column width" which has linker', function () {
            let targetTable = new maptalks.Table(tableOptions);
            targetTable.addTo(layer);
            let linker = new maptalks.Table(dynamicTableOptions);
            linker.addTo(layer);
            linker.linkTo(targetTable);
            expect(linker.getColumnWidth(1)).not.to.be.equal(300);
            targetTable.setColumnWidth(1, 300);
            expect(linker.getColumnWidth(1)).to.be.equal(300);
            targetTable.remove();
            linker.remove();
        });
    });



    describe('Header', function () {
        it('hide Header', function () {
            let table = new maptalks.Table(tableOptions);
            table.addTo(layer);
            let tableHeight = table.getTableHeight();
            let headerHeight = table.getRowHeight(0);
            table.hideHeader();
            expect(table.getTableHeight()).to.be.equal(tableHeight - headerHeight);
            table.showHeader();
            expect(table.getTableHeight()).to.be.equal(tableHeight);
            table.remove();
        });
    });
});
