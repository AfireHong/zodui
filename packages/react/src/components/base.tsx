import {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  SelectHTMLAttributes
} from 'react'

export type ZElement<T = undefined> = T extends undefined ? ReactElement : (props: T) => ReactElement;

export interface BaseProps {
  style?: CSSProperties
  className?: string
}

export namespace BaseCompProps {
  export type InputValue = string | number | undefined
  export type Input<T extends InputValue = string> =
    & BaseProps
    & Omit<InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'type'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      // not need
      | 'onBlur'
      | 'onFocus'
      | 'onClick'
      | 'onPaste'
      | 'onWheel'>
    & {
      type?: 'text' | 'password' | 'number' | 'email' | 'tel' | 'url' | 'search'
      value?: T
      defaultValue?: T
      onChange?: (v: T) => void
    }
    & ({
      mode?: string
    } | {
      type?: 'number'
      mode?: 'split'
    })
  export type InputAdornment =
    & BaseProps
    & PropsWithChildren
    & {
      prev?: ZElement
      next?: ZElement
    }
  export type Button =
    & BaseProps
    & ButtonHTMLAttributes<HTMLButtonElement>
    & {
    icon?: ZElement
    theme?: 'error' | 'warning' | 'success' | 'info'
    shape?: 'square' | 'round' | 'circle'
    variant?: 'text' | 'outline'
    onClick?: () => void
  }
  export type SelectValue = string | number | undefined | (string | number)[]
  export type SelectOptions = {
    label: string
    title: string
    value: number
  }
  // TODO support input select
  // TODO support multiple select
  export type Select<T extends SelectValue> =
    & BaseProps
    & Omit<SelectHTMLAttributes<HTMLSelectElement>,
      | 'size'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      // not need
      | 'onBlur'
      | 'onMouseEnter'
      | 'onMouseLeave'
      | 'onFocus'
      | 'onClick'
      | 'onPaste'
      | 'onWheel'>
    & {
      options?: SelectOptions[]
      value?: T
      defaultValue?: T
      onChange?: (v: T) => void
    }
  export type Switch =
    & BaseProps
    & {
      value?: boolean
      defaultValue?: boolean
      onChange?: (v: boolean) => void
    }
  export type DropdownMenuItem = {
    icon?: string | ReactElement
    label: string | ReactElement
    title?: string
    value?: string | number
    disabled?: boolean
  }
  export type Dropdown =
    & BaseProps
    & {
      trigger?: 'hover' | 'click'
      placement?: 'right'
      menu: DropdownMenuItem[]
      children?: ReactElement
      onAction?: (value: string | number, item: DropdownMenuItem) => void
    }
  // RadioGroup: () => <></>
  // Dialog: () => <></>
  // Drawer: () => <></>
}

export const BaseComps: {
  Input?: <T extends BaseCompProps.InputValue>(props: BaseCompProps.Input<T>) => ReactElement
  InputAdornment?: (props: BaseCompProps.InputAdornment) => ReactElement
  Button?: (props: BaseCompProps.Button) => ReactElement
  Select?: <T extends BaseCompProps.SelectValue>(props: BaseCompProps.Select<T>) => ReactElement
  Switch?: (props: BaseCompProps.Switch) => ReactElement
  Dropdown?: (props: BaseCompProps.Dropdown) => ReactElement
} = {}

export function registerBaseComp<K extends keyof typeof BaseComps>(name: K, comp: (typeof BaseComps)[K]) {
  BaseComps[name] = comp
}

export { Input, InputAdornment } from './input'
export { Button } from './button'
export { Dropdown } from './dropdown'
export { Select } from './select'
export { Switch } from './switch'
