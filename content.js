console.log("CamelCatch: State Manager Initialized.");

// The URL we are currently tracking
let currentActiveUrl = window.location.href;

// Our memory vault for the variables required in the current problem
let targetVariablesList = []; 

// Check the URL every 1.5 seconds
const heartbeatIntervalTime = 1500;

// The function that wipes our memory clean
function resetExtensionForNewProblem() {
    console.log("🔄 SPA Navigation Detected! Wiping memory for the new problem...");
    targetVariablesList = [];
    
    // Future: Call Module 2 here to scrape the new variables
}

// The core heartbeat loop
const stateManagerHeartbeat = setInterval(function() {
    
    // Check if the URL string has changed since our last heartbeat
    if (window.location.href !== currentActiveUrl) {
        currentActiveUrl = window.location.href;
        resetExtensionForNewProblem();
    }

    // Future: Call Module 3 here to scan the live editor text
    
}, heartbeatIntervalTime);