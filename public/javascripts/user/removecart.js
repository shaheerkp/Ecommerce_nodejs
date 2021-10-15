function removeCartItem(id){
    console.log("removedddd"+id);
    $.ajax({
        url: "/removecart",
         method: "POST",
        data:{id},
      success: function (response) {
          console.log(response);
          if (response.status) {
            alert(response.mes)
            location.replace("/cart")
          
            
          }
          else{
            
           
          }
          
        },
        error: function (err) {
          alert("{Please Signin to add to cart}")
          location.replace("/login")
    
        }
       
       
      })
}


function qtychange(){
   
    
    
    
    console.log(value)
  }


function changeQuantity(cartId,proId,Count){
  console.log(cartId);
    let Qty =document.getElementById(proId+"qty").value
    
    console.log(Qty)
    console.log(cartId)
    console.log(proId)
    console.log(Count)
    $.ajax({
        url:'/changequantity',
        method:'post',
        data:{
            cartid:cartId,
            proid:proId,
            count:Count,
            qty:Qty
        },
        success:function(response){
            if(response.status){
                window.location.reload()
            }

        }
    })

}