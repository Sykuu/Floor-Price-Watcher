const { guildInfo } = require('../utility/guildInfo');
const { argsValidation } = require('../utility/argsValidation');
const axios = require('axios');
const { ErrorEmbed, StandardEmbed } = require('../utility/embedTemplates');

module.exports.run = async (client, message, args, command) => {
  const allowedRoles =
    guildInfo[message.guildId].allowedRoles[command.info.name];
  const commandInfo = {
    minArgs: 1,
    allowedRoles,
    argsRules: [
      {
        name: 'collection',
        restrictOptions: [],
        numberRestrictions: [],
      },
    ],
  };

  // =======================================================
  // validating args
  const argsError = argsValidation(commandInfo, args, message, command);
  if (argsError) {
    return message.channel.send({
      embeds: [new ErrorEmbed(argsError)],
    });
  }
  // =======================================================

  const collectionName = args.join(' ').toLowerCase().trim();
  const cleanName = collectionName
    .replace(/[^a-zA-Z0-9\s\_]/g, '')
    .replace(/\_*\s+\_*/g, '_');

  try {
    const { data } = await axios.get(
      `https://api-mainnet.magiceden.dev/v2/collections/${cleanName}/`
    );
    return message.channel.send({
      embeds: [
        new StandardEmbed(
          data.name,
          `https://www.magiceden.io/marketplace/${cleanName}`,
          '',
          [
            {
              name: 'Floor Price',
              value: `${data.floorPrice / 1000000000} ◎`,
              inline: true,
            },
            {
              name: 'Listed',
              value: data.listedCount.toString(),
              inline: true,
            },
            {
              name: 'Total Volume',
              value: `${+(
                Math.round(data.volumeAll / 1000000000 + 'e+2') + 'e-2'
              )} ◎`,
              inline: true,
            },
            {
              name: 'Twitter',
              value: data.twitter || 'No Twitter provided',
            },
            {
              name: 'Discord',
              value: data.discord || 'No Discord provided',
            },
          ],
          data.image
        ),
      ],
    });
  } catch (e) {
    console.log(`[Command Floor] ${e}`);
    if (e.response && e.response.status === 404) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            `Collection **${collectionName}** not found. Try the collection name from the end of the MagicEden Collection URL.`
          ),
        ],
      });
    }
  }
};

module.exports.info = {
  name: 'floor',
  syntax: '!fpw floor [collection]',
  arguments: [{ name: 'collection', info: 'Collection name' }],
  description:
    'Gives out the current floorprice and additional info of a collection',
};
