import { useEffect, useState } from "react"
import { IGradesAPIData, getGradesData, getGradesUrl } from "./GradesHelper"
import "./GradesComponent.css"
import "../PopupComponent.css"

interface GradesDetailProps {
  sectionCode: string
}

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

  const getClassName = (average: number | undefined) => {
    if (!average) return "AverageContainer unavailable"
    if (average < 60) {
      return "AverageContainer VeryLowAverage"
    } else if (average < 70) {
      return "AverageContainer LowAverage"
    } else if (average < 80) {
      return "AverageContainer MidAverage"
    } else if (average < 90) {
      return "AverageContainer HighAverage"
    } else {
      return "AverageContainer VeryHighAverage"
    }
  }

  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Grade Information: </div>
      {isError ? (
        <div>Error loading grades.</div>
      ) : isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="GradesContainer">
            <div>Average (5 Years):</div>
            <div
              className={getClassName(gradesData?.averageFiveYears)}
              onClick={() => window.open(gradesURL, "_blank")}
            >
              {gradesData?.average
                ? gradesData?.average.toFixed(2)
                : "unavailable"}
            </div>
            {/* <table>
              <tr>
                <td>Average (All Time)</td>
                <td>
                  {gradesData?.average
                    ? gradesData?.average.toFixed(2)
                    : "unavailable"}
                </td>
              </tr>
              <tr>
                <td>Average (5 Years)</td>
                <td>
                  {gradesData?.averageFiveYears
                    ? gradesData?.averageFiveYears.toFixed(2)
                    : "unavailable"}
                </td>
              </tr>
            </table> */}
          </div>
          {/* <a
            className="GradesLink"
            href={gradesURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on UBC-Grades
          </a> */}
        </>
      )}
    </div>
  )
}

export default GradesComponent
