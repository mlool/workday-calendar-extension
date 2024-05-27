import { useEffect, useState } from 'react'

const Form = () => {
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")

  return (
    <div>
        <form>
            <label>Title:</label>
            <input type='text'/>
            <br />
            <label>Section Detail:</label>
            <input type='text'/>
        </form>
    </div>
  )
}

export default Form