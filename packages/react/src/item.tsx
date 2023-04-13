import './item.scss'

import z, { ZodError } from 'zod'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { WrapModes } from './configure'
import { debounce, getModes, inlineMarkdown } from './utils'
import { Controller } from './controllers'
import { Button } from './components'
import { useErrorHandler } from './contexts/error-handler'
import { useItemSerter } from './contexts/item-serter'

export interface ItemProps {
  uniqueKey?: string
  label: string
  disabled?: boolean
  value?: any
  onChange?: (value: any) => (void | Promise<void>)
  defaultValue?: any
  schema: z.Schema
  className?: string
}

/**
 * Item
 * - check controller data
 * - common contexts
 * - value operate and support extensible
 */
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

  const value = useRef<number>(props.value ?? props.defaultValue)
  const valueChangeListener = useRef<(v: any) => any>()
  const onValueChange = useCallback((func: (v: any) => any) => {
    valueChangeListener.current = func
    return () => {
      valueChangeListener.current = undefined
    }
  }, [])
  const changeValue = useCallback(debounce(async (v: any) => {
    try {
      const rv = await valueChangeListener.current?.(v) ?? v
      await props.onChange?.(rv)
      value.current = rv
    } catch (e) {
      if (e instanceof ZodError) {
      } else
        throw e
    }
    // TODO make delay configurable
  }, 300), [schema])

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
          <Button shape='square' variant='text' icon='More' disabled={!!error} />
        </div>
        <div className='zodui-item__label'>
          {props.label}
          {schema._def.description
            && <pre
              className='zodui-item__label-description inline-md'
              dangerouslySetInnerHTML={{ __html: inlineMarkdown(schema._def.description) }}
            />}
        </div>
        {!error && <Controller
          uniqueKey={props.uniqueKey}
          schema={schema}
          disabled={props.disabled}
          value={value.current}
          defaultValue={props.defaultValue}
          onChange={changeValue}
        />}
      </div>
    </ErrorHandler>
    <Append />
    <ValueChecker value={value.current}
                  schema={schema}
                  onValueChange={onValueChange}
    />
    {error &&
      <div className='zodui-item__error'>
        {error.message}
      </div>}
  </ItemSerter>
}

function ValueChecker({
  value,
  schema,
  onValueChange
}: {
  value: any
  schema: z.Schema
  onValueChange: (func: (v: any) => any) => () => void
}) {
  const [parseError, setParseError] = useState<ZodError>()
  const parse = useCallback(async function (v: any) {
    try {
      const nv = schema.parse(v)
      setParseError(undefined)
      return nv
    } catch (e) {
      console.warn(e)
      if (e instanceof ZodError) {
        setParseError(e)
      }
      throw e
    }
  }, [schema])
  useEffect(() => {
    parse(value)
    return onValueChange(parse)
  }, [value, schema, parse])
  return <>{
    parseError && <div className='zodui-item__error'>
      {parseError.errors.map((e, i) => <div key={i}>
        {e.path.map(p => {
          if (typeof p === 'number')
            return `${p}nd`
          return p
        }).join('.')} {e.message}
      </div>)}
    </div>
  }</>
}
