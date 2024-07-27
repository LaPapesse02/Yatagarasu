import { ChatInputCommandInteraction } from "discord.js";
import { changeServerUpdateChannel } from "../database";

export const setUpdateChannel = async (interaction: ChatInputCommandInteraction) => {
    const reply = interaction.reply('Setting the update channel...');

    const channel = interaction.options.getChannel('channel')!;
    const serverID = interaction.guildId!;

    changeServerUpdateChannel(parseInt(serverID), parseInt(channel?.id))

    await reply
    interaction.editReply(`${channel?.name} set as the update channel!`);
}