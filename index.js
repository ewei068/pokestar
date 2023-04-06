// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

let commands = {};
let prefix = "!";
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('command' in command && 'execute' in command) {
		commands[`${prefix}${command.command}`] = command.execute;
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "command" or "execute" property.`);
	}
}

client.on("messageCreate", (message) => {
    // get first word of message
    const command = message.content.split(" ")[0];

    // if command doesn't start with prefix or not in commands, return
    if (!command.startsWith(prefix) || !(command in commands)) return;

    // execute command
    try {
        commands[command](client, message);
    } catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute that command!");
    }
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
client.login(token);
