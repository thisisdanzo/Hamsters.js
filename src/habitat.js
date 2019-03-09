/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/***********************************************************************************
* Title: Hamsters.js                                                               *
* Description: 100% Vanilla Javascript Multithreading & Parallel Execution Library *
* Author: Austin K. Smith                                                          *
* Contact: austin@asmithdev.com                                                    *  
* Copyright: 2015 Austin K. Smith - austin@asmithdev.com                           * 
* License: Artistic License 2.0                                                    *
***********************************************************************************/

'use strict';

import { generateWorkerBlob } from './data';
/**
* @constructor
* @function constructor - Sets properties for this class
*/
export let habitat = {
  debug: false,
  importScripts: null,
  persistence: true,
  legacy: isLegacyEnvironment(),
  browser: isBrowser(),
  webWorker: isWebWorker(),
  node: isNode(),
  reactNative: isReactNative(),
  shell: isShell(),
  transferrable: supportsTransferrableObjects(),
  atomics: supportsAtomicOperations(),
  proxies: supportsProxies(),
  ie: isInternetExplorer,
  logicalThreads: determineGlobalThreads(),
  Worker: locateWorkerObject(),
  sharedWorker: locateSharedWorkerObject()
};

/**
* @function determineGlobalThreads - Determines max number of threads to use
*/
export function determineGlobalThreads() {
  let max = 4;
  if(typeof navigator !== 'undefined') {
    if(typeof navigator.hardwareConcurrency !== 'undefined') {
      max = navigator.hardwareConcurrency;
    }
    if(max > 20 && navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
      max = 20;
    }
  }
  return max;
}

/**
* @function locateWorkerObject - Attempts to find a global Worker object
*/
export function locateWorkerObject() {
  return typeof Worker !== 'undefined' ? Worker : false;
}

/**
* @function locateSharedWorkerObject - Attempts to find a global SharedWorker object
*/
export function locateSharedWorkerObject() {
  return typeof SharedWorker !== 'undefined' ? SharedWorker : false;
}

/**
* @function isBrowser - Detects if execution environment is a browser
*/
export function isBrowser() {
  return typeof window === "object";
}

/**
* @function isInternetExplorer - Detects if execution environment is internet explorer
*/
export function isInternetExplorer(version) {
  return (new RegExp('msie' + (!isNaN(version) ? ('\\s'+version) : ''), 'i').test(navigator.userAgent));
}

/**
* @function isNode - Detects if execution environment is node.js
*/
export function isNode() {
  return typeof process === "object" && typeof require === "function" && !isWebWorker() && !isBrowser();
}

/**
* @function isWebWorker - Detects if execution environment is a webworker
*/
export function isWebWorker() {
  return typeof importScripts === "function";
}

/**
* @function isReactNative - Detects if execution environment is reactNative
*/
export function isReactNative() {
  return !isNode() && typeof global === 'object' && !isBrowser();
}

/**
* @function isShell - Detects if execution environment is a shell
*/
export function isShell() {
  return isBrowser() && !isNode() && !isWebWorker() && !isReactNative();
}

/**
* @function isLegacyEnvironment - Detects if execution environment is a legacy environment
*/
export function isLegacyEnvironment() {
  let isLegacy = false;
  // Force legacy mode for known devices that don't support threading
  if (isBrowser() && !isReactNative()) {
    isLegacy = isLegacyDevice();
  }
  // Detect sharedWorker support for use within webworkers
  if (isWebWorker() && typeof SharedWorker !== 'undefined') {
    isLegacy = !supportsSharedWorkers();
  }
  return isLegacy || !!!locateWorkerObject();
}

export function isLegacyDevice() {
  let legacyDevice = false;
  let userAgent = navigator.userAgent;
  let lacksWorkerSupport = (typeof Worker === 'undefined');
  let legacyAgents = ['Kindle/3.0', 'Mobile/8F190', 'IEMobile'];
  if (lacksWorkerSupport || legacyAgents.indexOf(userAgent) !== -1) {
    legacyDevice = true;
  }
  return legacyDevice;
}

export function supportsSharedWorkers() {
  let supports = false;
  try {
    let workerBlob = generateWorkerBlob();
    let SharedHamster = new SharedWorker(workerBlob, 'SharedHamsterWheel');
    supports = true;
  } catch (e) {
    supports = false;
  }
  return supports;
}

/**
* @function supportsTransferrableObjects - Detects if execution environment supports typed arrays
*/
export function supportsTransferrableObjects() {
  return typeof Uint8Array !== 'undefined';
}

/**
* @function supportsAtomicOperations - Detects if execution environment supports shared array buffers
*/
export function supportsAtomicOperations() {
  return typeof SharedArrayBuffer !== 'undefined';
}

/**
* @function supportsProxies - Detects if execution environment supports proxy objects
*/
export function supportsProxies() {
  return typeof Proxy !== 'undefined';
}