const axios = require('axios');
const watchlistSchema = require('../utility/watchlistSchema');
const { SuccessEmbed, ErrorEmbed } = require('../utility/embedTemplates');
const { argsValidation } = require('../utility/argsValidation');
const { guildInfo } = require('../utility/guildInfo');

module.exports.run = async (client, message, args, command) => {
  const allowedRoles =
    guildInfo[message.guildId].allowedRoles[command.info.name];
  const commandInfo = {
    minArgs: 3,
    allowedRoles,
    argsRules: [
      {
        name: 'collection',
        restrictOptions: [],
        numberRestrictions: [],
      },
      {
        name: 'condition',
        restrictOptions: ['below', 'above'],
        numberRestrictions: [],
      },
      {
        name: 'price',
        restrictOptions: [],
        numberRestrictions: [0, 9999],
      },
    ],
  };

  // =======================================================
  // validating args
  const argsError = argsValidation(
    commandInfo,
    args.slice(args.length - 3),
    message,
    command
  );
  if (argsError) {
    return message.channel.send({
      embeds: [new ErrorEmbed(argsError)],
    });
  }
  // =======================================================

  const condition = args[args.length - 2];
  const price = parseFloat(args[args.length - 1]);
  //trying to manipulate the string to get the right collection name (doesnt work with all collections)
  const collectionName = args
    .slice(0, args.length - 2)
    .join(' ')
    .toLowerCase()
    .trim();
  const cleanName = collectionName
    .replace(/[^a-zA-Z0-9\s\_]/g, '')
    .replace(/\_*\s+\_*/g, '_');

  if (condition === 'below' && price < 0.01) {
    const embed = new ErrorEmbed(
      'Price cant be less than **0.01** if you use the **below** condition'
    );
    return message.channel.send({ embeds: [embed] });
  }

  try {
    const { data } = await axios.get(
      `https://api-mainnet.magiceden.dev/v2/collections/${cleanName}/`
    );

    const allCollections = await watchlistSchema.find({
      guildId: message.guildId,
    });

    const onlyNames = allCollections.map((collection) => collection.name);
    const uniqCollections = [...new Set(onlyNames)];
    const countConditions = {};

    for (let x in onlyNames) {
      countConditions[onlyNames[x]] = (countConditions[onlyNames[x]] || 0) + 1;
    }

    if (uniqCollections.length === 10) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            'Could not add collection because the limit of **10 collections** is reached.'
          ),
        ],
      });
    } else if (countConditions[cleanName] === 2) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            'Could not add collection because the limit of **2 conditions** per collection is reached.'
          ),
        ],
      });
    }

    const collection = {
      apiName: data.symbol,
      printName: data.name,
      thumbnailUrl: data.image,
      condition: condition,
      price: price,
      guildId: message.guildId,
      socials: { twitter: data.twitter, discord: data.discord },
    };

    await new watchlistSchema(collection).save();

    const embed = new SuccessEmbed(
      `Successfully added **${data.name}** with the condition **${condition} ${price}** to watchlist.`
    );

    message.channel.send({ embeds: [embed] });
  } catch (e) {
    console.log(`[Command Add] ${e}`);
    if (e.resonse && e.response.status === 404) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            `Collection **${collectionName}** doesnt exist on ME. Try the collection symbol at the end of the collection url from MagicEden.`
          ),
        ],
      });
    }
  }
};

module.exports.info = {
  name: 'add',
  syntax: '!fpw add [collection] [condition] [price]',
  arguments: [
    { name: 'collection', info: 'Collection name' },
    { name: 'condition', info: 'Allowed options: below, above' },
    { name: 'price', info: 'Number between 0 - 9999' },
  ],
  description: 'Adds a collection with a specific condition to the watchlist',
};
