import { ISectionData } from "../App/App.types";

export async function addCoursesToSavedSchedule(sections: ISectionData[], scheduleID: string) {
  let sectionString = "";
  for (const section of sections) {
    sectionString += "15194$" + section.courseID;
    if (section !== sections[sections.length - 1]) {
      sectionString += ",";
    }
  }
  const urlencoded = new URLSearchParams();
  urlencoded.append("selected", sectionString);
  urlencoded.append("additionalParameter", "15873$" + scheduleID);

  const requestOptions = {
    method: "POST",
    body: urlencoded,
    redirect: "follow" as RequestRedirect,
  };

  return fetch(
    "https://wd10.myworkday.com/ubc/mass-select-action/2997$20406/13710$370.htmld",
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error("Error making schedule:", error);
      return null;
    });
}
