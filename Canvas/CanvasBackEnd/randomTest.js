app.post('/login',function(req,res){
    //console.log("Inside Login Post Request");
    con.getConnection(function(err) {
        if (err) 
            throw err;
           // console.log("Connected!");
            var username = req.body.username;
            var password = req.body.password;
            var sql = "SELECT password FROM UserDetails WHERE username = " + 
                      mysql.escape(username) + " and traveller = 1" ;
            //console.log(sql);
            con.query(sql,function(err,result){
            if(err){
                //  console.log("Failed here " + sql)
                    res.writeHead(400,{
                        'Content-Type' : 'text/plain'
                    })
                    res.end("Invalid Credentials");
              }
              else{
                   if(result[0] != null){
                     bcrypt.compare(req.body.password,result[0].password, function(err, answer) { 
                       // console.log("answer is " +  JSON.stringify(answer))
                        if(answer){   
                        res.cookie('cookie',req.body.username,{maxAge: 9000000, httpOnly: false, path : '/'});
                        req.session.user = result;
                        console.log("Successfully retrieving User")
                        console.log("Username is "+ JSON.stringify(username))
                         res.status(200).send(JSON.stringify(username));
                         res.end("Successful Login");
                       }//if
                     else
                     {
                        console.log("Failed here " + sql)
                        res.writeHead(400,{
                            'Content-Type' : 'text/plain'
                        })
                        res.end("Invalid Credentials");
                     }

                   })//bcrypt
               }//bigif
          else
           {
              console.log("Failed here " + sql)
              res.writeHead(400,{
                  'Content-Type' : 'text/plain'
              })
              res.end("Invalid Credentials");
             }
          } //else
        });
    });//comm
});//app