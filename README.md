# RollingSphere
## Запуск
0. Установить [Node.js и npm](https://nodejs.org/en/ "Сервер и пакетный менеджер").
0. Установить и запустить [MongoDB](https://docs.mongodb.com/manual/installation/ "База данных").
0. Установить зависимости: `npm install`
0. Запустить сервер: `npm start`
## Подключение к серверу
Набрать в адресной строке браузера `http://localhost:8080`

*Внимание:* на данный момент регистрация и авторизация работают без учёта паролей! Это будет исправлено в ближайшем будущем!
## Взаимодействие с сервером
Взаимодействие с сервером осуществляется посредством библиотеки **socket.io**

*Пример*
```
var socket = io('server-address');

// Отправить сообщение
socket.emit('message-name', {
  field1: 0,
  field2: 'some-data',
  field3: [ false, 1, '2' ],
  field4: { data: 'in-obkect' }
});

// Подписаться на сообщение
socket.on('message-name', function(data) {
  // some code
  console.log(data.field1 + data.field2);
});
```

## Сообщения (Messages)
### От клиента
#### auth
Отправляется при авторизации
```
data = {
  username: 'user1',
  password: 'pass1'
}
```
#### registration
Отправляется при регистрации
```
data = {
  username: 'user1',
  password: 'pass1'
}
```
#### game-over
Отправляется в при завершении игры
```
data = {
  coins: 10,        // кол-во собранных монеток
  score: 100,       // кол-во очков
  time: 1000        // время в игре (в мс)
}
```
### От сервера
#### auth
Отправляется в ответ на сообщение `auth`
```
data = {
  successfully: true // булевое значение, информирующее успешно прошла аутентификация или нет
}
```
#### registration
Отправляется в ответ на сообщение `registration`
```
data = {
  successfully: true // булевое значение, информирующее успешно прошла регистрация или нет
}
```
#### authorized
Отправляется после успешной авторизации пользователя
```
data = {
  bestScore: 0,     // лучший счёт игрока
  timeInGame: 0,    // время, проведённое в игре в мс
  numberOfCoins: 0  // кол-во монеток
}
```
#### update-online
Обновление количества пользователей онлайн
```
data = {
  pOnline: 0        // кол-во подключённых в данный момент игроков
}
```
#### update-top-score
Обновление списка лучших результатов
```
data = [            // массив с объектами, содержащими никнейм игрока и счёт
  { user: 'username1', score: 0 },
  { user: 'username1', score: 1 },
  { user: 'username1', score: 2 },
  ...
]
```
