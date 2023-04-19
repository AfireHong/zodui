import * as z from 'zod'
import { Schema, ZodDefaultDef, ZodFirstPartyTypeKind, ZodObject, ZodRawShape, ZodType, ZodTypeAny } from 'zod'
import { AllTypes } from '@zodui/core'

export interface ModesMap extends Record<AllTypes, string> {
  [ZodFirstPartyTypeKind.ZodNumber]:
    | 'slider'
    | 'rate'
  [ZodFirstPartyTypeKind.ZodString]:
    | 'textarea'
    | 'link'
    | 'secrets'
    | 'date'
    | 'datetime'
    | 'time'
    | 'panel'
  [ZodFirstPartyTypeKind.ZodBoolean]:
    | 'checkbox'
  [ZodFirstPartyTypeKind.ZodDate]:
    | 'datetime'
    | 'date'
    | 'time'
    | 'panel'
  [ZodFirstPartyTypeKind.ZodUnion]:
    | 'append'
    | 'radio'
    | 'radio-inline'
    | 'button'
  [ZodFirstPartyTypeKind.ZodTuple]:
    | 'range'
    | 'slider'
    | 'no-range'
    | 'no-slider'
    | 'datetime'
    | 'date'
    | 'time'
    | 'panel'
}

declare module 'zod' {
  export interface ZodTypeDef {
    mode: string
    label: string
  }
  export interface ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    readonly _mode: string
    mode<T extends string>(
      mode:
        | Def extends ZodDefaultDef<infer InnerT extends ZodTypeAny>
          ? ModesMap[InnerT['_def']['typeName']]
          // @ts-ignore
          : ModesMap[Def['typeName']]
        | (string & {})
    ): ZodType<Output, Def, Input>

    readonly _label: string
    label(mode: string): ZodType<Output, Def, Input>

    readonly type: string
  }
  export function clazz<T>(clazz: { new(): T }): Schema<T>
  export function asObject<T extends any>(t: T): ZodObject<Record<string, ZodTypeAny> & T>
  // TODO resolve default type
}

function defineMetaField(key: string) {
  try {
    !Object.hasOwn(ZodType.prototype, `_${key}`)
      && Object.defineProperty(ZodType.prototype, `_${key}`, {
        get() {
          return this._def[key]
        }
      })
    !Object.hasOwn(ZodType.prototype, key)
      && Object.defineProperty(ZodType.prototype, key, {
        get() {
          return (val: any) => {
            const This = (this as any).constructor;
            return new This({
              ...this._def,
              [key]: val,
            });
          }
        }
      })
  } catch (e) {
    console.error(e)
  }
}

defineMetaField('mode')
defineMetaField('label')

!Object.hasOwn(ZodType.prototype, 'type')
  && Object.defineProperty(ZodType.prototype, 'type', {
    get() {
      return this._def
        ?.typeName
        .replace('Zod', '')
        .toLowerCase()
        ?? 'unknown'
    }
  })

const nz = { ...z }

export default nz as typeof z

export function clazz<T extends ZodRawShape>(clazz: { new(): T }): Schema<T> {
  return z.object(new clazz()) as any
}
// @ts-ignore
nz.clazz = clazz

export function asObject<T extends ZodRawShape>(t: T): ZodObject<Record<string, ZodTypeAny> & T> {
  return z.object(t) as any
}
// @ts-ignore
nz.asObject = asObject

export { nz as z }

export * from 'zod'
