import "./TabBar.css"

interface TabBarProps<T> {
  label?: string
  items: T[]
  onClickHandler: (item: T) => void
  isSelected: (item: T) => boolean
  isHighlighted?: (item: T) => boolean
  tabTextBuilder?: (item: T) => string
  disableBackgroundTabs?: boolean
}

export default function TabBar<T>(props: TabBarProps<T>) {
  const determineTabColor = (item: T) => {
    if (props.isSelected(item)) return "tab-selected"
    if (props.isHighlighted && props.isHighlighted(item))
      return "tab-highlighted"
    if (props.disableBackgroundTabs && props.disableBackgroundTabs === true)
      return "tab-backgrounded-disabled"
    return "tab-backgrounded"
  }

  return (
    <div className="tab-bar-container">
      {props.label && <p className="tab-bar-label">{props.label}</p>}
      <div className="tab-bar">
        {props.items.map((item, index) => (
          <div
            key={index}
            className={`tab-bar-button ${determineTabColor(item)}`}
            onClick={() => props.onClickHandler(item)}
          >
            {props.tabTextBuilder ? props.tabTextBuilder(item) : String(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
