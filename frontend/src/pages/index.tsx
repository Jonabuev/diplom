import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { booksAPI } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    // Загружаем публичные книги
    booksAPI.getPublic()
      .then(res => setFeaturedBooks(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
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
                <Link href="/register" className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-100 transition">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Обучайся с нейронными моделями
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Платформа для изучения книг с автоматической генерацией вопросов на основе искусственного интеллекта
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/books" className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-100 transition">
              Начать обучение
            </Link>
            {!isLoggedIn && (
              <Link href="/register" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Создать аккаунт
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Генерация</h3>
            <p className="text-purple-100">
              Автоматическая генерация вопросов на основе содержания глав с помощью нейронных сетей
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-bold text-white mb-2">Библиотека книг</h3>
            <p className="text-purple-100">
              Большая коллекция книг по различным категориям для вашего обучения
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Отслеживание прогресса</h3>
            <p className="text-purple-100">
              Следите за своим прогрессом, статистикой ответов и достижениями
            </p>
          </div>
        </div>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Популярные книги
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredBooks.map((book: any) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="bg-white/10 backdrop-blur-md p-6 rounded-xl hover:bg-white/20 transition"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{book.booksName}</h3>
                  <p className="text-purple-100 text-sm mb-4">{book.description || 'Нет описания'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">{book.category}</span>
                    <span className="text-purple-200 text-sm">
                      {book.chapters?.length || 0} глав
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
