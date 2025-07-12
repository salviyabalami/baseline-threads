/**
 * Name: Salviya Balami
 * CS132 Spring 2025
 * Date: June 14th, 2025
 * 
 * This is the faq.js file for Baseline Threads. It handles the dynamic
 * rendering of frequently asked questions by retrieving data from the server 
 * and returning it for viewing.
 */

"use strict";

(function () {
  /** Base path for backend API endpoints. */
  const BASE_URL = "/baseline";

  /**
   * Initializes the FAQ view after the DOM has loaded.
   * Fetches FAQ data and displays each question/answer pair.
   */
  window.addEventListener("DOMContentLoaded", () => {
    fetch(`${BASE_URL}/faqs`)
      .then(checkStatus)
      .then(res => res.json())
      .then(displayFAQs)
      .catch(handleError);
  });

  /**
   * Renders all FAQs as article cards on the page.
   * @param {Object[]} faqs - Array of FAQ objects containing question and answer text.
   */
  function displayFAQs(faqs) {
    const container = id("faq-container");

    faqs.forEach(faq => {
      const item = gen("article");
      item.classList.add("faq-item");

      const question = gen("h2");
      question.textContent = faq.question;

      const answer = gen("p");
      answer.textContent = faq.answer;

      item.appendChild(question);
      item.appendChild(answer);
      container.appendChild(item);
    });
  }
})();
