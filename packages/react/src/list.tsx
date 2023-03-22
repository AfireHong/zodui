import './list.scss'

import {
  ZodArrayDef,
  ZodFirstPartyTypeKind,
  ZodMapDef,
  ZodObjectDef,
  ZodRawShape,
  ZodRecordDef,
  ZodSetDef,
  ZodTupleDef,
  ZodTypeDef
} from 'zod'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DateRangePicker, Input, Slider, TimeRangePicker } from 'tdesign-react/esm'

import { ControllerProps } from './controller'
import { getDefaultValue, isWhatType, useModes } from './utils'
import { primitive, Primitive } from './primitive'
import { Union } from './union'
import { KeyEditableTypes, UseSchemasForList } from './configure'
import { Icon } from './components'

const prefix = 'zodui-item__control-list'

export interface ListProps extends ControllerProps {
}

export function List({
  schema,
  ...props
}: ListProps) {
  const commonDef = schema._def as (
    & Partial<ZodArrayDef<any>>
    & Partial<ZodTupleDef>
    & Partial<ZodSetDef>
    & Partial<ZodMapDef>
    & Partial<ZodRecordDef>
    & Partial<ZodObjectDef<any>>
  ) & ZodTypeDef
  const dict = useMemo(() => {
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodObject)) {
      const dict = schema._def.shape() ?? {}
      return Object.entries(dict)
        .reduce((acc, [key , s]) => {
          let ns = s
          if (s._def.label === undefined)
            ns = s.label(key)
          if (s._def.description === undefined)
            ns = s.describe(key)
          acc[key] = ns
          return acc
        }, {} as ZodRawShape)
    }
    return {}
  }, [commonDef.typeName])
  const getSchema = useCallback((index?: number) => {
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodArray)) {
      return schema._def.type
    }
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodTuple)) {
      return schema._def.items[index]
    }
    if (
      isWhatType(schema, ZodFirstPartyTypeKind.ZodSet)
      || isWhatType(schema, ZodFirstPartyTypeKind.ZodRecord)
      || isWhatType(schema, ZodFirstPartyTypeKind.ZodMap)
    ) {
      return schema._def.valueType
    }
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodObject)) {
      return Object.values(dict)[index]
    }
    return null
  }, [
    dict,
    commonDef.items,
    commonDef.valueType,
    commonDef.typeName,
  ])
  const schemasLength = useMemo(() => {
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodArray) || isWhatType(schema, ZodFirstPartyTypeKind.ZodSet)) {
      return Infinity
    }
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodTuple)) {
      return schema._def.items.length
    }
    if (isWhatType(schema, ZodFirstPartyTypeKind.ZodObject)) {
      return Object.entries(schema._def.shape() ?? {}).length
    }
    return 0
  }, [commonDef])

  const [list, setList] = useState<any[]>()
  useEffect(() => {
    setList(
      Object.keys(dict).length > 0
        ? Object.values(dict).map(getDefaultValue)
        : isWhatType(schema, ZodFirstPartyTypeKind.ZodTuple)
        ? schema._def.items
        : props.defaultValue ?? props.value
          ? Object.entries(props.defaultValue ?? props.value).map(([, v]) => v)
          : undefined
    )
  }, [
    dict,
    commonDef.typeName,
    commonDef.items,
    props.defaultValue,
    props.value
  ])

  const dictKeys = useMemo(() => Object.keys(dict ?? {}), [ dict ])
  const [keys, setKeys] = useState<string[]>([])

  const Controller = useCallback((props: ControllerProps) => primitive.includes(props.schema.type)
    ? <Primitive {...props}/>
    : props.schema.type === 'union'
    ? <Union {...props}/>
    : ['array', 'tuple'].includes(props.schema.type)
    ? <List {...props} />
    : <>暂未支持的的类型 <code>{props.schema.type}</code></>, [
  ])

  const isTuple = useMemo(() => schema.type === 'tuple', [schema.type])
  const isSchemas = useMemo(() => UseSchemasForList.includes(schema.type), [schema.type])

  const modes = useModes(schema)
  const isRange = useMemo(() => {
    return !modes.includes('no-range')
      && schemasLength === 2
  }, [modes, schemasLength])
  const isSlider = useMemo(() => {
    return !modes.includes('no-slider')
      && schemasLength === 2
  }, [modes, schemasLength])

  const addNewItem = useCallback((type: 'append' | 'prepend' = 'append') => setList(l => {
    const t = [getDefaultValue(getSchema())]
    if (l === undefined)
      return t

    return type === 'append' ? l.concat(t) : t.concat(l)
  }), [getSchema])

  const isEmpty = useMemo(() => (list?.length ?? 0) === 0, [list?.length])
  // TODO resolve tuple length is 0
  const Component = useCallback(({ keys, list }: {
    keys: string[]
    list: any[]
  }) => {
    if (isEmpty)
      return <Button
        shape='square'
        variant='outline'
        className={`${prefix}-create`}
        icon={<Icon name='Add' />}
        onClick={() => addNewItem()}
      />

    if (isTuple) {
      let nl = list.length === 2 ? list : [undefined, undefined]
      const [s0, s1] = [getSchema(0), getSchema(1)]
      if (isRange) {
        if (
          s0.type === 'date' && s1.type === 'date'
        ) {
          switch (true) {
            case modes.includes('date'):
            case modes.includes('datetime'):
              const nProps = {
                ...props,
                enableTimePicker: modes.includes('datetime')
              }
              return <DateRangePicker
                value={nl}
                onChange={setList}
                {...nProps}
              />
            case modes.includes('time'):
              return <TimeRangePicker
                value={nl}
                onChange={setList}
                className='t-time-range-picker'
                {...props}
              />
          }
        }
        if (
          s0.type === 'number' && s1.type === 'number'
        ) {
          // TODO support number range input
        }
      }
      if (isSlider) {
        if (
          s0.type === 'number' && s1.type === 'number'
        ) {
          return <Slider
            value={nl}
            onChange={setList as (v: any) => void}
            range
          />
        }
      }
    }

    return <>{list?.map((item, index) => {
      const itemSchema = getSchema(index)
      const isKeyEditable = KeyEditableTypes.includes(schema.type)

      return <div className={`${prefix}-item`} key={index}>
        {(
          (dictKeys[index] ?? itemSchema?._def.label) || isKeyEditable
        ) && <div className={
          `${prefix}-item__label`
          + (isKeyEditable ? ' editable' : '')
        }>
          {isKeyEditable
            ? <Input
              value={keys[index]}
              onChange={v => setKeys(keys => {
                const nKeys = keys.slice()
                nKeys[index] = v
                return nKeys
              })}
              placeholder='请输入键名'
              className='key-input'
            />
            : itemSchema._def.label ?? dictKeys[index]}
        </div>}
        {/* TODO display description */}
        <div className={`${prefix}-item__index-tag`}>
          {index + 1}
        </div>
        {!isSchemas && <>
          {index === 0
            ? <Button
              shape='square'
              variant='outline'
              icon={<Icon name='Prepend' /> }
              onClick={() => addNewItem('prepend')}
            />
            : <Button
              shape='square'
              variant='outline'
              icon={<Icon name='ArrowUp' />}
              onClick={() => {
                const newList = [...list]
                newList[index] = newList[index - 1]
                newList[index - 1] = item
                setList(newList)
              }}
            />}
          {index === list.length - 1
            ? <Button
              shape='square'
              variant='outline'
              icon={<Icon name='Append' /> }
              onClick={() => addNewItem('append')}
            />
            : <Button
              shape='square'
              variant='outline'
              icon={<Icon name='ArrowDown' />}
              onClick={() => {
                const newList = [...list]
                newList[index] = newList[index + 1]
                newList[index + 1] = item
                setList(newList)
              }}
            />}
        </>}
        {React.cloneElement(<Controller
          schema={itemSchema}
          value={item}
          onChange={value => {
            const newList = [...list]
            newList[index] = value
            setList(newList)
          }}
        />, {
          defaultValue: getDefaultValue(itemSchema),
          disabled: props.disabled ?? false,
          className: `${prefix}-item__container`,
        })}
        <Button
          shape='square'
          variant='outline'
          theme='danger'
          disabled={
            isSchemas
              ? props.disabled ?? (item === undefined)
              : props.disabled
          }
          icon={<Icon
            name={isSchemas ? 'Clear' : 'Delete'}
          />}
          onClick={() => {
            if (isSchemas) {
              const newList = [...list]
              newList[index] = undefined
              setList(newList)
            } else {
              setList(l => l.filter((_, i) => i !== index))
            }
          }}
        />
        <Button
          shape='square'
          variant='outline'
          icon={<Icon name='More' />}
        />
      </div>
    })}</>
  }, [isEmpty, isSchemas, isRange, dictKeys, addNewItem])
  return <div className={
    prefix
    + ((list?.length ?? 0) === 0 ? ' empty' : '')
  }>
    <Component keys={keys} list={list} />
  </div>
}
