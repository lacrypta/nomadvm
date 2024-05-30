// nomadvm: The Nomad Virtual Machine reference implementation
//
// MIT License
//
// Copyright (c) 2024 La Crypta
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/* eslint-disable sonarjs/no-duplicate-string */

import type { AnyFunction } from '../../src/dependency';

import {
  _getDependencyPrimitive,
  _removeComments,
  DependencyImplementation,
  create,
  from,
  sort,
} from '../../src/dependency';
import { testAll } from '../helpers';

describe('dependency', (): void => {
  testAll(it, _removeComments, {
    'should leave empty string alone': {
      expected: '',
      input: [''],
    },
    'should not change inside backtick-quoted strings': {
      expected: '`/* something */`',
      input: ['`/* something */`'],
    },
    'should not change inside double-quoted strings': {
      expected: '"/* something */"',
      input: ['"/* something */"'],
    },
    'should not change inside regular expressions': {
      expected: '/./* something */',
      input: ['/./* something */'],
    },
    'should not change inside single-quoted strings': {
      expected: "'/* something */'",
      input: ["'/* something */'"],
    },
    'should not change whitespace': {
      expected: ' something   else ',
      input: [' something   else '],
    },
    'should strip eof': {
      expected: '\nelse',
      input: ['// something\nelse'],
    },
    'should strip multiline': {
      expected: ' else',
      input: ['/* something */ else'],
    },
  });

  testAll(
    it,
    (x) => JSON.stringify(_getDependencyPrimitive(x)),
    {
      'should deal with empty arrow function': {
        expected: JSON.stringify({ code: '', dependencies: {}, name: '' }),
        input: [() => {}],
      },
      'should deal with empty arrow function with a single parameter with no default': {
        expected: JSON.stringify({ code: '', dependencies: { _x: '' }, name: '' }),
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        input: [(_x: unknown) => {}],
      },
      'should deal with empty function': {
        expected: JSON.stringify({ code: '', dependencies: {}, name: '' }),
        input: [function () {}],
      },
      'should deal with empty function with a single parameter with no default': {
        expected: JSON.stringify({ code: '', dependencies: { _x: '' }, name: '' }),
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        input: [function (_x: unknown) {}],
      },
      'should deal with empty named function': {
        expected: JSON.stringify({ code: '', dependencies: {}, name: 'something' }),
        input: [function something() {}],
      },
      'should deal with empty named function with a single parameter with no default': {
        expected: JSON.stringify({ code: '', dependencies: { _x: '' }, name: 'something' }),
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        input: [function something(_x: unknown) {}],
      },
      'should deal with non-empty arrow function': {
        expected: JSON.stringify({ code: 'return null;', dependencies: {}, name: '' }),
        input: [() => null],
      },
      'should deal with non-empty arrow function with two parameters with a default': {
        expected: JSON.stringify({
          code: 'return y;',
          dependencies: { _x: '', y: '123' },
          name: '',
        }),
        input: [(_x: unknown, y: unknown = 123) => y],
      },
      'should deal with non-empty function': {
        expected: JSON.stringify({ code: 'return null;', dependencies: {}, name: '' }),
        input: [
          function () {
            /* something */
            return null;
            // else
          },
        ],
      },
      'should deal with non-empty function with two parameters with a default': {
        expected: JSON.stringify({
          code: 'return y;',
          dependencies: { _x: '', y: '123' },
          name: '',
        }),
        input: [
          function (_x: unknown, y: unknown = 123) {
            return y;
          },
        ],
      },
      'should deal with non-empty named function': {
        expected: JSON.stringify({ code: 'return null;', dependencies: {}, name: 'something' }),
        input: [
          function something() {
            /* something */
            return null;
            // else
          },
        ],
      },
      'should deal with non-empty named function with two parameters with a default': {
        expected: JSON.stringify({
          code: 'return y;',
          dependencies: { _x: '', y: '123' },
          name: 'something',
        }),
        input: [
          function something(_x: unknown, y: unknown = 123) {
            return y;
          },
        ],
      },
      'should throw on native function': {
        error: new Error('could not determine function body'),
        input: [isFinite],
      },
    },
    '_getDependencyPrimitive',
  );

  testAll(it, from, {
    'should deal with empty arrow function': {
      expected: new DependencyImplementation('name', '', {}),
      input: [() => {}, 'name'],
    },
    'should deal with empty arrow function with a single parameter': {
      expected: new DependencyImplementation('name', '', { x: 'x' }),
      // @ts-expect-error: 'x' is declared but its value is never read.
      input: [(x: unknown = x) => {}, 'name'],
    },
    'should deal with empty function': {
      expected: new DependencyImplementation('name', '', {}),
      input: [function () {}, 'name'],
    },
    'should deal with empty function with a single parameter': {
      expected: new DependencyImplementation('name', '', { x: 'x' }),
      // @ts-expect-error: 'x' is declared but its value is never read.
      input: [function (x: unknown = x) {}, 'name'],
    },
    'should deal with empty named function': {
      expected: new DependencyImplementation('something', '', {}),
      input: [function something() {}],
    },
    'should deal with empty named function with a single parameter': {
      expected: new DependencyImplementation('something', '', { x: 'x' }),
      // @ts-expect-error: 'x' is declared but its value is never read.
      input: [function something(x: unknown = x) {}, 'name'],
    },
    'should deal with non-empty arrow function': {
      expected: new DependencyImplementation('name', 'return null;', {}),
      input: [() => null, 'name'],
    },
    'should deal with non-empty arrow function with two parameters with default': {
      expected: new DependencyImplementation('name', '', { x: 'x', y: 'y' }),
      // @ts-expect-error: 'x' is declared but its value is never read.
      input: [(x: unknown = x, y: unknown = y) => y, 'name'],
    },
    'should deal with non-empty function': {
      expected: new DependencyImplementation('name', 'return null;', {}),
      input: [
        function () {
          /* something */
          return null;
          // else
        },
        'name',
      ],
    },
    'should deal with non-empty function with two parameters with default': {
      expected: new DependencyImplementation('name', 'return y;', {
        x: 'x',
        y: 'y',
      }),
      input: [
        // @ts-expect-error: Parameter 'x' cannot reference itself. Parameter 'y' cannot reference itself.
        function (x: unknown = x, y: unknown = y) {
          return y;
        },
        'name',
      ],
    },
    'should deal with non-empty named function': {
      expected: new DependencyImplementation('something', 'return null;', {}),
      input: [
        function something() {
          /* something */
          return null;
          // else
        },
      ],
    },
    'should deal with non-empty named function with two parameters with default': {
      expected: new DependencyImplementation('something', 'return y;', {
        x: 'x',
        y: 'y',
      }),
      input: [
        // @ts-expect-error: Parameter 'x' cannot reference itself. Parameter 'y' cannot reference itself.
        function something(x: unknown = x, y: unknown = y) {
          return y;
        },
      ],
    },
    'should throw on native function': {
      error: new Error('could not determine function body'),
      input: [isFinite],
    },
    'should throw on non-defined function': {
      error: new Error('Expected defined function'),
      input: [Atomics as any as AnyFunction], // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    'should throw with empty arrow function and no name': {
      error: new Error("identifier must adhere to '/^[a-z]\\w*$/i'"),
      input: [() => {}],
    },
    'should throw with empty function and no name': {
      error: new Error("identifier must adhere to '/^[a-z]\\w*$/i'"),
      input: [function () {}],
    },
  });

  testAll(it, create, {
    'should deal with empty dependency': {
      expected: new DependencyImplementation('name', '', {}),
      input: ['name', '', {}],
    },
  });

  testAll(it, sort, {
    'should deal with empty input': {
      expected: [],
      input: [[]],
    },
    'should deal with only installed dependencies': {
      expected: [
        new DependencyImplementation('c', '', { x: 'a' }),
        new DependencyImplementation('d', '', { x: 'b', y: 'c' }),
        new DependencyImplementation('e', '', { x: 'a', y: 'c', z: 'd' }),
      ],
      input: [
        [
          new DependencyImplementation('c', '', { x: 'a' }),
          new DependencyImplementation('d', '', { x: 'b', y: 'c' }),
          new DependencyImplementation('e', '', { x: 'a', y: 'c', z: 'd' }),
        ],
        ['a', 'b'],
      ],
    },
    'should throw with cycles': {
      error: new Error('unresolved dependencies: [a, b]'),
      input: [
        [new DependencyImplementation('a', '', { x: 'b' }), new DependencyImplementation('b', '', { x: 'a' })],
        [],
      ],
    },
  });

  describe('DependencyImplementation', (): void => {});
});
