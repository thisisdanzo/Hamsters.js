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

export default class message {

  /**
  * @constructor
  * @function constructor - Sets properties for this class
  */
  constructor() {
    this.processDataType = this.processDataType;
    this.prepareJob = this.prepareFunction;
    this.prepareMeal = this.prepareMessage;
    this.feedHamster = this.messageWorker;
  }

  /**
  * @function messageWorker - Prepares message to send to thread
  * @param {worker} hamster - Thread to message
  * @param {object} hamsterFood - Message to send to thread
  */  
  messageWorker(hamster, hamsterFood) {
    if(hamstersHabitat.reactNative) {
      return hamster.postMessage(JSON.stringify(hamsterFood));
    }
    if (hamstersHabitat.ie10) {
      return hamster.postMessage(hamsterFood);
    }
    if (hamstersHabitat.webWorker) {
      return hamster.port.postMessage(hamsterFood);
    }
    let buffers = this.prepareTransferBuffers(hamsterFood, hamstersHabitat.transferrable);
    return hamster.postMessage(hamsterFood, buffers);
  }

  /**
  * @function prepareTransferBuffers - Prepares transferrable buffers for faster message passing
  * @param {object} hamsterFood - Message to send to thread
  */
  prepareTransferBuffers(hamsterFood, transferrable) {
    let buffers = [];
    let key = null;
    if(transferrable) {
      for (key of Object.keys(hamsterFood)) {
        if(hamsterFood[key].buffer) {
          buffers.push(hamsterFood[key].buffer);
        } else if(Array.isArray(hamsterFood[key]) && typeof ArrayBuffer !== 'undefined') {
          buffers.push(new ArrayBuffer(hamsterFood[key]));
        }
      }
    }
    return buffers;
  }

  /**
  * @function prepareMeal - Prepares message to send to a thread and invoke execution
  * @param {object} threadArray - Provided data to execute logic on
  * @param {object} task - Provided library functionality options for this task
  * @return {object} hamsterFood - Prepared message to send to a thread
  */
  prepareMessage(index, task) {
    let threadArray = data.getSubArrayUsingIndex(task.params.array, index);
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
  * @function prepareFunction - Prepares transferrable buffers for faster message passing
  * @param {function} functionBody - Message to send to thread
  */
  prepareFunction(functionBody) {
    functionBody = String(functionBody);
    if (!hamstersHabitat.webWorker) {
      let startingIndex = (functionBody.indexOf("{") + 1);
      let endingIndex = (functionBody.length - 1);
      return functionBody.substring(startingIndex, endingIndex);
    }
    return functionBody;
  }

}
