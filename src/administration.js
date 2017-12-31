const { inspect } = require('util')

const ms = require('ms')
const glob = require('glob')

module.exports = {
  block: {
    callback: (ctx, id) => {
      ctx.bot.blocked.add(id)
      ctx.send('blocked.')
    },
    owner: true,
  },
  unblock: {
    callback: (ctx, id) => {
      ctx.bot.blocked.delete(id)
      ctx.send('unblocked.')
    },
    owner: true,
  },
  flash: {
    callback: (ctx, file) => {
      ctx.gb.flash(file)
      ctx.send(`flashed \`${file}\` successfully.`)
    },
    owner: true,
  },
  reset: {
    callback: ctx => {
      ctx.gb.reset()
      ctx.send('reset gameboy!')
    },
    owner: true,
  },
  list: {
    callback: ctx => {
      const results = glob.sync('./saves/*').map(path => ({
        path,
        age: ms(Date.now() - parseInt(path.substr(8).split('.')[0])),
        type: path.includes('.state')
          ? 'save state, recommended'
          : 'sram save file',
      }))
      ctx.send(
        results
          .map(e => `\`${e.path}\`: ${e.type} (created ${e.age} ago)`)
          .join('\n')
      )
    },
    owner: true,
  },
  eval: {
    callback: async (ctx, ...args) => {
      try {
        const result = eval(args.join(' '))
        if (result instanceof Promise) await result
        const stringified = inspect(result).substr(0, 1990)
        ctx.send(stringified, { code: 'js' })
      } catch (err) {
        ctx.send(`nope\n\`\`\`js\n${err}\n\`\`\``)
      }
    },
    owner: true,
  },
}
