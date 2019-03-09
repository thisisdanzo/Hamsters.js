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

import hamstersData from './data';
import { habitat } from './habitat';

export let pool {
  tickInterval: 4, //Default is 4ms (HTML5 spec minimum)
  tasks: [],
  threads: [];
  running: [],
  pending: []
};

/**
* @function spawnHamsters - Spawns multiple new threads for execution
* @param {function} wheel - Results from select hamster wheel
* @param {number} maxThreds - Max number of threads for this client
*/
export function createThreads(maxThreads) {
  for (maxThreads; maxThreads > 0; maxThreads--) {
    pool.threads.push(createThread());
  }
};

/**
* @function spawnHamster - Spawns a new thread for execution
* @return {object} WebWorker - New WebWorker thread using selected scaffold
*/
export function createThread() {
  let newWheel = selectHamsterWheel();
  if (habitat.webWorker) {
    return new habitat.SharedWorker(newWheel, 'SharedHamsterWheel');
  }
  return new habitat.Worker(newWheel);
};

/**
* @function grabHamster - Keeps track of threads running, scoped globally and to task
* @param {number} threadId - Id of thread
* @param {boolean} persistence - Whether persistence mode is enabled or not
* @param {function} wheel - Results from select hamster wheel
*/
export function getThread(threadId) {
  if(habitat.persistence) {
    return pool.threads[threadId];
  }
  return pool.spawnHamster();
};

/**
* @function scheduleTask - Determines which scaffold to use for proper execution for various environments
*/
export function selectHamsterWheel() {
  if(habitat.reactNative) {
    return './scaffold/reactNative.js';
  }
  if(habitat.webWorker) {
    return './scaffold/sharedWorker.js';
  }
  return './scaffold/regular.js';
};

/**
* @function returnOutputAndRemoveTask - gathers thread outputs into final result
* @param {object} task - Provided library functionality options for this task
* @param {function} resolve - onSuccess method
*/
export function returnOutputAndRemoveTask(task, resolve) {
  let output = getOutput(task);
  if (task.sort) {
    output = sortOutput(output, task.sort);
  }
  task.completedAt = Date.now();
  let returnData = generateReturnObject(task, output);
  this.tasks[task.id] = null; //Clean up our task, not needed any longer
  resolve(returnData);
};

/**
* @function processThreadOutput - Handles output data from thread
* @param {object} task - Provided library functionality options for this task
* @param {number} threadId - Internal use id for this thread
* @param {worker} hamster - Thread to train
* @param {function} resolve - onSuccess method
*/
export function processThreadOutput(task, threadId, results, resolve) {
  mergeOutputData(task, threadId, results); //Merge results into data array as the thread returns, merge immediately don't wait
  if (task.workers.length === 0 && task.count === task.threads) { 
    returnOutputAndRemoveTask(task, resolve);
  }
};

/**
* @function keepTrackOfThread - Keeps track of threads running, scoped globally and to task
* @param {object} task - Provided library functionality options for this task
* @param {number} id - Id of thread to track
*/
export function checkQueue() {
  if (this.pending.length !== 0 && pool.running !== maxThreads) { //If work is pending and we have an available thread, get it started
    this.processQueuedItem(this.pending.shift());
  }
};

/**
* @function keepTrackOfThread - Keeps track of threads running, scoped globally and to task
* @param {object} task - Provided library functionality options for this task
* @param {number} id - Id of thread to track
*/
export function keepTrackOfThread(task, id) {
  task.workers.push(id); //Keep track of threads scoped to current task
  this.running.push(id); //Keep track of all currently running threads
};

/**
* @function registerTask - Adds task to execution pool based on id
* @param {number} id - Id of task to register
*/
export function registerTask(id) {
  this.tasks.push(id);
};

/**
* @function grabHamster - Adds task to queue waiting for available thread
* @param {object} array - Provided data to execute logic on
* @param {object} task - Provided library functionality options for this task
* @param {boolean} persistence - Whether persistence mode is enabled or not
* @param {function} wheel - Results from select hamster wheel
* @param {function} resolve - onSuccess method
* @param {function} reject - onError method
*/
export function addToPending(array, task, persistence, wheel, resolve, reject) {
  task.queuedAt = Date.now(); //Add a timestamp for when this task was put into the pending queue, useful for performance profiling
  this.pending.push(arguments);
};

/**
* @function grabHamster - Invokes processing of next item in queue
* @param {object} taskItem - Work to be processed
*/
export function processQueuedItem(taskItem) {
    return this.runTask(hamster, taskItem);
};

/**
* @function tick - Loops every N milliseconds checking for pending items to complete
*/
export function tick() {
  setInterval(function() {
    checkQueue();
  }, pool.tickInterval);
};