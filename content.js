console.log("🐫 CamelCatch: Modules 1 & 2 Initialized.");

// --- STATE MANAGER VARIABLES ---
let currentActiveUrl = window.location.href;
let targetVariablesList = []; 
const heartbeatIntervalTime = 1500;

// --- MODULE 2: UNIVERSAL PARSER ---
function extractTargetVariables(rawCodeText) {
    // 1. Regex to find everything inside the very first set of parentheses
    // The pattern /\(([^)]+)\)/ looks for "(", then captures everything that isn't a ")", then looks for ")"
    const parenthesesMatch = rawCodeText.match(/\(([^)]+)\)/);
    
    // If no parentheses are found, return an empty array
    if (!parenthesesMatch) return []; 
    
    // Example: "self, nums: List[int], target: int" OR "int[] nums, int target"
    const rawParametersString = parenthesesMatch[1]; 
    const rawParametersArray = rawParametersString.split(',');
    
    let extractedVariables = [];

    // 2. Clean each parameter to isolate just the variable name
    rawParametersArray.forEach(function(parameter) {
        let cleanParameter = parameter.trim();
        
        // Strategy A: Python format (e.g., "nums: List[int]")
        // The variable is always before the colon.
        if (cleanParameter.includes(':')) {
            cleanParameter = cleanParameter.split(':')[0].trim();
        } 
        // Strategy B: Java/C++/C# format (e.g., "int[] nums" or "vector<int>& nums")
        // The variable is almost always the last word separated by a space.
        else {
            const wordParts = cleanParameter.split(/\s+/);
            cleanParameter = wordParts[wordParts.length - 1];
            
            // Clean off any C++ pointers or references (like '*' or '&')
            cleanParameter = cleanParameter.replace(/[^a-zA-Z0-9_]/g, '');
        }

        // 3. Filter out language keywords (like Python's 'self') and push to our target list
        if (cleanParameter && cleanParameter !== "self") {
            extractedVariables.push(cleanParameter);
        }
    });

    return extractedVariables;
}

// --- MODULE 1: STATE MANAGER ---
function resetExtensionForNewProblem() {
    console.log("🔄 SPA Navigation Detected! Wiping memory...");
    targetVariablesList = [];
}

// The core heartbeat loop
const stateManagerHeartbeat = setInterval(function() {
    
    if (window.location.href !== currentActiveUrl) {
        currentActiveUrl = window.location.href;
        resetExtensionForNewProblem();
    }

    let leetCodeEditorBox = document.querySelector('.monaco-editor');

    if (leetCodeEditorBox) {
        let liveCodeText = leetCodeEditorBox.innerText;
        
        // If our memory is empty, we try to parse the editor for variables
        if (targetVariablesList.length === 0 && liveCodeText.includes('(')) {
            targetVariablesList = extractTargetVariables(liveCodeText);
            
            if (targetVariablesList.length > 0) {
                console.log("🎯 Targets Captured! Watching for:", targetVariablesList);
            }
        }
    }
}, heartbeatIntervalTime);