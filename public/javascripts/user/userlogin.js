

$("#login-form").submit((e) => {
  e.preventDefault()
  $.ajax({
    url: "/login",
    data: $("#login-form").serialize(),
    method: "post",
    success: function (response) {
      console.log(response);
      if (response.status) {
        if(response.guest){
          location.href=`/addtocart/${response.guest}`

        }else{
          
          location.replace('/');
        }

      }
      else {
        $("#err").html(response.message)

      }

    },
    error: function (err) {
      alert("Something Error")

    }
  })

})
 
document.getElementById("ver_otp").oninput=e=>{
  e.target.value = e.target.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');;
  if(e.target.value.length<6){
    document.getElementById("otp_err").innerHTML="Enter 6 digits"
    ver_otp=false
  }
  else{
    document.getElementById("otp_err").innerHTML=""
    ver_otp=true


  }


}

let ver_otp=false;
let number_val = false
var email_val = false
var u_number = document.getElementById("otp_number")
u_number.addEventListener('input', (e) => {
  u_number.value = u_number.value.replace(/[^0-9]/, '').replace(/(\..*)\./, '$1');;


  if (u_number.value.length != 10) {
    number_err.innerHTML = "Enter 10 numbers"
    number_val = false;
    email_val = false;


  }
  else {
    number_err.innerHTML = " "
    number_val = true;
    email_val = true;

  }
})

$("#login_email").on('input', function () {
  var email_field = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,20})?$/;

  if (this.value.length < 0) {
    email_err.html("email should not be blank")
    $(this).css({ borderColor: "red" })
    email_val = false;

  }
  else if (this.value.charAt(0) == " ") {
    $("#email_err").html("Email should not start with space")
    $(this).css({ borderColor: "red" })
    email_val = false;
  }

  else if (this.value.includes("  ")) {
    $("#email_err").text("Email should not have more 2 spaces ")
    $(this).css({ borderColor: "red" })
    email_val = false;

  }

  else if (!email_field.test(this.value)) {
    $("#email_err").html("invalid format")
    $(this).css({ borderColor: "red" })
    email_val = false;

  }
  else {
    $("#email_err").html("")
    $(this).css({ borderColor: "green" })
    email_val = true
  }

})




document.getElementById("ver_submit_btn").onclick = e => {
  e.preventDefault()
  let oneTime = $('#ver_otp').val()
  let number = $('#otp_number').val()
  if(ver_otp){
    
    $.ajax({
      url: "/verify-otp",
      method: "post",
      data: { oneTime, number },
      success: function (response) {
        if (response.status) {
          window.location.reload()
  
        }
        else {
          document.getElementById('number_err').innerHTML = "Incorrect Otp"
        }
  
  
      }, error: function () {
  
      }
    })
  }
  else{
    alert("Enter details correctly")
  }


}



$('#otp-form').submit((e) => {

  e.preventDefault()
  if (number_val && email_val) {
    let number = $('#otp_number').val()
    console.log(number);
    
    $.ajax({
      url: "/mobile_otp",
      method: "post",
      data: { number },
      success: function (response) {
        console.log(response)
        if (response.status == "nonum") {
          alert("number not registered")

        }

        else if (response.status) {

          document.getElementById('otp_div').style.display = ""
          document.getElementById('sent-otp').style.display = 'none'
          document.getElementById('countdown').style.display=''

          const startingMinutes = 2;
          let time = startingMinutes * 60;

          const countdownEl = document.getElementById('countdown')
          
          stop=setInterval(updateCountdown, 1000);

          function updateCountdown() {
            const minutes = Math.floor(time / 60);
            let seconds = time % 60;

            if(minutes==0&&seconds==0){
              clearInterval(stop)
              document.getElementById('resent-otp').style.display=""
              document.getElementById('countdown').style.display="none"

            }
            else{
              document.getElementById('resent-otp').style.display="none"
             

            }
            seconds = seconds < 10 ? '0' + seconds : seconds;
            countdownEl.innerHTML = `${minutes}:${seconds}`;
            time--;
          }





        }

      },
      error: function (err) {

      }
    })


  }
  else {
    $("#email_err").html("Enter all values correctly")
  }

})