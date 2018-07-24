/**
 * @file mip-bind spec file
 * @author qiusiqi(qiusiqi@baidu.com)
 */

/* eslint-disable no-unused-expressions */
/* globals describe, before, it, expect, MIP */

function createEle (tag, props, key) {
  let ele = document.createElement(tag)
  if (key === 'bind') {
    ele.setAttribute(`m-bind${props[0] ? ':' + props[0] : ''}`, props[1])
  } else if (key === 'text') {
    ele.setAttribute(`m-text`, props)
  } else if (key === 'else') {
    ele.setAttribute(props[0], props[1])
  }

  if (tag === 'iframe') {
    ele.srcdoc = `
      <mip-data>
        <script type="application/json">
          {
            "#open": false,
            "username": "iframe"
          }
        </script>
      </mip-data>
      <p m-text="global.data.name"></p>
    `
    ele.classList.add('mip-page__iframe')
    ele.setAttribute('data-page-id', 'test-link')
  }
  document.body.appendChild(ele)
  return ele
}

describe('mip-bind', function () {
  let eles = []
  let dumbDiv
  let iframe

  before(function () {
    // some normal bindings
    eles.push(createEle('p', ['loc.city'], 'text'))
    eles.push(createEle('p', ['data-active', 'global.isGlobal'], 'bind'))
    // some normal class bindings
    eles.push(createEle('p', ['class', 'classObject'], 'bind'))
    eles[2].classList.add('default-class')
    eles.push(createEle('p', ['class', '[{ loading: loading }, errorClass]'], 'bind'))
    eles.push(createEle('p', ['class', 'classText'], 'bind'))
    eles.push(createEle('p', ['class', `[loading ? loadingClass : '', errorClass]`], 'bind'))
    // some normal style bindings
    eles.push(createEle('p', ['style', 'styleObject'], 'bind'))
    eles.push(createEle('p', ['style', `{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }`], 'bind'))
    eles.push(createEle('p', ['style', `{'font-size': (Math.round(fontSize) > 12 ? Math.round(fontSize) : (fontSize - 1)) + 'px'}`], 'bind'))
    eles.push(createEle('p', ['style', '{fontSize: `${fontSize}px`}'], 'bind')) // eslint-disable-line
    eles.push(createEle('p', ['style', '[baseStyles, styleObject]'], 'bind'))
    eles.push(createEle('p', ['style', `{border: list[2].item + 'px'}`], 'bind'))
    // some form-element-bindings
    eles.push(createEle('input', ['on', 'change:MIP.setData({num:DOM.value})'], 'else'))
    eles.push(createEle('input', ['value', 'num'], 'bind'))
    eles.push(createEle('input', ['num'], 'text'))
    eles.push(createEle('input', ['notvalue', 'num'], 'bind'))
    eles.push(createEle('input', ['readonly', 'global.isGlobal'], 'bind'))
    // else
    eles.push(createEle('p', ['data', 'global.data'], 'bind'))
    // some abnormal bindings
    eles.push(createEle('p', ['num', ''], 'bind'))
    eles.push(createEle('p', ['', 'num'], 'bind'))
    eles.push(createEle('p', ['style', 'fontSize'], 'bind'))
    eles.push(createEle('p', ['style', '{}'], 'bind'))
    eles.push(createEle('p', ['class', 'fontSize'], 'bind'))
    eles.push(createEle('p', ['class', '{}'], 'bind'))
    eles.push(createEle('p', ['title'], 'text'))

    let mipData = document.createElement('mip-data')
    mipData.innerHTML = `
      <script type="application/json">
        {
          "#global": {
            "data": {
              "name": "level-1",
              "age": 1
            },
            "isGlobal": true
          },
          "loading": false,
          "loadingClass": "m-loading",
          "errorClass": "m-error",
          "classObject": {
            "warning-class": true,
            "active-class": false,
            "loading-class": true
          },
          "classText": "class-text",
          "baseStyles": {
            "color": "red"
          },
          "styleObject": {
            "fontSize": "12px",
            "margin-before": "1em",
            "whatever-prop": "default"
          },
          "fontSize": 12.5,
          "loc": {
            "province": "广东",
            "city": "广州",
            "coord": {
              "lat": 23.117,
              "lng": 113.175
            }
          },
          "num": 1,
          "num2": 1,
          "list": ['a', 'b', {"item": 2}]
        }
      </script>
    `
    document.body.appendChild(mipData)

    dumbDiv = createEle('div', null)
    dumbDiv.innerHTML = `
      <div class="inner-wrapper" disabled>
        <body>dup body</body>
        <h1 m-text=""></h1>
        <p style="color:red;;;" m-bind:style="{fontSize: fontSize + 'px'}">test:<span>1</span></p>
        <mip-data></mip-data>
        <mip-data>
          <script type="application/json">{}</script>
        </mip-data>
      </div>
    `

    MIP.$set({
      '#title': 'test case'
    })

    iframe = createEle('iframe', null)
  })

  it('should set data initially', function () {
    expect(window.m).to.eql({
      global: {
        data: {
          name: 'level-1',
          age: 1
        },
        isGlobal: true
      },
      loading: false,
      classObject: {
        'warning-class': true,
        'active-class': false,
        'loading-class': true
      },
      loadingClass: 'm-loading',
      errorClass: 'm-error',
      classText: 'class-text',
      baseStyles: {
        color: 'red'
      },
      styleObject: {
        fontSize: '12px',
        'margin-before': '1em',
        'whatever-prop': 'default'
      },
      fontSize: 12.5,
      loc: {
        province: '广东',
        city: '广州',
        coord: {
          lat: 23.117,
          lng: 113.175
        }
      },
      list: ['a', 'b', {item: 2}],
      num: 1,
      num2: 1,
      title: 'test case'
    })

    expect(window.g).to.eql({
      global: {
        data: {
          name: 'level-1',
          age: 1
        },
        isGlobal: true
      },
      title: 'test case'
    })

    expect(MIP.getData('global.data.name')).to.equal('level-1')

    expect(eles[0].textContent).to.equal('广州')
    expect(eles[1].getAttribute('data-active')).to.equal('true')
    expect(eles[2].getAttribute('class')).to.equal('default-class warning-class loading-class')
    expect(eles[3].getAttribute('class')).to.equal('m-error')
    expect(eles[4].getAttribute('class')).to.equal('class-text')
    expect(eles[5].getAttribute('class')).to.equal('m-error')
    expect(eles[6].getAttribute('style')).to.equal('font-size:12px;-webkit-margin-before:1em;')
    expect(eles[7].getAttribute('style')).to.equal('display:flex;')
    expect(eles[8].getAttribute('style')).to.equal('font-size:13px;')
    expect(eles[9].getAttribute('style')).to.equal('font-size:12.5px;')
    expect(eles[10].getAttribute('style')).to.equal('color:red;font-size:12px;-webkit-margin-before:1em;')
    expect(eles[11].getAttribute('style')).to.equal('border:2px;')

    expect(eles[17].getAttribute('data')).to.equal('{"name":"level-1","age":1}')
  })

  describe('json format', function () {
    before(function () {
      let mipData = document.createElement('mip-data')
      mipData.innerHTML = `
        <script type="application/json">
          {
            wrongFormatData: function () {}
          }
        </script>
      `
      document.body.appendChild(mipData)
    })

    it('should not combine wrong formatted data with m', function () {
      expect(window.m.wrongFormatData).to.be.undefined
    })

    it('should not set wrong formatted data', function () {
      try {
        MIP.setData({
          loading: function () {
            return false
          }
        })
      } catch (e) {}

      expect(MIP.getData('loading')).to.equal(false)
    })
  })

  describe('setData', function () {
    let ct = 0
    before(function () {
      // normal watch
      MIP.watch('global.isGlobal', function () {
        MIP.setData({
          global: {
            data: {
              age: 2
            }
          }
        })
      })
      // not-exist-data
      MIP.watch('data-not-exist', function () {})
      // array / number
      MIP.watch(['num2', 1], () => ct++)
      // // dup watch
      // MIP.watch('num2', () => ct++)
      // no cb
      MIP.watch('data-not-exist')
    })

    it('should change global data correctly', function () {
      MIP.setData({
        '#global': {
          data: {
            name: 'level-1-1'
          },
          isGlobal: false
        },
        title: 'changed'
      })

      MIP.$recompile()

      expect(window.m.global).to.eql({
        data: {
          name: 'level-1-1',
          age: 2
        },
        isGlobal: false
      })
      expect(eles[1].getAttribute('data-active')).to.equal('false')
      expect(window.m.title).to.equal('changed')
    })

    it('should have watched the change of isGlobal and do cb', function () {
      expect(window.m.global.data.age).to.equal(2)
    })

    it.skip('should not register duplicate watcher', function () {
      MIP.setData({num2: 2})
      expect(ct).to.equal(1)
    })

    it('should change page data correctly', function () {
      MIP.setData({
        loc: {
          city: '深圳',
          year: 2018
        },
        loading: true,
        newData: 1
      })

      expect(window.m.loc).to.eql({
        province: '广东',
        city: '深圳',
        year: 2018,
        coord: {
          lat: 23.117,
          lng: 113.175
        }
      })
      expect(eles[0].textContent).to.equal('深圳')
    })

    it('should shift data to a different type and still trace', function () {
      MIP.setData({
        global: {
          data: 7,
          isGlobal: {
            bool: true
          }
        }
      })

      MIP.setData({
        global: {
          data: 8,
          isGlobal: {
            bool: false
          }
        }
      })

      expect(eles[1].getAttribute('data-active')).to.equal('{"bool":false}')
      expect(eles[17].getAttribute('data')).to.equal('8')
    })

    it('should remove attribute when value turns empty', function () {
      MIP.setData({
        global: {
          data: ''
        }
      })

      expect(eles[17].getAttribute('data')).to.be.null
    })

    it('should set an object as data', function () {
      MIP.setData(1)
    })
  })

  describe('class-style-binding', function () {
    it('should update class', function () {
      MIP.setData({
        loading: true,
        classObject: {
          'active-class': true,
          'loading-class': false
        },
        classText: 'class-text-new'
      })

      expect(eles[2].getAttribute('class')).to.equal('default-class warning-class active-class')
      expect(eles[3].getAttribute('class')).to.equal('m-error loading')
      expect(eles[4].getAttribute('class')).to.equal('class-text-new')
      expect(eles[5].getAttribute('class')).to.equal('m-error m-loading')
    })

    it('should update style', function () {
      MIP.setData({
        styleObject: {
          fontSize: '16px',
          width: '50%'
        },
        fontSize: 12.4
      })

      expect(eles[6].getAttribute('style')).to.equal('font-size:16px;-webkit-margin-before:1em;width:50%;')
      expect(eles[8].getAttribute('style')).to.equal('font-size:11.4px;')
      expect(eles[9].getAttribute('style')).to.equal('font-size:12.4px;')
      expect(eles[10].getAttribute('style')).to.equal('color:red;font-size:16px;-webkit-margin-before:1em;width:50%;')
    })
  })

  describe('form element', function () {
    it('should change data with event and DOM var', function () {
      eles[12].value = 2
      let event = document.createEvent('HTMLEvents')
      event.initEvent('change', true, true)
      eles[12].dispatchEvent(event)

      expect(MIP.getData('num')).to.equal('2')
    })

    it('should change input value with m-bind', function () {
      eles[13].value = 3
      let event = document.createEvent('HTMLEvents')
      event.initEvent('input', true, true)
      eles[13].dispatchEvent(event)

      expect(MIP.getData('num')).to.equal('3')
    })
  })
})
