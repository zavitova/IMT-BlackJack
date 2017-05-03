$(document).ready(function () {

    $("#topUpBalance").on('click',function () {
        $.post(('/topUpBalance'), function (data) {
                $("#userBalance").html(data);
            }
        )
    })
});