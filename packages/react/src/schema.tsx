import './schema.scss'
import type { Schema as ZodSchema } from 'zod'

import { Item } from './item'
import { AllTypes, inlineMarkdown, isWhatType, merge } from './utils'
import { plgMaster } from './plugins'
import common from './plugins/common'
import { useCallback, useEffect, useRef } from 'react'

export interface SchemaProps {
  prefix?: string
  model: ZodSchema
  disabled?: boolean
  value?: any
  defaultValue?: any
  onChange?: (value: any) => (void | Promise<void>)
}

const prefix = 'zodui-schema'

export function Schema(props: SchemaProps) {
  useEffect(() => {
    return plgMaster.register(common())
  }, [plgMaster, common])

  const {
    model,
    value,
    defaultValue,
    onChange,
    disabled
  } = props
  const valueRef = useRef(value ?? defaultValue ?? {})
  const changeValue = useCallback((v: any) => {
    valueRef.current = v
    onChange?.(v)
  }, [onChange])

  if (isWhatType(model, AllTypes.ZodIntersection)) {
    return <>
      <Schema prefix='intersect::left'
              disabled={disabled}
              model={model._def.left}
              value={valueRef.current}
              onChange={async v => changeValue(merge(valueRef.current, v))}
      />
      <Schema prefix='intersect::right'
              disabled={disabled}
              model={model._def.right}
              value={valueRef.current}
              onChange={async v => changeValue(merge(valueRef.current, v))}
      />
    </>
  }

  return <div className={prefix}>
    <div className={`${prefix}__header`}>
      {props.model._def.label && <h2 className={`${prefix}__label`}>
        {props.model._def.label}
      </h2>}
      {props.model._def.description
        && <pre
          className={`${prefix}__desc inline-md`}
          dangerouslySetInnerHTML={{ __html: inlineMarkdown(props.model._def.description) }}
        />}
    </div>
    {isWhatType(model, AllTypes.ZodObject)
      ? Object.entries(model._def.shape()).map(([key, value]) => <Item
        key={key}
        uniqueKey={`${props.prefix || ''}.${key}`}
        label={value._def.label || key}
        schema={value}
        disabled={disabled}
        onChange={async v => changeValue({ ...valueRef.current, [key]: v })}
      />)
      : <Item
        uniqueKey='single'
        label={model._label || model._def?.description || model.type}
        schema={model}
        disabled={disabled}
        value={valueRef.current}
        onChange={changeValue}
      />}
  </div>
}

Schema.Item = Item
