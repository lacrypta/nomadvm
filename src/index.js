'use strict';

// TODO: ADD MISSING SHIMS
// TODO: ANALYZE Iterator AND OTHER HIDDEN OBJECTS

import { Dependency } from './dependency.js';
import { NomadVM, NomadVMNamespace } from './nomadvm.js';

/**
 * The type of a Dependency primitive object.
 *
 * @typedef DependencyObject
 * @type {object}
 * @global
 * @property {string} name - Dependency name.
 * @property {string} code - Dependency function source code.
 * @property {Map<string, string>} dependencies - Dependency's dependencies, as a mapping from imported name to dependency name.
 */

/**
 * The type of a method injector.
 *
 * @callback MethodInjector
 * @global
 * @param {Map<string, Function>} methodMap - A map from method name to a {@link Function} that will effectively forward the call to it.
 * @returns {void}
 */

/* exported DependencyObject */
/* exported MethodInjector */
/* exported NomadVM */
/* exported Validation */

export { Dependency, NomadVM, NomadVMNamespace };
