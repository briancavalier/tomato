// @flow
import { end, next, skip } from './step'
import { type Tomato, type TStep } from './core'

// Skip inputs for which a predicate is false
export const filter = <A> (p: A => boolean): Tomato<A, A> =>
  new Filter(p)

export class Filter<A> {
  p: A => boolean
  constructor (p: A => boolean) {
    this.p = p
  }

  step (a: A): TStep<A, A> {
    return this.p(a)
      ? next(a, this)
      : skip(this)
  }
}

// End after n steps
export const take = <A> (n: number): Tomato<A, A> =>
  slice(0, n)

// Skip n steps
export const drop = <A> (n: number): Tomato<A, A> =>
  slice(n, Infinity)

// Skip start steps, and end after end steps
export const slice = <A> (start: number, end: number): Tomato<A, A> =>
  new Slice(start, end, 0)

export class Slice<A> {
  min: number
  max: number
  index: number
  constructor (min: number, max: number, index: number) {
    this.min = min
    this.max = max
    this.index = index
  }

  step (a: A): TStep<A, A> {
    return this.index >= this.max ? end()
      : this.index < this.min ? skip(new Slice(this.min, this.max, this.index + 1))
        : next(a, new Slice(this.min, this.max, this.index + 1))
  }
}
