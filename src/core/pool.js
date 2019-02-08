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

class pool {
	
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
  * @function prepareMeal - Prepares message to send to a thread and invoke execution
  * @param {object} threadArray - Provided data to execute logic on
  * @param {object} task - Provided library functionality options for this task
  * @return {object} hamsterFood - Prepared message to send to a thread
  */
  prepareMeal(threadArray, task) {
    let hamsterFood = {
    	array: threadArray
    };
    for (var key in task.params) {
      if (task.params.hasOwnProperty(key) && ['array', 'threads'].indexOf(key) === -1) {
        hamsterFood[key] = task.params[key];
      }
    }
    return hamsterFood;
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
    let array = scope.data.getSubArrayUsingIndex(task.params.array, index);
    let hamsterFood = this.prepareMeal(array, task);
    this.registerTask(task.id);
    this.keepTrackOfThread(task, threadId);
    if(scope.habitat.legacy) {
      scope.habitat.legacyWheel(hamsterFood, resolve, reject);
    } else {
      this.trainHamster(task.count, task, hamster, scope, resolve, reject);
      scope.data.feedHamster(hamster, hamsterFood, scope.habitat);
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
    let output = hamstersData.getOutput(task, hamstersHabitat.transferrable);
    if (task.sort) {
      output = hamstersData.sortOutput(output, task.sort);
    }
    this.tasks[task.id] = null; //Clean up our task, not needed any longer
    resolve({
      data: output
    });
  }

  /**
  * @function trainHamster - Merges output data into data array, using indexes
  * @param {object} task - Provided library functionality options for this task
  * @param {number} threadId - Internal use id for this thread
  * @param {object} results - Message object containing results from thread
  */
  mergeOutputData(task, scope, threadId, results) {
    var data = scope.habitat.reactNative ? JSON.parse(results.data) : results.data;
    var arrayIndex = task.indexes[threadId].start; //Starting value index for subarray to merge
    for (var i = 0; i < data.length; i++) {
      task.params.array[arrayIndex] = data[i];
      arrayIndex++;
    }
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
  trainHamster(threadId, task, hamster, scope, resolve, reject) {
    let pool = this;
    // Handle successful response from a thread
    function onThreadResponse(message) {
      let results = message.data;
      pool.running.splice(pool.running.indexOf(threadId), 1); //Remove thread from running pool
    	task.workers.splice(task.workers.indexOf(threadId), 1); //Remove thread from task running pool
      if (pool.pending.length !== 0) { //If work is pending, get it started before doing heavy data merge..keep cpu busy not waiting
        pool.processQueue(pool.pending.shift(), hamster);
      } else if (!scope.habitat.persistence && !scope.habitat.webWorker) {
        hamster.terminate(); //Kill the thread only if no items waiting to run (20-22% performance improvement observed during testing, repurposing threads vs recreating them)
      }
      pool.mergeOutputData(task, scope, threadId, results); //Merge results into data array as the thread returns, merge immediately don't wait
      if (task.workers.length === 0 && task.count === task.threads) { 
        pool.returnOutputAndRemoveTask(task, resolve);
      }
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
}

var hamsterPool = new pool();

if(typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = hamsterPool;
}
