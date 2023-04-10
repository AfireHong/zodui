import type { ZodUnionOptions } from 'zod'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Controller, ControllerProps } from './index'
import { AllTypes, TypeMap } from '../utils'

import { plgMaster } from '../plugins'
import { useItemSerterContext } from '../contexts/item-serter'
import { Schema } from '../schema'
import { Select, BaseCompProps } from '../components'
import { ComplexType } from '../configure'

declare module '@zodui/react' {
  export interface ComplexSubController {
    props: {
      options: BaseCompProps.SelectOptions[]
      OptionRender: ReactElement
    }
    options: {}
  }
  interface SubControllerMap {
    complex: ComplexSubController
  }
}

function resolveSchemas(schemas: ZodUnionOptions): BaseCompProps.SelectOptions[] {
  // TODO resolve not literal type, it not contain value
  return schemas.map((schema, index) => ({
    label: schema._def.label || schema._def.description || schema._def.value || `[${index}]`,
    title: schema._def.description,
    value: index
  }))
}

export function Complex({
  modes,
  schema,
  value,
  defaultValue,
  ...rest
}: ControllerProps<TypeMap[ComplexType]>) {
  const options = useMemo(() => resolveSchemas(schema.options), [schema.options])
  const [index, setIndex] = useState<number>(0)
  useEffect(() => {
    const v = value ?? defaultValue
    const index = schema.options.findIndex(schema => schema._def.value === v)
    if (index === -1) return

    setIndex(index)
  }, [value, defaultValue])
  const props = {
    title: schema._def.description,
    ...rest,
    value: index,
    onChange(v: any) {
      setIndex(v)
      rest.onChange?.(schema.options[v]._def.value)
    }
  }

  const ItemSerter = useItemSerterContext()

  const OptionRender = <>
    <ItemSerter.Append deps={[schema.options, index]}>
      {/* 在里面控制是因为在 modes 修改后，将 append 内容清空 */}
      {modes.includes('append') && schema.options[index]._def.typeName !== AllTypes.ZodLiteral
        && <Schema model={schema.options[index]} />}
    </ItemSerter.Append>
    {!modes.includes('append') && schema.options[index]._def.typeName !== AllTypes.ZodLiteral && <>
      <br/>
      <Controller
        schema={schema.options[index]}
        {...rest}
      />
    </>}
  </>

  const { Component } = plgMaster.reveal(schema._def.typeName, 'SubController.complex', [modes]) ?? {}

  return Component
    ? <Component
      modes={modes}
      schema={schema}
      options={options}
      OptionRender={OptionRender}
      {...props}
    />
    // TODO support `'' | (string & {})` type
    //      display select input
    : <>
      <Select
        options={options}
        {...props}
      />
      {OptionRender}
    </>
}
