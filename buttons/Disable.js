import Discord, { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { getActionRows, ph } from '../api/messages.js';
import keys from '../api/keys.js';
import Button from '../structures/Button.js';

export default class Disable extends Button {

    constructor() {
        super({
            permissions: new PermissionsBitField(Discord.PermissionFlagsBits.Administrator),
            id: 'disable',
        });
    }

    async execute(interaction, client, server) {
        if(!await super.execute(interaction, client, server)) return;

        let settings = server ? server.settings : client.settingsConnections.cache.get(interaction.guildId);
        if(!settings) settings = await client.settingsConnections.connect(interaction.guildId);

        const commandName = interaction.customId.split('_').pop();

        if(await settings.disable('commands', commandName)) {
            await interaction.replyTl(keys.buttons.disable.success.response, { 'command_name': commandName.cap() });
        }
        else {
            return interaction.replyTl(keys.commands.disable.errors.could_not_disable, { 'command_name': commandName.cap() });
        }

        const enableRows = getActionRows(keys.commands.help.success.enable_button, { 'command_name': commandName }, ph.emojis());
        const helpEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(keys.buttons.disable.success.help.embeds[0].description)
            .setColor(Discord.Colors[keys.buttons.disable.success.help.embeds[0].color]);

        return interaction.message.edit({ embeds: [helpEmbed], components: enableRows });
    }
}