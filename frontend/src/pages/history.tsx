import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { historyAPI, booksAPI } from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function History() {
  const router = useRouter();
  const [histories, setHistories] = useState<any[]>([]);
  const [books, setBooks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await historyAPI.getMy();
      setHistories(response.data);

      // Загружаем информацию о книгах
      const bookIds = [...new Set(response.data.map((h: any) => h.bookId))];
      const booksData: any = {};
      for (const bookId of bookIds) {
        try {
          const bookResponse = await booksAPI.getOne(bookId);
          booksData[bookId] = bookResponse.data;
        } catch (error) {
          console.error(`Ошибка загрузки книги ${bookId}`, error);
        }
      }
      setBooks(booksData);
    } catch (error) {
      toast.error('Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistories = selectedBookId
    ? histories.filter((h) => h.bookId === selectedBookId)
    : histories;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-300';
    if (accuracy >= 60) return 'text-yellow-300';
    return 'text-red-300';
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
            <Link href="/profile" className="text-white hover:text-purple-200 transition">
              Профиль
            </Link>
            <Link href="/notifications" className="text-white hover:text-purple-200 transition">
              🔔
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">История прохождений</h1>
            
            {/* Фильтр по книгам */}
            <div className="flex gap-2 items-center">
              <label className="text-purple-100">Фильтр:</label>
              <select
                value={selectedBookId || ''}
                onChange={(e) => setSelectedBookId(e.target.value || null)}
                className="bg-white/20 text-white px-4 py-2 rounded-lg border-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">Все книги</option>
                {Object.entries(books).map(([bookId, book]: any) => (
                  <option key={bookId} value={bookId}>
                    {book.booksName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredHistories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-purple-100 text-xl mb-4">История прохождений пуста</p>
              <Link
                href="/books"
                className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-100 transition inline-block"
              >
                Начать обучение
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredHistories.map((history: any) => {
                const book = books[history.bookId];
                const accuracy = history.totalQuestions > 0
                  ? ((history.correctAnswers / history.totalQuestions) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={history.id} className="bg-white/10 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {book?.booksName || 'Книга удалена'}
                        </h3>
                        <p className="text-purple-200 text-sm">
                          {new Date(history.createdAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <Link
                        href={`/books/${history.bookId}`}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition text-sm"
                      >
                        Открыть книгу
                      </Link>
                    </div>

                    {/* Статистика */}
                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {history.totalQuestions}
                        </div>
                        <div className="text-purple-100 text-sm">Всего вопросов</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-300 mb-1">
                          {history.correctAnswers}
                        </div>
                        <div className="text-purple-100 text-sm">Правильно</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-300 mb-1">
                          {history.totalQuestions - history.correctAnswers}
                        </div>
                        <div className="text-purple-100 text-sm">Неправильно</div>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg text-center">
                        <div className={`text-2xl font-bold mb-1 ${getAccuracyColor(Number(accuracy))}`}>
                          {accuracy}%
                        </div>
                        <div className="text-purple-100 text-sm">Точность</div>
                      </div>
                    </div>

                    {/* Детали ответов */}
                    {history.answersDetails && history.answersDetails.length > 0 && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-purple-200 hover:text-white mb-2">
                          Показать детали ({history.answersDetails.length} ответов)
                        </summary>
                        <div className="bg-white/5 p-4 rounded-lg space-y-2 max-h-60 overflow-y-auto">
                          {history.answersDetails.map((answer: any, index: number) => (
                            <div
                              key={index}
                              className={`flex items-center gap-3 p-3 rounded ${
                                answer.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}
                            >
                              <div className="text-2xl">
                                {answer.isCorrect ? '✓' : '✗'}
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-semibold">Ответ: {answer.userAnswer}</p>
                                <p className="text-purple-200 text-sm">
                                  {new Date(answer.timestamp).toLocaleString('ru-RU')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}



