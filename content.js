console.log("✅ content.js loaded!");

const AZ_PROBLEM_KEY = "AZ_PROBLEM_KEY";

// Utility: Check if we are on a Codeforces problem page
function onProblemsPage() {
    return window.location.href.includes("codeforces.com/problemset/problem/");
}

// Utility: Extract unique problem ID
function extractUniqueId(url) {
    const parts = url.split("/problem/");
    return parts.length > 1 ? parts[1] : url;
}

// Utility: Get all bookmarks from chrome.storage
function getCurrentBookmarks() {
    return new Promise(resolve => {
        chrome.storage.sync.get([AZ_PROBLEM_KEY], (results) => {
            resolve(results[AZ_PROBLEM_KEY] || []);
        });
    });
}

// Button click handler to save the current problem
// Click handler — toggles on/off
async function addNewBookmarkHandler(buttonElement) {
    const azProblemUrl = window.location.href;
    const uniqueId = extractUniqueId(azProblemUrl);
    const problemName = document.querySelector(".title").innerText;

    const currentBookmarks = await getCurrentBookmarks();
    const isBookmarked = currentBookmarks.some(bookmark => bookmark.id === uniqueId);

    let updatedBookmarks;

    if (isBookmarked) {
        // 🔄 Remove from bookmarks
        updatedBookmarks = currentBookmarks.filter(bookmark => bookmark.id !== uniqueId);
        chrome.storage.sync.set({ AZ_PROBLEM_KEY: updatedBookmarks }, () => {
            console.log("❌ Unbookmarked:", uniqueId);
            buttonElement.innerText = "🔖 Bookmark";
        });
    } else {
        // ➕ Add new bookmark
        const bookmarkObj = { id: uniqueId, name: problemName, url: azProblemUrl };
        updatedBookmarks = [...currentBookmarks, bookmarkObj];
        chrome.storage.sync.set({ AZ_PROBLEM_KEY: updatedBookmarks }, () => {
            console.log("✅ Bookmarked:", bookmarkObj);
            buttonElement.innerText = "✅ Bookmarked!";
        });
    }
}

// Main function to insert the button
async function addBookmarkButton() {
    console.log("🟢 addBookmarkButton() called");

    if (!onProblemsPage()) {
        console.log("🚫 Not on a Codeforces problem page");
        return;
    }

    const problemTitle = document.querySelector(".title");
    console.log("📌 problemTitle found:", problemTitle);

    if (!problemTitle) return;

    if (document.getElementById("add-bookmark-button")) {
        console.log("⚠️ Button already exists");
        return;
    }

    const azProblemUrl = window.location.href;
    const uniqueId = extractUniqueId(azProblemUrl);
    const bookmarks = await getCurrentBookmarks();
    const isBookmarked = bookmarks.some(b => b.id === uniqueId);

    // 🔖 Create visual button
    const bookmarkButton = document.createElement("div");
    bookmarkButton.id = "add-bookmark-button";
    bookmarkButton.innerText = isBookmarked ? "✅ Bookmarked!" : "🔖 Bookmark";
    bookmarkButton.style.border = "2px solid red";
    bookmarkButton.style.color = "black";
    bookmarkButton.style.backgroundColor = "#ffd";
    bookmarkButton.style.padding = "5px";
    bookmarkButton.style.marginTop = "1px";
    bookmarkButton.style.display = "inline-block";
    bookmarkButton.style.cursor = "pointer";

    problemTitle.insertAdjacentElement("afterend", bookmarkButton);
    console.log("📍 Inserted bookmark button");

    bookmarkButton.addEventListener("click", () => addNewBookmarkHandler(bookmarkButton));
}

// Run once after short delay
setTimeout(() => {
    console.log("⏱️ Trying to run addBookmarkButton after short delay");
    addBookmarkButton();
}, 500);

// Support dynamic navigation via MutationObserver
let lastUrl = location.href;

const observer = new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log("🔁 Detected URL change:", currentUrl);
        setTimeout(() => addBookmarkButton(), 500);
    }
});

observer.observe(document.body, { childList: true, subtree: true });
