const joyKeys = require('./keys')
const { sleep } = require('./util')

module.exports = {
  view: ctx => ctx.show(),
  save: ctx => {
    ctx.gb.save()
    ctx.send('saved game!')
  },
  press: async (ctx, key, times) => {
    if (!key) {
      ctx.send('wtf supply a key idiot !')
      return
    }

    if (!joyKeys.includes(key)) {
      ctx.send(`invalid -- valid keys: ${joyKeys.join(', ')}`)
      return
    }

    console.log(
      '[%s] pressing key=%s code=%d, times=%s',
      ctx.msg.author.id,
      key,
      joyKeys.indexOf(key),
      times || 1
    )

    if (times && !isNaN(parseInt(times))) {
      const numTimes = parseInt(times)

      if (numTimes > 30) {
        ctx.send('too much (30 is max)!')
        return
      }

      await ctx.gb.multiPress(key, numTimes)
    } else {
      console.log('single press')
      await ctx.gb.press(key)
    }

    await ctx.msg.react('✅')

    // wait a bit before showing due to emulation delays
    await sleep(1500)
    await ctx.show()
  },
}
