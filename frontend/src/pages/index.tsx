import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { booksAPI } from '../lib/api';
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bookData, setBookData] = useState({
    booksName: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Загружаем публичные книги
    booksAPI.getPublic()
      .then(res => setFeaturedBooks(res.data.slice(0, 6)))
      .catch(err => console.error(err));
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setBookData({ ...bookData, booksName: file.name.replace(/\.[^/.]+$/, '') });
      toast.success(`Файл "${file.name}" загружен`);
    }
  }, [bookData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/epub+zip': ['.epub'],
    },
    maxFiles: 1,
  });

  const handleCreateBook = async () => {
    if (!uploadedFile) {
      toast.error('Загрузите файл');
      return;
    }

    if (!bookData.booksName) {
      toast.error('Введите название книги');
      return;
    }

    try {
      // Читаем содержимое файла
      const text = await uploadedFile.text();
      
      // Разбиваем на главы (простой парсинг)
      const chapters = parseTextIntoChapters(text);

      // Создаем книгу
      const newBook = await booksAPI.create({
        ...bookData,
        authorId: user?.id,
        public: false,
        chapters,
      });

      toast.success('Книга создана!');
      setShowUploadModal(false);
      setUploadedFile(null);
      setBookData({ booksName: '', category: '', description: '' });
      
      // Переходим к редактированию книги
      router.push(`/admin/chapters?bookId=${newBook.data.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка создания книги');
    }
  };

  const parseTextIntoChapters = (text: string) => {
    // Простой парсер - разбиваем по "Глава X" или пустым строкам
    const lines = text.split('\n');
    const chapters: any[] = [];
    let currentChapter: any = null;
    let chapterNumber = 1;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Определяем начало новой главы
      if (
        /^Глава\s+\d+/i.test(trimmed) ||
        /^Chapter\s+\d+/i.test(trimmed) ||
        (index > 0 && !lines[index - 1].trim() && trimmed && trimmed.length < 100)
      ) {
        if (currentChapter && currentChapter.content) {
          chapters.push(currentChapter);
        }
        currentChapter = {
          id: `chapter-${Date.now()}-${chapterNumber}`,
          title: trimmed || `Глава ${chapterNumber}`,
          content: '',
          chapterNumber: chapterNumber++,
        };
      } else if (currentChapter) {
        currentChapter.content += line + '\n';
      } else {
        // Первая глава
        currentChapter = {
          id: `chapter-${Date.now()}-${chapterNumber}`,
          title: `Глава ${chapterNumber}`,
          content: line + '\n',
          chapterNumber: chapterNumber++,
        };
      }
    });

    if (currentChapter && currentChapter.content) {
      chapters.push(currentChapter);
    }

    // Если не нашли глав, создаем одну
    if (chapters.length === 0) {
      chapters.push({
        id: `chapter-${Date.now()}-1`,
        title: 'Содержание',
        content: text,
        chapterNumber: 1,
      });
    }

    return chapters;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <Toaster position="top-right" />

      {/* Animated 3D Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-2000 top-0 right-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-blob animation-delay-4000 bottom-20 left-1/2"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/5 backdrop-blur-xl border-b border-white/10">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-4xl">📚</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Learning
            </span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/books" className="text-white hover:text-purple-300 transition-all transform hover:scale-105">
              Библиотека
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/achievements" className="text-white hover:text-purple-300 transition-all transform hover:scale-105">
                  🏆 Достижения
                </Link>
                <Link href="/profile" className="text-white hover:text-purple-300 transition-all transform hover:scale-105">
                  Профиль
                </Link>
                <Link href="/notifications" className="text-white hover:text-purple-300 transition-all transform hover:scale-105">
                  🔔
                </Link>
                {(user?.role === 'admin' || user?.role === 'author') && (
                  <Link 
                    href="/admin/books" 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Админ панель
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" className="text-white hover:text-purple-300 transition-all transform hover:scale-105">
                  Войти
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative container mx-auto px-4 py-20">
        {/* Main Content */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Обучение с
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
              {' '}AI Технологиями
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto animate-fade-in-delay">
            Загрузите свои книги и получите автоматически сгенерированные вопросы 
            с помощью искусственного интеллекта
          </p>

          {/* Upload Section */}
          {isLoggedIn && (user?.role === 'admin' || user?.role === 'author') && (
            <div className="mb-12 animate-fade-in-delay-2">
              <button
                onClick={() => setShowUploadModal(true)}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-2xl hover:shadow-purple-500/50"
              >
                <svg className="w-8 h-8 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Загрузить книгу
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-6 justify-center animate-fade-in-delay-3">
            <Link
              href="/books"
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-lg text-white rounded-xl font-semibold hover:bg-white/20 transition-all transform hover:scale-105 border border-white/20"
            >
              <span className="relative z-10">Исследовать библиотеку</span>
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
            </Link>
            {!isLoggedIn && (
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
              >
                Начать бесплатно
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: '🤖',
              title: 'AI Генерация',
              description: 'Автоматическое создание вопросов на основе содержания с помощью нейронных сетей',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: '📚',
              title: 'Умная библиотека',
              description: 'Загружайте книги в любом формате и систематизируйте свои знания',
              color: 'from-pink-500 to-red-500',
            },
            {
              icon: '🎯',
              title: 'Интерактивное обучение',
              description: 'Проходите тесты с мгновенной обратной связью и детальной статистикой',
              color: 'from-indigo-500 to-purple-500',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:border-white/30 transition-all transform hover:scale-105 hover:-translate-y-2"
            >
              <div className={`text-6xl mb-4 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-purple-200">{feature.description}</p>
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Featured Books */}
        {featuredBooks.length > 0 && (
          <div className="animate-fade-in-delay-4">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Популярные книги
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBooks.map((book: any) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group relative bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/30 transition-all transform hover:scale-105"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {book.booksName}
                    </h3>
                    <p className="text-purple-200 text-sm mb-4 line-clamp-3">
                      {book.description || 'Нет описания'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="px-3 py-1 bg-purple-500/50 text-white rounded-full">
                        {book.category || 'Без категории'}
                      </span>
                      <span className="text-purple-300">
                        {book.chapters?.length || 0} глав
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl animate-scale-in">
            <h2 className="text-3xl font-bold text-white mb-6">Загрузить новую книгу</h2>
            
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 mb-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-purple-400 bg-purple-500/20'
                  : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <svg className="w-16 h-16 mx-auto mb-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {uploadedFile ? (
                <div>
                  <p className="text-white text-lg font-semibold mb-2">✅ {uploadedFile.name}</p>
                  <p className="text-purple-300">Нажмите или перетащите другой файл для замены</p>
                </div>
              ) : (
                <div>
                  <p className="text-white text-lg font-semibold mb-2">
                    {isDragActive ? 'Отпустите файл здесь' : 'Перетащите файл сюда'}
                  </p>
                  <p className="text-purple-300">или нажмите для выбора</p>
                  <p className="text-purple-400 text-sm mt-2">Поддерживаются: TXT, PDF, EPUB</p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-purple-200 mb-2">Название книги *</label>
                <input
                  type="text"
                  value={bookData.booksName}
                  onChange={(e) => setBookData({ ...bookData, booksName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all backdrop-blur-xl"
                  placeholder="Введите название книги"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Категория</label>
                <input
                  type="text"
                  value={bookData.category}
                  onChange={(e) => setBookData({ ...bookData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all backdrop-blur-xl"
                  placeholder="Например: Программирование, История"
                />
              </div>
              <div>
                <label className="block text-purple-200 mb-2">Описание</label>
                <textarea
                  value={bookData.description}
                  onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all backdrop-blur-xl resize-none"
                  placeholder="Краткое описание книги"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleCreateBook}
                disabled={!uploadedFile || !bookData.booksName}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                Создать книгу
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFile(null);
                  setBookData({ booksName: '', category: '', description: '' });
                }}
                className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all backdrop-blur-xl border border-white/20"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-in 0.3s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fadeIn 1s ease-in 0.6s both;
        }
        
        .animate-fade-in-delay-3 {
          animation: fadeIn 1s ease-in 0.9s both;
        }
        
        .animate-fade-in-delay-4 {
          animation: fadeIn 1s ease-in 1.2s both;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}



