import "../PopupComponent.css"

interface IProps {
  locations: Set<{ location: string | undefined; link: string }>
}

const LocationComponent = ({ locations }: IProps) => {
  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Locations:</div>
      {Array.from(locations).map((locationObj) => (
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
