

$("#signup-form").submit((e) => {
    e.preventDefault()
$.ajax({
    url: "/signup",
    data: $("#signup-form").serialize(),
    method: "post",
    success: function (response) {
      console.log(response);
      if (response.status) {
          alert("Signed in successfully")
      location.replace('/login');
        
      }
      else{
        $('#inv').html("login")
        alert("User exist please login")
        
      }
      
    },
    error: function (err) {
      alert("Something Error")

    }
  })

})