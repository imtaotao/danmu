import { callHook, createKey } from './utils'

export default class SpecialBarrage {
  constructor (opts) {
    this.opts = opts
    this.key = opts.id || createKey()
  }

  append (manager) {

  }

  destroy (manager) {

  }
}