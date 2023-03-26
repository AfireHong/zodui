import { BaseCompProps, BaseComps } from './base'

export function Input<T extends BaseCompProps.InputValue>(props: BaseCompProps.Input<T>) {
  if (BaseComps.Input) {
    return <BaseComps.Input {...props} />
  }
  const { onChange, ...rest } = props
  return <input
    onChange={e => {
      switch (typeof props.value) {
        case 'string':
          onChange?.(e.target.value as T)
          break
        case 'number':
          onChange?.(Number(e.target.value) as T)
          break
        default:
          onChange?.(String(e.target.value) as T)
      }
    }}
    {...rest}
  />
}
