# Button Callbacks

Examples of handling button interactions.

## Simple Click

```javascript
const clickKey = useCallbackBinding(() => {
  setIsActive(true);
}, ref);

createElement(Button, {
  label: "Activate",
  callbackBindingKey: clickKey,
});
```

## With Data

Pass data to identify which button was clicked:

```javascript
const actionKey = useCallbackBinding((_, data) => {
  if (data.action === "prev") setPage((p) => p - 1);
  if (data.action === "next") setPage((p) => p + 1);
}, ref);

createElement(Button, {
  label: "◄",
  callbackBindingKey: actionKey,
  data: { action: "prev" },
});
createElement(Button, {
  label: "►",
  callbackBindingKey: actionKey,
  data: { action: "next" },
});
```

## Toggle

```javascript
const [isOn, setIsOn] = useState(false, ref);

const toggleKey = useCallbackBinding(() => {
  setIsOn((v) => !v);
}, ref);

createElement(Button, {
  label: isOn ? "ON" : "OFF",
  style: isOn ? ButtonStyle.Success : ButtonStyle.Danger,
  callbackBindingKey: toggleKey,
});
```

## Shared Callback for Multiple Buttons

One callback handling multiple buttons via `data`:

```javascript
const sharedKey = useCallbackBinding((_, data) => {
  switch (data.type) {
    case "increment":
      setCount((c) => c + data.amount);
      break;
    case "reset":
      setCount(0);
      break;
  }
}, ref);

return {
  components: [
    [
      createElement(Button, {
        label: "+1",
        callbackBindingKey: sharedKey,
        data: { type: "increment", amount: 1 },
      }),
      createElement(Button, {
        label: "+10",
        callbackBindingKey: sharedKey,
        data: { type: "increment", amount: 10 },
      }),
      createElement(Button, {
        label: "Reset",
        callbackBindingKey: sharedKey,
        data: { type: "reset" },
      }),
    ],
  ],
};
```
