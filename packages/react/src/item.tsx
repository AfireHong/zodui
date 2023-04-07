import './item.scss'

import z from 'zod'
import React, { useEffect, useMemo } from 'react'

import { WrapModes } from './configure'
import { getModes, inlineMarkdown } from './utils'
import { Controller } from './controllers'
import { Button } from './components'
import { useErrorHandler } from './contexts/error-handler'
import { useItemSerter } from './contexts/item-serter'

export interface ItemProps {
  label: string
  disabled?: boolean
  value?: any
  onChange?: (value: any) => void | Promise<void>
  defaultValue?: any
  schema: z.Schema
  className?: string
}

export function Item(props: ItemProps) {
  const {
    schema,
    className
  } = props
  const wrapDefault = useMemo(
    () => WrapModes.some(mode => {
      const modes = getModes(schema._mode)
      if (typeof mode === 'string')
        return modes.some(r => r?.startsWith(mode))
      else
        return modes.some(r => mode.test(r))
    }),
    [schema._mode]
  )

  const { Append, ItemSerter } = useItemSerter()

  const { reset, error, ErrorHandler } = useErrorHandler()

  useEffect(() => {
    if (error) reset()
  }, [schema])

  return <ItemSerter>
    <ErrorHandler>
      <div className={
        `zodui-item ${schema.type}`
        + (error ? ' error' : '')
        + (wrapDefault ? ' wrap' : '')
        + (schema._mode ? ` ${schema._mode}` : '')
        + (className ? ` ${className}` : '')
      }>
        <div className='zodui-item__more'>
          <Button shape='square' variant='text' icon='More' />
        </div>
        <div className='zodui-item__label'>
          {props.label}
          {schema._def.description
            && <pre
              className='zodui-item__label-description inline-md'
              dangerouslySetInnerHTML={{ __html: inlineMarkdown(schema._def.description) }}
            />}
        </div>
        {error
          ? '组件渲染异常'
          : <Controller schema={schema} disabled={props.disabled} />}
      </div>
    </ErrorHandler>
    <Append />
    {error &&
      <div className='zodui-item__error'>
        {error.message}
      </div>}
  </ItemSerter>
}
