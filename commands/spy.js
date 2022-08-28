const axios = require('axios');
const {
  ErrorEmbed,
  StandardEmbed,
  SimpleEmbed,
} = require('../utility/embedTemplates');
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
        name: 'wallet address',
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

  message.channel.send({ embeds: [new SimpleEmbed('Coming soon :eyes:')] });
  // change min args from 0 to 1 again

  // try {
  //   const { data } = await axios.get(
  //     `https://api-mainnet.magiceden.dev/v2/wallets/${args[0]}/tokens`
  //   );
  //   if (data.length === 0) {
  //     return message.channel.send({
  //       embeds: [new ErrorEmbed("This wallet holds no nft's.")],
  //     });
  //   }

  //   // change from importing guildInfo and co to giving it as parameter to function
  //   // change from importing guildInfo and co to giving it as parameter to function
  //   // change from importing guildInfo and co to giving it as parameter to function

  //   const testt = data.map((item) => item.name).join(' | ');
  //   return message.channel.send(testt);
  // } catch (e) {
  //   if (e.response && e.response.status === 400) {
  //     return message.channel.send({
  //       embeds: [new ErrorEmbed('Wallet not found.')],
  //     });
  //   }
  // }
};

module.exports.info = {
  name: 'spy',
  syntax: '!fpw spy [wallet address]',
  arguments: [{ name: 'wallet address', info: 'Public wallet address' }],
  description: 'Coming soon :eyes:',
};
