# maptalks table.

maptalks.table.js插件主要用于在地图容器上创建表格，它包含两种类型，分别是自定义表格与动态表格，
前者手工编辑数据，后者数据绑定至某图层。

##特点
1. 为地图增加可交互表格；
2. 通过"map.toDataURL()"可以输出表格截图；
3. 表格支持拖拽以及事件监听。


##使用
```javascript
<script src="dist/maptalks.table.min.js">
```

或者

```javascript
npm install maptalks-table
```

##例子

![表格Demo](http://brucin.github.io/maptalks.table.js/demo/image/screenshot_cn.png)

[表格Demo](http://brucin.github.io/maptalks.table.js/)

#Table Class
##API
###new maptalks.Table(options);
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
创建表格。
###toJSON()
```javascript
myTable.toJSON();
```
将表格对象转为JSON字符串。
###initByJson(jsonStr)
```javascript
myTable.initByJson(jsonStr);
```
通过JSON字符串初始化表格。
###addTo(layer)
```javascript
myTable.addTo(layer);
```
将table添加到layer。
###hide()
```javascript
myTable.hide;
```
隐藏表格。
###show()
```javascript
myTable.show();
```
显示表格。
###remove()
```javascript
myTable.remove();
```
移除表格。
###setCoordinates(coordiante)
```javascript
myTable.setCoordinates({
    'x': 121.489935,
    'y': 31.24432
});
```
设置表格显示的坐标。
###setStartNum(num)
```javascript
myTable.setStartNum(6);
```
设置表格序号列起始序号。
###animate(style, options, callback)
```javascript
myTable.animate(style, options, callback);
```
设置表格动画效果。
###getMap()
```javascript
myTable.getMap();
```
获取map对象。
###getLayer()
```javascript
myTable.getLayer();
```
获取layer对象。
###getCenter()
```javascript
myTable.getCenter();
```
获取表格坐标。
###setTableStyle(attr, value, isGlobal)
```javascript
myTable.setTableStyle('markerFill', '#00ff00', true);
```
修改表格样式。
###addRow(rowNum, data, below)
```javascript
myTable.addRow(1, {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'}, true);
```
为表格新增一行。
###updateRow(rowNum, data)
```javascript
myTable.addRow(1, {name:'Tom', birth:'1990-1-1', age: 25, marry: 'true'});
```
更新指定行。
###removeRow(rowNum)
```javascript
myTable.addRow(1);
```
删除行。
###moveRow(rowNum, direction)
```javascript
myTable.addRow(1, 'down');
```
向下/上移动行。

###addCol(colNum, data, right)
```javascript
myTable.addCol(1, {header:'Name', dataIndex: 'name', type: 'string'}, true);
```
为表格新增一列。
###removeCol(colNum)
```javascript
myTable.removeCol(1);
```
删除列。
###moveCol(colnum, direction)
```javascript
myTable.moveCol(1, 'left');
```
向左/右移动列。

##事件
***mouseover mouseout mousedown click dblclick contextmenu
hide remove  dragstart dragend moving dragging
symbolchange edittextstart edittextend orderchanged***
```javascript
myTable.on('click', function(){alert('Your click table')});
```
监听表格事件，进行事件处理。
