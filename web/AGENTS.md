# Web client

When changing a web screen, its CSS, or a development story, read
[`docs/web-ui-style-guide.md`](../docs/web-ui-style-guide.md). It defines the
current visual direction, interaction rules, and review scenarios for Pokestar.

When creating or promoting battle tile VFX, read
[`docs/battle-vfx-guide.md`](../docs/battle-vfx-guide.md) for the art,
timing, variation, and review workflow.

The battle session owns server communication and action timing. Presentation
components consume its state and callbacks. Development stories render the
production components with fixture data and stay out of the production bundle.
