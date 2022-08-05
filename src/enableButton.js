const Discord = require('discord.js');
const settings = require('../api/settings');
const { keys, ph, getEmbed, getActionRow } = require('../api/messages');

async function execute(interaction) {
    if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
        interaction.respond(keys.buttons.enable.warnings.no_permission);
        return;
    }

    const commandName = interaction.customId.split('_').pop();

    const enable = await settings.enable(interaction.guildId, 'commands', commandName);
    if(enable) {
        interaction.respond(keys.buttons.enable.success.response, { 'command_name': commandName });
    }
    else {
        interaction.respond(keys.buttons.enable.errors.already_enabled, { 'command_name': commandName });
        return;
    }

    const command = keys.data[commandName];

    const disableRow = getActionRow(keys.commands.help.success.disable_button, { 'command_name': commandName }, ph.emojis());
    // noinspection JSUnresolvedVariable
    const helpEmbed = getEmbed(
        keys.commands.help.success.command,
        ph.std(interaction),
        {
            'command_name': command.name.cap(),
            'command_long_description': command.long_description,
            'command_usage': command.usage,
            'command_example': command.example,
        },
    ).setDescription(keys.buttons.enable.success.help.embeds[0].description)
        .setColor(keys.buttons.enable.success.help.embeds[0].color);

    interaction.message.edit({ embeds: [helpEmbed], components: [disableRow] });
}

module.exports = { execute };