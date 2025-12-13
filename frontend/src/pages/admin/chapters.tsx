import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { booksAPI } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminChapters() {
  const router = useRouter();
  const { bookId } = router.query;
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapterNumber: 1,
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
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'author') {
        toast.error('У вас нет прав доступа');
        setTimeout(() => router.push('/'), 2000);
        return;
      }
    }
    if (bookId) {
      loadBook();
    }
  }, [bookId]);

  const loadBook = async () => {
    try {
      const response = await booksAPI.getOne(bookId as string);
      setBook(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки книги');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (chapter?: any) => {
    if (chapter) {
      setEditingChapter(chapter);
      setFormData({
        title: chapter.title,
        content: chapter.content,
        chapterNumber: chapter.chapterNumber,
      });
    } else {
      setEditingChapter(null);
      const nextChapterNumber = book?.chapters?.length ? book.chapters.length + 1 : 1;
      setFormData({
        title: '',
        content: '',
        chapterNumber: nextChapterNumber,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChapter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingChapter) {
        await booksAPI.updateChapter(bookId as string, editingChapter.id, formData);
        toast.success('Глава обновлена');
      } else {
        await booksAPI.addChapter(bookId as string, formData);
        toast.success('Глава создана');
      }
      handleCloseModal();
      loadBook();
    } catch (error) {
      toast.error('Ошибка сохранения главы');
    }
  };

  const handleDelete = async (chapterId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту главу?')) {
      return;
    }
    try {
      await booksAPI.deleteChapter(bookId as string, chapterId);
      toast.success('Глава удалена');
      loadBook();
    } catch (error) {
      toast.error('Ошибка удаления главы');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Книга не найдена</div>
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
            <Link href="/admin/books" className="text-white hover:text-purple-200 transition">
              ← Книги
            </Link>
            <Link href="/profile" className="text-white hover:text-purple-200 transition">
              Профиль
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{book.booksName}</h2>
            <p className="text-purple-200">{book.description}</p>
          </div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Главы книги</h1>
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
            >
              + Добавить главу
            </button>
          </div>

          {!book.chapters || book.chapters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-purple-100 text-xl">Главы еще не добавлены</p>
            </div>
          ) : (
            <div className="space-y-4">
              {book.chapters
                .sort((a: any, b: any) => a.chapterNumber - b.chapterNumber)
                .map((chapter: any) => (
                  <div key={chapter.id} className="bg-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Глава {chapter.chapterNumber}. {chapter.title}
                        </h3>
                        <p className="text-purple-100 line-clamp-3">{chapter.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleOpenModal(chapter)}
                          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div className="text-purple-200 text-sm">
                      Символов: {chapter.content.length}
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
          <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-6">
              {editingChapter ? 'Редактировать главу' : 'Добавить главу'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-100 mb-2">Номер главы *</label>
                  <input
                    type="number"
                    value={formData.chapterNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, chapterNumber: parseInt(e.target.value) })
                    }
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Название главы *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300"
                    placeholder="Введите название главы"
                  />
                </div>
                <div>
                  <label className="block text-purple-100 mb-2">Содержание главы *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={15}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border-none focus:ring-2 focus:ring-purple-400 placeholder-purple-300 font-mono"
                    placeholder="Введите текст главы..."
                  />
                  <p className="text-purple-200 text-sm mt-2">
                    Символов: {formData.content.length}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition"
                >
                  {editingChapter ? 'Сохранить' : 'Создать'}
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

