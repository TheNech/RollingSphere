var socket = io('http://localhost:8080');
socket.on('new-player-connected', function(data) {
  console.log('New player was connected. Id: ' + data.id + "\tCurrent number of players is " + data.pNumber);
})
.on('player-disconnected', function(data) {
  console.log('Player was disconnected. Id: ' + data.id + "\tCurrent number of players is " + data.pNumber);
})
.on('new-global-top-score', function(data){
  console.log('new-global-top-score');
  console.log(data);
  console.log();
});