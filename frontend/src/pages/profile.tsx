import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usersAPI, historyAPI, booksAPI } from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [myBooks, setMyBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        usersAPI.getProfile(),
        historyAPI.getStatistics(),
      ]);
      
      setUser(profileRes.data);
      setStatistics(statsRes.data);

      // Загружаем книги пользователя
      if (profileRes.data.listBooks && profileRes.data.listBooks.length > 0) {
        const booksPromises = profileRes.data.listBooks.map((bookId: string) =>
          booksAPI.getOne(bookId).catch(() => null)
        );
        const booksData = await Promise.all(booksPromises);
        setMyBooks(booksData.filter((b) => b !== null).map((b) => b.data));
      }
    } catch (error) {
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Выход выполнен');
    router.push('/');
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
            📚 Learning Platform
          </Link>
          <div className="flex gap-4">
            <Link href="/books" className="text-white hover:text-purple-200 transition">
              Книги
            </Link>
            <Link href="/notifications" className="text-white hover:text-purple-200 transition">
              🔔
            </Link>
            <button
              onClick={handleLogout}
              className="text-white hover:text-purple-200 transition"
            >
              Выход
            </button>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{user?.username}</h1>
              <p className="text-purple-100 mb-1">{user?.email}</p>
              {user?.phone && <p className="text-purple-100">{user.phone}</p>}
              <div className="flex gap-4 mt-4">
                <div className="bg-purple-500 px-4 py-2 rounded-lg">
                  <span className="text-white font-semibold">Уровень: {user?.lvl}</span>
                </div>
                <div className="bg-pink-500 px-4 py-2 rounded-lg">
                  <span className="text-white font-semibold">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-2">
                {statistics.totalQuestions}
              </div>
              <div className="text-purple-100">Всего вопросов</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="text-3xl font-bold text-green-300 mb-2">
                {statistics.correctAnswers}
              </div>
              <div className="text-purple-100">Правильных ответов</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="text-3xl font-bold text-red-300 mb-2">
                {statistics.incorrectAnswers}
              </div>
              <div className="text-purple-100">Неправильных ответов</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-300 mb-2">
                {statistics.accuracy}%
              </div>
              <div className="text-purple-100">Точность</div>
            </div>
          </div>
        )}

        {/* My Books */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Мои книги</h2>
          {myBooks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-purple-100 text-xl mb-4">
                У вас пока нет книг в списке
              </p>
              <Link
                href="/books"
                className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-100 transition inline-block"
              >
                Перейти к книгам
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myBooks.map((book: any) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="bg-white/10 p-6 rounded-xl hover:bg-white/20 transition"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{book.booksName}</h3>
                  <p className="text-purple-100 text-sm mb-4 line-clamp-2">
                    {book.description || 'Нет описания'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-200">{book.category}</span>
                    <span className="text-purple-200">
                      {book.chapters?.length || 0} глав
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

