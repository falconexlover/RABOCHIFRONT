# Гостиничный комплекс "Лесной Дворик"

Полнофункциональное веб-приложение для управления бронированиями и информацией о номерах гостиничного комплекса.

## 📚 Документация

- [Установка и запуск](INSTALL.md)
- [API Reference](docs/API_REFERENCE.md)
- [Структура проекта](docs/PROJECT_STRUCTURE.md)
- [Руководство по развертыванию](docs/DEPLOY.md)
- [Схема базы данных](docs/DATABASE_SCHEMA.md)
- [Аутентификация](docs/AUTHENTICATION.md)
- [Логирование](docs/LOGGER_IMPLEMENTATION.md)

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 14+ и npm 7+
- PostgreSQL (для production)

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/falconexlover/sitectestoviy.git
cd lesnoy-dvorik

# Установка зависимостей
npm run install:all

# Настройка переменных окружения
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### Запуск

```bash
# Режим разработки
npm run dev

# Продакшн сборка
npm run build
npm start
```

## 🛠 Технологии

### Фронтенд

- React 18+
- React Router 6
- Tailwind CSS
- Chart.js для аналитики
- Formik и Yup для валидации форм
- Axios для HTTP запросов
- React Icons

### Бэкенд

- Node.js с Express
- PostgreSQL (production) / SQLite (development)
- Sequelize ORM
- JWT для аутентификации
- Swagger для документации API
- Winston для логирования
- i18next для интернационализации

## 📁 Структура проекта

```
/
├── frontend/                 # React фронтенд
│   ├── public/               # Статические файлы
│   └── src/                  # Исходный код React
│       ├── assets/           # Изображения, шрифты и т.д.
│       ├── components/       # Многоразовые компоненты
│       ├── context/          # React контексты
│       ├── hooks/            # Пользовательские хуки
│       ├── pages/            # Страницы приложения
│       ├── services/         # Сервисы для API запросов
│       └── utils/            # Вспомогательные функции
├── backend/                  # Node.js бэкенд
│   ├── config/               # Конфигурация приложения
│   ├── controllers/          # Контроллеры для обработки запросов
│   ├── middlewares/          # Middleware функции
│   ├── models/               # Sequelize модели
│   ├── routes/               # Маршруты Express
│   ├── utils/                # Вспомогательные функции
│   └── locales/              # Файлы локализации
├── docs/                     # Документация проекта
└── scripts/                  # Скрипты для разработки и деплоя
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm test

# Тесты фронтенда
npm run test:frontend

# Тесты бэкенда
npm run test:backend
```

## 🔍 Линтинг

```bash
# Проверка всех файлов
npm run lint

# Линтинг фронтенда
npm run lint:frontend

# Линтинг бэкенда
npm run lint:backend
```

## 📝 Форматирование кода

```bash
# Форматирование всех файлов
npm run format
```

## 🔄 CI/CD

Проект настроен на автоматическое развертывание через Vercel. Подробности в [DEPLOY.md](docs/DEPLOY.md).

## 📞 Поддержка

При возникновении проблем обращайтесь:

- Email: info@lesnoy-dvorik.ru
- Телефон: +7 (498) 483-19-41

## 📄 Лицензия

Этот проект лицензирован под ISC лицензией.
