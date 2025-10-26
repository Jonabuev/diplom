import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { notificationsAPI } from '../lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationsAPI.getMy();
      setNotifications(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки уведомлений');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      loadNotifications();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('Все уведомления отмечены как прочитанные');
      loadNotifications();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      toast.success('Уведомление удалено');
      loadNotifications();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleClearAll = async () => {
    if (confirm('Удалить все уведомления?')) {
      try {
        await notificationsAPI.clearAll();
        toast.success('Все уведомления удалены');
        setNotifications([]);
      } catch (error) {
        toast.error('Ошибка');
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✕';
      default:
        return 'ℹ';
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
            📚 Learning Platform
          </Link>
          <div className="flex gap-4">
            <Link href="/books" className="text-white hover:text-purple-200 transition">
              Книги
            </Link>
            <Link href="/profile" className="text-white hover:text-purple-200 transition">
              Профиль
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">Уведомления</h1>
            <div className="flex gap-4">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={handleMarkAllAsRead}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
                  >
                    Отметить все
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Очистить все
                  </button>
                </>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-purple-100 text-xl">Нет уведомлений</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`bg-white/10 p-6 rounded-xl ${
                    !notification.isRead ? 'border-2 border-purple-400' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 ${getTypeColor(
                        notification.type
                      )} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
                    >
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Новое
                          </span>
                        )}
                      </div>
                      <p className="text-purple-100 mb-3">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200 text-sm">
                          {new Date(notification.createdAt).toLocaleString('ru-RU')}
                        </span>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-purple-200 hover:text-white text-sm underline"
                            >
                              Прочитано
                            </button>
                          )}
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="text-purple-200 hover:text-white text-sm underline"
                            >
                              Перейти
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-red-300 hover:text-red-100 text-sm underline"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

