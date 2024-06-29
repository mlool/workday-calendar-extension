import "./ColoredRangeDetail.css"

interface ColoredRange {
  lowerBound: number
  upperBound: number
}

interface ColoredRangeDetailProps {
  label: string | JSX.Element
  numericValue: number | null
  range: ColoredRange
  // renders what the numericValue is "out of".
  // for example, 2 with a max of 5, is rendered as "2 / 5"
  showRange: boolean
}

function ColoredRangeDetail(props: ColoredRangeDetailProps) {
  const segmentSize = (props.range.upperBound - props.range.lowerBound) / 5
  const segments: Record<number, string> = {
    [props.range.lowerBound + segmentSize]: "very-low-number",
    [props.range.lowerBound + 2 * segmentSize]: "low-number",
    [props.range.lowerBound + 3 * segmentSize]: "mid-number",
    [props.range.lowerBound + 4 * segmentSize]: "high-number",
    [props.range.upperBound]: "very-high-number",
  }

  const getColor = () => {
    if (props.numericValue === null) return "unavailable-number"
    for (const segment in segments) {
      if (Number(segment) >= props.numericValue) return segments[segment]
    }
    throw `Color for "${props.numericValue}" in "[${props.range.lowerBound},${props.range.upperBound}]" not found!`
  }

  const getNumberDisplay = () => {
    if (props.numericValue === null) return "??"
    return props.showRange
      ? props.numericValue + " / " + props.range.upperBound
      : props.numericValue
  }

  return (
    <div className="colored-range-detail">
      {typeof props.label === "string" ? <p>{props.label}</p> : props.label}
      <p className={`numeric-value-box ${getColor()}`}>{getNumberDisplay()}</p>
    </div>
  )
}

export { ColoredRangeDetail, type ColoredRange }
