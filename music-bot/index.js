const Discord = require('discord.js');
const Distube = require('distube')
const fs = require('fs')
const config = require('./config.json')
const { SpotifyPlugin } = require('@distube/spotify'); //For playing spotify 

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
})

client.distube = new Distube.default(client, {
    emitNewSongOnly: true,
    leaveOnEmpty: true,
    leaveOnFinish: false,
    leaveOnStop:true,
    searchCooldown: 10,
    updateYouTubeDL: false,
    searchSongs: 6,
    plugins: [new SpotifyPlugin()]
  }); //Distube Client

client.commands = new Discord.Collection()
client.aliases  = new Discord.Collection()

client.on('ready', () => {        
    console.log(`Logged in as ${client.user.tag}`)
    client.user.setActivity(`${config.prefix}help`,{ type: "LISTENING" })
}) //Running the bot


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
  
    if (!message.content.startsWith(config.prefix)) return;
  
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  
    const command = args.shift().toLowerCase();
  
    const cmd = client.commands.get(client.aliases.get(command));
  
    if (!cmd) return;
  
    if (cmd.inVoiceChannel && !message.member.voice.channel)
      return message.channel.send(`You must be in a voice channel!`);
  
    try {
      cmd.run(client, message, args);
    } catch (e) {
      console.error(e);
      message.channel.send(`Error: ${e}`);
    }
  });//Message Create Event
  

//DISTUBE Events ↓

const status = queue =>
	`Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.join(', ')
		|| 'Off'}\` | Loop: \`${
		queue.repeatMode
			? queue.repeatMode === 2
				? 'All Queue'
				: 'This Song'
			: 'Off'
	}\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``


client.distube
.on('playSong', (queue, song) =>
		queue.textChannel.send(
			`Playing \`${song.name}\` - \`${
				song.formattedDuration
			}\`\nRequested by: ${song.user}\n${status(queue)}`,
		))

.on('addSong', (queue, song) =>
		queue.textChannel.send(
			`Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`,
		))
	.on('addList', (queue, playlist) =>
		queue.textChannel.send(
			`Added \`${playlist.name}\` playlist (${
				playlist.songs.length
			} songs) to queue\n${status(queue)}`,
		))
	// DisTubeOptions.searchSongs = true
	.on('searchResult', (message, result) => {
		let i = 0
		message.channel.send(
			`**Choose an option from below**\n${result
				.map(
					song =>
						`**${++i}**. ${song.name} - \`${
							song.formattedDuration
						}\``,
				)
				.join(
					'\n',
				)}\n*Enter anything else or wait 30 seconds to cancel*`,
		)
	})
	// DisTubeOptions.searchSongs = true
	.on('searchCancel', message => message.channel.send(`Searching canceled`))
	.on('searchInvalidAnswer', message =>
		message.channel.send(`searchInvalidAnswer`))
	.on('searchNoResult', message => message.channel.send(`No result found!`))
	.on('error', (textChannel, e) => {
		console.error(e)
		textChannel.send(`An error encountered: ${e.slice(0, 2000)}`)
	})
	.on('finish', queue => queue.textChannel.send('Finish queue!'))
	.on('finishSong', queue => queue.textChannel.send('Finish song!'))
	.on('disconnect', queue => queue.textChannel.send('Disconnected!'))
	.on('empty', queue => queue.textChannel.send('Empty!'))

