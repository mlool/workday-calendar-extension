import { useEffect, useState } from "react";
import { IGradesAPIData, getGradesData, getGradesUrl } from "./GradesHelper";
import { ISectionData } from "../../App/App.types";
import "./GradesComponent.css";

interface IProps {
  selectedSection: ISectionData;
}

const GradesComponent = ({ selectedSection }: IProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gradesData, setGradesData] = useState<IGradesAPIData>();
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchGrades = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        let data = await getGradesData(selectedSection);
        setGradesData(data);
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, [selectedSection]);

  const gradesURL = getGradesUrl(selectedSection);

  return (
    <div className="GradesComponentContainer">
      <div className="GradesInformationTitle">Grade Information: </div>
      {isError ? (
        <div>Error loading grades.</div>
      ) : isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="GradesContainer">
            <table>
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
            </table>
          </div>
          <a
            className="GradesLink"
            href={gradesURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on UBC-Grades
          </a>
        </>
      )}
    </div>
  );
};

export default GradesComponent;
