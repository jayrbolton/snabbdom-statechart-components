# harel-components

> Fractal UI components using snabbdom, Harel statecharts, and event emitters

A fun way to create UI components for the web. Features:
* Use [Statecharts](https://statecharts.github.io/) to manage your UI behavior
* Efficient virtual-dom subtree rendering and patching with snabbdom
* Build small UI blocks in small reusable, composable, aggregatable chunks

## Usage

Every component has a statechart, a set of states, a store, a set of actions, and a view.

* The **statechart** describes the mode in which the component is currently in (opened, hidden, loading, etc)
* The **store** is a set of internal data, usually an object
* The **actions** are store updater functions that run when the statechart transitions.
* The **view** renders the component as HTML. It updates the html efficiently every time the statechart transitions.

A component is an object with a certain set of keys. You can instantiate a component with the `Component` function.

The following example is a countdown timer. See the [/examples](/examples) directory to see the source code, as well as a `timer-list-component` that dynamically aggregates many countdown timers.

```js
var Component = require('snabbdom-statechart-components')

// A countdown timer component

// Define a component, which is just an object with certain keys
// Here we can configure our component with a custom duration

const Timer = function (duration) {
  return {
    trace: true, // Print some debug messages
    states: ['running', 'paused', 'reset', 'finished'],
    events: {
      START: [
        // [fromState, toState]
        ['paused', 'running'],
        ['reset', 'running']
      ],
      STOP: ['running', 'paused'],
      RESTART: [
        ['finished', 'reset'],
        ['running', 'reset'],
        ['paused', 'reset']
      ],
      SET_DUR: ['reset', 'reset'],
      DONE: ['running', 'finished'],
      TICK: ['running', 'running']
    },
    initialStates: {reset: true},
    initialStore: function () {
      return {
        ms: duration,
        duration: duration
      }
    },
    actions: {
      SET_DUR: function (timer, val) {
        timer.store.ms = val
        timer.store.duration = val
        return timer.store
      },
      START: function (timer) {
        tick(timer)
        return timer.store
      },
      RESTART: function (timer) {
        timer.store.ms = timer.store.duration
        return timer.store
      },
      TICK: function (timer) {
        timer.store.ms = timer.store.ms - 10
        return timer.store
      }
    },
    view: function (timer, html) {
      // If running, then stop; if not running, then start
      function toggleRunning () {
        timer.emit(timer.states.running ? 'STOP' : 'START')
      }
      return html`
        <div>
          <button class='toggle' @on:click=${toggleRunning} @props=${{disabled: timer.states.finished}}>
            ${timer.states.running ? 'Pause' : 'Start'}
          </button>
          <button class='reset' @on:click=${() => timer.emit('RESTART')} @props=${{disabled: timer.states.reset}}>
            Reset
          </button>
          <input 
            @props:placeholder='Duration in ms'
            @props:value=${timer.store.duration}
            @props:disabled=${!timer.states.reset}
            @on:input=${ev => timer.emit('SET_DUR', ev.currentTarget.value)} />
          <p> Currently ${JSON.stringify(timer.states)} </p>
          <p> Time elapsed: ${timer.store.ms} / ${timer.store.duration} </p>
        </div>
      `
    }
  }
}


// We can render the component to the page by setting the .container property in the component

// First we instantiate the component
var config = Timer(1000)
// And set a container
var container = document.querySelector('#timer')
config.container = container
// Start rendering and generating vnodes
var timer = Component(config)
timer.vnode
timer.store
timer.emit
```

## API

There is only one top-level function `Component`. It takes a config object and returns a component with `.vnode`, `.store`, `.emit` properties.

```js
var Component = require('snabbdom-statechart-components')
var myComponent = Component(config)
```

The config object takes these keys:

* `trace`: Show debug info in the console (default=false)
* `states`: An array of all state names to include in your state chart. Required.
* `events`: An object of event names mapped to pairs of state transitions in the form of `[[fromState, toState]]`. Required.
* `initialStates`: An object of active initial states (eg. `{opened: true, selected: false}`). Required.
* `initialStore`: A function that returns your initial store data on page load.
* `actions`: An object where each key is an event name from `events` and each value is an updater function (see below)
* `view`: A function that takes the component instance and an `html` function and returns a vnode. See below. Required.
* `nestedCharts`: A set of nested statecharts. See below. Optional.

#### Action functions

Each updater function in the `actions` config property can update the store. An action function takes a component instance and any data as arguments and returns a new store.

The component instance has `component.store` and `component.emit` properties which you can use to read data and emit events.

The second argument to an action function is any arbitrary data that was emitted in a call to `component.emit`. For example, if you emit `component.emit('ACTION', myData)` then the action function for the event named 'ACTION' will have a second argument of `myData`.

#### View function

The view function takes two arguments: the component instance and an `html` function.

You can read and print data out of the component by accessing `component.store`, and you can fire events from the dom with `component.emit`.

The `html` function generates virtual HTML markup with snabbdom that can be used to render to the page. It uses template literals with [snabby](https://github.com/jamen/snabby). Visit the Snabby documentation to learn more about its syntax.

#### Nested charts

You can have nested charts in your component under the `.nestedCharts` property. This property should have an object where every key is a valid state name, and ever value is a statechart object. The statechart

```js
const config = {
  states: ['s1', 'nestedStateChart'],
  events: { PUSH: ['s1', 'nestedStateChart.initial'] },
  initialStates: {s1: true},
  actions: {...},
  nestedCharts: {
    nestedStateChart: {
      initial: {a1: true},
      states: ['a1']
    }
  },
  view: ...
})
```

The details of nesting state charts can be found in the [harel documentation](https://github.com/jayrbolton/harel#nested-charts)

#### Test utility

There is a simple test utility, which can be imported with `require('snabbdom-statechart-components/test-util')`.

The test utility takes a component and an array of objects with event names, data, test functions, and delays (in milliseconds).

```js
test('timer component', function (t) {
  var div = document.createElement('div')
  var timer = Component(Object.assign(Timer(1000), {container: div, trace: false}))
  testComponent(timer, [
    {
      event: 'SET_DUR',
      data: 999,
      test: function (timer) {
        t.strictEqual(timer.store.duration, 999)
        t.strictEqual(timer.store.ms, 999)
        t.deepEqual(timer.states, {reset: true})
      }
    },
    {
      event: 'START',
      test: function (timer) {
        t.deepEqual(timer.states, {running: true})
      }
    },
    {
      wait: 10,
      test: function (timer) {
        t.deepEqual(timer.states, {running: true})
        t.strictEqual(timer.store.ms, 989)
      }
    },
    {
      wait: 1100,
      test: function (timer) {
        t.deepEqual(timer.states, {finished: true})
        t.strictEqual(timer.store.ms, 0)
      }
    },
    {
      event: 'RESTART',
      test: function (timer) {
        t.deepEqual(timer.states, {reset: true})
        t.strictEqual(timer.store.ms, timer.store.duration)
        t.end()
      }
    },
    { event: 'START' },
    {
      wait: 10,
      event: 'STOP',
      function (timer) {
        t.deepEqual(timer.states, {paused: true})
      }
    }
  ])
})
```

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install harel-components
```

## See Also

- [harel statecharts](https://github.com/jayrbolton/harel)
- [snabbdom](https://github.com/snabbdom/snabbdom)
- [snabby](https://github.com/jamen/snabby)

## License

MIT

