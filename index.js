var mitt = require('mitt')
var harel = require('harel')
var snabbdom = require('snabbdom')
var patch = snabbdom.init([
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/attributes').default
])

module.exports = Component

var id = 0
function Component (options) {
  var component = {
    id: id++,
    handlers: {},
    tracing: options.trace,
    view: options.view,
    emitter: mitt(),
    on: function () {
      this.emitter.on.apply(this.emitter, arguments)
      return this
    },
    off: function () {
      this.emitter.off.apply(this.emitter, arguments)
      return this
    },
    emit: function (name, data) {
      if (this.tracing) {
        console.log('EVENT', name)
      }
      this.chart = this.chart.event(name)
      this.states = this.chart.states
      var action = this.handlers[name]
      if (action) {
        var newStore = action(this, data)
        if (newStore === undefined) {
          throw new Error("Don't forget to return an updated store in you action function")
        }
        this.store = newStore
      }
      if (this.tracing) {
        console.log('    store: ', newStore)
      }
      render(this)
      this.emitter.emit(name)
      return this
    }
  }

  var chart = harel.create({
    states: options.states,
    events: options.events || {},
    where: options.nestedCharts || {},
    initial: options.initialStates || {}
  })
  component.chart = chart
  component.states = chart.states

  if (options.initialStore) {
    component.store = options.initialStore(component)
  }

  for (var eventName in options.actions) {
    if (!(eventName in options.events)) {
      throw new Error('Invalid action on missing event: ' + eventName)
    }
    component.handlers[eventName] = options.actions[eventName]
  }

  var container = document.createElement('div')
  component.vnode = patch(container, options.view(component))

  return component
}

function render (component) {
  var newVnode = patch(component.vnode, component.view(component))
  component.vnode.data = newVnode.data
  component.vnode.elm = newVnode.elm
  component.vnode.children = newVnode.children
  component.vnode.key = newVnode.key
  component.vnode.text = newVnode.text
  component.vnode.sel = newVnode.sel
}
