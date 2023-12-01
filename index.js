const { Client, Intents } = require('discord.js');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

// Database connection
const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pw',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
  console.log('Connected to the database.');
});

client.on('ready', async () => {
  console.log(`Bot is ready as: ${client.user.tag}`);

  // Define a new slash command
  const data = {
    name: 'verify',
    description: 'Used to Verify your username to get access to the server.',
    options: [
      {
        name: 'username',
        description: 'The username to search for',
        type: 'STRING',
        required: true,
      },
    ],
  };

  // Register the slash command for a specific guild
  const guild = client.guilds.cache.get('serverID');
  await guild.commands.create(data);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options, guild } = interaction;

  if (commandName === 'verify') {
    try {
      // Get the username from user input
      const username = options.getString('username');

      if (!username) {
        interaction.reply('Please provide a username.');
        return;
      }

      // Update the SQL query to search for the username in the "name" column
      let sql = 'SELECT * FROM users WHERE name = ?';
      const results = await query(sql, [username]);

      if (results.length > 0) {
        // Get the member associated with the interaction
        const member = guild.members.cache.get(interaction.user.id);

        // Get the role to assign (replace 'YourRoleID' with your actual role ID)
        const roleToAssign = guild.roles.cache.get('role ID');

        // Check if the role exists and the member is not already assigned the role
        if (roleToAssign && !member.roles.cache.has(roleToAssign.id)) {
          // Add the role to the member
          await member.roles.add(roleToAssign);
          interaction.reply('You are verified! The role has been assigned.');
        } else {
          interaction.reply('You are already verified or the role does not exist.');
        }
      } else {
        interaction.reply('Username not found in the database.');
      }
    } catch (err) {
      console.error('Error executing database query:', err);
      interaction.reply('An error occurred while processing your request.');
    }
  }
});

async function query(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

client.login('clientID');
