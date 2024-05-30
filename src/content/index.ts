import { extractSection } from './utils';

// Function to add a button to a given HTML element
function addButtonToElement(element: Element): void {
  // Creating a button element
  const button: HTMLButtonElement = document.createElement('button');
  // Setting the button text content to '+'
  button.textContent = '+';
  // Adding an event listener for when the button is clicked
  button.addEventListener('click', () => {
    handleButtonClick(element);
  });

  // Styling the button
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.color = '#333';
  button.style.backgroundColor = '#EEF1F2';
  button.style.boxShadow = '0 0 0 1px #CED3D9';
  button.style.cursor = 'pointer';
  button.style.marginRight = '10px';
  button.style.borderRadius = '5px';
  button.style.transition = 'all 120ms ease-in';
  button.style.border = 'none';
  button.style.outline = 'none';

  // Adding event listeners for mouse enter and leave to change button style
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#CED3D9';
    button.style.boxShadow = '0 0 0 1px #9DA9AF';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#EEF1F2';
    button.style.boxShadow = '0 0 0 1px #CED3D9';
  });

  // Inserting the button before the given element
  element.parentNode?.insertBefore(button, element);
}

// Function to handle button click event
function handleButtonClick(element: Element): void {
  const selectedSection = extractSection(element)
  if (!selectedSection) return;
  // Getting existing sections from Chrome storage and adding the new section
  chrome.storage.sync.set({ newSection: selectedSection });
}

// Function to observe DOM changes and add buttons to matching elements
function observeDOMAndAddButtons(): void {
  // Configuration for the mutation observer
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false,
  };

  // Callback function for the mutation observer
  const callback: MutationCallback = (mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // Finding matching elements within the added node
            const matchingElements = node.querySelectorAll('.WD5F.WB5F');
            // Adding buttons to matching elements
            if (matchingElements.length > 0) {
              matchingElements.forEach((matchingElement) => {
                addButtonToElement(matchingElement);
              });
            }
          }
        });
      }
    });
  };

  // Creating a new mutation observer instance
  const observer: MutationObserver = new MutationObserver(callback);
  // Observing changes to the document body with the specified configuration
  observer.observe(document.body, config);
}

// Function to set up the observer for DOM changes
function setupObserver(): void {
  // If the document is still loading, add an event listener to observe DOM changes
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeDOMAndAddButtons);
  } else {
    // Otherwise, directly observe DOM changes
    observeDOMAndAddButtons();
  }
}

// Setting up the observer when the script is executed
setupObserver();


// Additional code to "fix" profile pictures
// Script in an IIFE to minimize possible conflicts
(function() {
    'use strict';

    // Function to modify image attributes and apply styles
    function modifyImages() {
        const images = document.querySelectorAll<HTMLImageElement>('img.wdappchrome-aax, img.wdappchrome-aaam');
        images.forEach(img => {
            img.src = img.src.replace(/scaleWidth=\d+/, 'scaleWidth=192').replace(/scaleHeight=\d+/, 'scaleHeight=250');
            // Calculate new width based on original width
            const originalWidth = img.width; // Capture the current width
            // Don't ask why the following line is the way that it is
            let scale = originalWidth > 40 ? 0.768 : 0.97; // Larger images reduced to 76.8%, others to 97%
            img.width = originalWidth * scale;
            img.className = 'highrespfp';
        });

        // Apply additional CSS to center the image in the 'wdappchrome-aaal' span
        const spans = document.querySelectorAll<HTMLSpanElement>('span.wdappchrome-aaal');
        spans.forEach(span => {
            span.style.display = 'flex';
            span.style.justifyContent = 'center';
            span.style.alignItems = 'center';
        });
        const alsoSpans = document.querySelectorAll<HTMLSpanElement>('span.wdappchrome-aaw');
        alsoSpans.forEach(span => {
            span.style.display = 'flex';
            span.style.justifyContent = 'center';
            span.style.alignItems = 'center';
        });
    }

    // Observer to watch for changes in the document
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                // Run modifyImages to check for new images and apply styles
                modifyImages();
            }
        });
    });

    // Start observing the body for added nodes
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial modification call
    modifyImages();
})();
