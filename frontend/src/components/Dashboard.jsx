

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ref, remove } from "firebase/database"
import { database } from "../firebase"
import { toast } from "react-toastify"
import axios from "axios"
import backgroundImage from "../assets/bg.jpg"
const Dashboard = () => {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`) // Use the environment variable here
        if (response.status === 200) {
          setTasks(response.data) // Assuming response.data is the array of tasks
        } else {
          toast.error(`Failed to fetch tasks. Status: ${response.status}`)
        }
      } catch (error) {
        console.error(error)
        toast.error("Error fetching tasks from the database.")
      }
    }

    fetchTasks()
  }, [])

  const handleDelete = async (taskId) => {
    try {
      // Hit the SQL API first
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`) // Use the environment variable here
  
      // Check if the response is successful (status 200)
      if (response.status === 200) {
        // Proceed to delete the task from Firebase
        await remove(ref(database, `tasks/${taskId}`))
  
        // Update the tasks state to trigger re-render
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
  
        // Show the success toast after re-rendering
        toast.success("Task deleted successfully!")
      } else {
        // If the status is not 200, show an error toast
        toast.error(`Failed to delete task from SQL database. Status: ${response.status}`)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to delete task.")
    }
  }



  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/tasks/${taskId}`, { status: newStatus })
      if (response.status === 200) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        )
        toast.success("Task status updated successfully!")
      } else {
        toast.error("Failed to update task status.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to update task status.")
    }
  }


  const formatDate = (dateString) => {
    const date = new Date(dateString.replace(" ", "T"))
    return date.toLocaleString()
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

  {/* Content */}
  <div className="relative z-10 flex flex-col justify-center items-center min-h-screen">
    <div className="title mb-6 text-white text-3xl font-semibold">Task Management Dashboard</div>
    <div className="w-11/12 md:w-3/4 lg:w-2/3 bg-white p-6 rounded-lg shadow-md mt-4">
      <Link
        to="/tasks"
        className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 mb-4 inline-block"
      >
        Add Task
      </Link>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Task ID</th>
            <th className="py-2 px-4 border-b text-left">Task</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Created At</th>
            <th className="py-2 px-4 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b">
              <td className="py-2 px-4">{task.id}</td>
              <td className="py-2 px-4">{task.name}</td>
              <td className="py-2 px-4">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
              <td className="py-2 px-4">{formatDate(task.created_at)}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleDelete(task.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

  )
}

export default Dashboard
