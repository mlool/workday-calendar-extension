import { Term } from '../popup/App/App.types';

// Interface representing a section of a course
interface Section {
  code: string; // Course code
  name: string; // Course name
  location: string; // Location where the course takes place
  days: string[]; // Days of the week the course is held on
  startTime: string; // Start time of the course
  endTime: string; // End time of the course
  term: Term; // Term when the course is offered
}

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
  // Finding course labels within the parent element
  const courseLabels = element.parentElement?.querySelectorAll('.gwt-Label.WKIP.WDHP');
  // Checking if course labels exist and there are at least two of them
  if (!courseLabels || courseLabels.length < 2) {
    alert('Title or section details not found');
    return;
  }

  // Extracting title and section details from the labels
  const titleElement = courseLabels[0];
  const sectionDetailsElement = courseLabels[1];
  const title = titleElement.textContent;
  const sectionDetails = sectionDetailsElement.textContent;

  // Checking if title or section details are missing
  if (!title || !sectionDetails) {
    alert('Title or section details not found');
    return;
  }

  // Splitting title and section details into parts
  const titleParts = title.split(' - ');
  const detailsParts = sectionDetails.split(' | ');

  // Checking if title and section details have the expected format
  if (titleParts.length !== 2 || detailsParts.length !== 4) {
    alert(JSON.stringify(titleParts));
    alert(JSON.stringify(detailsParts));
    alert('Invalid title or section details format');
    return;
  }

  // Extracting individual parts from title and section details
  const [code, name] = titleParts;
  const [location, daysString, timeRange, dateRange] = detailsParts;
  const days = daysString.split(' ');
  const [startTime, endTime] = timeRange.split(' - ');

  // Determining the term based on the date range
  const term = dateRange === '2024-09-03 - 2024-12-05' ? Term.winterOne : Term.winterTwo;

  // Creating a new section object
  const newSection: Section = {
    code,
    name,
    location,
    days,
    startTime: convertTo24(startTime),
    endTime: convertTo24(endTime),
    term,
  };

  // Getting existing sections from Chrome storage and adding the new section
  chrome.storage.sync.get(['sections'], (result) => {
    const sections: Section[] = result.sections || [];
    chrome.storage.sync.set({ sections: [...sections, newSection] });
  });
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
          // Finding matching elements within the added node
          const matchingElements = (node as Element).querySelectorAll('.WD5F.WB5F');
          // Adding buttons to matching elements
          if (matchingElements.length > 0) {
            matchingElements.forEach((matchingElement) => {
              addButtonToElement(matchingElement);
            });
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

// Function to convert time from 12-hour to 24-hour format
function convertTo24(time: string): string {
  const regex = /^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)$/i;
  const match = time.match(regex);

  if (!match) {
    throw new Error('Invalid time format');
  }

  let [_, hours, minutes, period] = match;
  let hoursNumber = parseInt(hours, 10);

  if (period.toLowerCase() === 'p.m.' && hoursNumber !== 12) {
    hoursNumber += 12;
  } else if (period.toLowerCase() === 'a.m.' && hoursNumber === 12) {
    hoursNumber = 0;
  }

  const formattedHours = hoursNumber.toString().padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}
