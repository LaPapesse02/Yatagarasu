import { readdirSync, lstatSync } from 'node:fs';
import { REST, Routes } from 'discord.js';

import { Command } from "./src/@types/discord.t";

import { token, clientID, guildID } from './secrets.json';

/*
* Crawls a directory to get all the files inside it
*/
const getFilesFromDir = async (dir: string): Promise<string[]>  => {
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
            (await getFilesFromDir(path)).forEach(
                (value) => fileList.push(value)
            );
        } else {
            // If the path leads to a file add it to the list of files
            fileList.push(path);
        }
    });
    
    return fileList;
}

/*
* Check if a file is a JavaScript or TypeScript file, loads it then check
* if it contains the properties 'data' and 'execute' necessary for the command
*/
const getCommandFromFile = (filePath: string) : void | Command => {
    // Only accept JavaScript and TypeScript files
    if (!(filePath.endsWith('.js') || filePath.endsWith('.ts'))) {
        console.error(`File '${filePath}' isn't a JavaScript or TypeScript file, skipped.`)
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

    console.log(`Found command ${command.data.name}.`)
    
    return {
        data: command.data,
        execute: command.execute
    };
}

/*
* Get all the commands in a specific directory then adds them to the client object
*/
const loadCommands = async (commandsPath: string) => {
    const files = await getFilesFromDir(commandsPath);
    const commands: Command[] = [];

    files.forEach((file) => {
        const command = getCommandFromFile(file);

        if (command != null) {
            commands.push(command);
        }
    });

    return commands;
}


const updateCommands = async (commands: Command[]) => {
	try {
        const rest = new REST().setToken(token);

		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = (await rest.put(
			Routes.applicationGuildCommands(clientID, guildID),
			{ body: commands.map((command) => command.data) }
		)) as object[];

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
}



const commands = await loadCommands(`${import.meta.dir}/src/commands`);

await updateCommands(commands);
