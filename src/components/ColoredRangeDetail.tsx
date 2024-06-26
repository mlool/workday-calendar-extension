import "./ColoredRangeDetail.css"

interface ColoredRangeProps {
  label: string
  numericValue: number | null
  max: number
  // renders what the numericValue is "out of".
  // for example, 2 with a max of 5, is rendered as "2 / 5"
  showRange: boolean
}

function ColoredRangeDetail(props: ColoredRangeProps) {
  const getColor = () => {
    if (props.numericValue === null) return "unavailable-number"
    const segments: Record<number, string> = {
      [props.max / 5]: "very-low-number",
      [(props.max * 2) / 5]: "low-number",
      [(props.max * 3) / 5]: "mid-number",
      [(props.max * 4) / 5]: "high-number",
      [props.max]: "very-high-number",
    }
    for (const segment in segments) {
      if (Number(segment) >= props.numericValue) return segments[segment]
    }
    throw `Color for "${props.numericValue}" out of "${props.max}" not found!`
  }

  const getNumberDisplay = () => {
    if (props.numericValue === null) return "??"
    return props.showRange
      ? props.numericValue + " / " + props.max
      : props.numericValue
  }

  return (
    <div className="colored-range-detail">
      <p>{props.label}</p>
      <p className={`numeric-value-box ${getColor()}`}>{getNumberDisplay()}</p>
    </div>
  )
}

export { ColoredRangeDetail }
