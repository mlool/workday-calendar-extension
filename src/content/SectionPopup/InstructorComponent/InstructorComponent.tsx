import { useEffect, useState } from "react"
import Browser from "webextension-polyfill"
import { RMPData } from "../../../backends/rateMyProf"
import {
  ColoredRange,
  ColoredRangeDetail,
} from "../../../components/ColoredRangeDetail"
import "../PopupComponent.css"

interface IProps {
  instructors: string[]
  isVancouver: boolean
}

const RMP_RANGE: ColoredRange = { lowerBound: 0, upperBound: 5 }

const InstructorComponent = ({ instructors, isVancouver }: IProps) => {
  const [rmpRatings, setRmpRatings] = useState<Record<string, RMPData | null>>()

  useEffect(() => {
    populateRmpRatings()
  }, [])

  const populateRmpRatings = async () => {
    const fetches = []
    for (const prof of instructors) {
      fetches.push(
        // cannot directly fetch from RMP here - fetching
        // from the service worker with the right
        // host_permissions allows us to bypass CORS.
        Browser.runtime.sendMessage({
          type: "RMP",
          prof: prof,
          isVancouver: isVancouver,
        })
      )
    }
    const results = await Promise.all(fetches)
    const ratings = results.reduce<Record<string, RMPData>>(
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
                  label={
                    <a
                      target="_blank"
                      href={rmpRatings[instructor]?.link}
                      rel="noreferrer"
                    >
                      {instructor}
                    </a>
                  }
                  numericValue={
                    rmpRatings[instructor]
                      ? rmpRatings[instructor]!.rating
                      : null
                  }
                  range={RMP_RANGE}
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
