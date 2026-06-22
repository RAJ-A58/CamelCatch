console.log("🐫 CamelCatch: Modules 1, 2 & 3 Initialized.");

// --- STATE MANAGER VARIABLES ---
let currentActiveUrl = window.location.href;
let targetVariablesList = []; 
const heartbeatIntervalTime = 1500;

// --- MODULE 2: UNIVERSAL PARSER ---
function extractTargetVariables(rawCodeText) {
    const parenthesesMatch = rawCodeText.match(/\(([^)]+)\)/);
    if (!parenthesesMatch) return []; 
    
    const rawParametersString = parenthesesMatch[1]; 
    const rawParametersArray = rawParametersString.split(',');
    
    let extractedVariables = [];

    rawParametersArray.forEach(function(parameter) {
        let cleanParameter = parameter.trim();
        if (cleanParameter.includes(':')) {
            cleanParameter = cleanParameter.split(':')[0].trim();
        } else {
            const wordParts = cleanParameter.split(/\s+/);
            cleanParameter = wordParts[wordParts.length - 1];
            cleanParameter = cleanParameter.replace(/[^a-zA-Z0-9_]/g, '');
        }

        if (cleanParameter && cleanParameter !== "self") {
            extractedVariables.push(cleanParameter);
        }
    });

    return extractedVariables;
}

// --- MODULE 3: THE DIFF ENGINE ---
function detectTypos(liveCodeText, targets) {
    let typosFound = [];
    
    targets.forEach(function(target) {
        // Create a case-INSENSITIVE regex that looks for the whole word
        // \b means "Word Boundary" so it doesn't match parts of other words
        let regexPattern = new RegExp(`\\b${target}\\b`, 'gi');
        
        // Find every time this word appears in the editor
        let matches = liveCodeText.match(regexPattern);
        
        if (matches) {
            matches.forEach(function(typedWord) {
                // If the word matches insensitively, but the exact casing is wrong... it's a typo!
                if (typedWord !== target) {
                    
                    // We create a clean error object
                    let errorObj = {
                        expected: target,
                        typed: typedWord
                    };
                    
                    // Prevent logging the exact same error 50 times if they typed it multiple times
                    let alreadyLogged = typosFound.some(err => err.typed === typedWord && err.expected === target);
                    if (!alreadyLogged) {
                        typosFound.push(errorObj);
                    }
                }
            });
        }
    });
    
    return typosFound;
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
        
        // 1. Capture Targets if memory is empty
        if (targetVariablesList.length === 0 && liveCodeText.includes('(')) {
            targetVariablesList = extractTargetVariables(liveCodeText);
            if (targetVariablesList.length > 0) {
                console.log("🎯 Targets Captured! Watching for:", targetVariablesList);
            }
        }
        
        // 2. Scan for Typos if we have targets
        if (targetVariablesList.length > 0) {
            let activeTypos = detectTypos(liveCodeText, targetVariablesList);
            
            if (activeTypos.length > 0) {
                console.warn("🚨 CamelCatch Linter found case-mismatches:", activeTypos);
            }
        }
    }
}, heartbeatIntervalTime);