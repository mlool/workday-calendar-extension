import "../PopupComponent.css"

interface IProps {
  locations: Set<{ location: string | undefined; link: string } | undefined>
}

const LocationComponent = ({ locations }: IProps) => {
  const hasLocations = locations.size > 0

  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Locations:</div>
      {hasLocations ? (
        Array.from(locations).map((locationObj) => (
          <div key={locationObj?.location}>
            <a
              href={locationObj?.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locationObj?.location}
            </a>
          </div>
        ))
      ) : (
        <div>Unavailable</div>
      )}
    </div>
  )
}

export default LocationComponent
