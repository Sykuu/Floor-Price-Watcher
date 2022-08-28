const { argsValidation } = require('../utility/argsValidation');
const { ErrorEmbed, StandardEmbed } = require('../utility/embedTemplates');
const { guildInfo } = require('../utility/guildInfo');

module.exports.run = (client, message, args, command) => {
  const allowedRoles =
    guildInfo[message.guildId].allowedRoles[command.info.name];
  const commandInfo = {
    minArgs: 0,
    allowedRoles,
    argsRules: [],
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
    const command = client.commands.get(args[0].toLowerCase());
    if (!command) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            `Command named **${args[0]}** doesnt exist! Check all available commands with **!fpw help**`
          ),
        ],
      });
    }
    const arguments = command.info.arguments
      .map((item) => `\`${item.name}\`: ${item.info}`)
      .join('\n');
    const commandDescription = `**Syntax:**\n\`${command.info.syntax}\`\n\n**Arguments:**\n${arguments}\n\n**Description:**\n${command.info.description}.\n\nThe **?** before arguments means they are optional.`;
    return message.channel.send({
      embeds: [
        new StandardEmbed(
          `Command: ${command.info.name}`,
          '',
          commandDescription,
          '',
          ''
        ),
      ],
    });
  }

  const commands = client.commands
    .map((command) => {
      return `\`!fpw help ${command.info.name}\`\n*${command.info.description}*\n`;
    })
    .join('\n');

  message.channel.send({
    embeds: [new StandardEmbed('Commands Info', '', commands, '', '')],
  });
};

module.exports.info = {
  name: 'help',
  syntax: '!fpw help ?[command]',
  arguments: [{ name: 'command', info: 'Command name' }],
  description:
    'Gets you all available commands, their syntax and a short description',
};
