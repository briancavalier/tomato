// @flow

export const END: 2 = 2
export const SKIP: 1 = 1
export const NEXT: 0 = 0

export type Step<A, S> =
  | { type: typeof END, value: void, next: void }
  | { type: typeof SKIP, value: void, next: S }
  | { type: typeof NEXT, value: A, next: S }

export const end = <A, S> (): Step<A, S> =>
  ({ type: END, value: undefined, next: undefined })

export const skip = <A, S> (next: S): Step<A, S> =>
  ({ type: SKIP, value: undefined, next })

export const next = <A, S> (value: A, next: S): Step<A, S> =>
  ({ type: NEXT, value, next })
