# Обучающая платформа с генерацией вопросов

Дипломный проект - обучающая платформа с использованием нейронных моделей для генерации вопросов на основе глав книг.

## 🚀 Технологии

### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Yarn** - менеджер пакетов

### Backend
- **NestJS** - Node.js фреймворк
- **TypeORM** - ORM для работы с БД
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **Swagger** - документация API

## 📁 Структура проекта

```
diplom/
├── frontend/          # Next.js приложение
│   ├── src/
│   │   └── app/       # Страницы и компоненты
│   └── package.json
├── backend/           # NestJS API
│   ├── src/
│   │   ├── auth/      # Модуль аутентификации
│   │   ├── users/     # Модуль пользователей
│   │   ├── books/     # Модуль книг и глав
│   │   └── questions/ # Модуль вопросов и AI генерации
│   └── package.json
└── README.md
```

## 🛠 Установка и запуск

### Предварительные требования
- Node.js 18+ (рекомендуется 20 или 22)
- PostgreSQL 14+
- Yarn

### 1. Клонирование репозитория
```bash
git clone <your-repository-url>
cd diplom
```

### 2. Установка зависимостей

#### Backend
```bash
cd backend
yarn install --ignore-engines
```

#### Frontend
```bash
cd frontend
yarn install
```

### 3. Настройка переменных окружения

#### Backend (.env)
Создайте файл `backend/.env`:
```env
# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=learning_platform

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Application
PORT=3001
NODE_ENV=development

# AI Model (для будущей интеграции)
AI_MODEL_API_URL=http://localhost:5000
AI_MODEL_API_KEY=your_api_key
```

#### Frontend (.env.local)
Создайте файл `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Настройка базы данных

Создайте базу данных PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE learning_platform;
\q
```

### 5. Запуск приложения

#### Backend (в режиме разработки)
```bash
cd backend
yarn start:dev
```
Backend будет доступен на `http://localhost:3001`  
Swagger документация: `http://localhost:3001/api/docs`

#### Frontend (в режиме разработки)
```bash
cd frontend
yarn dev
```
Frontend будет доступен на `http://localhost:3000`

## 📚 Основная функциональность

### ✅ Реализовано
- Регистрация и аутентификация пользователей
- JWT токены для безопасности
- CRUD операции для книг
- CRUD операции для глав книг
- CRUD операции для вопросов
- REST API с Swagger документацией
- TypeORM интеграция с PostgreSQL

### 🚧 В разработке
- Интеграция с нейронной моделью для генерации вопросов
- UI для работы с книгами и главами
- Система тестирования студентов
- Отслеживание прогресса обучения
- Панель администратора

## 🔌 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Пользователи
- `GET /api/users` - Список пользователей
- `GET /api/users/:id` - Информация о пользователе

### Книги
- `GET /api/books` - Список книг
- `POST /api/books` - Создать книгу
- `GET /api/books/:id` - Получить книгу
- `PATCH /api/books/:id` - Обновить книгу
- `DELETE /api/books/:id` - Удалить книгу

### Главы
- `GET /api/books/:bookId/chapters` - Главы книги
- `POST /api/books/:bookId/chapters` - Создать главу

### Вопросы
- `GET /api/questions` - Все вопросы
- `GET /api/questions/by-chapter/:chapterId` - Вопросы по главе
- `POST /api/questions/generate/:chapterId` - 🤖 Генерация вопросов AI
- `POST /api/questions` - Создать вопрос
- `PATCH /api/questions/:id` - Обновить вопрос
- `DELETE /api/questions/:id` - Удалить вопрос

## 🧪 Тестирование

### Backend
```bash
cd backend
yarn test              # Unit тесты
yarn test:e2e          # E2E тесты
yarn test:cov          # С покрытием
```

### Frontend
```bash
cd frontend
yarn test
```

## 📦 Сборка для production

### Backend
```bash
cd backend
yarn build
yarn start:prod
```

### Frontend
```bash
cd frontend
yarn build
yarn start
```

## 🤝 Разработка

### Создание новых модулей (NestJS)
```bash
cd backend
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

### Создание миграций
```bash
cd backend
yarn typeorm migration:generate -n MigrationName
yarn typeorm migration:run
```

## 📝 TODO для диплома

- [ ] Интеграция с AI моделью (GPT/Claude) для генерации вопросов
- [ ] Разработка UI компонентов для работы с материалами
- [ ] Система ролей (студент, преподаватель, админ)
- [ ] Загрузка книг из файлов (PDF, DOCX)
- [ ] Статистика и аналитика обучения
- [ ] Адаптивный дизайн
- [ ] Развертывание на production сервере

## 📄 Лицензия

Дипломный проект

## 👤 Автор

Ваше имя - Дипломная работа 2025

