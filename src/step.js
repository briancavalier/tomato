// @flow

export const END: 0 = 0
export const SKIP: 1 = 1
export const NEXT: 2 = 2

export type Step<A, S> =
  | { type: typeof END, value: void, state: void }
  | { type: typeof SKIP, value: void, state: S }
  | { type: typeof NEXT, value: A, state: S }

export const end = <A, S> (): Step<A, S> =>
  ({ type: END, value: undefined, state: undefined })

export const skip = <A, S> (state: S): Step<A, S> =>
  ({ type: SKIP, value: undefined, state })

export const next = <A, S> (value: A, state: S): Step<A, S> =>
  ({ type: NEXT, value, state })
