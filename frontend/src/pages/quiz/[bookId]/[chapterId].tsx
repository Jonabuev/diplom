import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { questionsAPI, historyAPI, notificationsAPI } from '../../../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function QuizPage() {
  const router = useRouter();
  const { bookId, chapterId } = router.query;
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string; isCorrect: boolean }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (bookId && chapterId) {
      loadQuestions();
    }
  }, [bookId, chapterId]);

  // Таймер
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const loadQuestions = async () => {
    try {
      const response = await questionsAPI.getByChapter(chapterId as string);
      if (response.data.length === 0) {
        toast.error('Вопросы для этой главы еще не созданы');
        setTimeout(() => router.back(), 2000);
        return;
      }
      setQuestions(response.data);
      // Устанавливаем время: 1 минута на вопрос
      setTimeLeft(response.data.length * 60);
    } catch (error) {
      toast.error('Ошибка загрузки вопросов');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setTimerActive(true);
  };

  const handleTimeout = () => {
    setTimerActive(false);
    toast.error('Время вышло!');
    submitQuiz();
  };

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      toast.error('Выберите ответ');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
      },
    ]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setTimerActive(false);
    setShowResult(true);

    // Сохраняем все ответы в историю
    try {
      for (const answer of answers) {
        await historyAPI.addAnswer(
          bookId as string,
          answer.questionId,
          answer.answer,
          answer.isCorrect
        );
      }
      // Последний ответ если есть
      if (selectedAnswer && currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
        await historyAPI.addAnswer(
          bookId as string,
          currentQuestion.id,
          selectedAnswer,
          isCorrect
        );
      }
      toast.success('Результаты сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения результатов', error);
    }
  };

  const calculateResults = () => {
    let correct = answers.filter((a) => a.isCorrect).length;
    if (selectedAnswer && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        correct++;
      }
    }
    const total = questions.length;
    const percentage = Math.round((correct / total) * 100);
    return { correct, total, percentage };
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Вопросы не найдены</div>
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
          <div className="flex gap-4 items-center">
            {timerActive && (
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-white font-bold">⏱ {formatTime(timeLeft)}</span>
              </div>
            )}
            {!showResult && (
              <Link href={`/books/${bookId}`} className="text-white hover:text-purple-200 transition">
                Выход
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {!quizStarted ? (
          // Стартовый экран
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-6">Готовы начать тест?</h1>
            <div className="text-purple-100 text-xl mb-8">
              <p className="mb-4">Количество вопросов: {questions.length}</p>
              <p className="mb-4">Время на прохождение: {questions.length} минут</p>
              <p className="mb-4">Выберите правильный ответ для каждого вопроса</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105"
            >
              Начать тест
            </button>
          </div>
        ) : showResult ? (
          // Экран результатов
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-12">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">Результаты теста</h1>
            {(() => {
              const { correct, total, percentage } = calculateResults();
              return (
                <>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/10 p-6 rounded-xl text-center">
                      <div className="text-4xl font-bold text-white mb-2">{correct}</div>
                      <div className="text-purple-100">Правильных ответов</div>
                    </div>
                    <div className="bg-white/10 p-6 rounded-xl text-center">
                      <div className="text-4xl font-bold text-white mb-2">{total - correct}</div>
                      <div className="text-purple-100">Неправильных ответов</div>
                    </div>
                    <div className="bg-white/10 p-6 rounded-xl text-center">
                      <div className="text-4xl font-bold text-white mb-2">{percentage}%</div>
                      <div className="text-purple-100">Точность</div>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    {percentage >= 80 ? (
                      <div className="text-6xl mb-4">🏆</div>
                    ) : percentage >= 60 ? (
                      <div className="text-6xl mb-4">👍</div>
                    ) : (
                      <div className="text-6xl mb-4">📚</div>
                    )}
                    <h2 className="text-3xl font-bold text-white mb-4">
                      {percentage >= 80
                        ? 'Отлично!'
                        : percentage >= 60
                        ? 'Хорошо!'
                        : 'Нужно больше практики'}
                    </h2>
                    <p className="text-purple-100 text-xl">
                      {percentage >= 80
                        ? 'Вы отлично справились с тестом!'
                        : percentage >= 60
                        ? 'Неплохой результат, продолжайте в том же духе!'
                        : 'Прочитайте главу еще раз и попробуйте снова'}
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Link
                      href={`/books/${bookId}`}
                      className="bg-white text-purple-700 px-8 py-3 rounded-lg font-semibold hover:bg-purple-100 transition"
                    >
                      Вернуться к книге
                    </Link>
                    <Link
                      href="/profile"
                      className="bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
                    >
                      Мой профиль
                    </Link>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          // Экран вопроса
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
            {/* Прогресс */}
            <div className="mb-8">
              <div className="flex justify-between text-purple-100 mb-2">
                <span>
                  Вопрос {currentQuestionIndex + 1} из {questions.length}
                </span>
                <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Вопрос */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">
                {questions[currentQuestionIndex].questionText}
              </h2>
              <div className="space-y-4">
                {questions[currentQuestionIndex].options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(option)}
                    className={`w-full text-left p-6 rounded-xl transition transform hover:scale-[1.02] ${
                      selectedAnswer === option
                        ? 'bg-purple-600 text-white border-2 border-white'
                        : 'bg-white/10 text-purple-100 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          selectedAnswer === option
                            ? 'bg-white text-purple-600'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка следующего вопроса */}
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className={`px-8 py-3 rounded-lg font-semibold transition ${
                  selectedAnswer
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Завершить тест' : 'Следующий вопрос'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



