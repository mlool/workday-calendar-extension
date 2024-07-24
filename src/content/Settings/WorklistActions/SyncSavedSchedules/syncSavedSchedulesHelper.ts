import { Term } from "../../../App/App.types"

export interface ScheduleItem {
  text: string
  instanceId: string
}

export function getAllSavedScheduleIDs() {
  const selectedItems = document.querySelectorAll(
    '[data-automation-id^="selectedItem_15873"]'
  )

  if (selectedItems.length) {
    const ids = []
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i]
      if (item instanceof HTMLElement && item.dataset.automationId) {
        const idParts = item.dataset.automationId.split("_")
        ids.push(idParts[1])
      }
    }
    return ids
  } else {
    console.error("No SelectedItem elements found")
    return null
  }
}

export function savedScheduleTerm(): Set<Term> {
  const possibleTerms = document.querySelectorAll(
    "[data-automation-id=promptOption]"
  )

  const allTerms = new Set([Term.One, Term.Two])
  if (!possibleTerms) {
    return allTerms
  }

  for (let i = 0; i < possibleTerms.length; i++) {
    const text = possibleTerms[i].textContent

    if (text && text.includes("Term 1")) {
      return new Set([Term.One])
    } else if (text && text.includes("Term 2")) {
      return new Set([Term.Two])
    }
  }

  return allTerms
}
