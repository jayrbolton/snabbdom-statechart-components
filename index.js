var mitt = require('mitt')
var harel = require('harel')
var html = require('snabby/create')([
  require('snabbdom/modules/eventlisteners').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/dataset').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/attributes').default
])

module.exports = Component

var id = 0
function Component (options) {
  var emitter = mitt()
  var component = {
    id: id++,
    handlers: {},
    tracing: options.trace,
    view: options.view,
    emitter: emitter,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter),
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
    component.store = options.initialStore()
  }

  for (var eventName in options.actions) {
    if (!(eventName in options.events)) {
      throw new Error('Invalid action on missing event: ' + eventName)
    }
    component.handlers[eventName] = options.actions[eventName]
  }

  component.vnode = options.view(component, html)
  if (options.container) {
    component.vnode = html.update(options.container, component.vnode)
  }

  return component
}

function render (component) {
  component.vnode = html.update(component.vnode, component.view(component, html))
}
