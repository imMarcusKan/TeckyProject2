async function getName(){
    
    let res= await fetch("/session");
    let result=await res.json() 
    usernameBox.textContent= result.user;
    
}
const usernameBox=document.querySelector(".username");

getName();
    //req.session.destroy();

    // fetch('/session')
    // .then(res=>res.json())
    // .then(data=>{
    //     usernameBox.textContent = data.user
    // })