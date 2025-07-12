/**
 * Name: Salviya Balami
 * CS132 Spring 2025
 * Date: June 14th, 2025
 * 
 * This is the cart.js file for Baseline Threads. It handles all interactivity
 * on the Cart page, including loading cart items from localStorage, displaying
 * them using the player card format, removing items, and processing purchases.
 */

"use strict";

(function () {
  /** Base path for all backend API routes. */
  const BASE_URL = "https://baseline-threads-backend.onrender.com/baseline";

  /**
   * Initializes the Cart page after DOM content is loaded.
   * Loads cart items and binds the purchase button.
   */
  window.addEventListener("DOMContentLoaded", () => {
    loadCartItems();
    id("purchase-all-btn").addEventListener("click", purchaseAllItems);
  });

  /**
   * Retrieves the current cart from localStorage.
   * @returns {number[]} An array of jersey IDs in the cart.
   */
  function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
  }

  /**
   * Loads and displays all jersey items currently in the cart.
   * If the cart is empty, displays a placeholder message.
   */
  function loadCartItems() {
    const cart = getCart();
    if (cart.length === 0) {
      id("cart-items").textContent = "Your cart is empty.";
      return;
    }

    fetch(`${BASE_URL}/jerseys`)
      .then(checkStatus)
      .then(res => res.json())
      .then(data => {
        const items = data.filter(j => cart.includes(j.id));
        renderCartItems(items);
      })
      .catch(handleError);
  }

  /**
   * Renders an array of player jersey cards to the cart view.
   * Adds event listeners to each remove button.
   * @param {Object[]} items - Array of jersey objects to display.
   */
  function renderCartItems(items) {
    const section = id("cart-items");
    section.innerHTML = "";
    section.classList.add("cart-grid");

    items.forEach(player => {
      const card = gen("div");
      card.classList.add("player-card");

      const img = gen("img");
      img.src = player.img;
      img.alt = player.name;

      const text = gen("div");
      text.classList.add("card-text");
      text.innerHTML = `
        <h3>${player.name}</h3>
        <p>${player.team} - $${player.price}</p>
        <button class="remove-btn" data-id="${player.id}">Remove</button>
      `;

      card.appendChild(img);
      card.appendChild(text);
      section.appendChild(card);
    });

    qsa(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-id"));
        removeFromCart(id);
        loadCartItems();
      });
    });
  }

  /**
   * Removes a specific item from the cart in localStorage.
   * @param {number} id - The jersey ID to remove.
   */
  function removeFromCart(id) {
    const cart = getCart();
    const updated = cart.filter(cid => cid !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  /**
   * Sends POST requests to purchase all items in the cart.
   * If successful, clears the cart and displays a confirmation.
   */
  function purchaseAllItems() {
    const cart = getCart();
    if (cart.length === 0) return;

    const button = id("purchase-all-btn");
    button.disabled = true;
    button.textContent = "Processing...";

    Promise.all(cart.map(id =>
      fetch(`${BASE_URL}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
    ))
      .then(() => {
        localStorage.removeItem("cart");
        id("cart-items").innerHTML = "<p style='text-align:center;'>Purchase complete! Jerseys on the way.</p>";
        button.remove();
      })
      .catch(err => {
        console.error("Purchase failed:", err);
        alert("Something went wrong during purchase.");
        button.disabled = false;
        button.textContent = "Purchase All";
      });
  }

})();
