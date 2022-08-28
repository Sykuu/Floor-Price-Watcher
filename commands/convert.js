const axios = require('axios');
const { ErrorEmbed, SimpleEmbed } = require('../utility/embedTemplates');
const { argsValidation } = require('../utility/argsValidation');
const { guildInfo } = require('../utility/guildInfo');

module.exports.run = async (client, message, args, command) => {
  const allowedRoles =
    guildInfo[message.guildId].allowedRoles[command.info.name];
  const commandInfo = {
    minArgs: 2,
    allowedRoles,
    argsRules: [
      {
        name: 'amount',
        restrictOptions: [],
        numberRestrictions: [0, 999999],
      },
      {
        name: 'currency',
        restrictOptions: ['sol', 'usd'],
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

  const { data } = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
  );

  const solPrice = data.solana.usd;

  if (args[1].toLowerCase() === 'sol') {
    const amountUsd = +(
      Math.round(solPrice * parseFloat(args[0]) + 'e+2') + 'e-2'
    );
    return message.channel.send({
      embeds: [new SimpleEmbed(`**${args[0]}◎** is worth **${amountUsd}$**`)],
    });
  } else if (args[1].toLowerCase() === 'usd') {
    const amountSol = +(
      Math.round(parseFloat(args[0]) / solPrice + 'e+2') + 'e-2'
    );
    return message.channel.send({
      embeds: [new SimpleEmbed(`**${args[0]}$** is worth **${amountSol}◎**`)],
    });
  }
};

module.exports.info = {
  name: 'convert',
  syntax: '!fpw convert [amount] [currency]',
  arguments: [
    { name: 'amount', info: 'Number between 0 - 999999' },
    { name: 'currency', info: 'Allowed options: sol, usd' },
  ],
  description: 'Will convert sol to usd or vice versa',
};
