export class Framework<
  K extends FrameworksKeys,
  Components = Frameworks[K]['Components'],
> {
  defineComp<
    Type extends keyof Components,
  >(
    type: Type, Component: Components[Type],
  ) {
    return this
  }
  // defineIcon(): Framework<K>
  // defineCtrl(): Framework<K>
  // defineView(): Framework<K>
  // defineStructure(): Framework<K>
}

export interface Frameworks {
  [key: string]: {
    /**
     * define framework special component func value to infer defineComp func type
     */
    Components: Record<string, any>
  }
}

export type FrameworksKeys = keyof Frameworks
