// @flow

import { type Tomato, Pipe, Lift, Id, Always } from './core'
import { Slice } from './filter'

// "Compile" a tree of Pipes by combining adjacent automatons
// For example: Pipe(Lift(f), Lift(g)) -> Lift(g • f)
// Also, restructure the tree to be right-associative.
// Right-associative evaluates more efficiently in most cases,
// especially when items are being dropped or filtered.
// For example:
// Pipe(Pipe(Take, Lift), Lift) is guaranteed to evaluate
// two Pipes (outer and inner) and one Take for every item.
// Pipe(Take, Pipe(Lift, Lift)) only has to evaluate
// *one* Pipe (only outer) and one Take every item.
// The effect can be significant for large trees
export const compile = <A, B> (t: Tomato<A, B>): Tomato<A, B> =>
  t instanceof Pipe ? compile2(t.ab, t.bc) : t

export const compile2 = <A, B, C> (ab: Tomato<A, B>, bc: Tomato<B, C>): Tomato<A, C> =>
  _compile2(compile(ab), compile(bc))

const _compile2 = <A, B, C> (ab: Tomato<A, B>, bc: Tomato<B, C>): Tomato<A, C> => {
  // Id is a noop, so can be dropped outright
  if (ab instanceof Id) {
    return ((compile(bc): any): Tomato<A, C>)
  }

  if (bc instanceof Id) {
    return ((compile(ab): any): Tomato<A, C>)
  }

  // Always annihilates Lift
  if (ab instanceof Lift && bc instanceof Always) {
    return bc
  }

  // Lifts can be coalesced
  if (ab instanceof Lift && bc instanceof Lift) {
    const f1 = ab.f
    const f2 = bc.f
    return new Lift(a => f2(f1(a)))
  }

  // Lift and Slice can be commuted
  if (ab instanceof Lift && bc instanceof Slice) {
    return new Pipe(bc, ab)
  }

  // Slices can be coalesced
  if (ab instanceof Slice && bc instanceof Slice) {
    return ((new Slice(ab.min + bc.min, Math.min(ab.max, ab.min + bc.max), 0): any): Tomato<A, C>)
  }

  // Right associated Pipe
  // Attempt to eliminate the Pipe by combining ab and the
  // first component of the pipe.
  // If the pipe was eliminated, further compile the results.
  // If it wasn't, return it as is to prevent infinite recursion
  if (bc instanceof Pipe) {
    const c1 = compile2(ab, bc.ab)
    return !(c1 instanceof Pipe && c1.ab === ab && c1.bc === bc.ab)
      ? compile2(c1, bc.bc)
      : new Pipe(ab, bc)
  }

  // Left associated Pipe
  // Attempt to eliminate the Pipe by combining the second
  // component of the pipe and bc.
  // If the pipe was eliminated, further compile the results.
  // If it wasn't, then attempt to compile the components
  // and right-associate.
  if (ab instanceof Pipe) {
    const c2 = compile2(ab.bc, bc)
    return !(c2 instanceof Pipe && c2.ab === ab.bc && c2.bc === bc)
      ? compile2(ab.ab, c2)
      : new Pipe(compile(ab.ab), new Pipe(compile(ab.bc), bc))
  }

  return new Pipe(ab, bc)
}
