import {
    ChatInputCommandInteraction,
    Client,
    Events,
    Interaction,
} from 'discord.js';
import { readdirSync, lstatSync } from 'node:fs';
import { Command } from './@types/discord.t';

import { token } from '../secrets.json';

/*
 * Crawls a directory to get all the files inside it
 */
const getFilesFromDir = async (dir: string): Promise<string[]> => {
    // An array of all the files and directories inside the original directory
    const dirContent = readdirSync(dir);
    // All the files inside the directory
    const fileList: string[] = [];

    await dirContent.forEach(async (value) => {
        const path = `${dir}/${value}`;
        // Checks if the path leads to a file or a directory
        if (lstatSync(path).isDirectory()) {
            // If the path leads to a directory call this function again on that
            // directory and then add the results of that function to the list of
            // files
            (await getFilesFromDir(path)).forEach((value) =>
                fileList.push(value)
            );
        } else {
            // If the path leads to a file add it to the list of files
            fileList.push(path);
        }
    });

    return fileList;
};

/*
 * Check if a file is a JavaScript or TypeScript file, loads it then check
 * if it contains the properties 'data' and 'execute' necessary for the command
 */
const getCommandFromFile = (filePath: string): void | Command => {
    // Only accept JavaScript and TypeScript files
    if (!(filePath.endsWith('.js') || filePath.endsWith('.ts'))) {
        console.error(
            `File '${filePath}' isn't a JavaScript or TypeScript file, skipped.`
        );
        return;
    }

    // Import the command
    const command = require(filePath);

    // Check that the file contains all the info necessary to run the command
    if (!('data' in command)) {
        console.error(`File '${filePath}' missing 'data' field, skipped.`);
        return;
    } else if (!('execute' in command)) {
        console.error(`File '${filePath}' missing 'execute' field, skipped.`);
        return;
    }

    console.log(`Found command ${command.data.name}.`);

    return {
        data: command.data,
        execute: command.execute,
    };
};

/*
 * Get all the commands in a specific directory then adds them to the client object
 */
const loadCommands = async (commandsPath: string, client: Client) => {
    const files = await getFilesFromDir(commandsPath);
    const commands: Command[] = [];

    files.forEach((file) => {
        const command = getCommandFromFile(file);

        if (command != null) {
            commands.push(command);
        }
    });

    client.commands = commands;
};

/*
 * Find the command that the user is trying to run and execute it, otherwise notify
 * the user that there was an error
 */
const executeCommand = async (
    interaction: ChatInputCommandInteraction,
    client: Client
) => {
    const command = client.commands.find(
        (command) => command.data.name == interaction.commandName
    );
    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            });
        }
    }
};

const client = new Client({ intents: [] });
await loadCommands(`${import.meta.dir}/commands`, client);

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
        executeCommand(interaction, client);
    }
});

client.once(Events.ClientReady, (c: Client) =>
    console.log(`Logged in as ${c.user?.tag}!`)
);
client.login(token);
