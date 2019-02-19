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
import hamstersHabitat from './habitat';
import hamstersLogger from './logger';

export default class pool {
	
  /**
  * @constructor
  * @function constructor - Sets properties for this class
  */
  constructor() {
    this.tasks = [];
    this.threads = [];
    this.running = [];
    this.pending = [];
    this.fetchHamster = this.grabHamster;
  }

  /**
  * @function grabHamster - Adds task to queue waiting for available thread
  * @param {object} array - Provided data to execute logic on
  * @param {object} task - Provided library functionality options for this task
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} wheel - Results from select hamster wheel
  * @param {function} resolve - onSuccess method
  * @param {function} reject - onError method
  */
  addWorkToPending(array, task, persistence, wheel, resolve, reject) {
    task.queuedAt = Date.now(); //Add a timestamp for when this task was put into the pending queue, useful for performance profiling
  	this.pending.push(arguments);
  }

  /**
  * @function grabHamster - Invokes processing of next item in queue
  * @param {object} item - Task to process
  */
  processQueue(item, hamster) {
  	return this.runTask(hamster, item[0], item[1], item[2], item[3], item[4]);
  }

  /**
  * @function grabHamster - Keeps track of threads running, scoped globally and to task
  * @param {number} threadId - Id of thread
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} wheel - Results from select hamster wheel
  */
  grabHamster(threadId, habitat) {
    if(habitat.persistence) {
      return this.threads[threadId];
    }
    return this.spawnHamster();
  }

  /**
  * @function keepTrackOfThread - Keeps track of threads running, scoped globally and to task
  * @param {object} task - Provided library functionality options for this task
  * @param {number} id - Id of thread to track
  */
  keepTrackOfThread(task, id) {
    task.workers.push(id); //Keep track of threads scoped to current task
    this.running.push(id); //Keep track of all currently running threads
  }

  /**
  * @function registerTask - Adds task to execution pool based on id
  * @param {number} id - Id of task to register
  */
  registerTask(id) {
    this.tasks.push(id);
  }

  /**
  * @function scheduleTask - Adds new task to the system for execution
  * @param {object} task - Provided library functionality options for this task
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} wheel - Scaffold to execute login within
  * @param {number} maxThreads - Maximum number of threads for this client
  */
  scheduleTask(task, scope) {
    return new Promise((resolve, reject) => {
      let i = 0;
      while (i < task.threads) {
        this.hamsterWheel(i, task, scope, resolve, reject);
        i += 1;
      }
    });
  }

  /**
  * @function spawnHamsters - Spawns multiple new threads for execution
  * @param {function} wheel - Results from select hamster wheel
  * @param {number} maxThreds - Max number of threads for this client
  */
  spawnHamsters(maxThreads) {
    for (maxThreads; maxThreads > 0; maxThreads--) {
      this.threads.push(this.spawnHamster());
    }
  }

  /**
  * @function spawnHamster - Spawns a new thread for execution
  * @return {object} WebWorker - New WebWorker thread using selected scaffold
  */
  spawnHamster() {
    let newWheel = hamstersHabitat.selectHamsterWheel();
    if (hamstersHabitat.webWorker) {
      return new hamstersHabitat.SharedWorker(newWheel, 'SharedHamsterWheel');
    }
    return new hamstersHabitat.Worker(newWheel);
  }

  /**
  * @constructor
  * @function task - Constructs a new task object from provided arguments
  * @param {object} params - Provided library execution options
  * @param {function} functionToRun - Function to execute
  * @param {object} scope - Reference to main library context
  * @return {object} new Hamsters.js task
  */
  task(params, functionToRun, scope, resolve, reject) {
    this.id = scope.pool.tasks.length;
    this.count = 0;
    this.aggregate = (params.aggregate || false);
    this.workers = [];
    this.memoize = (params.memoize || false);
    this.dataType = (params.dataType ? params.dataType.toLowerCase() : null);
    this.params = params;
    // Do not modify function if we're running on the main thread for legacy fallback
    this.threads = (scope.habitat.legacy ? 1 : (params.threads || 1));
    this.hamstersJob = (scope.habitat.legacy ? functionToRun : hamstersData.prepareJob(functionToRun));
    // Determine sub array indexes, precalculate ahead of time so we can pull data only when executing on a thread 
    this.indexes = hamstersData.generateIndexes(this.params.array, this.threads);
    this.onSuccess = resolve;
    this.onError = reject;
    this.createdAt = Date.now();
    this.completedAt = null;
    this.queuedAt = null;
  }

  /**
  * @function hamsterWheel - Runs function using thread
  * @param {object} array - Provided data to execute logic on
  * @param {object} task - Provided library functionality options for this task
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} wheel - Results from select hamster wheel
  * @param {function} resolve - onSuccess method
  * @param {function} reject - onError method
  */
  runTask(hamster, index, task, scope, resolve, reject) {
  	let threadId = this.running.length;
    let hamsterFood = hamstersData.prepareMeal(index, task);
    this.registerTask(task.id);
    this.keepTrackOfThread(task, threadId);
    if(hamstersHabitat.legacy) {
      hamstersHabitat.legacyWheel(hamsterFood, resolve, reject);
    } else {
      this.trainHamster(task.count, task, hamster, scope, resolve, reject);
      hamstersData.feedHamster(hamster, hamsterFood, scope.habitat);
    }
    task.count += 1; //Increment count, thread is running
  }

  /**
  * @function hamsterWheel - Runs or queues function using threads
  * @param {object} array - Provided library functionality options for this task
  * @param {object} task - Provided library functionality options for this task
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} wheel - Results from select hamster wheel
  * @param {function} resolve - onSuccess method
  * @param {function} reject - onError method
  */
  hamsterWheel(thread, task, scope, resolve, reject) {
    let index = task.indexes[thread];
    if(scope.maxThreads === this.running.length) {
      return this.addWorkToPending(index, task, scope, resolve, reject);
    }
    let hamster = this.grabHamster(this.running.length, scope.habitat);
    this.runTask(hamster, index, task, scope, resolve, reject);
  }

  /**
  * @function returnOutputAndRemoveTask - gathers thread outputs into final result
  * @param {object} task - Provided library functionality options for this task
  * @param {function} resolve - onSuccess method
  */
  returnOutputAndRemoveTask(task, resolve) {
    let output = hamstersData.getOutput(task);
    if (task.sort) {
      output = hamstersData.sortOutput(output, task.sort);
    }
    task.completedAt = Date.now();
    let returnData = hamstersData.generateReturnObject(task, output);
    this.tasks[task.id] = null; //Clean up our task, not needed any longer
    resolve(returnData);
  }

  /**
  * @function trainHamster - Trains thread in how to behave
  * @param {number} threadId - Internal use id for this thread
  * @param {object} task - Provided library functionality options for this task
  * @param {worker} hamster - Thread to train
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} resolve - onSuccess method
  * @param {function} reject - onError method
  */
  checkQueueOrKillThread(scope, hamster) {
    if (this.pending.length !== 0) { //If work is pending, get it started before doing heavy data merge..keep cpu busy not waiting
      this.processQueue(this.pending.shift(), hamster);
    } else if (!scope.habitat.persistence && !scope.habitat.webWorker) {
      hamster.terminate(); //Kill the thread only if no items waiting to run (20-22% performance improvement observed during testing, repurposing threads vs recreating them)
    }
  }

  /**
  * @function processThreadOutput - Handles output data from thread
  * @param {object} task - Provided library functionality options for this task
  * @param {number} threadId - Internal use id for this thread
  * @param {worker} hamster - Thread to train
  * @param {function} resolve - onSuccess method
  */
  processThreadOutput(task, threadId, results, resolve) {
    hamstersData.mergeOutputData(task, threadId, results); //Merge results into data array as the thread returns, merge immediately don't wait
    if (task.workers.length === 0 && task.count === task.threads) { 
      this.returnOutputAndRemoveTask(task, resolve);
    }
  }

  /**
  * @function trainHamster - Trains thread in how to behave
  * @param {number} threadId - Internal use id for this thread
  * @param {object} task - Provided library functionality options for this task
  * @param {worker} hamster - Thread to train
  * @param {function} resolve - onSuccess method
  * @param {function} reject - onError method
  */
  trainHamster(threadId, task, hamster, scope, resolve, reject) {
    let pool = this;
    // Handle successful response from a thread
    function onThreadResponse(message) {
      let results = message.data;
      pool.running.splice(pool.running.indexOf(threadId), 1); //Remove thread from running pool
    	task.workers.splice(task.workers.indexOf(threadId), 1); //Remove thread from task running pool
      pool.checkQueueOrKillThread(scope, hamster);
      pool.processThreadOutput(task, threadId, results, resolve);
    }
    // Handle error response from a thread
    function onThreadError(error) {
      hamstersLogger.errorFromThread(error, reject);
    }
    // Register on message/error handlers
    if (hamstersHabitat.webWorker) {
      hamster.port.onmessage = onThreadResponse;
      hamster.port.onmessageerror = onThreadError;
      hamster.port.onerror = onThreadError;
    } else {
      hamster.onmessage = onThreadResponse;
      hamster.onmessageerror = onThreadError;
      hamster.onerror = onThreadError;
    }
  }
}
