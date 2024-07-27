import { ChatInputCommandInteraction, SlashCommandBuilder, ChannelType } from 'discord.js';
import { setUpdateChannel } from '../../discord/server';


export const data = new SlashCommandBuilder()
    .setName('set_channel')
    .setDescription('Sets the channel where you will receive the updates')
    .addChannelOption(
        option => option.setName('channel')
            .setDescription('Channel where you will receive the updates')
            .addChannelTypes(ChannelType.GuildText, ChannelType.PublicThread)
            .setRequired(true)
    );
    
export async function execute(interaction: ChatInputCommandInteraction) {
    setUpdateChannel(interaction);
}
