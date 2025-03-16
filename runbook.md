# pokéstar

## Running

### Create Bot

- Create developer application
- Enable Bot & ability to read client message content
- Generate link with bot & command priviledges
- Add bot to relevant servers & emoji servers

### Install homebrew & build tools

- Purge mandb `sudo apt-get remove -y --purge man-db`
- `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- Update path

```
test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
test -r ~/.bash_profile && echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bash_profile
echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.profile
```

- `sudo apt-get install build-essential procps curl file git`

### Node & npm

- Install nvm `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`
- `nvm install 18`
- Add path to profile if not there -- `~/.profile` for Debian
- `git clone https://github.com/ewei068/pokestar.git`
- `cd pokestar && npm install`

### Environment

- `brew install tmux`
  - IN PROD: `npm install -g pm2`
- Export `DISCORD_TOKEN`, `STAGE`, `MONGODB_URL`, `CLIENT_ID`, `DBL_TOKEN`, `DBL_SECRET`, `BOTLIST_SECRET`, `BOTLIST_TOKEN`, `DISCORDLIST_TOKEN`, `TOPGG_TOKEN`, `TOPGG_SECRET` to `.env` file **DON'T ADD THIS TO VERSION CONTROL** Refer to `.env.in`
- Upload commands: `node scripts/bot/deployCommands.js`

### Database

**Local**

- `brew tap mongodb/brew`
- `brew install mongodb-community@6.0`
- `brew install mongosh`
- `brew services start mongodb-community@6.0`
  - To stop, `brew services stop mongodb-community@6.0`
  - Don't run in `tmux`

**Debian**

- Follow instructions: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-debian/
  - `sudo systemctl start mongod`
- If pubkey error: https://chrisjean.com/fix-apt-get-update-the-following-signatures-couldnt-be-verified-because-the-public-key-is-not-available/

**Run Migration**

- Create a backup folder `src/backups`
- `node scripts/database/setupDatabase.js`

### Voting

- Add webhook URL to appropriate voting sites (DBL, Botlist)
- On cloud, run nginx reverse proxy: https://javascript.plainenglish.io/deploy-a-node-js-server-using-google-cloud-compute-engine-87268919de20

### Run Bot

- `tmux` (DON'T RUN IN PROD)
- `node src/index.js`
  - IN PROD: `pm2 start src/index.js`

## Update Steps

- Pull `git pull`
- Backup DB `mongodump  --db=pokestar --out=backups/{BACKUP_NAME}`
  - Optionally: remove some old backups
- If necessary: add other environment variables to `.env`
- If necessary: install new packages `npm install`
- If necessary: deploy commands `node scripts/bot/deployCommands.js`
- Run migration: `node scripts/database/setupDatabase.js`
- If necessary: run other migrations in `scripts/database/migrations`
- Run bot `node src/index.js`
  - IN PROD: `pm2 start src/index.js --max-memory-restart=140M`
- Test that bot works in sandboxed environment
- If DB errors, restore DB `mongorestore --drop backups/{BACKUP_NAME}/`
