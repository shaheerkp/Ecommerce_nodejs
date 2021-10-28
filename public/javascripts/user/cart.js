

function goBack() {
  window.history.back();
}
  function addtoCart(id){

console.log(id)
$.ajax({
    url: "/addtocart",
     method: "POST",
    data:{id},
  success: function (response) {

      if (response.status) {

    // Swal.fire({
    //   title: 'Item added to cart',
    //   confirmButtonText: 'Cool',
      
     
      
    // }).then((res)=>{
    //   window.location.reload()
    // })
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Added to cart',
      showConfirmButton: false,
      timer: 1000
    }).then((res)=>{
      window.location.reload()
    })
     
      }
      else{
        alert("{Please Signin to add to cart}")
      
       
      }
      
    },
    error: function (err) {
      console.log("asdasd")

      alert("{Please Signin to add to cart}")

    }
   
   
  })
  

}



