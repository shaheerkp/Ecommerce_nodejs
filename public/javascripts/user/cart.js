

function goBack() {
  window.history.back();
}
  function addtoCart(id){

console.log(id)
$.ajax({
    url: "/addtocartcheck",
     method: "POST",
    data:{id},
  success: function (response) {
   console.log(response)

      if (response.status) {


        if(response.abc){
          location.replace('/cart')

        }else{
          
          document.getElementById('cart_count').innerHTML=response.count
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Added to cart',
        showConfirmButton: false,
        timer: 1000
      }).then((res)=>{
       
      })
        }
     
      }
      else{
        location.replace('/login')
      
       
      }
      
    },
    error: function (err) {
      console.log("asdasd")


    }
   
   
  })
  

}


function wishList(id) {
      
      
  $.ajax({
      url: "/wishlist",
      method: "post",
      data: { id },
      success: function (response) {
          if(response.status){
          Swal.fire(
              response.status
          )

          }else{
              location.replace('/login')
          }

      },
      error: function (response) {

      }
  })
}



