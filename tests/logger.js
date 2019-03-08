/* jshint esversion: 6, curly: true, eqeqeq: true, forin: true */

/***********************************************************************************
* Title: Hamsters.js                                                               *
* Description: 100% Vanilla Javascript Multithreading & Parallel Execution Library *
* Author: Austin K. Smith                                                          *
* Contact: austin@asmithdev.com                                                    *  
* Copyright: 2015 Austin K. Smith - austin@asmithdev.com                           * 
* License: Artistic License 2.0                                                    *
***********************************************************************************/

import {
  infoLog, 
  warningLog, 
  errorLog,
  logBook,
  searchLogBook,
  generateTimeStampedMessage
} from '../src/logger';

describe("Hamsters Logger", () => {

  it("LogBook should be an object", () => {
    expect(typeof logBook).toEqual('object');
  });

  it("LogBook Errors should be a non empty array", () => {
    expect(typeof logBook.error).toEqual('object');
    expect(Array.isArray(logBook.error)).toEqual(true);
    expect(logBook.error.length).toEqual(1);
  });

  it("LogBook Warning should be an empty array", () => {
    expect(typeof logBook.warning).toEqual('object');
    expect(Array.isArray(logBook.warning)).toEqual(true);
    expect(logBook.warning.length).toEqual(0);
  });

  it("LogBook Info should be an empty array", () => {
    expect(typeof logBook.info).toEqual('object');
    expect(Array.isArray(logBook.info)).toEqual(true);
    expect(logBook.info.length).toEqual(0);
  });

  it("LogBook Error should save to error array", () => {
    expect(logBook.error.length).toEqual(1);
    errorLog('Pay no mind to the hamster behind the curtain');
    expect(logBook.error.length).toEqual(2);
  });

  it("LogBook Info should save to info array", () => {
    expect(logBook.info.length).toEqual(0);
    infoLog('The hamster we need but dont deserve');
    expect(logBook.info.length).toEqual(1);
  });

  it("LogBook Warning should save to warning array", () => {
    expect(logBook.warning.length).toEqual(0);
    warningLog('One hamster to rule them all');
    expect(logBook.warning.length).toEqual(1);
  });

  it("CreateAndSaveStampedMessage should generate a time stamped message for info type", () => {
    let timeStampedMessage = generateTimeStampedMessage('info', 'One hamster at a time');
    expect(timeStampedMessage).toContain('Hamsters.js');
    expect(timeStampedMessage).toContain('info');
    expect(timeStampedMessage).toContain('One hamster at a time');
  });

  it("CreateAndSaveStampedMessage should generate a time stamped message for warning type", () => {
    let timeStampedMessage = generateTimeStampedMessage('warning', 'Some hamsters do an awful lot of talking without a brain');
    expect(timeStampedMessage).toContain('Hamsters.js');
    expect(timeStampedMessage).toContain('warning');
    expect(timeStampedMessage).toContain('Some hamsters do an awful lot of talking without a brain');
  });

  it("CreateAndSaveStampedMessage should generate a time stamped message for error type", () => {
    let timeStampedMessage = generateTimeStampedMessage('error', 'Hamsters rule the world');
    expect(timeStampedMessage).toContain('Hamsters.js');
    expect(timeStampedMessage).toContain('error');
    expect(timeStampedMessage).toContain('Hamsters rule the world');
  });

  it("Search log book should return results for error event", () => {
    let savedMessageObject = searchLogBook('Hamsters rule', 'error');
    expect(typeof savedMessageObject).toEqual('object');
    expect(savedMessageObject.total).toEqual(1);
    expect(savedMessageObject.results[0]).toContain('Hamsters rule the world');
  });

  it("Search log book should return results for info event", () => {
    let savedMessageObject = searchLogBook('One hamster', 'info');
    expect(typeof savedMessageObject).toEqual('object');
    expect(savedMessageObject.total).toEqual(1);
    expect(savedMessageObject.results[0]).toContain('One hamster at a time');
  });

  it("Search log book should return results for warning event", () => {
    let savedMessageObject = searchLogBook('talking without a brain', 'warning');
    expect(typeof savedMessageObject).toEqual('object');
    expect(savedMessageObject.total).toEqual(1);
    expect(savedMessageObject.results[0]).toContain('Some hamsters do an awful lot of talking without a brain');
  });

  it("Search log book should return results without error event", () => {
    let savedMessageObject = searchLogBook('Hamsters rule');
    expect(typeof savedMessageObject).toEqual('object');
    expect(savedMessageObject.total).toEqual(1);
    expect(savedMessageObject.results[0]).toContain('Hamsters rule the world');
  });

  it("Search log book should return results without info event", () => {
    let savedMessageObject = searchLogBook('at a time');
    expect(typeof savedMessageObject).toEqual('object');
    expect(savedMessageObject.total).toEqual(1);
    expect(savedMessageObject.results[0]).toContain('One hamster at a time');
  });

  it("Search log book should return results without warning event", () => {
    let savedMessageObject = searchLogBook('talking without a brain');
    expect(typeof savedMessageObject).toEqual('object');
    expect(savedMessageObject.total).toEqual(1);
    expect(savedMessageObject.results[0]).toContain('Some hamsters do an awful lot of talking without a brain');
  });

});