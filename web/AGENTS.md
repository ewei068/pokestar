# Web client

When changing browser UI, including the shell, prototypes, CSS or development
stories, read
[`docs/web-ui-style-guide.md`](../docs/web-ui-style-guide.md). It defines the
current visual direction, interaction rules, and review scenarios for Pokestar.
Use the guide's selected Jewel reference for the shell and non-battle screens;
use the rendered battle screen for battlefield work. Carry the game presentation
and existing copy voice into new screens.

For interface copy, battle narration or error wording, read its
[Copy voice](../docs/web-ui-style-guide.md#copy-voice) section and linked approved
review before editing. It owns the author's voice and copy source boundaries.

For battlefield layout, floating HUDs, sprite anchoring or event labels, also
read [`docs/arena-design-guide.md`](../docs/arena-design-guide.md).

When creating or promoting battle tile VFX, read
[`docs/battle-vfx-guide.md`](../docs/battle-vfx-guide.md) for the art,
timing, variation, and review workflow.

The battle session owns server communication and action timing. Presentation
components consume its state and callbacks. Development stories render the
production components with fixture data and stay out of the production bundle.
