# RollingSphere

## Запуск
0. Установить [Node.js и npm](https://nodejs.org/en/ "Сервер и пакетный менеджер").
0. Установить и запустить [MongoDB](https://docs.mongodb.com/manual/installation/ "База данных").
0. Установить зависимости: `npm install`
0. Запустить сервер: `npm start`

## Подключение к серверу
Набрать в адресной строке браузера `http://localhost:8080`


## Чат

### Приватные сообщения

Чтобы отправить приватное сообщение другому игроку, необходимо в чате набрать `@*player-name* some-message` (`*player-name*` заменить на никнейм получателя). Если получатель в момент отправки сообщения находится оффлайн, то сервер сообщит об этом. При этом сообщение пропадёт, т.к. история чата на сервере не сохраняется.

### Бот

Чтобы отправить команду боту, необходимо в чате набрать `/command-name`.

Доступные комманды:
* `/help` - список всех доступных комманд
* `/regdate` - дата регистрации
* `/time` - время проведённо в игре


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

#### get-player-data
Запрос текущих данных об игроке
```
data = {
}
```

#### game-over
Отправляется при завершении игры
```
data = {
  coins: 10,        // кол-во собранных монеток
  score: 100,       // кол-во очков
  time: 1000        // время в игре (в мс)
}
```

#### chat-message
Отправка сообщения в чате
```
data = {
  message: 'my-chat-message'   // текст отправляемого сообщения
}
```


### От сервера

#### registration
Отправляется в ответ на сообщение `registration`
```
data = {
  successfully: true // булевое значение, информирующее успешно прошла регистрация или нет
}
```

#### auth
Отправляется в ответ на сообщение `auth`
```
data = {
  successfully: true, // булевое значение, информирующее успешно прошла аутентификация или нет
  
  // если авторизация успешна, то будут доступны следующие поля
  bestscore: 0,     // лучший счёт игрока
  time: 0,    // время, проведённое в игре в мс
  coins: 0, // кол-во монеток
  topscores: [...]  // массив с налучшими результатами
}
```

#### player-data
Отправляется в ответ на сообщение `get-player-data`
```
data = {
  bestscore: 0,     // лучший счёт игрока
  time: 0,    // время, проведённое в игре в мс
  coins: 0  // кол-во монеток
}
```

#### update-online
Обновление количества пользователей онлайн. Отправляется только авторизированным пользователям.
```
data = {
  pOnline: 0        // кол-во подключённых в данный момент игроков
}
```

#### update-top-score
Обновление списка лучших результатов. Отправляется только авторизированным пользователям.
```
data = {
  scores: [         // массив с объектами, содержащими никнейм игрока и счёт
    { user: 'username1', score: 0 },
    { user: 'username1', score: 1 },
    { user: 'username1', score: 2 }
  ]
}
```

#### chat-message
Переотправка сообщения остальным игрокам. Отправляется только авторизированным пользователям.
```
data = {
  message: 'chat-message',   // сообщение
  user: 'username',          // имя отправителя
  private: false             // булевое значение, указывающее это приватное сообщение или нет
}
```
