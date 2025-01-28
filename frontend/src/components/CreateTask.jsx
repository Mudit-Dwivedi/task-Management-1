


import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import backgroundImage from "../assets/bg.jpg"

const CreateTask = () => {
  const [task, setTask] = useState("")
  const [status, setStatus] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Save to MySQL via backend API
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, {
        task,
        status,
      })

        if(response.status !== 200) {
          throw new Error("Failed to add task.")
        }

      setTask("")
      setStatus("")
      toast.success("Task created successfully!")
      navigate("/") // Redirect to dashboard
    } catch (err) {
      console.error(err)
      toast.error("Failed to add task.")
    }
  }

  return (
    <div className="relative w-full min-h-screen">
    {/* Background Image */}
    <div
      className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-0"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    ></div>

    {/* Form Container */}
    <div className="relative z-10 flex justify-center items-center min-h-screen">
      <div className="w-11/12 md:w-1/2 bg-white rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-4">Add Task</h2>
          <div className="mb-4">
            <label htmlFor="task" className="block text-lg font-medium mb-2">
              Task
            </label>
            <input
              type="text"
              id="task"
              placeholder="Enter Task"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-lg font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  </div>
  )
}

export default CreateTask

