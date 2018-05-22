// @flow

export type Step<A, S> =
  | { type: 0, value: void, state: void }
  | { type: 1, value: void, state: S }
  | { type: 2, value: A, state: S }

export const end = <A, S> (): Step<A, S> =>
  ({ type: 0, value: undefined, state: undefined })

export const skip = <A, S> (state: S): Step<A, S> =>
  ({ type: 1, value: undefined, state })

export const next = <A, S> (value: A, state: S): Step<A, S> =>
  ({ type: 2, value, state })
