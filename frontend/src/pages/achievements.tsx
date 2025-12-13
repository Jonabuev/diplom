import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usersAPI, historyAPI } from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  type: 'questions' | 'books' | 'accuracy' | 'streak';
}

export default function Achievements() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        usersAPI.getProfile(),
        historyAPI.getStatistics(),
      ]);

      setUser(profileRes.data);
      setStatistics(statsRes.data);

      // Генерируем достижения на основе статистики
      const achievementsList: Achievement[] = [
        {
          id: 'first_steps',
          title: 'Первые шаги',
          description: 'Ответьте на 10 вопросов',
          icon: '🎯',
          requirement: 10,
          currentProgress: statsRes.data.totalQuestions,
          unlocked: statsRes.data.totalQuestions >= 10,
          type: 'questions',
        },
        {
          id: 'curious_mind',
          title: 'Любопытный разум',
          description: 'Ответьте на 50 вопросов',
          icon: '🧠',
          requirement: 50,
          currentProgress: statsRes.data.totalQuestions,
          unlocked: statsRes.data.totalQuestions >= 50,
          type: 'questions',
        },
        {
          id: 'knowledge_seeker',
          title: 'Искатель знаний',
          description: 'Ответьте на 100 вопросов',
          icon: '📚',
          requirement: 100,
          currentProgress: statsRes.data.totalQuestions,
          unlocked: statsRes.data.totalQuestions >= 100,
          type: 'questions',
        },
        {
          id: 'master_of_knowledge',
          title: 'Мастер знаний',
          description: 'Ответьте на 500 вопросов',
          icon: '🏆',
          requirement: 500,
          currentProgress: statsRes.data.totalQuestions,
          unlocked: statsRes.data.totalQuestions >= 500,
          type: 'questions',
        },
        {
          id: 'book_starter',
          title: 'Начинающий читатель',
          description: 'Изучите 3 книги',
          icon: '📖',
          requirement: 3,
          currentProgress: statsRes.data.booksStudied,
          unlocked: statsRes.data.booksStudied >= 3,
          type: 'books',
        },
        {
          id: 'book_enthusiast',
          title: 'Книжный энтузиаст',
          description: 'Изучите 10 книг',
          icon: '📚',
          requirement: 10,
          currentProgress: statsRes.data.booksStudied,
          unlocked: statsRes.data.booksStudied >= 10,
          type: 'books',
        },
        {
          id: 'accurate_learner',
          title: 'Точный ученик',
          description: 'Достигните точности 80%',
          icon: '🎯',
          requirement: 80,
          currentProgress: parseFloat(statsRes.data.accuracy),
          unlocked: parseFloat(statsRes.data.accuracy) >= 80,
          type: 'accuracy',
        },
        {
          id: 'perfect_accuracy',
          title: 'Совершенство',
          description: 'Достигните точности 95%',
          icon: '⭐',
          requirement: 95,
          currentProgress: parseFloat(statsRes.data.accuracy),
          unlocked: parseFloat(statsRes.data.accuracy) >= 95,
          type: 'accuracy',
        },
        {
          id: 'hundred_correct',
          title: 'Сотня правильных',
          description: 'Ответьте правильно на 100 вопросов',
          icon: '✅',
          requirement: 100,
          currentProgress: statsRes.data.correctAnswers,
          unlocked: statsRes.data.correctAnswers >= 100,
          type: 'questions',
        },
      ];

      setAchievements(achievementsList);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (totalQuestions: number) => {
    // Формула: уровень = квадратный корень из (кол-во вопросов / 10)
    return Math.floor(Math.sqrt(totalQuestions / 10)) + 1;
  };

  const getNextLevelXP = (level: number) => {
    return Math.pow(level, 2) * 10;
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  const currentLevel = user?.lvl || calculateLevel(statistics?.totalQuestions || 0);
  const nextLevelXP = getNextLevelXP(currentLevel);
  const currentXP = statistics?.totalQuestions || 0;
  const xpProgress = ((currentXP % nextLevelXP) / nextLevelXP) * 100;

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
        {/* Level Progress */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Ваш уровень</h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-2">
                {currentLevel}
              </div>
              <p className="text-purple-100">Уровень</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-purple-100 mb-2">
                <span>Опыт: {currentXP % nextLevelXP} / {nextLevelXP} XP</span>
                <span>До {currentLevel + 1} уровня</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>
              <p className="text-purple-200 text-sm mt-2">
                💡 Совет: Отвечайте на вопросы, чтобы получать опыт и повышать уровень!
              </p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">Достижения</h2>
            <div className="bg-purple-500 px-4 py-2 rounded-lg">
              <span className="text-white font-semibold">
                {unlockedCount} / {totalAchievements}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-xl p-6 transition ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`text-5xl ${
                      achievement.unlocked ? 'grayscale-0' : 'grayscale opacity-50'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {achievement.title}
                    </h3>
                    <p className="text-purple-100 text-sm mb-3">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-purple-200">
                          <span>Прогресс</span>
                          <span>
                            {achievement.currentProgress} / {achievement.requirement}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (achievement.currentProgress / achievement.requirement) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {achievement.unlocked && (
                      <div className="flex items-center gap-2 text-white text-sm">
                        <span>✓</span>
                        <span>Разблокировано!</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}



