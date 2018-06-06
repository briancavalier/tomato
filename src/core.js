// @flow

import { type Step, end, next, skip, END, SKIP } from './step'

// An automaton that can be stepped to transform
// a value and returns an updated automaton
export type Tomato<A, B> = {
  step (A): TStep<A, B>
}

// Stepping an automaton yields a value and an
// automaton in an updated state
export type TStep<A, B> = Step<B, Tomato<A, B>>

// Identity transform
export const id = <A> (): Tomato<A, A> =>
  new Id()

export class Id<A> {
  step (a: A): TStep<A, A> {
    return next(a, this)
  }
}

// Lift a pure function
export const lift = <A, B> (f: A => B): Tomato<A, B> =>
  new Lift(f)

export class Lift<A, B> {
  f: A => B
  constructor (f: A => B) {
    this.f = f
  }

  step (a: A): TStep<A, B> {
    return next(this.f(a), this)
  }
}

// Compose (left to right)
export const pipe = <A, B, C> (ab: Tomato<A, B>, bc: Tomato<B, C>): Tomato<A, C> =>
  new Pipe(ab, bc)

// Curried right-to-left compose for use in |> pipelines
export const to = <A, B, C> (bc: Tomato<B, C>): (Tomato<A, B> => Tomato<A, C>) =>
  ab => pipe(ab, bc)

export class Pipe<A, B, C> {
  ab: Tomato<A, B>
  bc: Tomato<B, C>
  constructor (ab: Tomato<A, B>, bc: Tomato<B, C>) {
    this.ab = ab
    this.bc = bc
  }

  step (a: A): TStep<A, C> {
    const r1 = this.ab.step(a)
    switch (r1.type) {
      case END: return end()
      case SKIP: return skip(new Pipe(r1.next, this.bc))
    }

    const r2 = this.bc.step(r1.value)
    switch (r2.type) {
      case END: return end()
      case SKIP: return skip(new Pipe(r1.next, r2.next))
    }

    return next(r2.value, new Pipe(r1.next, r2.next))
  }
}

// Transform the input and output
export const promap = <A, B, C, D> (l: A => B, r: C => D, t: Tomato<B, C>): Tomato<A, D> =>
  lmap(l, rmap(r, t))

// Transform only the input
export const lmap = <A, B, C> (l: A => B, t: Tomato<B, C>): Tomato<A, C> =>
  pipe(lift(l), t)

// Transform only the output
export const rmap = <A, B, C> (r: B => C, t: Tomato<A, B>): Tomato<A, C> =>
  pipe(t, lift(r))

export { rmap as map }

// Transform everything to a constant value
export const always = <X, A> (a: A): Tomato<X, A> =>
  new Always(a)

export class Always<A> {
  value: A
  constructor (value: A) {
    this.value = value
  }

  step <X> (x: X): TStep<X, A> {
    return next(this.value, this)
  }
}
