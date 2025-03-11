const { ButtonStyle } = require("discord.js");
const {
  useState,
  useCallback,
  useCallbackBinding,
  createElement,
} = require("../deact/deact");
const Button = require("../deact/elements/Button");

const useInfoToggle = ({ initial = false, deferToggle = false }, ref) => {
  const [isToggled, setIsToggled] = useState(initial, ref);

  const toggle = useCallback(
    () => {
      setIsToggled((prev) => !prev);
    },
    [],
    ref
  );
  const toggleBindingKey = useCallbackBinding(toggle, ref, {
    defer: deferToggle,
  });

  const toggleButton = createElement(Button, {
    label: "ⓘ",
    callbackBindingKey: toggleBindingKey,
    style: isToggled ? ButtonStyle.Primary : ButtonStyle.Secondary,
  });

  return {
    isToggled,
    toggle,
    toggleButton,
  };
};

module.exports = useInfoToggle;
