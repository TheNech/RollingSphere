# RollingSphere
## Запуск
1. Загрузить необходимые библиотеки по зависимостям
```
npm install
```
2. Запуск сервера
```
npm start
```
*После каждого обновления необходимо заново выполнять пункт 1*

*На данный момент сервер настроен на прослушивание порта 8080*
## Подключиться к серверу
Набрать в адресной строке браузера `http://localhost:8080`

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

// Принять сообщение
socket.on('message-name', function(data) {
  // some code
  console.log(data.field1 + data.field2);
});
```

## Сообщения от сервера к клиенту
### connected
```
data = {
  id: 0,          // id игрока
  bestScore: 0,   // лучший счё игрока
  timeInGame: 0   // время, проведённое в игре в мс
}
```
### new-player-connected
```
data = {
  id: 0,          // id подключившегося игрока
  pNumber:        // кол-во подключённых в данный момент игроков
}
```
### player-disconnected
```
data = {
  id: 0,          // id отключившегося игрока
  pNumber:        // кол-во подключённых в данный момент игроков
}
```
### new-global-top-score
```
data = [          // массив с объектами, содержащими никнейм игрока и счёт
  { name: 'player-nickname1', score: 0 },
  { name: 'player-nickname2', score: 1 },
  { name: 'player-nickname3', score: 2 },
  ...
]
```
