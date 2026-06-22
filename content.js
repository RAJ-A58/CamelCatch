console.log("🐫 CamelCatch: Modules 1, 2, 3 & 4 Initialized.");

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
        let regexPattern = new RegExp(`\\b${target}\\b`, 'gi');
        let matches = liveCodeText.match(regexPattern);
        
        if (matches) {
            matches.forEach(function(typedWord) {
                if (typedWord !== target) {
                    let errorObj = { expected: target, typed: typedWord };
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

// --- MODULE 4: THE UI INJECTOR & HEALER ---
function updateUI(activeTypos, liveCodeText) {
    let existingBanner = document.getElementById('camelcatch-banner');
    
    if (activeTypos.length === 0) {
        if (existingBanner) existingBanner.remove();
        return;
    }

    if (!existingBanner) {
        existingBanner = document.createElement('div');
        existingBanner.id = 'camelcatch-banner';
        
        existingBanner.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; z-index: 99999;
            background: #2b2b2b; color: #fff; padding: 15px 20px;
            border-radius: 8px; font-family: sans-serif; font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); border-left: 5px solid #e74c3c;
            display: flex; flex-direction: column; gap: 10px; min-width: 250px;
        `;
        document.body.appendChild(existingBanner);
    }

    let typoHtml = activeTypos.map(t => 
        `<div>Expected: <strong style="color: #4cd137;">${t.expected}</strong> 
         | You typed: <span style="color: #e84118; text-decoration: underline;">${t.typed}</span></div>`
    ).join('');

    existingBanner.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">🚨 Casing Typo Detected</div>
        ${typoHtml}
        <button id="camelcatch-fix-btn" style="
            margin-top: 10px; background: #4cd137; color: #fff; border: none;
            padding: 8px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s;
        ">✨ Auto-Fix & Copy</button>
    `;

    document.getElementById('camelcatch-fix-btn').onclick = () => {
        let correctedCode = liveCodeText;
        
        activeTypos.forEach(typo => {
            let replaceRegex = new RegExp(`\\b${typo.typed}\\b`, 'g');
            correctedCode = correctedCode.replace(replaceRegex, typo.expected);
        });

        navigator.clipboard.writeText(correctedCode).then(() => {
            let btn = document.getElementById('camelcatch-fix-btn');
            btn.innerText = "✅ Copied! Press Ctrl+V";
            btn.style.background = "#00a8ff"; 
        });
    };
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

    // FIX: Target ONLY the lines of code and ignore the margin!
    let viewLines = document.querySelectorAll('.view-line');

    if (viewLines.length > 0) {
        
        // Extract text line by line, preserving indentation and adding line breaks
        let liveCodeText = Array.from(viewLines).map(line => {
            // Replace Monaco's invisible spacing characters with normal spaces
            return line.textContent.replace(/\u00a0/g, ' '); 
        }).join('\n');
        
        // 1. Capture Targets if memory is empty
        if (targetVariablesList.length === 0 && liveCodeText.includes('(')) {
            targetVariablesList = extractTargetVariables(liveCodeText);
            if (targetVariablesList.length > 0) {
                console.log("🎯 Targets Captured! Watching for:", targetVariablesList);
            }
        }
        
        // 2. Scan for Typos and Trigger UI
        if (targetVariablesList.length > 0) {
            let activeTypos = detectTypos(liveCodeText, targetVariablesList);
            updateUI(activeTypos, liveCodeText);
        }
    }
}, heartbeatIntervalTime);