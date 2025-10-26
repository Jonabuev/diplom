import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { booksAPI, questionsAPI, usersAPI } from '../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function BookPage() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState<any>(null);
  const [questions, setQuestions] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inMyList, setInMyList] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      const response = await booksAPI.getOne(id as string);
      setBook(response.data);
      if (response.data.chapters && response.data.chapters.length > 0) {
        setSelectedChapter(response.data.chapters[0]);
      }
      
      // Проверяем, есть ли книга в списке пользователя
      if (user) {
        const profileResponse = await usersAPI.getProfile();
        setInMyList(profileResponse.data.listBooks?.includes(id));
      }
    } catch (error) {
      toast.error('Ошибка загрузки книги');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedChapter || !isLoggedIn) {
      toast.error('Выберите главу и войдите в систему');
      return;
    }

    try {
      toast.loading('Генерация вопросов...');
      await questionsAPI.generate(selectedChapter.id, id as string, 5);
      toast.dismiss();
      toast.success('Вопросы сгенерированы!');
      loadQuestions();
    } catch (error) {
      toast.dismiss();
      toast.error('Ошибка генерации вопросов');
    }
  };

  const loadQuestions = async () => {
    if (!selectedChapter) return;
    try {
      const response = await questionsAPI.getByChapter(selectedChapter.id);
      setQuestions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToList = async () => {
    if (!isLoggedIn || !user) {
      router.push('/login');
      return;
    }

    try {
      await usersAPI.addBookToList(user.id, id as string);
      setInMyList(true);
      toast.success('Книга добавлена в ваш список');
    } catch (error) {
      toast.error('Ошибка добавления книги');
    }
  };

  useEffect(() => {
    if (selectedChapter) {
      loadQuestions();
    }
  }, [selectedChapter]);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-white text-2xl">Загрузка...</div>;
  }

  if (!book) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-white text-2xl">Книга не найдена</div>;
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
              ← Назад к книгам
            </Link>
            {isLoggedIn && (
              <Link href="/profile" className="text-white hover:text-purple-200 transition">
                Профиль
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Book Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{book.booksName}</h1>
              <p className="text-purple-100 mb-4">{book.description}</p>
              <div className="flex gap-4 items-center">
                <span className="bg-purple-500 text-white px-4 py-2 rounded-full">
                  {book.category}
                </span>
                <span className="text-purple-100">
                  {book.chapters?.length || 0} глав
                </span>
              </div>
            </div>
            {isLoggedIn && !inMyList && (
              <button
                onClick={handleAddToList}
                className="bg-white text-purple-700 px-6 py-3 rounded-lg font-semibold hover:bg-purple-100 transition"
              >
                + Добавить в мой список
              </button>
            )}
          </div>
        </div>

        {/* Chapters and Content */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Chapters List */}
          <div className="md:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
              <h2 className="text-xl font-bold text-white mb-4">Главы</h2>
              <div className="space-y-2">
                {book.chapters?.map((chapter: any) => (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapter(chapter)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition ${
                      selectedChapter?.id === chapter.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-purple-100 hover:bg-white/20'
                    }`}
                  >
                    <div className="font-semibold">{chapter.chapterNumber}. {chapter.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="md:col-span-3">
            {selectedChapter ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6">
                  {selectedChapter.title}
                </h2>
                <div className="text-purple-100 whitespace-pre-wrap mb-6">
                  {selectedChapter.content}
                </div>

                {/* Generate Questions Button */}
                {isLoggedIn && (
                  <button
                    onClick={handleGenerateQuestions}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition mb-6"
                  >
                    🤖 Сгенерировать вопросы
                  </button>
                )}

                {/* Questions */}
                {questions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-2xl font-bold text-white mb-4">Вопросы по главе</h3>
                    <div className="space-y-4">
                      {questions.map((question: any, index: number) => (
                        <div key={question.id} className="bg-white/10 p-4 rounded-lg">
                          <p className="text-white font-semibold mb-2">
                            {index + 1}. {question.questionText}
                          </p>
                          <div className="space-y-2">
                            {question.options.map((option: string, optIndex: number) => (
                              <div key={optIndex} className="text-purple-100 ml-4">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </div>
                            ))}
                          </div>
                          <p className="text-green-300 mt-2 text-sm">
                            ✓ Правильный ответ: {question.correctAnswer}
                          </p>
                          {question.aiAnswer && (
                            <p className="text-purple-200 mt-2 text-sm italic">
                              💡 {question.aiAnswer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
                <p className="text-white text-xl">Выберите главу для чтения</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

