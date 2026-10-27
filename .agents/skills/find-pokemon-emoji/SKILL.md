---
name: find-pokemon-emoji
description: Find a Pokemon's Discord emoji string — canonical (e.g. `<:25:1100282072003772457>`) from `pokestar-pk-{n}`, form variants (e.g. `<:483origin:1404654211324448848>`) from `pokestar-forms-1`, or fakemon (e.g. `<:ashpikachu:1109522092283658250>`) from `pokestar-pk-extra` — via Playwright CLI. Use when the user asks for a Pokemon's emoji, emoji ID, form emoji, fakemon emoji, or needs an `<:name:snowflake>` string.
---

# Find Pokemon Emoji

Pokemon emojis are posted as plain-text messages in Discord emoji servers under the "Emojis" folder. This skill covers three cases:

- **Canonical Pokemon** (numeric ID only) live in `pokestar-pk-{n}`, 50 per server.
- **Form variants** (e.g. Dialga Origin, Rotom Wash) live in `pokestar-forms-1`.
- **Fakemon** (e.g. Ash's Pikachu, Aqua Sharpedo) live in `pokestar-pk-extra`.

Decide which workflow to use based on the request, then follow that section.

## Setup (run before any workflow)

Do not assume a Playwright session is already open. Always close any existing session first, then open a fresh one with the persistent `main` profile. This avoids inheriting a stale page or a different user profile.

```bash
playwright-cli -s=main close 2>/dev/null || true
```

The `|| true` swallows the error when no session is open. The actual `playwright-cli -s=main open ...` call happens inside each workflow's "open the channel" step (the URL differs per workflow), so do not pre-open a generic page here.

## Canonical Pokemon Workflow

### 1. Compute the server number

For a Pokemon with ID `pokemonId`:

```
serverNumber = ceil(pokemonId / 50)
```

Examples:

- Pikachu (25) → server 1
- Mamoswine (473) → server 10

### 2. Open the matching server's `#general` channel directly

Use the URL table below (do not search the sidebar). These links open `pokestar-pk-{n}`'s `#general` channel.

| n   | URL                                                                  |
| --- | -------------------------------------------------------------------- |
| 1   | https://discord.com/channels/1099523950297485323/1099523951195078819 |
| 2   | https://discord.com/channels/1100284426044309555/1100284426690244731 |
| 3   | https://discord.com/channels/1100289786046058518/1100289787648294984 |
| 4   | https://discord.com/channels/1116755651876618320/1116755653973790874 |
| 5   | https://discord.com/channels/1119802868413775965/1119802869307158610 |
| 6   | https://discord.com/channels/1126680474778091570/1126680475948306434 |
| 7   | https://discord.com/channels/1132495466542678079/1132495467553489000 |
| 8   | https://discord.com/channels/1132495525929816137/1132495526886133803 |
| 9   | https://discord.com/channels/1351024398462619670/1351024398945091617 |
| 10  | https://discord.com/channels/1351024742563319820/1351024742999523332 |

Open it with the persistent `main` profile:

```bash
playwright-cli -s=main open "<url>" --headed --persistent
```

Verify the page title contains `#general | pokestar-pk-{n}`:

```bash
playwright-cli -s=main snapshot --depth=2
```

### 3. Locate the bulk emoji message

Snapshot the chat messages list at moderate depth. The emoji dump is a single plain-text message from `ewei` containing 50 `<:{id}:{snowflake}>` tokens separated by spaces.

```bash
playwright-cli -s=main snapshot "[data-list-id='chat-messages']" --depth=8
```

The message body shows up as a `generic` child of an `article`, for example:

```
- generic: <:451:1351027171560259594> <:452:1351027172546187339> ... <:500:1351027600859988040>
```

If the message is not in the default snapshot, scroll to the top of the message list and snapshot again:

```bash
playwright-cli -s=main eval "document.querySelector('[data-list-id=\"chat-messages\"]').scrollTop = 0"
playwright-cli -s=main snapshot "[data-list-id='chat-messages']" --depth=8
```

If it still isn't found, fall back to opening the "Emojis" folder in the sidebar, clicking `pokestar-pk-{n}`, and scrolling through `#general` manually (per the `verify-discord` skill).

### 4. Extract the emoji string

From the bulk message, find the token whose ID matches the Pokemon's ID. Return it verbatim, including the angle brackets.

Example (Mamoswine, ID 473, server 10):

```
<:473:1351027335155024042>
```

## Form Variant Workflow

Form emojis use the token format `<:{id}{form}:{snowflake}>`, where `{form}` is a lowercase suffix like `origin`, `sandy`, `trash`, `fan`, `frost`, `heat`, `mow`, `wash`. Example: Dialga Origin (base ID 483) → `<:483origin:1404654211324448848>`.

### 1. Identify the base ID and form suffix

From the user's request, determine:

- The base Pokemon's numeric ID (e.g. Dialga = 483)
- The form suffix (e.g. "Origin" → `origin`)

If unsure, check `src/config/pokemonConfig.js` for the corresponding `{pokemonId}_{FORM}` entry — existing form emojis there show the exact suffix spelling.

### 2. Open `pokestar-forms-1`'s `#general`

```bash
playwright-cli -s=main open "https://discord.com/channels/1367372071755317298/1367372071755317301" --headed --persistent
```

Verify the page title contains `#general | pokestar-forms-1`:

```bash
playwright-cli -s=main snapshot --depth=2
```

### 3. Snapshot and scan for the form token

```bash
playwright-cli -s=main snapshot "[data-list-id='chat-messages']" --depth=8
```

Unlike the canonical servers, form emojis are posted in multiple smaller messages from `ewei` over time (e.g. one message per batch of newly-added forms). Scan all visible message bodies for the `<:{id}{form}:...>` token.

If the target form isn't in the default view, scroll to the top and re-snapshot:

```bash
playwright-cli -s=main eval "document.querySelector('[data-list-id=\"chat-messages\"]').scrollTop = 0"
playwright-cli -s=main snapshot "[data-list-id='chat-messages']" --depth=8
```

### 4. Extract the emoji string

Return the matching token verbatim. Example (Dialga Origin, base 483, form `origin`):

```
<:483origin:1404654211324448848>
```

## Fakemon Workflow

Fakemon emoji names are unpredictable — they may combine the base Pokemon's name, an owner/theme prefix, a numeric ID, or a mix (e.g. `ashpikachu`, `garyblastoise`, `aquasharpedo`). Bulk-scanning is impractical, so use Discord's in-server search.

### 1. Generate candidate search terms

Build 2–4 candidate tokens from the fakemon's display name by stripping spaces, apostrophes, and punctuation, then lowercasing. For "Ash's Pikachu":

- `ashpikachu` (most likely)
- `ashspikachu`
- `ashs_pikachu`
- `pikachu` (broad fallback — may match many results)

If `src/config/pokemonConfig.js` already has a `pokemonIdEnum` entry for the fakemon, its snake_case key (e.g. `ASHS_PIKACHU`) hints at the likely emoji name. Prefer searching the most stripped-down form first.

### 2. Open `pokestar-pk-extra`'s `#general`

```bash
playwright-cli -s=main open "https://discord.com/channels/1109520907581542441/1109520908118405234" --headed --persistent
```

Verify the page title contains `#general | pokestar-pk-extra`:

```bash
playwright-cli -s=main snapshot --depth=2
```

### 3. Use Discord's search

Click the search combobox and type the candidate term:

```bash
playwright-cli -s=main click "[role='combobox'][aria-label='Search']"
playwright-cli -s=main type "<candidate>"
playwright-cli -s=main press Enter
```

Snapshot the results panel:

```bash
playwright-cli -s=main snapshot "[aria-label='Search Results']" --depth=10
```

**First-time indexing**: If the panel shows "Before searching, we need to index this server", wait ~10 seconds and re-snapshot. Discord finishes indexing in the background.

**Reading results**: Each result is a `listitem` with a nested `article`. The article's accessible name includes the full message body with emoji tokens, e.g.:

```
article "ewei , <:ashpikachu:1109522092283658250> <:garyblastoise:1109522094645063810> , 5/20/23, 9:44 AM"
```

Scan for the `<:{name}:{snowflake}>` token whose name matches the fakemon.

### 4. Iterate if no match

If the first candidate returns zero results, clear the search and try the next candidate:

```bash
playwright-cli -s=main click "[role='combobox'][aria-label='Search']"
playwright-cli -s=main fill "[role='combobox'][aria-label='Search']" ""
playwright-cli -s=main type "<next-candidate>"
playwright-cli -s=main press Enter
```

If all name-based candidates fail, try the numeric `pokemonId` (some older fakemon use numeric names).

### 5. Extract the emoji string

Return the matching token verbatim. Example (Ash's Pikachu):

```
<:ashpikachu:1109522092283658250>
```

## Output

Report the server used and the final emoji string, e.g.:

> Mamoswine (473) — server `pokestar-pk-10` — `<:473:1351027335155024042>`
> Dialga Origin (483, `origin`) — server `pokestar-forms-1` — `<:483origin:1404654211324448848>`
> Ash's Pikachu — server `pokestar-pk-extra` — `<:ashpikachu:1109522092283658250>`

## Fallback when the emoji can't be found

If the emoji genuinely doesn't exist (most common for newly-conceived fakemon or a brand-new form that has not yet been uploaded to the emoji server), or if you've spent a reasonable amount of effort searching and still can't locate it, **do not block the implementation**. Instead:

1. Return the placeholder string `❓` in place of the emoji.
2. **Explicitly flag to the user** that the emoji is missing, what you searched for, and which server you expected it in. Example:

   > Could not find an emoji for "Ash's Greninja" — searched `pokestar-pk-extra` for candidates `ashgreninja`, `ashsgreninja`, `greninja658`, plus a numeric `658-1` fallback. Using `❓` as a placeholder; please upload the emoji and replace.

3. The caller (e.g. the `add-pokemon` skill) should still complete the rest of its work using `❓`. The user can swap in the real emoji later.

What counts as "reasonable effort":

- **Canonical**: scrolled through the matching `pokestar-pk-{n}` server's `#general` and the bulk-emoji message doesn't contain the ID. Try the adjacent server (`n-1` or `n+1`) once in case the ID is borderline (e.g. id `100` could be in server 2 instead of server 3 due to off-by-one). If still missing → fallback.
- **Form**: scrolled the entire `pokestar-forms-1` `#general` from top to bottom and no `<:{id}{form}:...>` token matches. → fallback.
- **Fakemon**: tried at least 3 candidate search terms (stripped, with apostrophes, numeric ID) and Discord search returned no matches. → fallback.

Do not silently substitute a different Pokemon's emoji or invent an emoji ID — always use `❓` and flag.

## Notes

- Items and NPC emojis live in other servers in the "Emojis" folder (`pokestar-item-1`, `pokestar-npc-1`, etc.) and are out of scope for this skill.
- Do not type the emoji into the input or send any messages — read-only snapshotting is sufficient.
