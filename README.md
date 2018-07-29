# Установка
Запустить `yarn install` из корневой директории
Для запуска в режиме "development", "production", "staging" смотри `package.json`

# Docs
Инициализация бота в node: `./src/index.js`
Файл бота, который общается с Instagram в `./src/InstagramCommerce.js`
Настройки для общения с Instagram в файле `workarounds.json`
Конфиг к монге: mongodb.config (сейчас используется mlab) - поменять на свой

Модели для БД прописаны в `./middleware/api/models`
Методы для доступа к Instagram API в `./middleware/api/methods`

Лэндос находится в `./middleware/static/public`

# Instagram-интеграция
Бот использует 2 аккаунта для сбора данных:
* Первый - собирает всю статистику о текущих пользователях
* Второй - проверяет статус подписки на каждое действие пользователя

Аккаунты для Instagram прописывать свои, т.к. текущие уже забанили, пароль для них ставить одинаковый

# Info
Админы прописываются в файле `admins.json`
Кнопки и сообщения прописываются в файле `buttons.json` & `messages.json`