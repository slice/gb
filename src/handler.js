const Discord = require('discord.js')

function createContext(msg) {
  const show = async () => {
    // send png screenshot to the channel
    let view = await msg.channel.send(
      '',
      new Discord.Attachment(msg.client.gb.png(), 'view.png')
    )

    // default reaction to save
    await view.react('💾')

    // wait for any reaction that comes our way within 10 seconds
    const reactions = await view.awaitReactions(
      (reaction, user) => user.id !== msg.client.user.id,
      {
        time: 1000 * 10,
        max: 1,
      }
    )

    if (!reactions.size) {
      // if we didn't receive any additional reactions, just delete the message
      // to prevent chat pollution
      console.log('deleting view', view.id)
      await view.delete()
    } else {
      let confirmation = await msg.channel.send('ok, keeping this view.')
      setTimeout(() => confirmation.delete(), 2000)
    }
  }

  return {
    show,
    msg,
    gb: msg.client.gb,
    bot: msg.client,
    send: msg.channel.send.bind(msg.channel),
  }
}

module.exports = async (cmds, msg) => {
  let [cmd, ...args] = msg.content.split(' ')
  if (!cmd.startsWith('!')) return
  cmd = cmd.substr(1) // remove !

  if (!cmds[cmd]) {
    return
  }

  const handler = cmds[cmd]

  if (handler.owner && !msg.client.admins.includes(msg.author.id)) {
    return
  }

  if (typeof handler === 'function') handler.callback = handler
  await handler.callback(createContext(msg), ...args)
}
