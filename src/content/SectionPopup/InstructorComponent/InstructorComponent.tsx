import { useEffect, useState } from "react"
import Browser from "webextension-polyfill"
import { ColoredRangeDetail } from "../../../components/ColoredRangeDetail"
import "../PopupComponent.css"
interface IProps {
  instructors: string[]
}

const InstructorComponent = ({ instructors }: IProps) => {
  const [rmpRatings, setRmpRatings] = useState<Record<string, number | null>>()

  useEffect(() => {
    populateRmpRatings()
  }, [])

  const populateRmpRatings = async () => {
    const fetches = []
    for (const prof of instructors) {
      fetches.push(
        Browser.runtime.sendMessage({
          type: "RMP",
          prof: prof,
        })
      )
    }
    const results = await Promise.all(fetches)
    const ratings = results.reduce<Record<string, number>>(
      (acc, item, index) => {
        acc[instructors[index]] = item
        return acc
      },
      {}
    )
    setRmpRatings(ratings)
  }

  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Instructors:</div>
      <div>
        {instructors && instructors.length > 0 ? (
          <ul>
            {instructors.map((instructor, index) =>
              rmpRatings === undefined ? (
                <li key={index}>{instructor}</li>
              ) : (
                <ColoredRangeDetail
                  key={index}
                  label={instructor}
                  numericValue={rmpRatings[instructor]}
                  max={5}
                  showRange={true}
                />
              )
            )}
          </ul>
        ) : (
          <div>Unavailable</div>
        )}
      </div>
    </div>
  )
}

export default InstructorComponent
