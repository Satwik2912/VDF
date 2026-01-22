const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const message = document.getElementById("message");
const gifContainer = document.getElementById("gifContainer");

// Track "No" button position changes
let positionChangeCount = 0;

// Local GIF files
const gifUrls = [
  "./1.gif", // GIF 1 - Shows on 6th position change
  "./2.gif", // GIF 2 - Shows on 8th position change
  "./3.gif", // GIF 3 - Shows on 10th position change
  "./4.gif", // GIF 4 - Shows on 12th position change
];

// GIFs 5, 6, 7 for Yes button click
const yesGifUrls = [
  "./5.gif",
  "./6.gif",
  "./7.gif",
];

// Map position change counts to GIF indices
const gifTriggers = {
  6: 0,  // 6th position change -> GIF 1
  8: 1,  // 8th position change -> GIF 2
  10: 2, // 10th position change -> GIF 3
  12: 3, // 12th position change -> GIF 4
};

const noPhrases = [
  "Are you sure? 😅",
  "Pleaseeee? 🥺",
  "Try again 😏",
  "That button seems shy...",
  "Nope, not today!",
];

function setMessage(text) {
  message.textContent = text;
}

function moveNoButton() {
  const pad = 12;
  const btnRect = noBtn.getBoundingClientRect();
  const maxX = window.innerWidth - btnRect.width - pad;
  const maxY = window.innerHeight - btnRect.height - pad;

  const x = Math.max(pad, Math.floor(Math.random() * maxX));
  const y = Math.max(pad, Math.floor(Math.random() * maxY));

  noBtn.style.position = "fixed";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  
  // Increment position change counter
  positionChangeCount++;
  
  // Check if we should show a GIF
  if (gifTriggers[positionChangeCount] !== undefined) {
    const gifIndex = gifTriggers[positionChangeCount];
    showGif(gifIndex);
  }
}

// Store all existing GIF positions
const existingGifs = [];

function getGifPosition(gifIndex) {
  const gifWidth = 350;
  const question = document.querySelector(".question");
  const questionRect = question.getBoundingClientRect();
  const questionText = question.textContent;
  const words = questionText.split(/\s+/);
  
  // Get exact positions of first and last words using Range API
  let firstWordRect = null;
  let lastWordRect = null;
  
  try {
    // Get first word position
    const range1 = document.createRange();
    const textNode = question.firstChild;
    if (textNode) {
      let startPos = 0;
      let endPos = words[0].length;
      
      range1.setStart(textNode, startPos);
      range1.setEnd(textNode, endPos);
      firstWordRect = range1.getBoundingClientRect();
      
      // Get last word position
      const range2 = document.createRange();
      let lastWordStart = questionText.length - words[words.length - 1].length;
      let lastWordEnd = questionText.length;
      
      range2.setStart(textNode, lastWordStart);
      range2.setEnd(textNode, lastWordEnd);
      lastWordRect = range2.getBoundingClientRect();
    }
  } catch (e) {
    // Fallback if Range API fails
    console.log("Using fallback positioning");
  }
  
  // Fallback: estimate positions if Range API didn't work
  if (!firstWordRect || !lastWordRect) {
    const questionTextWidth = question.scrollWidth;
    const centerX = questionRect.left + questionRect.width / 2;
    const estimatedTextStart = centerX - questionTextWidth / 2;
    
    // Estimate first word position
    const tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    tempSpan.style.fontFamily = getComputedStyle(question).fontFamily;
    tempSpan.style.fontSize = getComputedStyle(question).fontSize;
    tempSpan.style.fontWeight = getComputedStyle(question).fontWeight;
    document.body.appendChild(tempSpan);
    
    tempSpan.textContent = words[0];
    const firstWordWidth = tempSpan.offsetWidth;
    
    tempSpan.textContent = words[words.length - 1];
    const lastWordWidth = tempSpan.offsetWidth;
    
    document.body.removeChild(tempSpan);
    
    firstWordRect = {
      left: estimatedTextStart,
      right: estimatedTextStart + firstWordWidth,
      bottom: questionRect.bottom,
    };
    
    lastWordRect = {
      left: estimatedTextStart + questionTextWidth - lastWordWidth,
      right: estimatedTextStart + questionTextWidth,
      bottom: questionRect.bottom,
    };
  }
  
  let position = { x: 0, y: 0 };
  
  switch (gifIndex) {
    case 0: // GIF 1: Just below the last word of the sentence
      position.x = lastWordRect.left + (lastWordRect.right - lastWordRect.left) / 2 - gifWidth / 2;
      position.y = lastWordRect.bottom + 20;
      break;
      
    case 1: // GIF 2: Below the 1st word of the sentence
      position.x = firstWordRect.left + (firstWordRect.right - firstWordRect.left) / 2 - gifWidth / 2;
      position.y = firstWordRect.bottom + 20;
      break;
      
    case 2: // GIF 3: Below the 1st GIF
      if (existingGifs[0]) {
        position.x = existingGifs[0].x;
        position.y = existingGifs[0].y + existingGifs[0].height + 20;
      } else {
        // Fallback: below last word
        position.x = lastWordRect.left + (lastWordRect.right - lastWordRect.left) / 2 - gifWidth / 2;
        position.y = lastWordRect.bottom + 20;
      }
      break;
      
    case 3: // GIF 4: Behind the Yes button
      const yesBtnRect = yesBtn.getBoundingClientRect();
      position.x = yesBtnRect.left + yesBtnRect.width / 2 - gifWidth / 2;
      position.y = yesBtnRect.top + yesBtnRect.height / 2 - gifWidth / 2;
      break;
  }
  
  // Ensure GIF stays within viewport
  position.x = Math.max(20, Math.min(position.x, window.innerWidth - gifWidth - 20));
  position.y = Math.max(20, Math.min(position.y, window.innerHeight - 350 - 20));
  
  return position;
}

function showGif(gifIndex) {
  if (gifIndex < 0 || gifIndex >= gifUrls.length) return;
  
  const gifItem = document.createElement("div");
  gifItem.className = "gif-item";
  
  // GIF 4 should be behind Yes button (lower z-index)
  if (gifIndex === 3) {
    gifItem.style.zIndex = "-1";
  }
  
  const img = document.createElement("img");
  img.src = gifUrls[gifIndex];
  img.alt = `GIF ${gifIndex + 1}`;
  
  const position = getGifPosition(gifIndex);
  gifItem.style.left = `${position.x}px`;
  gifItem.style.top = `${position.y}px`;
  
  // Store position (will update with actual dimensions after load)
  const gifData = {
    x: position.x,
    y: position.y,
    width: 350,
    height: 350,
    element: gifItem,
  };
  existingGifs.push(gifData);
  
  gifItem.appendChild(img);
  gifContainer.appendChild(gifItem);
  
  // Update actual dimensions after image loads
  img.onload = () => {
    const rect = gifItem.getBoundingClientRect();
    gifData.width = rect.width;
    gifData.height = rect.height;
    
    // If this is GIF 3 and it's positioned below GIF 1, update its position
    if (gifIndex === 2 && existingGifs[0]) {
      const newY = existingGifs[0].y + existingGifs[0].height + 20;
      gifItem.style.top = `${newY}px`;
      gifData.y = newY;
    }
  };
}

function removeAllGifs() {
  // Remove all GIF elements from DOM
  const allGifs = gifContainer.querySelectorAll(".gif-item");
  allGifs.forEach(gif => gif.remove());
  
  // Clear the existingGifs array
  existingGifs.length = 0;
}

function showYesGifs(startPos, endPos) {
  const gifWidth = 350;
  const gapBetweenGifs = 120; // Extra gap between GIFs to prevent overlapping (in pixels)
  const numGifs = yesGifUrls.length;
  
  // Calculate positions for 3 GIFs in a straight line
  // Line goes from startPos (GIF 2) to endPos (GIF 1)
  const startX = startPos.x + gifWidth / 2; // Center of start GIF
  const startY = startPos.y;
  const endX = endPos.x + gifWidth / 2; // Center of end GIF
  const endY = endPos.y;
  
  // Calculate total distance between start and end points
  const totalDistance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  
  // Calculate spacing between centers of GIFs
  // We want: gap + GIF + gap + GIF + gap + GIF + gap
  // So the distance between centers should be: GIF width + gap
  const centerToCenterDistance = gifWidth + gapBetweenGifs;
  
  // Calculate angle of the line
  const angle = Math.atan2(endY - startY, endX - startX);
  
  // Show each GIF with 3 second delay
  yesGifUrls.forEach((gifUrl, index) => {
    setTimeout(() => {
      // Calculate position along the line
      // First GIF starts after initial gap, then each subsequent GIF is spaced by centerToCenterDistance
      const distanceFromStart = gapBetweenGifs + (centerToCenterDistance * index);
      const x = startX + Math.cos(angle) * distanceFromStart - gifWidth / 2;
      const y = startY + Math.sin(angle) * distanceFromStart;
      
      const gifItem = document.createElement("div");
      gifItem.className = "gif-item";
      
      const img = document.createElement("img");
      img.src = gifUrl;
      img.alt = `GIF ${index + 5}`;
      
      gifItem.style.left = `${x}px`;
      gifItem.style.top = `${y}px`;
      
      gifItem.appendChild(img);
      gifContainer.appendChild(gifItem);
      
      // Store in existingGifs for reference
      const gifData = {
        x: x,
        y: y,
        width: gifWidth,
        height: 350,
        element: gifItem,
      };
      existingGifs.push(gifData);
      
      // Update actual dimensions after image loads
      img.onload = () => {
        const rect = gifItem.getBoundingClientRect();
        gifData.width = rect.width;
        gifData.height = rect.height;
      };
    }, index * 3000); // 3 seconds delay between each GIF
  });
}

yesBtn.addEventListener("click", () => {
  setMessage("Yay! 💖💖💖💖💖💖💖 \n I Love You So Much Riyuuu 💖💖💖💖💖💖💖💖💖💖\n See you on Valentine's!");
  noBtn.style.visibility = "hidden";
  
  // Store positions of GIF 1 and GIF 2 before removing
  const gif1Pos = existingGifs[0] ? { x: existingGifs[0].x, y: existingGifs[0].y } : null;
  const gif2Pos = existingGifs[1] ? { x: existingGifs[1].x, y: existingGifs[1].y } : null;
  
  // Remove all existing GIFs
  removeAllGifs();
  
  // If we have positions for GIF 1 and GIF 2, show new GIFs in a line
  if (gif1Pos && gif2Pos) {
    // Show GIFs 5, 6, 7 in a straight line from GIF 2 position to GIF 1 position
    showYesGifs(gif2Pos, gif1Pos);
  } else {
    // Fallback: calculate positions if GIFs weren't shown yet
    const question = document.querySelector(".question");
    const questionRect = question.getBoundingClientRect();
    const questionText = question.textContent;
    const words = questionText.split(/\s+/);
    
    // Get positions
    let firstWordRect = null;
    let lastWordRect = null;
    
    try {
      const range1 = document.createRange();
      const textNode = question.firstChild;
      if (textNode) {
        range1.setStart(textNode, 0);
        range1.setEnd(textNode, words[0].length);
        firstWordRect = range1.getBoundingClientRect();
        
        const range2 = document.createRange();
        let lastWordStart = questionText.length - words[words.length - 1].length;
        range2.setStart(textNode, lastWordStart);
        range2.setEnd(textNode, questionText.length);
        lastWordRect = range2.getBoundingClientRect();
      }
    } catch (e) {
      // Fallback calculation
    }
    
    if (firstWordRect && lastWordRect) {
      const gifWidth = 350;
      const startPos = {
        x: firstWordRect.left + (firstWordRect.right - firstWordRect.left) / 2 - gifWidth / 2,
        y: firstWordRect.bottom + 20,
      };
      const endPos = {
        x: lastWordRect.left + (lastWordRect.right - lastWordRect.left) / 2 - gifWidth / 2,
        y: lastWordRect.bottom + 20,
      };
      showYesGifs(startPos, endPos);
    }
  }
});

noBtn.addEventListener("mouseenter", () => {
  moveNoButton();
  setMessage(noPhrases[Math.floor(Math.random() * noPhrases.length)]);
});

noBtn.addEventListener("click", () => {
  moveNoButton();
  setMessage(noPhrases[Math.floor(Math.random() * noPhrases.length)]);
});

