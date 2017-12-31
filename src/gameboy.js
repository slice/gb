const Canvas = require('canvas')
const fs = require('fs')
const GameboyCore = require('./emulator')

const { sleep } = require('./util')
const { WIDTH, HEIGHT } = require('./dimensions')
const joyKeys = require('./keys')

module.exports = class Gameboy {
  /**
   * A high-level wrapper for a Gameboy emulator. Wraps the core emulator.
   */

  constructor(width = WIDTH, height = HEIGHT, rom, { rate = 4 } = {}) {
    this.width = width
    this.height = height
    this.canvas = new Canvas(width, height)
    this.rate = rate
    this.rom = rom
    this._setupGameboy(this.rom)
    this.tickInterval = 0
  }

  /**
   * Starts the tick loop for the emulator.
   */
  run() {
    this.tickInterval = setInterval(() => this.gb.run(), this.rate)
  }

  _setupGameboy(rom) {
    this.gb = new GameboyCore(this.canvas, fs.readFileSync(rom))
    this.gb.stopEmulator = 1 // stop the emulator for now (this is needed)
    this.gb.start()
  }

  /**
   * Resets the emulator. Internally, this method stops the tick loop and
   * recreates the emulator core.
   */
  reset() {
    clearInterval(this.tickInterval)
    this._setupGameboy(this.rom)
  }

  save(path = `./saves/${Date.now()}.sav`) {
    // save sram
    const sram = new Buffer(this.gb.saveSRAMState())
    fs.writeFileSync(path, sram)

    // save state
    const state = JSON.stringify(this.gb.saveState())
    fs.writeFileSync(`${path}.state`, state)
  }

  /**
   * Flashes SRAM from a .sav file or a .state save state into the emulator.
   * The file type is determined by file extension.
   * @param {string} path - The path to the SRAM file.
   */
  flash(path) {
    if (path.endsWith('.state')) {
      const data = JSON.parse(fs.readFileSync(path))
      this.gb.returnFromState(data)
    } else {
      const typed = new Uint8Array(fs.readFileSync(path))
      this.gb.MBCRam = typed
    }
  }

  /**
   * Presses a key multiple times.
   * @param {string} key - The key to press.
   * @param {number} times - The amount of times the key should be pressed.
   * @param {number} between - The amount of milliseconds to wait between presses.
   * @param {number} pressDuration - The amount of milliseconds to keep the key pressed.
   */
  async multiPress(key, times, between = 100, pressDuration = 100) {
    for (let i = 0; i < times; i++) {
      await this.press(key, pressDuration)

      // wait a lil
      await sleep(between)
    }
  }

  /**
   * Presses a key.
   * @param {string} key - The key to press.
   * @param {number} duration - The amount of milliseconds to keep the key pressed.
   */
  async press(key, duration = 500) {
    // translate the name of this key to the proper key code the emulator wants
    const keyCode = joyKeys.indexOf(key)

    this.gb.JoyPadEvent(keyCode, true) // key down
    await sleep(duration)
    this.gb.JoyPadEvent(keyCode, false) // key up
  }

  /**
   * @returns {stream.Readable} a readable stream of PNG bytes (a screenshot of the emulation).
   */
  png() {
    return this.canvas.createPNGStream()
  }
}
