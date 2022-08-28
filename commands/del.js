const watchlistSchema = require('../utility/watchlistSchema');
const { argsValidation } = require('../utility/argsValidation');
const { SuccessEmbed, ErrorEmbed } = require('../utility/embedTemplates');
const { guildInfo } = require('../utility/guildInfo');

module.exports.run = async (client, message, args, command) => {
  const allowedRoles =
    guildInfo[message.guildId].allowedRoles[command.info.name];
  const commandInfo = {
    minArgs: 2,
    allowedRoles,
    argsRules: [
      {
        name: 'target',
        restrictOptions: ['collection', 'id'],
        numberRestrictions: [],
      },
      {
        name: 'value',
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

  if (args[0] === 'collection') {
    const collectionName = args.slice(1).join(' ').toLowerCase().trim();
    const cleanName = collectionName
      .replace(/[^a-zA-Z0-9\s\_]/g, '')
      .replace(/\_*\s+\_*/g, '_');

    const { deletedCount } = await watchlistSchema.deleteMany({
      apiName: cleanName,
      guildId: message.guildId,
    });

    if (deletedCount === 0) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            `Couldnt delete collection with the name **${collectionName}**! The collection isnt on the watchlist.`
          ),
        ],
      });
    }

    return message.channel.send({
      embeds: [
        new SuccessEmbed(
          `Successfully deleted collection with the name **${collectionName}** from the watchlist!`
        ),
      ],
    });
  } else {
    try {
      const { deletedCount } = await watchlistSchema.deleteOne({
        _id: args[1],
      });
      if (deletedCount === 0) {
        return message.channel.send({
          embeds: [
            new ErrorEmbed(
              `Couldnt delete condition with ID **${args[1]}**! ID not found.`
            ),
          ],
        });
      }
    } catch (e) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            `Couldnt delete condition with id **${args[1]}**! The Id seems to be wrong.`
          ),
        ],
      });
    }
    return message.channel.send({
      embeds: [
        new SuccessEmbed(
          `Successfully deleted condition with id **${args[1]}** from the watchlist!`
        ),
      ],
    });
  }
};

module.exports.info = {
  name: 'del',
  syntax: '!fpw del [target] [value]',
  arguments: [
    { name: 'target', info: 'Allowed options: collection, id' },
    { name: 'value', info: 'Collection name or condition id' },
  ],
  description:
    'Remove a whole collection or just one condition from the watchlist',
};
