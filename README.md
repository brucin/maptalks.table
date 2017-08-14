# maptalks table.

The maptalks.table.js plug-in is mainly used to create a table on the map container, which contains two types, respectively, custom tables and dynamic tables,
The former manual editing data, the latter data is bound to a layer.

## Feature
1. Add interactive table for maps.
2. Output table screenshot through "map.toDataURL()".
3. Support drag and mouse event listener.


## Installing
```javascript
<script src="dist/maptalks.table.min.js">
```

or

```javascript
npm install maptalks-table
```

## Demo

![Maptalks Table Demo](http://brucin.github.io/maptalks.table/demo/image/screenshot.png)

[Maptalks Table Demo](https://brucin.github.io/maptalks.table/demo/)


# Table Class
## API
### new maptalks.Table(options);
```javascript
var myTalbe = new maptalks.Table({
    'title': 'title',
    'columns': [
        {header:'Name', dataIndex: 'name', type: 'string'},
        {header:'Birth', dataIndex: 'birth', type: 'data'},
        {header:'Age', dataIndex: 'age', type: 'number'},
        {header:'Marry', dataIndex: 'marry', type: 'boolean', trueText:'Yes', falseText: 'No'}
    ],
    'data': [
        {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'},
        {name:'Peter', birth:'1985-5-1', age: 30, marry: 'true'},
        {name:'Mary', birth:'2000-6-1', age: 15, marry: 'false'}
    ],
    'headerSymbol' :{
        'lineColor': '#ffffff',
        'fill': '#4e98dd',
        'textFaceName': 'monospace',
        'textSize': 12,
        'textFill': '#ebf2f9',
        'textWrapWidth': 100
    },
    'symbol': {
        'lineColor': '#ffffff',
        'fill': '#4e98dd',
        'textFaceName': 'monospace',
        'textSize': 12,
        'textFill': '#ebf2f9',
        'textWrapWidth': 100
    },
    'position': {
        'x': 121.489935,
        'y': 31.24432
    },
    'width': 300,
    'height': 300,
    'draggable': true,
    'editable': true,
    'header': true,
    'order': true,
    'startNum' : 1,
    'dynamic': false,
    'layerId' : null
});
```
Create table.
### toJSON()
```javascript
myTable.toJSON();
```
Convert table object to JSON string.
### initByJson(jsonStr)
```javascript
myTable.initByJson(jsonStr);
```
Initialize table from JSON string.
### addTo(layer)
```javascript
myTable.addTo(layer);
```
Add table to maptalks's layer.
### hide()
```javascript
myTable.hide;
```
Hide table.
### show()
```javascript
myTable.show();
```
Display table.
### remove()
```javascript
myTable.remove();
```
Remove table from layer.
### setCoordinates(coordiante)
```javascript
myTable.setCoordinates({
    'x': 121.489935,
    'y': 31.24432
});
```
Setting the position where table display.
### setStartNum(num)
```javascript
myTable.setStartNum(6);
```
Setting table start number。
### animate(style, options, callback)
```javascript
myTable.animate(style, options, callback);
```
Setting table animate show or hide effect.
### getMap()
```javascript
myTable.getMap();
```
Get this map which table add to.
### getLayer()
```javascript
myTable.getLayer();
```
Get this layer which table add to.
### getCenter()
```javascript
myTable.getCenter();
```
Get table coordinate.
### setTableStyle(attr, value, isGlobal)
```javascript
myTable.setTableStyle('markerFill', '#00ff00', true);
```
Change table style.
### addRow(rowNum, data, below)
```javascript
myTable.addRow(1, {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'}, true);
```
Add new row.
### updateRow(rowNum, data)
```javascript
myTable.addRow(1, {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'});
```
Update row.
### removeRow(rowNum)
```javascript
myTable.addRow(1);
```
Remove row.
### moveRow(rowNum, direction)
```javascript
myTable.addRow(1, 'down');
```
Move row up or down.

### addCol(colNum, data, right)
```javascript
myTable.addCol(1, {header:'Name', dataIndex: 'name', type: 'string'}, true);
```
Add new column.
### removeCol(colNum)
```javascript
myTable.removeCol(1);
```
Remove column.
### moveCol(colnum, direction)
```javascript
myTable.moveCol(1, 'left');
```
Move column left or right.

## Events
***mouseover mouseout mousedown click dblclick contextmenu
hide remove  dragstart dragend moving dragging
symbolchange edittextstart edittextend orderchanged***
```javascript
myTable.on('click', function(){alert('Your click table')});
```
Monitor table events for event handling.
