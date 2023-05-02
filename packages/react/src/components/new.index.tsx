import {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  PropsWithChildren,
  ReactElement,
  SelectHTMLAttributes, SVGAttributes
} from 'react'
import { ComponentProps, Icons } from '@zodui/core'

declare module '@zodui/core' {
  export interface Frameworks {
    react: ReactFramework
  }
}

export type ZElement<T = undefined> = T extends undefined ? ReactElement : (props: T) => ReactElement;

export interface BaseProps {
  style?: CSSProperties
  className?: string
}

export namespace InnerProps {
  export interface Icon extends SVGAttributes<SVGSVGElement>, BaseProps {
    name: Icons | (string & {})
    size?: 'small' | 'medium' | 'large' | string | number
  }
  export type Input<T extends ComponentProps.InputValue = string> =
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
    & ComponentProps.Input
  export type InputAdornment =
    & BaseProps
    & PropsWithChildren
    & ComponentProps.InputAdornment
    & {
      prev?: ZElement
      next?: ZElement
    }
  export type Button =
    & BaseProps
    & ButtonHTMLAttributes<HTMLButtonElement>
    & ComponentProps.Button
    & {
      icon?: ZElement
    }
  // TODO support input select
  // TODO support multiple select
  export type Select<T extends ComponentProps.SelectValue> =
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
    & ComponentProps.Select<T>
  export type Switch =
    & BaseProps
    & ComponentProps.Switch
  export type DropdownMenuItem =
    & {
      icon?: string | ReactElement
      label: string | ReactElement
    }
    & ComponentProps.DropdownMenuItem
  export type Dropdown =
    & BaseProps
    & ComponentProps.Dropdown
    & {
      menu: DropdownMenuItem[]
      children?: ReactElement
      onAction?: (value: string | number, item: DropdownMenuItem) => void
    }
  // RadioGroup: () => <></>
  // Dialog: () => <></>
  // Drawer: () => <></>
}

export interface ReactFramework {
  Components: {
    Input: <T extends ComponentProps.InputValue>(props: InnerProps.Input<T>) => ReactElement
    InputAdornment: (props: InnerProps.InputAdornment) => ReactElement
    Button: (props: InnerProps.Button) => ReactElement
    Select: <T extends ComponentProps.SelectValue>(props: InnerProps.Select<T>) => ReactElement
    Switch: (props: InnerProps.Switch) => ReactElement
    Dropdown: (props: InnerProps.Dropdown) => ReactElement
  }
  Icon: (props: InnerProps.Icon) => ReactElement
}
