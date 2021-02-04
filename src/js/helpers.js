import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

// contains functions that are reused over and over across the project

// will return a new promise that will reject after X seconds
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // the data wanted to be send
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    // it is ok to use await because this is an async function, running in background, and won't stop page loading
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // fetch returns response with json method, which return another promise
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    // console.log(res, data);

    // this data is going to be the resolve value of the promise that getJSON function returns. promises have resolve and reject values
    return data;
  } catch (err) {
    // propagating the error way down from one async function to another
    throw err;
  }
};

/*
export const getJSON = async function (url) {
  try {
    const fetchPro = fetch(url);

    // it is ok to use await because this is an async function, running in background, and won't stop page loading
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // fetch returns response with json method, which return another promise
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    // console.log(res, data);

    // this data is going to be the resolve value of the promise that getJSON function returns. promises have resolve and reject values
    return data;
  } catch (err) {
    // propagating the error way down from one async function to another
    throw err;
  }
};

export const sendJSON = async function (url, uploadData) {
  try {
    // fetch request
    const fetchPro = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // the data wanted to be send
      body: JSON.stringify(uploadData),
    });

    // it is ok to use await because this is an async function, running in background, and won't stop page loading
    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);

    // fetch returns response with json method, which return another promise
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    // console.log(res, data);

    // this data is going to be the resolve value of the promise that getJSON function returns. promises have resolve and reject values
    return data;
  } catch (err) {
    // propagating the error way down from one async function to another
    throw err;
  }
};
*/
