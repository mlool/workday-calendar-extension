import "./TabBar.css"

interface TabBarProps<Type> {
  label: string
  items: Type[]
  onClickHandler: (item: Type) => void
  isSelected: (item: Type) => boolean
  isHighlighted?: (item: Type) => boolean
}

export default function TabBar<Type>(props: TabBarProps<Type>) {
  const determineTabColor = (item: Type) => {
    if (props.isSelected(item)) return "tab-selected"
    if (props.isHighlighted && props.isHighlighted(item))
      return "tab-higlighted"
    return "tab-backgrounded"
  }

  return (
    <div className="tab-bar-container">
      <p className="tab-bar-label">{props.label}</p>
      <div className="tab-bar">
        {props.items.map((item, index) => (
          <div
            key={index}
            className={`tab-bar-button ${determineTabColor(item)}`}
            onClick={() => props.onClickHandler(item)}
          >
            {String(item)}
          </div>
        ))}
      </div>
    </div>
  )
}
