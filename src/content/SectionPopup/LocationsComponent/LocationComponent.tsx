import "../PopupComponent.css"

interface IProps {
  locations: string[]
}

const LocationComponent = ({ locations }: IProps) => {
  const locationsArr = locations.filter(
    (item, index) => locations.indexOf(item) === index
  )

  const uniqueLocations = new Set(
    locationsArr.map((location) => {
      const parts = location.split(/[- ]/) || ""
      if (parts.length > 1) {
        const loca = parts[0] + "-" + parts.slice(-1)[0]
        return {
          location: location,
          link: `https://learningspaces.ubc.ca/classrooms/${loca}`,
        }
      } else {
        return {
          location: location,
          link: "",
        }
      }
    })
  )

  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Locations:</div>
      {Array.from(uniqueLocations).map((locationObj) => (
        <div key={locationObj.location}>
          <a href={locationObj.link} target="_blank" rel="noopener noreferrer">
            {locationObj.location}
          </a>
        </div>
      ))}
    </div>
  )
}

export default LocationComponent
