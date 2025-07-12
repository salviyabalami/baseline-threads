/**
 * CS 132
 * Provided global DOM accessor aliases.
 * These are the ONLY functions that should be global in your submissions.
 */

/**
 * Returns the first element that matches the given CSS selector.
 * @param {string} selector - CSS query selector string.
 * @returns {object} first element matching the selector in the DOM tree (null if none)
 */
function qs(selector) {
  return document.querySelector(selector);
}

/**
 * Returns the array of elements that match the given CSS selector.
 * @param {string} selector - CSS query selector
 * @returns {object[]} array of DOM objects matching the query (empty if none).
 */
function qsa(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Returns a new element with the given tagname
 * @param {string} tagName - name of element to create and return
 * @returns {object} new DOM element with the given tagname
 */
function gen(tagName) {
  return document.createElement(tagName);
}

/**
 * Returns the DOM element with the given ID.
 * @param {string} tagName - The id of the element to retrieve.
 * @returns {object} DOM element with the specified ID (null if not found).
 */
function id(tagName) {
  return document.getElementById(tagName);
}

/**
 * Capitalizes the first letter of the provided word.
 * @param {string} word - The word to capitalize.
 * @returns {string} Word with the first character in uppercase.
 */
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Checks the response from a fetch call and throws an error if not successful.
 * @param {Response} response - Response object returned from fetch().
 * @returns {Response} The same response if status is OK.
 * @throws {Error} If the response status is not in the 200–299 range.
 */
function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response;
}

/**
 * Displays a friendly error message in the #feedback section,
 * and optionally logs the actual error to the console (for dev).
 * 
 * @param {Error} err - The error object caught in a fetch().catch()
 */
function handleError(err) {
  const feedback = id("feedback");
  if (feedback) {
    feedback.textContent = "Something went wrong. Please try again.";
  }

  // For development only — remove/comment out for final submission
  console.error("ERROR:", err);
}

