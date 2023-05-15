import type { AllType, FrameworksKeys, TypeMap, UnitProps } from '@zodui/core'

import { Framework } from './framework'

export * from './base'
export type {
  ComponentProps,
  FrameworkComponents,
  Icons } from './components'
export * from './framework'

const effectSymbol = Symbol('effect')

type Rule<N extends keyof UnitMap> =
  | string[]
  | [N] extends [never]
    ? { (modes: string[]): boolean }
    : { (modes: string[], opts?: UnitMap[N]['options']): boolean }

type MatcherRndr<C> =
  | string
  | [C] extends [never]
    ? [rndrTarget: string, comp: C]
    : never
  | [rndrTarget: string, props: Record<string, any>]

type Matcher<
  C,
  N extends keyof UnitMap = never
> =
  | [rule: Rule<N>, rndr: MatcherRndr<C>]

export interface UnitMap {
  [key: string]: {
    props: unknown
    options: unknown
  }
  monad: {
    props: {}
    options: {}
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface UnitFrameworksComp<N extends keyof UnitMap, Props> {
  [key: FrameworksKeys]: unknown
}

interface DefineUnit<FK extends FrameworksKeys = never> {
  <
    N extends keyof UnitMap,
    T extends AllType
  >(
    name: N,
    types: T[],
    matchers: Matcher<
      [FK] extends [never] ? never : UnitFrameworksComp<
        N,
        & Omit<UnitProps<T, TypeMap[T]>, keyof UnitMap[N]['props']>
        & UnitMap[N]['props']
      >[FK],
      N
    >[]
  ): this
  composer<T extends AllType>(types: T[], matchers: Matcher<never>[]): this
  switcher<T extends AllType>(types: T[], matchers: Matcher<never>[]): this
}

class Emitter {
  #listeners = new Map<string, Function[]>()
  on(key: string, func: Function) {
    const list = this.#listeners.get(key) || []
    const index = list.length
    list.push(func)
    this.#listeners.set(key, list)
    return () => {
      list.splice(index, 1)
      this.#listeners.set(key, list)
    }
  }
  do(...args: any[]) {
    const [key, ...params] = args
    const list = this.#listeners.get(key) || []
    list.forEach(func => func(...params))
  }
}

/**
 * Contexts extended by the same Context share the same store
 * The `extend` method is used to record the side effects of the next operation
 * When you need to reclaim the side effects of this segment, you only need to call the off function,
 * or execute the functions from `[effectSymbol]` filed
 */
export class Context<
  PluginName extends string = string
> {
  static global = new Context()
  // eslint-disable-next-line indent
  ;[effectSymbol]: Function[] = []
  constructor(
    private readonly store = new Map<string, any>(),
    private readonly emitter = new Emitter()
  ) {
  }
  extend() {
    return new Context(this.store, this.emitter)
  }
  set(k: string, v?: any) {
    this.store?.set(k, v)
    this.emitter.do(k, v)
    this[effectSymbol].push(() => {
      const storeV = this.store?.get(k)
      if (storeV === v) {
        this.store?.delete(k)
      }
    })
    return this
  }
  del(k: string) {
    const storeV = this.store?.get(k)
    this.store?.delete(k)
    this.emitter.do(k)
    this[effectSymbol].push(() => {
      this.store?.set(k, storeV)
    })
    return this
  }
  get<T>(k: string) {
    return [
      this.store?.get(k) as T,
      this.emitter.on.bind(this.emitter, k)
    ] as const
  }
  use(p: Plugin | (() => Promise<Plugin>) | (() => Promise<{ default: Plugin }>)) {
    let effect: Function

    const childCtx = this.extend()
    function collectPluginEffect(p: Plugin) {
      p.call(childCtx)
      effect = () => {
        childCtx[effectSymbol].forEach(func => func())
      }
    }
    if (typeof p === 'function') {
      const promise = p()
      if (promise instanceof Promise) {
        let isCancel = false
        promise
          .then(plugin => {
            if (isCancel) return
            // let default field prioritize
            if (plugin.default) {
              plugin = plugin.default
            }
            collectPluginEffect(plugin)
          })
        effect = () => {
          isCancel = true
        }
      } else {
        throw new Error('plugin must be a function or a promise')
      }
    } else {
      collectPluginEffect(p)
    }

    // make effect function closure for store this reference
    const wrapEffect = () => effect()
    this[effectSymbol].push(wrapEffect)
    return wrapEffect
  }
  framework<K extends FrameworksKeys>(key: K): Framework<K, PluginName> {
    return new Framework(key, this)
  }
}

export interface Plugin<N extends string = string> {
  name: N
  call: (ctx: Context) => void
}

export function definePlugin(
  name: Plugin['name'],
  call: Plugin['call']
): Plugin {
  return { name, call }
}
