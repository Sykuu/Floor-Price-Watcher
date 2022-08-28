const watchlistSchema = require('../utility/watchlistSchema');
const { StandardEmbed, ErrorEmbed } = require('../utility/embedTemplates');
const { argsValidation } = require('../utility/argsValidation');
const { guildInfo } = require('../utility/guildInfo');

module.exports.run = async (client, message, args, command) => {
  const allowedRoles =
    guildInfo[message.guildId].allowedRoles[command.info.name];
  const commandInfo = {
    minArgs: 0,
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

  if (args[0]) {
    const collectionName = args.slice(0).join(' ').toLowerCase().trim();
    const cleanName = collectionName
      .replace(/[^a-zA-Z0-9\s\_]/g, '')
      .replace(/\_*\s+\_*/g, '_');

    const oneCollection = await watchlistSchema.find({
      apiName: cleanName,
      guildId: message.guildId,
    });

    if (!oneCollection.length) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            `Collection **${collectionName}** is not on the watchlist!`
          ),
        ],
      });
    }

    const data = oneCollection.map((item) => {
      return {
        name: `${item.condition} ${item.price}`,
        value: `**id:** ${item._id}`,
        inline: true,
      };
    });

    const { printName, thumbnailUrl, apiName } = oneCollection[0];

    message.channel.send({
      embeds: [
        new StandardEmbed(
          printName,
          `https://www.magiceden.io/marketplace/${apiName}`,
          'All currently active conditions',
          data,
          thumbnailUrl
        ),
      ],
    });
  } else {
    const allCollections = await watchlistSchema.find({
      guildId: message.guildId,
    });

    if (!allCollections.length) {
      return message.channel.send({
        embeds: [
          new StandardEmbed(
            'Watchlist',
            '',
            'There are no collections on the watchlist.',
            '',
            ''
          ),
        ],
      });
    }

    const data = allCollections.map((item) => {
      return item.apiName;
    });

    const counts = {};

    for (let x in data) {
      counts[data[x]] = (counts[data[x]] || 0) + 1;
    }

    const uniqCollections = [...new Set(data)];

    const embedFields = uniqCollections.map((item) => {
      return {
        name: item,
        value: `${counts[item]} condition(s)`,
        inline: true,
      };
    });

    message.channel.send({
      embeds: [new StandardEmbed('Watchlist', '', '', embedFields, '')],
    });
  }
};

module.exports.info = {
  name: 'list',
  syntax: '!fpw list ?[collection]',
  arguments: [{ name: 'collection', info: 'Collection name' }],
  description:
    'Lists all collections that are on the watchlist or all conditions for a specific collection',
};
