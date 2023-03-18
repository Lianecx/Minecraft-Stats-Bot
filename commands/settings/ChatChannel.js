import Discord from 'discord.js';
import { getComponent, getEmbed, ph } from '../../api/messages.js';
import keys, { getLanguageKey } from '../../api/keys.js';
import Command from '../../structures/Command.js';
import * as utils from '../../api/utils.js';
import Pagination from '../../structures/helpers/Pagination.js';

export default class ChatChannel extends Command {

    constructor() {
        super({
            name: 'chatchannel',
            requiresConnectedPlugin: true,
            category: 'settings',
        });
    }

    async execute(interaction, client, args, server) {
        if(!await super.execute(interaction, client, args, server)) return;

        const method = args[0];

        //Add chatchannel
        if(method === 'add') {
            const channel = args[1];
            const useWebhooks = args[2];

            if(!channel.isTextBased()) {
                return interaction.replyTl(keys.commands.chatchannel.warnings.no_text_channel);
            }

            const logChooserMsg = await interaction.replyTl(keys.commands.chatchannel.step.choose);

            let menu;
            try {
                menu = await logChooserMsg.awaitMessageComponent({
                    componentType: Discord.ComponentType.StringSelect,
                    time: 180_000,
                    filter: m => m.user.id === interaction.user.id && m.customId === 'log',
                });
            }
            catch(_) {
                return interaction.replyTl(keys.commands.chatchannel.warnings.not_collected);
            }

            //Create webhook for channel
            let webhook;
            if(useWebhooks && menu.values.includes('chat')) {
                if(channel.isThread()) webhook = await channel.parent.createWebhook({
                    name: 'ChatChannel',
                    reason: 'ChatChannel to Minecraft',
                });
                else webhook = await channel.createWebhook({
                    name: 'ChatChannel',
                    reason: 'ChatChannel to Minecraft',
                });
            }

            const resp = await server.protocol.addChatChannel({
                id: channel.id,
                webhook: webhook?.id,
                types: menu.values,
            });
            if(!await utils.handleProtocolResponse(resp, server.protocol, interaction)) return webhook?.delete();

            await server.edit({ channels: resp.data });

            return interaction.replyTl(keys.commands.chatchannel.success.add, ph.emojis(), ph.colors());
        }
        //Remove chatchannel
        else if(method === 'remove') {
            const channel = args[1];

            if(!channel.isTextBased()) {
                return interaction.replyTl(keys.commands.chatchannel.warnings.no_text_channel);
            }

            const channelIndex = server.channels.findIndex(c => c.id === channel.id);
            if(channelIndex === -1) {
                return interaction.replyTl(keys.commands.chatchannel.warnings.channel_not_added);
            }

            const resp = await server.protocol.removeChatChannel(server.channels[channelIndex]);
            if(!await utils.handleProtocolResponse(resp, server.protocol, interaction)) return;

            await server.edit({ channels: resp.data });

            return interaction.replyTl(keys.commands.chatchannel.success.remove);
        }
        else if(method === 'list') {
            if(!server.channels?.length) return interaction.replyTl(keys.commands.chatchannel.warnings.no_channels);

            /** @type {PaginationPages} */
            const pages = {};

            for(const channel of server.channels) {
                const options = getLanguageKey(keys.commands.chatchannel.step.choose.components[0].options);
                const formattedTypes = channel.types.map(type => options.find(o => o.value === type).label).join(',\n');

                const channelEmbed = getEmbed(
                    keys.commands.chatchannel.success.list,
                    ph.std(interaction),
                    {
                        channel: await interaction.guild.channels.fetch(channel.id),
                        webhooks: channel.webhook ? keys.commands.chatchannel.success.enabled : keys.commands.chatchannel.success.disabled,
                        channel_types: formattedTypes,
                    },
                );

                const index = server.channels.indexOf(channel);
                const channelButton = getComponent(keys.commands.chatchannel.success.channel_button, {
                    index1: index + 1,
                    index: index,
                });

                pages[channelButton.data.custom_id] = {
                    page: { embeds: [channelEmbed] },
                    button: channelButton,
                };
            }

            const pagination = new Pagination(client, interaction, pages);
            return pagination.start();
        }
    }
}