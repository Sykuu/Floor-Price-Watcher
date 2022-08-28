const watchlistSchema = require('../utility/watchlistSchema');
const axios = require('axios');
const { guildInfo } = require('./guildInfo');
const { StandardEmbed } = require('./embedTemplates');

module.exports.fpChecker = (client) => {
  setInterval(async () => {
    const allEntries = await watchlistSchema.find({});
    const collections = {};
    let floorPrices = [];
    let metConditions = [];

    for (let x in allEntries) {
      const { apiName } = allEntries[x];

      collections[apiName] = collections[apiName]
        ? [...collections[apiName], allEntries[x]]
        : [allEntries[x]];
    }

    const sendNotification = (
      notiRole,
      notiChannel,
      apiName,
      floorPrice,
      condition,
      price,
      thumbnailUrl,
      printName,
      socials
    ) => {
      client.channels.cache.get(notiChannel).send({
        content: `<@&${notiRole}>`,
        embeds: [
          new StandardEmbed(
            printName,
            `https://www.magiceden.io/marketplace/${apiName}`,
            ``,
            [
              {
                name: 'Floor Price',
                value: `${floorPrice} ◎`,
                inline: true,
              },
              {
                name: 'Condition',
                value: `${condition} ${price} ◎`,
                inline: true,
              },
              {
                name: 'Twitter',
                value: socials.twitter,
              },
              {
                name: 'Discord',
                value: socials.discord,
              },
            ],
            thumbnailUrl
          ),
        ],
      });
    };

    const keys = Object.keys(collections);

    for (let x in keys) {
      try {
        const { data } = await axios.get(
          `https://api-mainnet.magiceden.dev/v2/collections/${keys[x]}/`
        );

        floorPrices.push({
          apiName: keys[x],
          floorPrice: data.floorPrice / 1000000000,
        });
      } catch (e) {
        console.log(`[fpChecker] ${e}`);
        break;
      }
    }

    for (let x in floorPrices) {
      const { apiName, floorPrice } = floorPrices[x];
      const conditions = collections[apiName];
      for (let y in conditions) {
        const {
          condition,
          price,
          guildId,
          _id,
          printName,
          thumbnailUrl,
          socials,
        } = conditions[y];
        const { notiChannel, notiRole } = guildInfo[guildId];

        if (condition === 'above' && floorPrice > price) {
          console.log(
            `[${printName}] Condition met. Sending notification to guild: ${guildId}`
          );
          sendNotification(
            notiRole,
            notiChannel,
            apiName,
            floorPrice,
            condition,
            price,
            thumbnailUrl,
            printName,
            socials
          );
          metConditions.push(_id);
        } else if (condition === 'below' && floorPrice < price) {
          console.log(
            `[${printName}] Condition met. Sending notification to guild: ${guildId}`
          );
          sendNotification(
            notiRole,
            notiChannel,
            apiName,
            floorPrice,
            condition,
            price,
            thumbnailUrl,
            printName,
            socials
          );
          metConditions.push(_id);
        }
      }
    }

    for (let x in metConditions) {
      const _id = metConditions[x];
      try {
        await watchlistSchema.deleteOne({ _id });
      } catch (e) {
        console.log(`[fpChecker] ${e}`);
      }
    }
  }, 60000);
};
