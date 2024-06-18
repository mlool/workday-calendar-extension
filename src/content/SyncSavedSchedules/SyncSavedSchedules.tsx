import { ISectionData } from "../App/App.types";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

const syncSavedSchedules = (sections: ISectionData[] ) => {
  let showDropDown = true;
  console.log("reach")

  return (
    <div>
      {showDropDown && (
        <ConfirmationModal
          title="Select Saved Schdules"
          message={`Select 1 saved schedule below. Clicking confirm will add all of the classes in your worklist that match the term of the saved schedule`}
          onCancel={() => showDropDown = false}
          onConfirm={() => {
            showDropDown = false;
          }}
        />
      )}
    </div>
  )

}

export default syncSavedSchedules


  
  