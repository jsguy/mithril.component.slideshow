# mithril MDL components

This creates [http://www.getmdl.io/](MDL) components for use with mithril.

Use state to create different components, for example:

```javascript
m.components.mButton({text: "Hello"})
```

Is a "normal" coloured button, whereas this:

```javascript
m.components.mButton({state: {fab: true, colored: true}, text: "add"})
```

Is a "fab" (round) button with a plus symbol

For further options, see [the MDL documentation](http://www.getmdl.io/components/index.html)