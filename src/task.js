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

export default class task {

	/**
	* @constructor
	* @function task - Constructs a new task object from provided arguments
	* @param {object} params - Provided library execution options
	* @param {function} functionToRun - Function to execute
	* @return {object} new Hamsters.js task
	*/
	constructor(params, functionToRun, resolve, reject) {
		this.id = pool.tasks.length;
	    this.count = 0;
	    this.aggregate = (params.aggregate || false);
	    this.workers = [];
	    this.memoize = (params.memoize || false);
	    this.dataType = (params.dataType ? params.dataType.toLowerCase() : null);
	    this.params = params;
	    // Do not modify function if we're running on the main thread for legacy fallback
	    this.threads = (habitat.legacy ? 1 : (params.threads || 1));
	    this.hamstersJob = (habitat.legacy ? functionToRun : data.prepareJob(functionToRun));
	    // Determine sub array indexes, precalculate ahead of time so we can pull data only when executing on a thread 
	    this.indexes = data.generateIndexes(this.params.array, this.threads);
	    this.onSuccess = resolve;
	    this.onError = reject;
	    this.createdAt = Date.now();
	    this.completedAt = null;
	    this.queuedAt = null;
	}

}