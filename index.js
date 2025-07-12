/**
 * Name: Salviya Balami
 * CS132 Spring 2025
 * Date: June 14th, 2025
 *
 * This is the index.js file for Baseline Threads. It handles the dynamic
 * rendering of the various player cards along with the realted information.
 * It also handles the display of promotions and other filters.
 */

(function () {
    "use strict";

    const BASE_URL = "https://baseline-threads-backend.onrender.com/baseline";
    let allPromotions = [];

    /**
     * Initializes event listeners and loads initial data.
     */
    function init() {
        loadAllJerseys();

        id("search-btn").addEventListener("click", handleSearch);
        id("filter-dropdown").addEventListener("change", handleFilter);
        id("back-btn").addEventListener("click", () => {
            id("player-view").classList.add("hidden");
            id("jersey-grid").classList.remove("hidden");
        });
        id("reset-btn").addEventListener("click", () => {
            id("search-bar").value = "";
            id("filter-dropdown").selectedIndex = 0;
            loadAllJerseys();
        });

        fetch(`${BASE_URL}/promotions`)
            .then(checkStatus)
            .then(res => res.json())
            .then(data => (allPromotions = data))
            .catch(err => console.error("Failed to load promotions:", err));
    }

    /**
     * Fetches and displays all jerseys.
     */
    function loadAllJerseys() {
        fetch(`${BASE_URL}/jerseys?_=${Date.now()}`)
            .then(checkStatus)
            .then(res => res.json())
            .then(renderJerseyCards)
            .catch(handleError);
    }

    /**
     * Handles player search from input field.
     */
    function handleSearch() {
        const name = id("search-bar").value.trim();
        if (!name) return;

        fetch(`${BASE_URL}/jerseys/player/${encodeURIComponent(name)}`)
            .then(checkStatus)
            .then(res => res.json())
            .then(player => renderJerseyCards([player]))
            .catch(() => {
                id("jersey-grid").innerHTML = `<p class="error-msg">Player not found.</p>`;
            });
    }

    /**
     * Handles dropdown-based filtering and sorting.
     */
    function handleFilter() {
        const value = id("filter-dropdown").value;
        const url =
            value === "West" || value === "East"
                ? `${BASE_URL}/jerseys/filter?conference=${value}`
                : `${BASE_URL}/jerseys/filter?sortBy=${value}`;

        fetch(url)
            .then(checkStatus)
            .then(res => res.json())
            .then(renderJerseyCards)
            .catch(handleError);
    }

    /**
 * Displays a detailed player card.
 * @param {Object} player - Jersey object of the selected player.
 */
    function showPlayerDetail(player) {
        id("jersey-grid").classList.add("hidden");
        id("player-view").classList.remove("hidden");

        const detail = id("player-detail");
        detail.innerHTML = "";

        const card = buildPlayerDetailCard(player);
        detail.appendChild(card);

        setupPlayerCardButtons(player);
    }

    /**
     * Builds and returns a detailed player card DOM element.
     * This includes image, name, team info, stats, promotions, and action buttons.
     *
     * @param {Object} player - The player jersey object.
     * @param {string} player.name - Player's full name.
     * @param {string} player.team - Team the player belongs to.
     * @param {string} player.img - Image path for the player's jersey.
     * @param {string} player.conference - Conference (East or West).
     * @param {number} player.price - Price of the jersey.
     * @param {number} player.ppg - Points per game.
     * @param {number} player.rpg - Rebounds per game.
     * @param {number} player.apg - Assists per game.
     * @param {number} player.sales - Total sales for this jersey.
     * @param {boolean} player.inStock - Whether the jersey is in stock.
     * @returns {HTMLElement} A fully constructed DOM element representing the player's detail view.
     */
    function buildPlayerDetailCard(player) {
        const card = gen("div");
        card.classList.add("player-card-detail");

        const img = gen("img");
        img.src = player.img;
        img.alt = player.name;

        const info = gen("div");
        info.classList.add("player-info");

        const name = gen("h2");
        name.textContent = player.name;

        const team = gen("p");
        team.classList.add("player-team");
        team.textContent = `Team: ${player.team}`;

        const stats = gen("ul");
        stats.classList.add("player-stats");
        stats.innerHTML = `
    <li>Price: $${player.price}</li>
    <li>PPG: ${player.ppg}</li>
    <li>RPG: ${player.rpg}</li>
    <li>APG: ${player.apg}</li>
    <li>Sales: ${player.sales}</li>
  `;

        const promoHTML = buildPromotionsHTML(player);
        const promoWrapper = gen("div");
        promoWrapper.innerHTML = promoHTML;

        const buyBtn = gen("button");
        buyBtn.id = "buy-btn";
        buyBtn.textContent = player.inStock ? "Buy Now" : "Sold Out";
        if (!player.inStock) {
            buyBtn.disabled = true;
            buyBtn.classList.add("sold-out");
        }

        const cartBtn = gen("button");
        cartBtn.id = "cart-btn";
        cartBtn.textContent = isInCart(player.id) ? "Remove from Cart" : "Add to Cart";

        const msg = gen("p");
        msg.id = "purchase-msg";

        info.append(name, team, stats, promoWrapper, buyBtn, cartBtn, msg);
        card.append(img, info);

        return card;
    }

    /**
     * Attaches click handlers to the Buy and Cart buttons.
     * @param {Object} player - The player jersey object.
     */
    function setupPlayerCardButtons(player) {
        if (player.inStock) {
            id("buy-btn").addEventListener("click", () => purchaseJersey(player.id));
        }

        id("cart-btn").addEventListener("click", () => {
            toggleCartItem(player.id);
            id("cart-btn").textContent = isInCart(player.id)
                ? "Remove from Cart"
                : "Add to Cart";
        });
    }

    /**
  * Creates a DOM element containing all relevant promotions for a player.
  * @param {Object[]} relevant - Array of promotion objects applicable to the player.
  * @returns {HTMLElement} A <div> element with a list of promotion descriptions.
  */
    function createPromoSection(relevant) {
        const promoDiv = gen("div");
        promoDiv.classList.add("player-promos");

        const heading = gen("h3");
        heading.textContent = "Promotions Available";
        promoDiv.appendChild(heading);

        const list = gen("ul");
        relevant.forEach(promo => {
            const item = gen("li");
            item.innerHTML = `${promo.title} — <em>${promo.description}</em>`;
            list.appendChild(item);
        });

        promoDiv.appendChild(list);
        return promoDiv;
    }

    /**
     * Builds an HTML string listing all promotions applicable to a player.
     * 
     * @param {Object} player - The player object to evaluate promotions against.
     * @param {string} player.team - Player's team name.
     * @param {string} player.conference - Player's conference.
     * @param {number} player.ppg - Player's points per game.
     * @returns {string} HTML string for applicable promotions, or an empty string if none apply.
     */
    function buildPromotionsHTML(player) {
        const relevant = allPromotions.filter(promo => {
            const matchTeam = promo.teams?.includes(player.team);
            const matchConf = promo.conference?.toLowerCase() === player.conference?.toLowerCase();
            const matchPPG = promo.condition === "ppg>=25" && player.ppg >= 25;
            return matchTeam || matchConf || matchPPG;
        });

        if (relevant.length === 0) return "";

        return `
    <div class="player-promos">
      <h3>Promotions Available</h3>
      <ul>
        ${relevant.map(p => `<li>${p.title} — <em>${p.description}</em></li>`).join("")}
      </ul>
    </div>
  `;
    }


    /**
     * Renders a grid of player jersey cards.
     * @param {Object[]} players - List of player jersey objects.
     */
    function renderJerseyCards(players) {
        const grid = id("jersey-grid");
        grid.innerHTML = "";

        players.forEach(player => {
            const card = gen("div");
            card.classList.add("player-card");
            if (!player.inStock) card.classList.add("sold-out-card");

            const img = gen("img");
            img.src = player.img;
            img.alt = `${player.name} Jersey`;

            const text = gen("div");
            text.classList.add("card-text");
            text.innerHTML = `
        <h3>${player.name}</h3>
        <p>${player.team} - $${player.price}</p>
        ${!player.inStock ? "<p class='sold-label'>Sold Out</p>" : ""}
      `;

            card.appendChild(img);
            card.appendChild(text);

            if (player.inStock) {
                card.addEventListener("click", () => showPlayerDetail(player));
            }

            grid.appendChild(card);
        });
    }

    /**
     * Sends POST request to mark jersey as purchased.
     * @param {number} jerseyId - ID of jersey to purchase.
     */
    function purchaseJersey(jerseyId) {
        fetch(`${BASE_URL}/purchase`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: jerseyId })
        })
            .then(checkStatus)
            .then(res => res.json())
            .then(() => {
                id("purchase-msg").textContent =
                    "Purchase successful! Your jersey is on the way.";
                const btn = id("buy-btn");
                btn.disabled = true;
                btn.textContent = "Sold Out";
                btn.classList.add("sold-out");
            })
            .catch(err => {
                id("purchase-msg").textContent =
                    "Purchase failed. This jersey may already be sold out.";
                console.error("Purchase error:", err);
            });
    }

    /**
     * Gets cart array from localStorage.
     * @returns {number[]} List of jersey IDs in cart.
     */
    function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
    }

    /**
     * Checks if a jersey ID is in the cart.
     * @param {number} id - Jersey ID.
     * @returns {boolean} True if in cart, else false.
     */
    function isInCart(id) {
        return getCart().includes(id);
    }

    /**
     * Adds or removes a jersey from the cart.
     * @param {number} id - Jersey ID.
     */
    function toggleCartItem(id) {
        const cart = getCart();
        const index = cart.indexOf(id);
        if (index === -1) {
            cart.push(id);
        } else {
            cart.splice(index, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    window.addEventListener("DOMContentLoaded", init);
})();
