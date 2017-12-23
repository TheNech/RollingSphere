var bestscore, Coins, time;

$("#btnEnter").on('click', (function() {

  var nick = $('#inputNickname').val().trim(),
      pass = $('#inputPassword').val().trim();

  if (nick.length == 0 || pass.length == 0) {
    messagesAuth('Not all fields are filled');

    return;
  }
   
  socket.emit('auth', { username: nick, password: pass });

  socket.on('auth', function (data) {

    if (!data.successfully) {
      messagesAuth('Authorization failed!');

      return;
    }

    $('#overlay-start').fadeOut(50);
    $('#mainScreen').fadeIn(50);
    document.getElementById('mainScreenElements').style.visibility = "visible";

    bestscore = data.bestscore;
    Coins = data.coins;
    time = data.time;

    $('#mainScreenStatistic p:nth-child(1)').text('Nickname: ' + nick);
    $('#mainScreenStatistic p:nth-child(2)').text('Best score: ' + bestscore);
    $('#mainScreenStatistic p:nth-child(3)').text('Coins: ' + Coins);

    var hour = Math.floor(time / 3600000),
        minute = Math.floor((time % 3600000) / 60000),
        second = Math.floor(((time % 3600000) % 60000) / 1000);

    $('#mainScreenStatistic p:nth-child(4)').text('Total time: ' + hour + 'h ' + minute + 'm ' + second + 's');

    data.topscores.forEach(function (item, i) {
      $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1)').text(i + 1);
      $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(2)').text(item.username);
      $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3)').text(item.score);
    });

    socket.on('update-top-score', function (data) {

      data.scores.forEach(function (item, i) {
        $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1)').text(i + 1);
        $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(2)').text(item.username);
        $('#mainScreenTop > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(3)').text(item.score);
      });

    })
    .on('update-online', function (data) {
      $('#mainScreenOnline p').text('Online: ' + data.pOnline);
    })
    .on('player-data', function (data) {
      $('#mainScreenStatistic p:nth-child(2)').text('Best score: ' + data.bestscore);
      $('#mainScreenStatistic p:nth-child(3)').text('Coins: ' + data.coins);

      hour = Math.floor(data.time / 3600000),
      minute = Math.floor((data.time % 3600000) / 60000),
      second = Math.floor(((data.time % 3600000) % 60000) / 1000);

      $('#mainScreenStatistic p:nth-child(4)').text('Total time: ' + hour + 'h ' + minute + 'm ' + second + 's'); 

      Coins = data.coins;

      if (Coins < continueFor) {
        document.getElementById('btn-continue').disabled = true;
        document.getElementById('btn-continue').title = 'You need more coins';
      } else {
          $('#btn-continue').removeAttr('title');
      }
    });
  });
}));

$("#inputs").trigger('reset');  

function messagesAuth (message) {
  document.getElementById('validationAuth').style.display = 'block';
  document.getElementById('validationAuth').innerHTML = message;
  $('#validationAuth').addClass('error');
}