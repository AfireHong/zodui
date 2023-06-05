import type { MonadType, TypeMap } from '@zodui/core'
import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'

import { Input, Switch } from '../components'
import { useCoreContextUnit } from '../contexts'
import type { SwitcherPropsForReact } from './index'

declare module '@zodui/react' {
  export interface MonadSubController {
    props: {}
    options: {}
  }
  interface SubControllerMap {
    monad: MonadSubController
  }
}

export interface PrimitiveProps extends SwitcherPropsForReact<TypeMap[MonadType]> {
}

export function Monad({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uKey, // FIXME
  modes,
  model,
  ...rest
}: PrimitiveProps) {
  const [value, setValue] = useState(rest.defaultValue || rest.value)
  const props = {
    ...rest,
    value,
    onChange: (v: any) => {
      setValue(v)
      rest.onChange?.(v)
    }
  }
  useEffect(() => {
    setValue(rest.defaultValue || rest.value)
  }, [rest.defaultValue, rest.value])

  let InnerComp: ReactElement = null
  switch (model._def.typeName) {
    case 'ZodNumber':
      InnerComp = <Input type='number' {...props as any} />
      break
    case 'ZodString':
      InnerComp = <Input {...props as any} />
      break
    case 'ZodDate':
      // TODO better date input default ui
      InnerComp = <Input {...props as any} />
      break
    case 'ZodBoolean':
      InnerComp = <Switch {...props as any} />
      break
  }

  const RNDR = useCoreContextUnit('monad', model._def.typeName, modes)
  return RNDR
    ? <RNDR modes={modes} model={model} {...props} />
    : InnerComp
}
