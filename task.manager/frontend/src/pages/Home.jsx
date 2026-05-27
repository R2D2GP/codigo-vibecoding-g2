import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import Dialog from '../components/ui/Dialog';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedTask, setSelectedTask] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getAll();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = () => {
    setDialogMode('create');
    setSelectedTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task) => {
    setDialogMode('edit');
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDelete = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (dialogMode === 'create') {
        await taskApi.create(formData);
      } else {
        await taskApi.update(selectedTask.id, formData);
      }
      setDialogOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await taskApi.delete(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await taskApi.update(task.id, { ...task, completed: !task.completed });
      fetchTasks();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Hola, {user?.name}
            </span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Cerrar sesión
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nueva Tarea</span>
            </button>
          </div>
        </div>

        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
        />

        <Dialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title={dialogMode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
        >
          <TaskForm
            task={selectedTask}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </Dialog>

        <Dialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Confirmar eliminación"
        >
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas eliminar la tarea <strong>"{taskToDelete?.title}"</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
            >
              Eliminar
            </button>
          </div>
        </Dialog>
      </div>
    </div>
  );
}