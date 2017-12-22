$('#btnReg').on('click', function () {
  $('#modalBoxReg').modal('show');
});

$('#btnRegRegistr').on('click', function () {

  var nick = $('#inputNick').val().trim(),
      pass = $('#inputPass').val().trim(),
      repeatPass = $('#inputRepeatPass').val().trim();

  if (nick.length == 0 || pass.length == 0 || repeatPass.length == 0) {
    document.getElementById('validationReg').style.display = 'block';
    document.getElementById('validationReg').innerHTML = 'Fields must not be empty';
    $('#validationReg').addClass('error');

    return;
  } 

  if (nick.length < 3 || nick.length > 15) {
    document.getElementById('validationReg').style.display = 'block';
    document.getElementById('validationReg').innerHTML = 'Nickname must be more than 3 and less than 15 characters';
    $('#validationReg').addClass('error');

    return;
  }

  if (pass.length < 5) {
    document.getElementById('validationReg').style.display = 'block';
    document.getElementById('validationReg').innerHTML = 'Password must be at least 5 characters';
    $('#validationReg').addClass('error');

    return;
  }

  if (pass != repeatPass) {
    document.getElementById('validationReg').style.display = 'block';
    document.getElementById('validationReg').innerHTML = 'Passwords do not match';
    $('#validationReg').addClass('error');

    return;
  } 
  
  socket.emit('registration', { username: nick, password: pass }); 

  socket.on('registration', function (data) {

    if (!data.successfully) {
      document.getElementById('validationReg').style.display = 'block';
      document.getElementById('validationReg').innerHTML = 'Registration failed!';
      $('#validationReg').addClass('error');

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