import { useEffect, useState } from 'react'

const Calendar = () => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    chrome.storage.sync.get(['clickCount'], (result) => {
      if (result.clickCount !== undefined) {
        setValue(result.clickCount)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ clickCount: value })
  }, [value])

  return (
    <div>
      Calendar
    </div>
  )
}

export default Calendar