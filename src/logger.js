/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/***********************************************************************************
* Title: Hamsters.js                                                               *
* Description: 100% Vanilla Javascript Multithreading & Parallel Execution Library *
* Author: Austin K. Smith                                                          *
* Contact: austin@asmithdev.com                                                    *  
* Copyright: 2015 Austin K. Smith - austin@asmithdev.com                           * 
* License: Artistic License 2.0                                                    *
***********************************************************************************/

import { version } from './version';

'use strict';

export const logBook = {
  error: [], 
  warning: [], 
  info: []
};

export function searchLogBook(searchString, eventType) {
  let finalResults = [];
  if(eventType) {
    finalResults = findStringInLogBook(logBook[eventType], searchString);
  } else {
    finalResults = findStringInLogBookAllTypes(logBook, searchString);
  }
  return {
    total: finalResults.length,
    results: finalResults
  };
};

export function infoLog(message) {
  let timeStampedMessage = generateTimeStampedMessage('Info', message);
  console.info(timeStampedMessage);
};

export function warningLog(message) {
  let timeStampedMessage = generateTimeStampedMessage('Warning', message);
  console.warn(timeStampedMessage);
};

export function errorLog(message, reject) {
  let timeStampedMessage = generateTimeStampedMessage('Error', message);
  console.error(timeStampedMessage);
  if(reject) {
    reject(timeStampedMessage);
  } else {
    return timeStampedMessage;
  }
};

export function errorFromThread(error, reject) {
  let errorMessage = `#${error.lineno} in ${error.filename}: ${error.message}`;
  errorLog(errorMessage, reject);
};

export function generateTimeStampedMessage(type, message) {
  let record = `Hamsters.js v${version} ${type}: ${message} @ ${Date.now()}`
  saveToLogBook(type.toLowerCase(), record);
  return record;
};

export function saveToLogBook(eventType, message) {
  logBook[eventType].push(message);
};

export function fetchLogBook(eventType) {
  if(eventType) {
    return logBook[eventType];
  }
  return logBook;
};

export function findStringInLogBook(logBookEntries, searchString) {
  let searchResults = [];
  let i = 0;
  for (i; i < logBookEntries.length; i++) {
    if(logBookEntries[i].indexOf(searchString) !== -1) {
      searchResults.push(logBookEntries[i]);
    }
  }
  return searchResults;
};

export function findStringInLogBookAllTypes(logBook, searchString) {
  let searchResults = [];
  let key, eventTypeResults, tmpEntries = null;
  for(key in logBook) {
    if(logBook.hasOwnProperty(key)) {
      tmpEntries = logBook[key];
      eventTypeResults = findStringInLogBook(tmpEntries, searchString);
      for (var i = eventTypeResults.length - 1; i >= 0; i--) {
        searchResults.push(eventTypeResults[i])
      }
    }
  }
  return searchResults;
};
