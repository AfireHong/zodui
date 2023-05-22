import { AllTypes, Context, definePlugin } from '@zodui/core'
import { expect } from 'chai'

declare module '@zodui/core' {
  interface Frameworks {
    __test__: {
      Components: {
        A0: any
        A1: any
        A2: any
        A3: any
        A4: any
        A5: any
      }
    }
  }
}

describe('Plugin', function () {
  const p0 = definePlugin('test', ctx => {
    ctx.framework('__test__')
      .defineComp('A0', 'A0')
      .defineComp('A1', 'A1')
  })
  const p1 = definePlugin('test', ctx => {
    ctx.framework('__test__')
      .defineComp('A2', 'A2')
      .defineComp('A3', 'A3')
  })
  const p2 = definePlugin('test', ctx => {
    ctx
      .defineUnit('monad', [AllTypes.ZodNumber], [
        [modes => modes.includes('a'), 'a']
      ])
  })
  const p3 = definePlugin('test', ctx => {
    ctx
      .defineUnit('monad', [AllTypes.ZodNumber], [
        [modes => modes.includes('b'), 'b']
      ])
  })
  const p_01 = definePlugin('test', ctx => {
    ctx.use(p0)
    ctx.use(p1)
    ctx.framework('__test__')
      .defineComp('A4', 'A4')
  })

  it('should be use plugin and off it', () => {
    const off = Context.global.use(p0)
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal('A0')
    off()
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal(undefined)
  })
  it('should be use multiple plugin and off it', () => {
    const off = Context.global.use(p_01)
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal('A0')
    expect(Context.global.get('framework.__test__.components.A1')[0])
      .to.equal('A1')
    expect(Context.global.get('framework.__test__.components.A2')[0])
      .to.equal('A2')
    expect(Context.global.get('framework.__test__.components.A3')[0])
      .to.equal('A3')
    expect(Context.global.get('framework.__test__.components.A4')[0])
      .to.equal('A4')
    off()
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal(undefined)
    expect(Context.global.get('framework.__test__.components.A1')[0])
      .to.equal(undefined)
    expect(Context.global.get('framework.__test__.components.A2')[0])
      .to.equal(undefined)
    expect(Context.global.get('framework.__test__.components.A3')[0])
      .to.equal(undefined)
    expect(Context.global.get('framework.__test__.components.A4')[0])
      .to.equal(undefined)
  })
  it('should resolve async import module', async () => {
    let off = Context.global.use(() => new Promise(re => {
      setTimeout(() => re(p0), 10)
    }))
    await new Promise(re => setTimeout(re, 20))
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal('A0')
    off()
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal(undefined)

    off = Context.global.use(() => new Promise(re => {
      setTimeout(() => re(p0), 10)
    }))
    off()
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal(undefined)
    await new Promise(re => setTimeout(re, 20))
    expect(Context.global.get('framework.__test__.components.A0')[0])
      .to.equal(undefined)
  })
  it('should create emitter listeners when store set', () => {
    const ctx = new Context()
    // eslint-disable-next-line prefer-const
    let [v, onVChange] = ctx.get('v')
    onVChange((value: any) => v = value)
    ctx.set('v', 'value')
    expect(v).to.equal('value')
    ctx.set('v', 'value2')
    expect(v).to.equal('value2')
    expect(
      ctx.get('v')[0]
    ).to.equal('value2')

    const extCtx = ctx.extend()
    // eslint-disable-next-line prefer-const
    let [extV, extOnVChange] = extCtx.get('v')
    extOnVChange((value: any) => extV = value)
    extCtx.set('v', 'value3')
    expect(v).to.equal('value3')
    expect(extV).to.equal('value3')
    expect(
      extCtx.get('v')[0]
    ).to.equal('value3')
    expect(
      ctx.get('v')[0]
    ).to.equal('value3')
  })
  it('should control Context frame array of units', () => {
    const off0 = Context.global.use(p2)
    const off1 = Context.global.use(p3)
    let unit: string[][]
    ;[unit] = Context.global.get<string[][]>('units.monad.ZodNumber')
    expect(unit[0][1]).to.equal('a')
    expect(unit[1][1]).to.equal('b')
    off0()
    ;[unit] = Context.global.get<string[][]>('units.monad.ZodNumber')
    expect(unit[0][1]).to.equal('b')
    off1()
    ;[unit] = Context.global.get<string[][]>('units.monad.ZodNumber')
    expect(unit[0]).to.equal(undefined)
  })
})
