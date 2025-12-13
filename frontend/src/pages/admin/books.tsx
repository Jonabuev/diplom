import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { booksAPI } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminBooks() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    booksName: '',
    category: '',
    description: '',
    coverImage: '',
    public: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Проверяем права доступа
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'author') {
        toast.error('У вас нет прав доступа');
        setTimeout(() => router.push('/'), 2000);
        return;
      }
    }
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки книг');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book?: any) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        booksName: book.booksName,
        category: book.category || '',
        description: book.description || '',
        coverImage: book.coverImage || '',
        public: book.public,
      });
    } else {
      setEditingBook(null);
      setFormData({
        booksName: '',
        category: '',
        description: '',
        coverImage: '',
        public: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBook(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBook) {
        await booksAPI.update(editingBook.id, formData);
        toast.success('Книга обновлена');
      } else {
        await booksAPI.create({ ...formData, authorId: user?.id });
        toast.success('Книга создана');
      }
      handleCloseModal();
      loadBooks();
    } catch (error) {
      toast.error('Ошибка сохранения книги');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
      return;
    }
    try {
      await booksAPI.delete(id);
      toast.success('Книга удалена');
      loadBooks();
    } catch (error) {
      toast.error('Ошибка удаления книги');
    }
  };

  const handleTogglePublic = async (book: any) => {
    try {
      await booksAPI.togglePublic(book.id);
      toast.success(`Книга ${book.public ? 'скрыта' : 'опубликована'}`);
      loadBooks();
    } catch (error) {
      toast.error('Ошибка изменения статуса');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            📚 Admin Panel
          </Link>
          <div className="flex gap-4">
            <Link href="/admin/chapters" className="text-white hover:text-purple-200 transition">
              Главы
            </Link>
            <Link href="/books" className="text-white hover:text-purple-200 transition">
              Книги
            </Link>
            <Link href="/profile" className="text-white hover:text-purple-200 transition">
              Профиль
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Управление книгами</h1>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              + Создать книгу
            </button>
          </div>

          {books.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-100 text-xl">Книги еще не созданы</p>
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book: any) => (
                <div key={book.id} className="bg-white/10 rounded-xl p-6 flex items-start gap-6">
                  {book.coverImage && (
                    <img
                      src={book.coverImage}
                      alt={book.booksName}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{book.booksName}</h3>
                        <p className="text-purple-200 text-sm mb-2">{book.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
                            book.public
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {book.public ? 'Публичная' : 'Скрыта'}
                        </span>
                      </div>
                    </div>
                    <p className="text-purple-100 mb-4">{book.description || 'Нет описания'}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-purple-200 text-sm">
                        Глав: {book.chapters?.length || 0} • Создана:{' '}
                        {new Date(book.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/chapters?bookId=${book.id}`}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                        >
                          Главы
                        </Link>
                        <button
                          onClick={() => handleTogglePublic(book)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition text-sm"
                        >
                          {book.public ? 'Скрыть' : 'Опубликовать'}
                        </button>
                        <button
                          onClick={() => handleOpenModal(book)}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              {editingBook ? 'Редактировать книгу' : 'Создать книгу'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-100 mb-2">Название книги *</label>
                  <input
                    type="text"
                    value={formData.booksName}
                    onChange={(e) => setFormData({ ...formData, booksName: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300"
                    placeholder="Введите название книги"
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Категория</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300"
                    placeholder="Например: Программирование, История"
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300"
                    placeholder="Краткое описание книги"
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">URL обложки</label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="public"
                    checked={formData.public}
                    onChange={(e) => setFormData({ ...formData, public: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="public" className="text-purple-100">
                    Сделать книгу публичной
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                >
                  {editingBook ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



