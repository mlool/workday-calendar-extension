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
