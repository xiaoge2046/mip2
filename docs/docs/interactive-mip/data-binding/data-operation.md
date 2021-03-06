# 数据获取与修改

## 数据获取

通过 `<mip-data>` 定义的数据可以通过 `MIP.getData('nameOfData')` 获取。但是假如在 `on` 事件绑定语法里通过 getData 方法获取数据会让代码显得冗长，因此约定在 `on` 事件绑定语法里面通过 `m.nameOfData` 进行数据获取，而在一般 JS 代码中，仍需通过 `MIP.getData` 方法获取。

举个例子，比如统计按钮点击数，那么可以这么写：

```html
<!-- preview -->
<!-- preset

-->
<mip-data>
  <script type="application/json">
    {
      "count": 0
    }
  </script>
</mip-data>

<p>当前按钮点击次数：<span m-text="count"></span></p>
<button on="tap:MIP.setData({count: m.count + 1})">点我</button>

```

但是在写 JS 代码的时候（如开发组件、写 mip-script 等场景），则应该使用 `MIP.getData()`。如下面的例子，实现了 count 每间隔 1s 从 0 自增到 9 ，再变回 0 的循环过程。

```html
<!-- preview -->
<!-- preset
  <script src="https://c.mipcdn.com/static/v2/mip-script/mip-script.js"></script>
-->
<mip-data>
  <script type="application/json">
    {
      "count": 0
    }
  </script>
</mip-data>

<mip-script>
setInterval(function () {
  var count = MIP.getData('count');
  count = count > 9 ? 0 : count + 1;
  MIP.setData({
    count: count
  });
}, 1000);
</mip-script>

<p>当前统计结果：<span m-text="count"></span></p>
```

**需要注意的是** 在 `on="eventName:MIP.setData()"` 语法中获取的数据变量，必须在 mip-data 中定义。

## 数据修改

MIP 提供了全局方法 `MIP.setData(data)` 来让开发者修改数据，以完成通过数据驱动 DOM 元素更新的交互方案。重复数据会进行覆盖。

### 用法

这个方法接受一个对象作为参数，要设置的数据对象将按照层级被合并到总的数据源中，后设置的数据会覆盖前者（支持多层级的复杂对象的 deep 数据覆盖）。

首次设置数据源如：

```html
<mip-data>
  <script type="application/json">
    {
      "name": "张三",
      "age": 25
    }
  </script>
</mip-data>
<mip-data>
  <script type="application/json">
    {
      "detail": {
        "home": {
          "province": "广东",
          "city": "深圳"
        }
      }
    }
  </script>
</mip-data>
```

此时页面维护的数据源为：

```json
{
  "name": "张三",
  "age": 25,
  "detail": {
    "home": {
      "province": "广东",
      "city": "深圳"
    }
  }
}
```

如果此时在进行数据的设置：

```html
<div on="tap:MIP.setData({job:'互联网从业者',age:26,detail:{home:{city:'广州'}}})"></div>
```

此时数据源将变为：

```json
{
  "name": "张三",
  "age": 26,
  "detail": {
    "home": {
      "province": "广东",
      "city": "广州"
    }
  },
  "job": "互联网从业者"
}
```

> **注意** ：
> 在 mip-data 小节中提到：通过 `mip-data` 组件设置的数据要求符合标准的 JSON 格式。而 `setData` 方法虽然没有严格要求传 JSON 格式的对象，但是仅允许传 JSON 对象可以接受的数据，因此是不允许设置为 **function** 的。

调用 `MIP.setData` 方法修改数据既可以通过在 HTML 元素中加入事件来完成（方式是在元素中加入 `on` 属性监听事件以触发指定修改，如前面的示例所示）；也可以在组件代码中直接调用 `setData` 方法。

后者没有特殊要求，只需要开发者自行确认逻辑和数据即可。而前者的使用，对开发者的要求有两点：
1.  使用单引号来引用字符串；
2.  要修改的数据的值，如果是一个变量 `var`，需要是通过 mip-data 组件设置的数据，并且通过 `m.var` 来获取

### 支持数据表达式

开发者使用 `setData` 方法时，支持使用数据表达式来修改数据。其中包含以下两种：

#### 支持运算表达式解析

如：

```html
<mip-data>
  <script type="application/json">
    {
      "price": 20,
      "count": 2
    }
  </script>
</mip-data>
<div m-text="price"></div>
<button on="tap:MIP.setData({price: '30'})">30</button>
<button on="tap:MIP.setData({price: 30 * m.count})">30*m.count</button>
```

#### 支持 DOM 元素解析

`<mip-bind>` 支持 DOM 元素解析，在设置的数据中，可通过 DOM 变量来表示当前事件触发的源 DOM 元素，并可通过其获取元素上的属性值等，如：

```html
<mip-data>
  <script type="application/json">
    {
      "price": 20
    }
  </script>
</mip-data>
<div>
  DOM.value*m.price = <span m-text="price"></span>
</div>
<mip-form url="https://www.mipengine.org/">
  <input type='text' on="change:MIP.setData({price:DOM.value*m.price})">
</mip-form>
```
