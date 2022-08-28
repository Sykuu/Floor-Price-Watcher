const axios = require('axios');
const { StandardEmbed } = require('./embedTemplates');
const { guildInfo } = require('./guildInfo');

module.exports.newCollections = (client) => {
  let oldCollections = [];

  let newCollectionsChannels = Object.keys(guildInfo).map(
    (guild) => guildInfo[guild].newCollectionsChannel
  );

  setInterval(() => {
    axios
      .get('https://api-mainnet.magiceden.dev/v2/collections?limit=5')
      .then(({ data }) => {
        const newCollections = data.map(
          ({
            symbol: apiName,
            name: printName,
            image: thumbnailUrl,
            twitter,
            discord,
          }) => {
            return {
              apiName,
              printName,
              thumbnailUrl,
              socials: { twitter, discord },
            };
          }
        );

        for (let x in newCollections) {
          const { apiName, printName, thumbnailUrl, socials } =
            newCollections[x];
          if (
            !oldCollections.some((oldCollection) => {
              return oldCollection.apiName === apiName;
            })
          ) {
            for (let y in newCollectionsChannels) {
              client.channels.cache.get(newCollectionsChannels[y]).send({
                embeds: [
                  new StandardEmbed(
                    printName,
                    `https://www.magiceden.io/marketplace/${apiName}`,
                    '',
                    [
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
            }
          }
        }

        oldCollections = [...newCollections];
      })
      .catch((e) => {
        console.log(`[newCollections checker] ${e}`);
      });
  }, 3000);
};
