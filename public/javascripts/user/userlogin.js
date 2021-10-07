

$("#login-form").submit((e) => {
    e.preventDefault()
$.ajax({
    url: "/login",
    data: $("#login-form").serialize(),
    method: "post",
    success: function (response) {
      console.log(response);
      if (response.status) {
      location.replace('/');
        
      }
      else{
        $("#err").html(response.message)
       
      }
      
    },
    error: function (err) {
      alert("Something Error")

    }
  })

})