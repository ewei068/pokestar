const { REST, Routes } = require('discord.js');
const { commandConfig } = require('../config/commandConfig');
const { buildSlashCommand } = require('./commandManager');
const fs = require('node:fs');
const path = require('node:path');

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;
const commands = [];

// iterate over command config categories and commands
for (const commandGroup in commandConfig) {
    const commandGroupConfig = commandConfig[commandGroup];
    for (const command in commandGroupConfig.commands) {
        const commandConfig = commandGroupConfig.commands[command];
        if (commandConfig.stages.includes(process.env.STAGE)) {
            const slashCommand = buildSlashCommand(commandConfig);
            commands.push(slashCommand.toJSON());
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();