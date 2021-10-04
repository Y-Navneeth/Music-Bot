module.exports = {
  name: "play",
  aliases: ['p', 'play'],
  run: async(client, message, args) => {
    const Text = args.join(" ")
    const queue = client.distube.getQueue(message)
    
    if(!message.member.voice.channel) return message.channel.send("you must be in a Voice channel")
    if (!args[0]) return message.channel.send("No search item provided")
    message.channel.send(`Searching <a:loading:893487213948592188> \`\`\`${Text}\`\`\``)

    client.distube.play(message, Text);
  },
};
