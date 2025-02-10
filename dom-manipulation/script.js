const quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
];

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API for simulation

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to populate categories dynamically
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    const categories = [...new Set(quotes.map(q => q.category))];
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    const lastSelectedCategory = localStorage.getItem("selectedCategory") || "all";
    categoryFilter.value = lastSelectedCategory;
}

// Function to filter quotes based on the selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem("selectedCategory", selectedCategory);
    
    const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
    
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = filteredQuotes.map(q => `<p>${q.text} - <em>${q.category}</em></p>`).join(" ");
}

// Function to add a new quote and update categories
function addQuote() {
    const newText = document.getElementById("newQuoteText").value.trim();
    const newCategory = document.getElementById("newQuoteCategory").value.trim();
    
    if (newText !== "" && newCategory !== "") {
        const newQuote = { text: newText, category: newCategory };
        quotes.push(newQuote);
        saveQuotes();
        populateCategories();
        filterQuotes();
        syncWithServer(newQuote);
        
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
        alert("Quote added successfully!");
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// Function to sync with the server
async function syncWithServer(newQuote) {
    try {
        await fetch(SERVER_URL, {
            method: "POST",
            body: JSON.stringify(newQuote),
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error syncing with server:", error);
    }
}

// Function to fetch updated quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        const serverQuotes = await response.json();
        
        // Simulated conflict resolution: server data takes precedence
        if (serverQuotes.length > quotes.length) {
            localStorage.setItem("quotes", JSON.stringify(serverQuotes));
            alert("New updates received from the server!");
            location.reload();
        }
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
    }
}

// Function to sync local quotes with the server
async function syncQuotes() {
    try {
        // Fetch latest quotes from the server
        await fetchQuotesFromServer();

        // Sync newly added quotes from local storage to the server
        for (const quote of quotes) {
            await syncWithServer(quote);
        }

        console.log("Quotes synchronized successfully.");
    } catch (error) {
        console.error("Error during synchronization:", error);
    }
}

// Periodic syncing with the server
setInterval(fetchQuotesFromServer, 30000); // Fetch new data every 30 seconds

document.addEventListener("DOMContentLoaded", () => {
    createAddQuoteForm();
    populateCategories();
    filterQuotes();
    fetchQuotesFromServer();
});
