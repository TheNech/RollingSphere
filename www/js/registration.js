$('#btnReg').on('click', function () {
  $('#modalBoxReg').modal('show');
});

$('#btnRegRegistr').on('click', function () {

  var nick = $('#inputNick').val().trim(),
      pass = $('#inputPass').val().trim(),
      repeatPass = $('#inputRepeatPass').val().trim();

  if (nick.length == 0 || pass.length == 0 || repeatPass.length == 0) {
    messagesReg('Fields must not be empty');

    return;
  } 

  if (nick.length < 3 || nick.length > 15) {
    messagesReg('Nickname must be more than 3 and less than 15 characters');

    return;
  }

  if (pass.length < 5) {
    messagesReg('Password must be at least 5 characters');

    return;
  }

  if (pass != repeatPass) {
    messagesReg('Passwords do not match');

    return;
  } 
  
  socket.emit('registration', { username: nick, password: pass }); 

  socket.on('registration', function (data) {

    if (!data.successfully) {
      messagesReg('Registration failed!');

      return; 
    }

    document.getElementById('validationReg').style.display = 'block';
    document.getElementById('validationReg').innerHTML = 'You are successfully registered';

    if ($('#validationReg').hasClass('error')) {
      $('#validationReg').removeClass('error');
    } 

    $('#validationReg').addClass('success'); 

  });
});

$('#inpReg').trigger('reset');

function messagesReg (message) {
  document.getElementById('validationReg').style.display = 'block';
  document.getElementById('validationReg').innerHTML = message;
  $('#validationReg').addClass('error');
}