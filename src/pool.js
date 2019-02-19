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
    this.threads = [];
    this.fetchHamster = this.getThread;
    this.spawnHamsters = this.createThreads;
    this.spawnHamster = this.createThread;
  }

    /**
  * @function spawnHamsters - Spawns multiple new threads for execution
  * @param {function} wheel - Results from select hamster wheel
  * @param {number} maxThreds - Max number of threads for this client
  */
  createThreads(maxThreads) {
    for (maxThreads; maxThreads > 0; maxThreads--) {
      this.threads.push(createThread());
    }
  }

  /**
  * @function spawnHamster - Spawns a new thread for execution
  * @return {object} WebWorker - New WebWorker thread using selected scaffold
  */
  createThread() {
    let newWheel = hamstersHabitat.selectHamsterWheel();
    if (hamstersHabitat.webWorker) {
      return new hamstersHabitat.SharedWorker(newWheel, 'SharedHamsterWheel');
    }
    return new hamstersHabitat.Worker(newWheel);
  }

  /**
  * @function grabHamster - Keeps track of threads running, scoped globally and to task
  * @param {number} threadId - Id of thread
  * @param {boolean} persistence - Whether persistence mode is enabled or not
  * @param {function} wheel - Results from select hamster wheel
  */
  getThread(threadId, habitat) {
    if(habitat.persistence) {
      return this.threads[threadId];
    }
    return this.spawnHamster();
  }

}
