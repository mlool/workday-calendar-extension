import { useEffect, useState } from "react"
import { IGradesAPIData, getGradesData, getGradesUrl } from "./GradesHelper"
import "./GradesComponent.css"
import "../PopupComponent.css"
import {
  ColoredRange,
  ColoredRangeDetail,
} from "../../../components/ColoredRangeDetail"

interface GradesDetailProps {
  sectionCode: string
}

const UBC_GRADES_RANGE: ColoredRange = { lowerBound: 50, upperBound: 100 }

const GradesComponent = ({ sectionCode }: GradesDetailProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gradesData, setGradesData] = useState<IGradesAPIData>()
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    const fetchGrades = async () => {
      setIsLoading(true)
      setIsError(false)
      try {
        const data = await getGradesData(sectionCode)
        setGradesData(data)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGrades()
  }, [])

  const gradesURL = getGradesUrl(sectionCode)

  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Grade Information: </div>
      {isError ? (
        <div>Error loading grades.</div>
      ) : isLoading ? (
        <div>Loading...</div>
      ) : (
        <ColoredRangeDetail
          label={
            <a href={gradesURL} target="_blank" rel="noreferrer">
              Average (5 Years)
            </a>
          }
          numericValue={gradesData ? gradesData?.average : null}
          range={UBC_GRADES_RANGE}
          showRange={false}
          precision={2}
        />
      )}
    </div>
  )
}

export default GradesComponent
