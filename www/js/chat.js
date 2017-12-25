$(".inputMessage").val('');

$('.inputMessage').keydown (function (event) {
    if (event.which === 13) {

        var message = $('.inputMessage').val().trim();

        if (message.length > 0) {
            socket.emit('chat-message', {
                message: message
            });

            addMessage( {user: nickname, message: message} );
        }

        $('.inputMessage').val('');
    }
});

function subscribeChat () {
    socket.on('chat-message', function (data) {
        addMessage(data);
    });
}

function addMessage (data) {
    var usernameDiv = $('<span class="chatUsername"/>').text(data.user + ':');
    var messageBodyDiv = $('<span class="messageBody">').text(data.message);
    var messageDiv = $('<li class="message"/>').append(usernameDiv, messageBodyDiv);

    $('.messages').append(messageDiv);

    $('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
}