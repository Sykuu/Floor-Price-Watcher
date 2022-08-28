const argsValidation = (commandInfo, args, message, command) => {
  // checking if member is allowed to run command
  if (commandInfo.allowedRoles.length > 0) {
    const member = message.guild.members.cache.get(message.author.id);
    const isAllowed = member.roles.cache.some((role) =>
      commandInfo.allowedRoles.includes(role.id)
    );
    if (!isAllowed) {
      return ':no_entry_sign: You are not allowed to run this command!';
    }
  }

  const commandArguments = command.info.arguments
    .map((argument) => {
      return `\`${argument.name}\`: ${argument.info}`;
    })
    .join('\n');
  const syntaxMessage = `\`${command.info.syntax}\`\n\nArguments:\n${commandArguments}\n\nThe **?** before arguments means they are optional.`;

  // checks if min amount of args is given
  if (args.length < commandInfo.minArgs) {
    return `Wrong Syntax! Try:\n${syntaxMessage}`;
  }

  // checks if all args are using the correct syntax
  for (let i = 0; i < commandInfo.argsRules.length; i++) {
    const { name, restrictOptions, numberRestrictions } =
      commandInfo.argsRules[i];
    if (restrictOptions.length) {
      if (!restrictOptions.includes(args[i].toLowerCase())) {
        return `Wrong Syntax for argument **[${name}]**! Try:\n${syntaxMessage}`;
      }
    } else if (numberRestrictions.length) {
      let check = parseFloat(args[i]);
      if (isNaN(check)) {
        return `Wrong Syntax for **[${name}]**! Try:\n${syntaxMessage}`;
      } else {
        if (check < numberRestrictions[0] || check > numberRestrictions[1]) {
          return `Wrong Syntax for **[${name}]**! Try:\n${syntaxMessage}`;
        }
      }
    }
  }
};

module.exports = { argsValidation };
