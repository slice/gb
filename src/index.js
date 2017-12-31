const Discord = require('discord.js')
const Gameboy = require('./gameboy')

const { WIDTH, HEIGHT } = require('./dimensions')
const commandHandler = require('./handler')

const {
  token,
  scalingFactor = 3,
  channel_whitelist: channelWhitelist = [],
  rom = './pk.gb',
  admins = [],
} = require('../config.json')

const bot = new Discord.Client()
let gb = new Gameboy(WIDTH * scalingFactor, HEIGHT * scalingFactor, rom)

// "global state" escape hatch
// NotLikeThis
bot.admins = admins
bot.gb = gb
bot.blocked = new Set()

// run emulator now
gb.run()

bot.on('debug', console.log)

bot.on('message', async msg => {
  if (
    !channelWhitelist.includes(msg.channel.id) || // not whitelisted
    msg.author.bot || // is a bot
    bot.blocked.has(msg.author.id) // is blocked
  ) {
    return
  }

  await commandHandler(
    {
      ...require('./administration'),
      ...require('./interaction'),
    },
    msg
  )
})

// connect to discord
bot.login(token)
