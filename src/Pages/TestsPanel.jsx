import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { authService } from '../services/ApiService';

const TestsPanel = () => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTest, setSelectedTest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete', 'view'
    const [formData, setFormData] = useState({
        name: '',
        category: 'strength',
        description: '',
        unit: 'seconds',
        higher_is_better: true
    });
    const navigate = useNavigate();

    // Categorías disponibles (basadas en tu modelo Django)
    const CATEGORIES = [
        { value: 'strength', label: 'Fuerza' },
        { value: 'endurance', label: 'Resistencia' },
        { value: 'speed', label: 'Velocidad' },
        { value: 'flexibility', label: 'Flexibilidad' },
        { value: 'agility', label: 'Agilidad' },
        { value: 'balance', label: 'Equilibrio' },
        { value: 'coordination', label: 'Coordinación' }
    ];

    // Unidades disponibles (basadas en tu modelo Django)
    const UNITS = [
        { value: 'seconds', label: 'Segundos' },
        { value: 'minutes', label: 'Minutos' },
        { value: 'meters', label: 'Metros' },
        { value: 'centimeters', label: 'Centímetros' },
        { value: 'kilograms', label: 'Kilogramos' },
        { value: 'repetitions', label: 'Repeticiones' },
        { value: 'score', label: 'Puntuación' }
    ];

    useEffect(() => {
        const checkAuth = async () => {
            const user = authService.getCurrentUser();
            if (!user || user.role !== 'admin') {
                navigate('/admin-dashboard');
                return;
            }
            
            fetchTests();
        };
        
        checkAuth();
    }, [navigate]);

    // Obtener todos los tests
    const fetchTests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get('/lab/list/');
            console.log('Tests response:', response.data);
            setTests(response.data.tests || []);
        } catch (err) {
            console.error('Error fetching tests:', err);
            setError('Error al cargar los tests. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Abrir modal para crear test
    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            name: '',
            category: 'strength',
            description: '',
            unit: 'seconds',
            higher_is_better: true
        });
        setShowModal(true);
    };

    // Abrir modal para editar test
    const openEditModal = (test) => {
        setModalMode('edit');
        setSelectedTest(test);
        setFormData({
            name: test.name || '',
            category: test.category || 'strength',
            description: test.description || '',
            unit: test.unit || 'seconds',
            higher_is_better: test.higher_is_better !== undefined ? test.higher_is_better : true
        });
        setShowModal(true);
    };

    // Abrir modal para ver detalles del test
    const openViewModal = (test) => {
        setModalMode('view');
        setSelectedTest(test);
        setShowModal(true);
    };

    // Abrir modal para eliminar test
    const openDeleteModal = (test) => {
        setModalMode('delete');
        setSelectedTest(test);
        setShowModal(true);
    };

    // Cerrar modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedTest(null);
        setError(null);
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            if (modalMode === 'create') {
                console.log('Creating test with data:', formData);
                await apiClient.post('/lab/create/', formData);
            } else if (modalMode === 'edit') {
                console.log('Updating test with data:', formData);
                await apiClient.put(`/lab/update/${selectedTest.id}/`, formData);
            } else if (modalMode === 'delete') {
                console.log('Deleting test with ID:', selectedTest.id);
                await apiClient.delete(`/lab/delete/${selectedTest.id}/`);
            }
            
            await fetchTests();
            closeModal();
        } catch (err) {
            console.error('Error en operación:', err);
            const errorMessage = err.response?.data?.message || 
                                err.response?.data?.error || 
                                'Ocurrió un error. Inténtalo de nuevo.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Volver al dashboard de admin
    const goBack = () => {
        navigate('/admin-dashboard');
    };

    // Función para obtener el color de la categoría
    const getCategoryColor = (category) => {
        const colors = {
            strength: 'bg-red-100 text-red-800',
            endurance: 'bg-blue-100 text-blue-800',
            speed: 'bg-yellow-100 text-yellow-800',
            flexibility: 'bg-green-100 text-green-800',
            agility: 'bg-purple-100 text-purple-800',
            balance: 'bg-indigo-100 text-indigo-800',
            coordination: 'bg-pink-100 text-pink-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    // Función para obtener el label de la categoría
    const getCategoryLabel = (category) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat ? cat.label : category;
    };

    // Función para obtener el label de la unidad
    const getUnitLabel = (unit) => {
        const u = UNITS.find(u => u.value === unit);
        return u ? u.label : unit;
    };

    if (loading && tests.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={goBack}
                            className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="bg-purple-600 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Tests</h1>
                    </div>
                    <button 
                        onClick={openCreateModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition shadow-md flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Crear Test
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                        <button 
                            onClick={() => setError(null)}
                            className="ml-auto text-red-500 hover:text-red-700"
                        >
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Tests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map(test => (
                        <div key={test.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate">{test.name}</h3>
                                    <div className="flex space-x-1">
                                        <button 
                                            onClick={() => openViewModal(test)}
                                            className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                                            title="Ver detalles"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(test)}
                                            className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                                            title="Editar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => openDeleteModal(test)}
                                            className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                            title="Eliminar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Categoría:</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(test.category)}`}>
                                            {getCategoryLabel(test.category)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Unidad:</span>
                                        <span className="text-sm font-medium text-gray-700">{getUnitLabel(test.unit)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Mejor resultado:</span>
                                        <span className={`text-sm font-medium ${test.higher_is_better ? 'text-green-600' : 'text-red-600'}`}>
                                            {test.higher_is_better ? 'Mayor es mejor ↑' : 'Menor es mejor ↓'}
                                        </span>
                                    </div>
                                    
                                    {test.description && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {tests.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tests disponibles</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza creando tu primer test.</p>
                        <div className="mt-6">
                            <button 
                                onClick={openCreateModal}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
                            >
                                Crear Test
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 bg-gray-50 border-b">
                            <h3 className="text-xl font-semibold text-gray-800">
                                {modalMode === 'create' && 'Crear Nuevo Test'}
                                {modalMode === 'edit' && 'Editar Test'}
                                {modalMode === 'view' && 'Detalles del Test'}
                                {modalMode === 'delete' && 'Eliminar Test'}
                            </h3>
                            <button 
                                onClick={closeModal}
                                className="p-1 hover:bg-gray-200 rounded transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto">
                            {modalMode === 'delete' ? (
                                <div className="p-6">
                                    <p className="mb-4 text-gray-700">
                                        ¿Estás seguro de que quieres eliminar el test <span className="font-semibold">"{selectedTest?.name}"</span>?
                                    </p>
                                    <p className="mb-6 text-red-600 text-sm">
                                        Esta acción no se puede deshacer. Todos los resultados asociados también se eliminarán.
                                    </p>
                                    
                                    <div className="flex justify-end space-x-3">
                                        <button 
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            onClick={handleSubmit}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                                                    Eliminando...
                                                </>
                                            ) : (
                                                'Eliminar Test'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : modalMode === 'view' ? (
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Nombre del Test</label>
                                        <p className="text-lg font-medium text-gray-900">{selectedTest?.name}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTest?.category)}`}>
                                                {getCategoryLabel(selectedTest?.category)}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Unidad de Medida</label>
                                            <p className="text-base text-gray-900">{getUnitLabel(selectedTest?.unit)}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Criterio de Evaluación</label>
                                        <p className={`text-base font-medium ${selectedTest?.higher_is_better ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedTest?.higher_is_better ? 'Mayor resultado es mejor ↑' : 'Menor resultado es mejor ↓'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                                        <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">
                                            {selectedTest?.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Test</label>
                                            <input 
                                                type="text" 
                                                name="name" 
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                placeholder="Ej: Sprint 100m, Press de banca, Flexiones"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                                <select 
                                                    name="category" 
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                >
                                                    {CATEGORIES.map(category => (
                                                        <option key={category.value} value={category.value}>
                                                            {category.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                                                <select 
                                                    name="unit" 
                                                    value={formData.unit}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                >
                                                    {UNITS.map(unit => (
                                                        <option key={unit.value} value={unit.value}>
                                                            {unit.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                            <textarea 
                                                name="description" 
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                                placeholder="Describe brevemente el test, su objetivo y cómo se ejecuta..."
                                            />
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="higher_is_better" 
                                                name="higher_is_better" 
                                                checked={formData.higher_is_better}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="higher_is_better" className="ml-2 block text-sm text-gray-700">
                                                Mayor resultado es mejor (desmarcar si menor es mejor)
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                                        <button 
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit"
                                            className={`px-4 py-2 rounded-lg text-white transition flex items-center ${
                                                modalMode === 'create' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>{modalMode === 'create' ? 'Crear Test' : 'Actualizar Test'}</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestsPanel;