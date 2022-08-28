// ===== IMPORTS =====
const { Client, Intents, Collection } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const { ErrorEmbed } = require('./utility/embedTemplates');
const { fpChecker } = require('./utility/fpChecker');
const { guildInfo } = require('./utility/guildInfo');
const { newCollections } = require('./utility/newCollections');
// ===== IMPORTS =====

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const prefix = '!fpw';

// ===== COMMAND HANDLER =====
client.commands = new Collection(); // creating a new discord collection for our commands. client.commands is the same as const commands except it is helpful in global declaration
const commandFiles = fs // get all command files ending with .js -> commandFiles is an array with the file names as strings
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (file of commandFiles) {
  const commandName = file.split('.')[0];
  const command = require(`./commands/${file}`); // normal importing exporting nodejs stuff. require takes every export from file and puts it in an object
  client.commands.set(commandName, command); // setting a key value pair in the collection. object with the content of the command file (normal exporting and importing nodejs stuff) as the value and the key is the commandName
}

client.on('messageCreate', (message) => {
  const comChannel = guildInfo[message.guildId].comChannel;
  if (message.content.startsWith(prefix) && message.channelId === comChannel) {
    const args = message.content.slice(prefix.length).trim().split(' '); //removing prefix from command and putting every argument in an array plus the command name
    const commandName = args.shift(); // removes and takes the commandName from the args array !!!!! CHANGES THE ARGS ARRAY
    const command = client.commands.get(commandName); // looking the command collection we created up and trying to get the command from the collection
    // if command doesnt exists commands value is undefined = falsy value => !falsy is true .... return cancels the further code and only executes the stuff directly after return
    if (!command) {
      return message.channel.send({
        embeds: [
          new ErrorEmbed(
            'Command doesnt exist! Try `!fpw help` for a list of all available commands.'
          ),
        ],
      });
    }
    command.run(client, message, args, command); // calling the run method (we created in the command file) with the arguments of: client, the message and the array of args we filtered out
  }
});
// ===== COMMAND HANDLER =====

client.once('ready', async () => {
  await mongoose.connect(process.env.MONGODB_LOGIN), { keepAlive: true };
  console.log('Bot up and running');
  client.user.setActivity({ name: 'MagicEden Floor Prices', type: 'WATCHING' });
  fpChecker(client);
  // newCollections(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
