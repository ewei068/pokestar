---
name: verify-discord
description: Verify Discord bot changes by running the bot and testing commands in Discord via Playwright CLI. Use when the user asks to test, verify, or check bot commands in Discord.
---

# Verify Discord Bot via Playwright CLI

## Prerequisites

- `playwright-cli` installed globally (`npm install -g @playwright/cli@latest`)
- Chromium browser installed (`playwright-cli install-browser chromium`)
- Persistent profile `main` pre-authenticated to Discord

## Workflow

### 1. Start the bot

```bash
node src/index.js
```

Run in the background. Check the console output and confirm the bot has started successfully before proceeding.

To verify the bot is still running later, read the **end** of the terminal file to check for an `exit_code` footer (which means the process has exited). If present, the bot has stopped and needs to be restarted. Do not rely on the `running_for_seconds` header alone -- it may be stale.

### 2. Open Discord

```bash
playwright-cli -s=main open "https://discord.com/channels/1093395679516311615/1492580497866625197" --headed --persistent
```

This opens the **Pokestar Alpha** server, **#dev-private** channel.

### 3. Verify the page loaded

```bash
playwright-cli -s=main snapshot --depth=3
```

Confirm the page loaded to the correct server and channel. Check the page title or take a deeper snapshot to look for the server name and channel name in the navigation or header areas.

### 4. Find and click the chat input

```bash
playwright-cli -s=main snapshot "[role='textbox']"
```

This returns the chat input ref (e.g. `e404`). Click it:

```bash
playwright-cli -s=main click <ref>
```

### 5. Enter a slash command

Command definitions and their parameters are in `src/config/commandConfig.js`.

#### Fast method: `fill` (preferred when you know the params)

If you know the command and its parameter names, use `fill` to paste the entire command at once. Discord will auto-parse the `param: value` syntax.

```bash
playwright-cli -s=main fill "[role='textbox']" "/commandname param1: value1 param2: value2"
```

Then press Enter to send. This is the fastest method.

#### Manual method: `type` with autocomplete

Use this when you need to discover available params or aren't sure of the exact syntax.

```bash
playwright-cli -s=main type "/commandname"
```

Check the autocomplete listbox and click the matching option:

```bash
playwright-cli -s=main snapshot "[role='listbox']"
playwright-cli -s=main click <option-ref>
```

**Required parameters:** After selecting a command, the cursor is placed in the first required parameter field. Type the value directly. If there are multiple required params, pressing Tab moves to the next one.

**Optional parameters:** After all required params are filled, press Tab to bring up the optional parameter list. Then:

1. Press ArrowDown to select the first optional param
2. Use ArrowDown/ArrowUp to navigate to the desired param
3. Press Enter to activate that param field
4. Type the value

Snapshot `[role='listbox']` after pressing Tab to see the available optional params and confirm selection state.

### 6. Send the command

```bash
playwright-cli -s=main press Enter
```

After pressing Enter, verify the command was actually sent by snapshotting the textbox:

```bash
playwright-cli -s=main snapshot "[role='textbox']"
```

If the textbox is empty (shows only the placeholder like `Message #channel-name`), the command sent successfully. If the textbox still contains command text, the command did not send. Common causes:

- Discord opened an optional parameters list — press Enter again to dismiss and send
- A required parameter is missing — snapshot the command bar area to identify what's needed
- The command input has an error — check for error indicators in the surrounding UI

Keep pressing Enter or fixing the issue until the textbox is cleared.

### 7. Verify bot output

Wait a few seconds for the bot to respond, then snapshot the message list:

```bash
playwright-cli -s=main snapshot "[data-list-id='chat-messages']" --depth=6
```

Read the snapshot to verify the bot's response content. The most recent messages appear at the bottom of the list.

### 8. Interact with bot UI components

Bot responses can include buttons, select menus, and modals. Snapshot the bot's message to find interactive elements:

```bash
playwright-cli -s=main snapshot "[data-list-id='chat-messages'] li:last-of-type" --depth=6
```

#### Buttons

Find buttons by their label text in the snapshot (e.g. `button "Filter / Sort" [ref=e1234]`) and click by ref:

```bash
playwright-cli -s=main click <button-ref>
```

After clicking, wait briefly and snapshot the message again to verify the updated output. Some buttons toggle additional rows of buttons or change the embed content in place.

#### Select menus

Select menus appear as a button with a label like `"Select a pokemon"` and `aria-haspopup="listbox"`. Click the select menu to open it:

```bash
playwright-cli -s=main click <select-ref>
```

Then snapshot the listbox to see available options:

```bash
playwright-cli -s=main snapshot "[role='listbox']" --depth=5
```

Click the desired option by ref:

```bash
playwright-cli -s=main click <option-ref>
```

**Note:** If the page has multiple select menus (from different bot messages), the CSS selector `[role='listbox']` may not be unique. Use `eval` to identify the correct element, or snapshot the specific message's subtree.

#### Modals

Some buttons open a modal dialog (e.g. search input). After clicking the triggering button, check for a modal:

```bash
playwright-cli -s=main snapshot "[role='dialog']" --depth=6
```

The modal will contain form fields (textboxes), a Cancel button, and a Submit button. Fill in the fields and submit:

```bash
playwright-cli -s=main fill <textbox-ref> "value"
playwright-cli -s=main click <submit-ref>
```

After submitting, the modal closes and the bot updates its response. Snapshot the message list to verify.

### 9. Cleanup

Close the browser and stop the bot when done:

```bash
playwright-cli -s=main close
```

Stop the bot process (kill the `node src/index.js` process).

## Tips

- Always save screenshots to `.playwright/output/` to keep the project root clean:
  ```bash
  playwright-cli -s=main screenshot --filename=.playwright/output/name.png
  ```
  Snapshots and console logs already go there via `outputDir` in the config, but screenshots require an explicit `--filename` path.
- Use `--depth=N` on snapshots to limit output size. Discord's DOM is large; start shallow and drill into specific elements.
- Use `playwright-cli -s=main snapshot <ref>` to snapshot a specific element for more detail.
- Ephemeral messages (visible only to you) appear in the snapshot with "Only you can see this" text.
- If the session auth expires, re-open headed and log in again manually.
