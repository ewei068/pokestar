# User ID Filter Option

Control which users can interact with a component using `userIdForFilter`.

## Usage

```javascript
const { userTypeEnum } = require("../../deact/deact");

useCallbackBinding(callback, ref, {
  userIdForFilter: userTypeEnum.DEFAULT, // or ANY, or a specific user ID
});
```

## Options

### Default (Original User Only)

Only the user who initiated the interaction can click:

```javascript
const restrictedKey = useCallbackBinding(callback, ref, {
  userIdForFilter: userTypeEnum.DEFAULT,
});
```

This is the default behavior if `userIdForFilter` is not specified.

### Any User

Allow any user to interact:

```javascript
const publicKey = useCallbackBinding(callback, ref, {
  userIdForFilter: userTypeEnum.ANY,
});
```

Use this for public actions like voting or reactions.

### Specific User

Only a specific user ID can interact:

```javascript
const specificKey = useCallbackBinding(callback, ref, {
  userIdForFilter: "123456789012345678",
});
```

Use this when an action should only be available to a particular user (e.g., the target of a trade).
