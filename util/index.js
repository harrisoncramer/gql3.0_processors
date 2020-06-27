import randomUser from "random-useragent";
import rp from "request-promise";

export const getRandom = (bottom, top) => {
  return function () {
    return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
  };
};

export const asyncForEach = async (array, callback) => {
  let results = [];
  for (let index = 0; index < array.length; index++) {
    let result = await callback(array[index]);
    results.push(result);
  }
  return results;
};

const timeoutRequest = (signal, url, options) =>
  new Promise((res, rej) => {
    let proxiedRequest = rp.defaults({ ...options });

    // Make request to url, and pass result to promise
    proxiedRequest
      .get(url)
      .then((result) => res(result))
      .catch((err) => rej(err));

    // If signal times out, reject the promise
    signal.catch((err) => {
      rej(err);
    });
  });

const cancellableSignal = (ms, url) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms on ${url}`));
    }, ms);
  });
};

export const requestPromiseRetry = async (url, n) => {
  let userAgentString = randomUser.getRandom();
  let options = {
    headers: { "User-Agent": userAgentString },
  };

  try {
    // Create promise that rejects after five seconds, pass to request for proxies.
    const signal = cancellableSignal(process.env.LATENCY, url);
    let res = await timeoutRequest(signal, url, options);
    return res;
  } catch (err) {
    // Upon timeout, if number of attempts has run out then throw error, otherwise retry w/ n-1
    if (n === 1) {
      throw err;
    } else {
      return await requestPromiseRetry(url, n - 1);
    }
  }
};
