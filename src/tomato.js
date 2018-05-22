// @flow

import { type Step, end, next, skip } from './step'

export type TStep<A, B> = Step<B, Tomato<A, B>>

// An automaton that can be stepped to transform
// a value and returns an updated automaton
export type Tomato<A, B> = {
  step (A): TStep<A, B>
}

// Identity transform
export class Id<A> {
  step (a: A): TStep<A, A> {
    return next(a, this)
  }
}

// Transform everything to a constant value
export class Const<A> {
  value: A
  constructor (value: A) {
    this.value = value
  }

  step <X> (x: X): TStep<X, A> {
    return next(this.value, this)
  }
}

// Lift a pure function into an automaton
export class Lift<A, B> {
  f: A => B
  constructor (f: A => B) {
    this.f = f
  }

  step (a: A): TStep<A, B> {
    return next(this.f(a), this)
  }
}

// Skip inputs for which a predicate is false
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
export class Take<A> {
  n: number
  constructor (n: number) {
    this.n = n
  }

  step (a: A): TStep<A, A> {
    return this.n > 0
      ? next(a, new Take(this.n - 1))
      : end()
  }
}

// Compose (left to right) two automatons
export class Pipe<A, B, C> {
  ab: Tomato<A, B>
  bc: Tomato<B, C>
  constructor (ab: Tomato<A, B>, bc: Tomato<B, C>) {
    this.ab = ab
    this.bc = bc
  }

  step (a: A): TStep<A, C> {
    const r = this.ab.step(a)
    switch (r.type) {
      case 0: return end()
      case 1: return skip(new Pipe(r.state, this.bc))
    }

    const r2 = this.bc.step(r.value)
    switch (r2.type) {
      case 0: return end()
      case 1: return skip(new Pipe(r.state, r2.state))
    }

    return next(r2.value, new Pipe(r.state, r2.state))
  }
}
