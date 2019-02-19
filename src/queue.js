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

export default class queue {

	/**
	* @constructor
	*/
	constructor(interval) {
		this.tickInterval = interval || 4; //Default is 4ms (HTML5 spec minimum)
		this.running = [];
		this.pending = [];
	}

	checkQueue() {
		if (this.pending.length !== 0) { //If work is pending, get it started before doing heavy data merge..keep cpu busy not waiting
			this.processQueuedItem(this.pending.shift());
		}
	}

	/**
	* @function grabHamster - Invokes processing of next item in queue
	* @param {object} taskItem - Work to be processed
	*/
	processQueuedItem(taskItem) {
  		return this.runTask(hamster, taskItem);
	}

	/**
	* @function tick - Loops every N milliseconds checking for pending items to complete
	*/
	tick() {
		setInterval(function() {
			this.checkQueue();
		}, this.tickInterval);
	}

}