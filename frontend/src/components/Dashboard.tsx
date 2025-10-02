import { useState, useEffect, useRef, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { TaskModal } from "./TaskModal";
import api from "../lib/api";
import {
  Search,
  Filter,
  Inbox,
  Loader2,
  MessageSquare,
  X,
  Send,
  Bot,
  PlusCircle,
  User,
  LogOut,
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
}

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: `Hello ${user?.fullName}! I'm your AI assistant. How can I help you with your tasks today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Task[]>("/tasks");
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const handleSaveTask = async (taskData: Omit<Task, "_id"> | Task) => {
    try {
      if ("_id" in taskData) {
        const { data } = await api.put<Task>(
          `/tasks/${taskData._id}`,
          taskData
        );
        setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
      } else {
        const { data } = await api.post<Task>("/tasks", taskData);
        setTasks([...tasks, data]);
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter((t) => t._id !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const openModalForEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const openModalForNew = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = { sender: "user", text: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsBotTyping(true);

    setTimeout(() => {
      const botResponse: ChatMessage = {
        sender: "bot",
        text: "Thanks for your message! This is a simulated response. In a real application, I would process your request about tasks.",
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsBotTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 shadow-lg text-white">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, <span className="text-indigo-300">{user?.fullName}</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 border border-white/20 bg-green-500 rounded-lg text-black hover:bg-white/20 hover:text-white transition-colors duration-300"
            >
              <User size={18} />
              <span className="font-semibold">Profile</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 border border-red-500 bg-red-500 rounded-lg text-black hover:bg-red-500/40 hover:text-white transition-colors duration-300"
            >
              <LogOut size={18} />
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                title="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                title="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-center my-8">
          <button
            onClick={openModalForNew}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
          >
            <PlusCircle size={24} />
            Add New Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col border-t-4 ${
                  task.priority === "high"
                    ? "border-red-500"
                    : task.priority === "medium"
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
              >
                <div className="p-6 flex-grow">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">
                    {task.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{task.description}</p>
                </div>
                <div className="px-6 pb-4 flex justify-between items-center">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      task.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in_progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                  <button
                    onClick={() => openModalForEdit(task)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    title="Edit Task"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700 transition-colors"
                    title="Delete Task"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
                <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {tasks.length > 0 ? "No Results Found" : "No Tasks Yet"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {tasks.length > 0
                    ? "Your search and filter combination did not match any tasks."
                    : 'Click the "+ Add Task" button to create your first task.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      {isModalOpen && (
        <TaskModal
          task={selectedTask}
          onSave={handleSaveTask}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      <div className="fixed bottom-8 right-8 z-50">
        {isChatOpen && (
          <div className="w-80 h-[28rem] bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out">
            <div className="bg-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <h3 className="font-semibold text-lg">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-indigo-700 p-1 rounded-full"
                title="Close AI Chat"
              >
                <X size={20} />
              </button>
            </div>

            <div
              ref={chatContainerRef}
              className="flex-1 p-4 overflow-y-auto space-y-4"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={20} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-indigo-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot size={20} />
                  </div>
                  <div className="bg-gray-200 text-gray-800 rounded-lg p-3 rounded-bl-none">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about your tasks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isBotTyping}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
                  disabled={isBotTyping || !inputMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform duration-200 hover:scale-110"
            aria-label="Open AI Chat"
          >
            <MessageSquare size={32} />
          </button>
        )}
      </div>
    </div>
  );
};
