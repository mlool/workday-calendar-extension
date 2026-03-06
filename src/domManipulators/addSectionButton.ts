import { extractSection } from "../backends/workday/idSearchApi";
import { toggleContainer } from "../content";

// Function to add a button to a given HTML element
function addButtonToElement(element: Element, reskinButton?: boolean, clickTarget?: Element): void {
  // Creating a button element
  const button: HTMLButtonElement = document.createElement("button");
  // Setting the button text content to '+'
  button.textContent = "+";
  // Add custom button id
  button.id = "add-section-button";
  // Adding an event listener for when the button is clicked
  const targetForClick = clickTarget ?? element;
  button.addEventListener("click", (event) => {
    const clickedButton = event.currentTarget as HTMLButtonElement;
    const liveContainer = clickedButton.closest('[data-automation-id="compositeContainer"]');
    handleButtonClick(liveContainer ?? targetForClick);
  });

  // Styling the button
  button.style.padding = "5px 10px";

  button.style.fontSize = "16px";
  button.style.color = "#333";
  button.style.backgroundColor = "#EEF1F2";
  button.style.boxShadow = "0 0 0 1px #CED3D9";
  button.style.cursor = "pointer";
  button.style.marginRight = "10px";
  if (
    element.previousElementSibling &&
    element.previousElementSibling.getAttribute("data-automation-id") ===
      "checkbox"
  ) {
    button.style.marginLeft = "24px";
  }
  button.style.borderRadius = "5px";
  button.style.transition = "all 120ms ease-in";
  button.style.border = "none";
  button.style.outline = "none";
  button.style.textAlign = "center"; // Center the text horizontally

  // Adding display flex and align-items center to the button's parent
  const parentElement = element.parentElement;
  if (parentElement) {
    parentElement.style.display = "flex";
    parentElement.style.alignItems = "center";
  }

  // Adding event listeners for mouse enter and leave to change button style
  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#CED3D9";
    button.style.boxShadow = "0 0 0 1px #9DA9AF";
  });

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#EEF1F2";
    button.style.boxShadow = "0 0 0 1px #CED3D9";
  });

  // Inserting the button before the given element
  if (reskinButton && reskinButton === true) {
    element.appendChild(button);
    return;
  }
  element.parentNode?.insertBefore(button, element);
}

// Function to handle button click event
async function handleButtonClick(element: Element): Promise<void> {
  toggleContainer(true);
  await extractSection(element);
}

// Function to observe DOM changes and add buttons to matching elements
export function observeDOMAndAddButtons(): void {
  // Configuration for the mutation observer
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false,
  };

  // Callback function for the mutation observer
  const callback: MutationCallback = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // Finding matching elements within the added node
            const containers = node.querySelectorAll(
              '[data-automation-id="compositeContainer"]'
            ); // last time buttons gone, this selector broke
            // Adding buttons to matching elements
            containers.forEach((container) => {
              // Check if the element already has a button as a previous sibling
              const firstContainer = container.firstElementChild;
              if (!firstContainer) {
                return;
              }

              if (firstContainer.id === "add-section-button") {
                return; 
              }

              const previousContainer = firstContainer.previousElementSibling;
              const isButtonAlreadyPresent = previousContainer && previousContainer.id === "add-section-button";
              if (!isButtonAlreadyPresent) {
                addButtonToElement(firstContainer, false, container);
              }
            });
            const matchingElementsForReskinExtension = document
              .getElementById("react-root")
              ?.querySelectorAll("div.AddButtonGoHere");
            matchingElementsForReskinExtension?.forEach((container) => {
              const matchingElementChild = container.firstElementChild;
              const isButtonAlreadyPresent =
                matchingElementChild &&
                matchingElementChild.id === "add-section-button";
              if (!isButtonAlreadyPresent) {
                addButtonToElement(container, true);
              }
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
