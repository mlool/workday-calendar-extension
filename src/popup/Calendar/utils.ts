import { ISectionData } from "../App/App.types";

export interface CellFormat {
  name: string;
  color: string;
}

export const convertToMatrix = (
  sections: ISectionData[],
  newSection: ISectionData,
  setInvalidSection: (state: boolean) => void
) => {
  let matrixDict: { [id: string]: CellFormat[] } = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: []
  };

  for (const [key, value] of Object.entries(matrixDict)) {
    let i = 0;
    while (i < 28) {
      let hour = 7 + Math.floor(i / 2);
      let stringHour = hour < 10 ? `0${hour}` : `${hour}`;
      let minute = i % 2 === 0 ? "00" : "30";
      let checkedTime = `${stringHour}:${minute}`;
      let foundSection = sections.find(
        (section) =>
          section.days.includes(key) && section.startTime === checkedTime
      );
      if (foundSection) {
        let [code, number] = foundSection.code.split(" ");
        value.push({
          name: code,
          color: "#eaffd1"
        });
        value.push({
          name: number,
          color: "#eaffd1"
        });
        i += 2;
        while (i < 28) {
          hour = 7 + Math.floor(i / 2);
          minute = i % 2 === 0 ? "00" : "30";
          if (`${hour.toString().padStart(2, '0')}:${minute}` === foundSection.endTime) break;
          value.push({
            name: "",
            color: "#eaffd1"
          });
          i += 1;
        }
      } else {
        value.push({
          name: "",
          color: "white"
        });
        i += 1;
      }
    }
  }

  let hasInvalidSection = true;
  if (newSection.startTime && newSection.endTime && newSection.days) {
    hasInvalidSection = false;
    for (let day of newSection.days) {
      let [hourStr, minutesStr] = newSection.startTime.split(":");
      let hourNum = +hourStr;
      let i = (hourNum - 7) * 2 + (minutesStr === "30" ? 1 : 0);

      //console.log('starttime: ' + newSection.startTime);
      //console.log('endtime: ' + newSection.endTime);

      while (i < 28) {
        let hour = 7 + Math.floor(i / 2);
        let minute = i % 2 === 0 ? "00" : "30";
        //console.log('hour/minute: ' + `${hour.toString().padStart(2, '0')}:${minute}`);
        if (`${hour.toString().padStart(2, '0')}:${minute}` === newSection.endTime) break;
        if (i < matrixDict[day].length && matrixDict[day][i]) { // Ensure i is within bounds
          if (matrixDict[day][i].color === "white") {
            matrixDict[day][i].color = "orange";
          } else {
            matrixDict[day][i].color = "red";
            hasInvalidSection = true;
          }
        }
        i += 1;
      }
    }
  }

  setInvalidSection(hasInvalidSection);
  return matrixDict;
};
