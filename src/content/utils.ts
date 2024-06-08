import { defaultColorList } from "../helpers/courseColors";
import { SectionDetail, Term, ISectionData, SectionType} from "./App/App.types";

export enum ButtonActionType {
  click,
  hover
}

// Convert times from 12-hour format to 24-hour format
const convertTo24HourFormat = (time: string): string => {
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (period && period.toLowerCase() === 'p.m.' && hours !== 12) {
    hours += 12;
  } else if (period && period.toLowerCase() === 'a.m.' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

const getTermFromSectionDetailsString =(sectionDetailsTextsStr: string): Term => {
  //If the string includes 2024, check if it includes 2025 also, if it does then it is both W1 and W2, if only 2024, W1, else W2
  //@TODO: In future this also needs to work for summer terms. Perhaps switch from year based to month based to work for every year
  if(sectionDetailsTextsStr.includes('2024')) {
    if(sectionDetailsTextsStr.includes('2025')) {
      return Term.winterFull;
    }
    return Term.winterOne;
  } else {
    return Term.winterTwo
  }
}

const parseSectionDetails = (details: string[]): SectionDetail[] => {
  let detailsArr: SectionDetail[] = []

  details.forEach((detail) => {
    const detailParts = detail.split(' | ');
    if(detailParts.length !== 3 && detailParts.length !== 4) {
      alert(JSON.stringify(detailParts));
      alert('Invalid section details format');
    }

    let location = "";
    let daysString = "";
    let timeRange = "";
    let dateRange = "";

    if (detailParts.length === 3) {
      // Without location
      [daysString, timeRange, dateRange] = detailParts;
    } else {
      // With location
      [location, daysString, timeRange, dateRange] = detailParts;
    }

    let  days = daysString.split(' ');
    let [startTime, endTime] = timeRange.split(' - ');

    startTime = convertTo24HourFormat(startTime)
    endTime = convertTo24HourFormat(endTime)

    //Handle the "Fri (Alternate Weeks)" case, or any text that isn't a valid day
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"]

    days = days.reduce<string[]>((acc, str) => {
      const firstThreeChars = str.substring(0, 3)
      
      if (daysOfWeek.includes(firstThreeChars))
        {
          acc.push(firstThreeChars)
        }
      
      return acc
    }, []);

    //@TODO: Change for summer term support
    const term = dateRange.includes('2024') ? Term.winterOne : Term.winterTwo
  
    detailsArr.push({
      term: term,
      days: days,
      startTime: startTime,
      endTime: endTime,
      location: location,
      dateRange: dateRange
    })
  })

  //Removing duplicates, some are from reading week split on workday
  const removeDuplicates = (arr: SectionDetail[]) => {
    const seen = new Set();
    return arr.filter(item => {
      const serializedItem = JSON.stringify(item);
      return seen.has(serializedItem) ? false : seen.add(serializedItem);
    });
  };
  
  // Remove duplicates
  detailsArr = removeDuplicates(detailsArr);

  return detailsArr
}

export async function extractSection(element: Element) {
  const courseLabels = element.parentElement?.querySelectorAll('[data-automation-id="promptOption"]'); // The div with the raw text of the course section data.
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

  const code = title.slice(0, title.indexOf(" - "));

  const name = title.slice(title.indexOf(" - ") + 3);

  // ~~~ Start of stupidly hacky code ~~~

  // This may or may not have been gpt'd
  // Create a promise that resolves when the DOM is updated
  const waitForDOMUpdate = (targetNode: Node): Promise<void> => {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations, obs) => {
            resolve();
            obs.disconnect();
        });

        observer.observe(targetNode, {
            childList: true,
            subtree: true,
        });
    });
  }

  let button = element.querySelector('div[role="button"][data-automation-id="compositeToggleIcon"]') as HTMLDivElement
  //Click expand to load the SectionDetails info. If not expanded before, data is not in the HTML document, cant get
  if (button && button.getAttribute('aria-expanded') === "false") {
    button.click()
  }

  //Some how, this button can get into dom without waiting for dom update, but the data doesn't with this one unless we wait
  let moreButton = element.querySelector('div[role="button"][data-automation-id="wd-MoreLink"]') as HTMLDivElement
  if (moreButton && moreButton.getAttribute('aria-expanded') === "false") {
    moreButton.click()
    moreButton.click()
    //double click to close since it can be very long
  }

  let sectionDetailsElements = element.querySelectorAll('[data-automation-id="promptOption"][data-automation-label*="|"][role="link"]')
  //If there are not more loaded then we need to wait for the dom to update before querying the sectionDetails
  if (moreButton && sectionDetailsElements.length <= 6) {
    await waitForDOMUpdate(element)
  }

  // ~~~ End of stupidly hacky code ~~~

  // Extracting instructors details from labels
  const instructorElements = element.parentElement?.querySelectorAll('[data-automation-id="promptOption"]');
  let instructors: string[] = [];
  
  if(instructorElements) {
    for(let i = 2; i < instructorElements.length; i++) {
      if(!instructorElements[i].textContent?.includes("|")) {
        instructors.push(instructorElements[i]?.textContent || "");
      }
    }
  }

  //Find all the sectionDetails elements, turn to an array, and then join them all into one string that contains all the sectionDetails
  sectionDetailsElements = element.querySelectorAll('[data-automation-id="promptOption"][data-automation-label*="|"][role="link"]')
  //can slice first element because it should be duplicate. The first elem is from non-expand sectionDetails
  const sectionDetailsTextArr = Array.from(sectionDetailsElements).map(element => element.textContent?.trim() || '').slice(1) 
  const sectionDetailsTextString = sectionDetailsTextArr.join(', ')

  const sectionDetailsArr = parseSectionDetails(sectionDetailsTextArr);

  const term = getTermFromSectionDetailsString(sectionDetailsTextString);

  // Creating a new section object
  const newSection: ISectionData = {
    code: code,
    name: name,
    instructors: instructors,
    type: SectionType.lecture,
    term: term,
    sectionDetails: sectionDetailsArr,
    worklistNumber: 0,
    color: defaultColorList[0]
  };

  return newSection;
}
