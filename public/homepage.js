function logout(req,res){
    req.session.destroy();
    console.log(req)
res.redirect('/')
}

