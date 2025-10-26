import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { booksAPI } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function Books() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await booksAPI.getPublic();
      setBooks(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки книг');
    } finally {
      setLoading(false);
    }
  };

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
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="text-white hover:text-purple-200 transition">
                  Профиль
                </Link>
                <Link href="/notifications" className="text-white hover:text-purple-200 transition">
                  🔔
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-purple-200 transition">
                  Войти
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Публичные книги</h1>

        {loading ? (
          <div className="text-center text-white text-xl">Загрузка...</div>
        ) : books.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center">
            <p className="text-white text-xl">Книги пока не добавлены</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book: any) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition transform hover:scale-105"
              >
                {book.coverImage && (
                  <img
                    src={book.coverImage}
                    alt={book.booksName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-bold text-white mb-2">{book.booksName}</h2>
                <p className="text-purple-100 mb-4 line-clamp-3">
                  {book.description || 'Нет описания'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full">
                    {book.category || 'Без категории'}
                  </span>
                  <span className="text-purple-200">
                    {book.chapters?.length || 0} глав
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

