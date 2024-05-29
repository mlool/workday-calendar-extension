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
  // Assign unique ID
  button.id = `addButton`;
  // Custom attribute to track state
  button.dataset.state = 'notAdded'; // Custom attribute to track state
  // Adding an event listener for when the button is clicked
  button.addEventListener('click', () => {
    handleButtonClick(button);
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
  button.style.textAlign = 'center'; // Center the text horizontally
  button.style.width = '3.5em'; // Set the width of the button

  // Adding display flex and align-items center to the button's parent
  const parentElement = element.parentElement;
  if (parentElement) {
    parentElement.style.display = 'flex';
    parentElement.style.alignItems = 'center';
  }
  
  // Adding event listeners for mouse enter and leave to change button style
  button.addEventListener('mouseenter', () => {
    if (button.dataset.state === 'added') {
      button.style.backgroundColor = '#7fc77b';
    } else {
      button.style.backgroundColor = '#CED3D9';
    }
    button.style.boxShadow = '0 0 0 1px #9DA9AF';
  });

  button.addEventListener('mouseleave', () => {
    if (button.dataset.state === 'added') {
      button.style.backgroundColor = '#8fdf8a';
    } else {
      button.style.backgroundColor = '#EEF1F2';
    }
    button.style.boxShadow = '0 0 0 1px #CED3D9';
  });

  // Inserting the button before the given element
  element.parentNode?.insertBefore(button, element);



  // Check if the section is already added and update the button state
  let newSection = getSectionNextToButton(button, true);
  chrome.storage.sync.get(['sections'], (result) => {
    const sections: Section[] = result.sections || [];
    if (
      newSection &&
      sections.map((section) => section.code).includes(newSection.code)
    ) {
      updateButtonState(button, true);
    }
  });
}

// Function to get the section details next to the button
function getSectionNextToButton(
  button: HTMLButtonElement,
  quiet = false
): Section | undefined {
  const courseLabels = button.parentElement?.querySelectorAll(
    '.gwt-Label.WKIP.WDHP'
  );
  // Checking if course labels exist and there are at least two of them
  if (!courseLabels || courseLabels.length < 2) {
    if (!quiet) alert('Title or section details not found');
    return;
  }

  // Extracting title and section details from the labels
  const titleElement = courseLabels[0];
  const sectionDetailsElement = courseLabels[1];
  const title = titleElement.textContent;
  const sectionDetails = sectionDetailsElement.textContent;

  // Checking if title or section details are missing
  if (!title || !sectionDetails) {
    if (!quiet) alert('Title or section details not found');
    return;
  }

  // Splitting title and section details into parts
  const titleParts = title.split(' - ');
  const detailsParts = sectionDetails.split(' | ');

  // Checking if title and section details have the expected format
  if (titleParts.length !== 2 || detailsParts.length !== 4) {
    alert(JSON.stringify(titleParts));
    alert(JSON.stringify(detailsParts));
    if (!quiet) alert('Invalid title or section details format');
    return;
  }

  // Extracting individual parts from title and section details
  const [code, name] = titleParts;
  const [location, daysString, timeRange, dateRange] = detailsParts;
  const days = daysString.split(' ');
  const [startTime, endTime] = timeRange.split(' - ');

  // Determining the term based on the date range
  const term =
    dateRange === '2024-09-03 - 2024-12-05' ? Term.winterOne : Term.winterTwo;

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
  return newSection;
}

// Function to handle button click event
function handleButtonClick(button: HTMLButtonElement): void {
  let newSection = getSectionNextToButton(button);

  const isAdded = button.dataset.state === 'added';
  if (newSection) {
    if (isAdded) {
      // Logic to remove the section from Chrome storage
      removeSectionFromStorage(button, newSection);
    } else {
      // Logic to add the section to Chrome storage
      addSectionToStorage(button, newSection);
    }
  }
}

// Function to add a section to Chrome storage
function addSectionToStorage(button: HTMLButtonElement, newSection: Section) {
  chrome.storage.sync.get(['sections'], (result) => {
    const sections: Section[] = result.sections || [];
    if (!hasConflict(newSection, sections)) {
      sections.push(newSection);
      chrome.storage.sync.set({ sections: sections }, () => {
        updateButtonState(button, true);
      });
    } else {
      alert(
        "Sorry, this course conflicts with another section you've already added."
      );
    }
  });
}

// Function to remove a section from Chrome storage
function removeSectionFromStorage(
  button: HTMLButtonElement,
  newSection: Section
) {
  chrome.storage.sync.get(['sections'], (result) => {
    let sections: Section[] = result.sections || [];
    sections = sections.filter((s) => s.code !== newSection.code); // Need correct identifier to match
    chrome.storage.sync.set({ sections: sections }, () => {
      updateButtonState(button, false);
    });
  });
}

// Function to update the button state
function updateButtonState(button: HTMLButtonElement, isAdded: boolean) {
  if (isAdded) {
    button.textContent = '✔';
    button.style.backgroundColor = '#8fdf8a'; // Green
    button.dataset.state = 'added';
  } else {
    button.textContent = '+';
    button.style.backgroundColor = '#EEF1F2'; // Grey
    button.dataset.state = 'notAdded';
  }
}

// Function to parse time from string to minutes
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Function to check for time conflicts between sections
function hasConflict(
  newSection: Section,
  existingSections: Section[]
): boolean {
  const newDays = new Set(newSection.days);
  const newStartTime = parseTime(newSection.startTime);
  const newEndTime = parseTime(newSection.endTime);

  for (const existingSection of existingSections) {
    const existingDays = new Set(existingSection.days);
    if (Array.from(newDays).some((day) => existingDays.has(day))) {
      const existingStartTime = parseTime(existingSection.startTime);
      const existingEndTime = parseTime(existingSection.endTime);
      // Check for overlap
      if (
        !(newStartTime >= existingEndTime || newEndTime <= existingStartTime)
      ) {
        return true; // Conflict found
      }
    }
  }
  return false; // No conflicts found
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
          const matchingElements = (node as Element).querySelectorAll(
            '.WD5F.WB5F'
          );
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