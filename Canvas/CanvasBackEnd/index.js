var express = require ('express')
var mysql = require('mysql')
var app = express()
var cors = require('cors');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

var http =  require("http").Server(app).listen(80)
var path= require('path')
var multer =  require('multer')
var fs= require('fs')
const bcrypt = require('bcrypt');
const saltRounds = 10;



app.use(cors({ origin: 'http://localhost:3000', credentials: true }));


app.use(session({
    secret              : 'Hello@123',
    resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
    duration            : 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
    activeDuration      :  5 * 60 * 1000
}));


var connection = mysql.createPool({
    connectionLimit: 100,
    host     : 'localhost',
    database : 'CanvasApp',
    user     : 'root',
    password : 'password',
  })
  
  /*var connection = mysql.createConnection({
    host     : 'localhost',
    database : 'CanvasApp',
    user     : 'root',
    password : 'password',
  })*/

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });


//   connection.connect(function(err) {
//     if (err) {
//         console.error('Error connecting: ' + err.stack);
//         return;
//     }

//     console.log('Connected as id ' + connection.threadId);
// });


app.use(bodyParser.json());

// app.get('/',function(req,res){
//     res.redirect('//login/faculty')
// })

app.post('/login/faculty',function(req,res){
    connection.getConnection(function(err) {
        if (err) 
                throw err;
        var id = req.body.id
        var password = req.body.password
        var query = `SELECT * FROM Users WHERE id = "${id}" AND type="faculty"`
        console.log(query)
        connection.query(query, function (error, results, fields) {
        if (error)
        {
                res.writeHead(400,{
                            'Content-Type' : 'application/text'
                    })
                res.end(error.toString())
                throw error;
        }
        else
        {
            if(results[0] != null){
                bcrypt.compare(req.body.password,results[0].password, function(err, answer) { 
                  // console.log("answer is " +  JSON.stringify(answer))
                   if(answer){   
                       console.log(req.body.username)
                   res.cookie('cookie',req.body.username,{maxAge: 9000000, httpOnly: false, path : '/'});
                   //req.session.user = result;
                   console.log("Successfully retrieving User")
                   //console.log("Username is "+ JSON.stringify(username))
                    res.status(200).send(results[0]);
                    
                    res.end("Successful Login");
                  }//if
                  else
                    {
                    console.log("Failed here " + query)
                    res.writeHead(400,{
                        'Content-Type' : 'text/plain'
                    })
                    res.end("Invalid Credentials");
                    }
                })
            }
            else
            {
                console.log("Failed here " + query)
                res.writeHead(400,{
                    'Content-Type' : 'text/plain'
                })
                res.end("Invalid Credentials");
            }      
        }
        });
           
    })
})

app.post('/login/student',function(req,res){
    
   connection.getConnection(function(err) {
    if (err) 
            throw err;
    var id = req.body.id
    var password = req.body.password
    var query = `SELECT * FROM Users WHERE id = "${id}" AND type="student"`
    connection.query(query, function (error, results, fields) {
        if (error)
        {
            res.writeHead(400,{
                'Content-Type' : 'application/text'
            })
            res.end(error.toString())
            throw error;
        }
        else
        {
            
            if(results[0] != null){
                bcrypt.compare(req.body.password,results[0].password, function(err, answer) { 
                  // console.log("answer is " +  JSON.stringify(answer))
                   if(answer){   
                   res.cookie('cookie',req.body.username,{maxAge: 9000000, httpOnly: false, path : '/'});
                   //req.session.user = result;
                   console.log("Successfully retrieving User")
                   //console.log("Username is "+ JSON.stringify(username))
                    res.status(200).send(results[0]);
                    
                    res.end("Successful Login");
                  }//if
                  else
                    {
                    console.log("Failed here " + query)
                    res.writeHead(400,{
                        'Content-Type' : 'text/plain'
                    })
                    res.end("Invalid Credentials");
                    }
                })
            }
            else
            {
                console.log("Failed here " + query)
                res.writeHead(400,{
                    'Content-Type' : 'text/plain'
                })
                res.end("Invalid Credentials");
            }
        }
    });


   })
    

})

//INSERT INTO `CanvasApp`.`Users` (`name`, `email`, `type`) VALUES ('Richard Sinn', 'rsinn@sjsu.edu', 'faculty');

app.post('/create/student',function(req,res){

    connection.getConnection(function(err) {
        if (err) 
            throw err;
    console.log("Connected!");
    var hashed_password = '';
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    hashed_password = hash;
    console.log(hashed_password)
    var ID = req.body.id;
    var Name = req.body.name;
    var Email = req.body.emailAddress;
    var Password =hashed_password
    console.log(ID)
    console.log(Name)
    console.log(Email)
    console.log(Password)

    var query1 = `INSERT INTO Users (id,name, email, password,type) VALUES ("${ID}", "${Name}", "${Email}", "${Password}","student")`;
    connection.query(query1, function (error, results, fields) {
        if (error)
        {
            res.writeHead(400,{
                'Content-Type' : 'application/text'
            })
            res.end(error.toString())
            throw error;
        }
        else
        {
            var testQuery =  `select * from Users where id = "${ID}" AND type="student"`
            console.log(testQuery)
            connection.query(testQuery,function(error,results,fields){
                if(results.length>0)
                {
                    res.writeHead(200,{
                        'Content-Type' : 'application/text'
                    })
                    res.end(JSON.stringify(results[0]))
                }
                else
                {
                    res.end("Insertion failed")
                }
            })
            
        }
        
    });



    })

    })

})

app.post('/create/faculty',function(req,res){

    connection.getConnection(function(err) {
        if (err) 
            throw err;
    console.log("Connected!");
    var hashed_password = '';
    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
    hashed_password = hash;
    var ID = req.body.id;
    var Name = req.body.name
    var Email = req.body.emailAddress
    var Password = hashed_password
    var query1 = `INSERT INTO Users (id,name, email, password,type) VALUES ("${ID}", "${Name}", "${Email}", "${Password}","faculty")`;
    connection.query(query1, function (error, results, fields) {
        if (error)
        {
            res.writeHead(400,{
                'Content-Type' : 'application/text'
            })
            res.end(error.toString())
            throw error;
        }
        else
        {
            var testQuery =  `select * from Users where id = "${ID}" AND type="faculty"`
            connection.query(testQuery,function(error,results,fields){
                if(results.length>0)
                {
                    res.writeHead(200,{
                        'Content-Type' : 'application/text'
                    })
                    res.end(JSON.stringify(results[0]))
                }
                else
                {
                    res.end("Insertion failed")
                }
            })
            
        }
        
    });
    })

    
    })
})

app.post('/createCourse',(req,res)=>{
    console.log(req.body)
    var ID = req.body.courseId
    var courseName = req.body.courseName
    var courseDept = req.body.courseDept
    var courseDescription = req.body.courseDescription
    var courseRoom = req.body.courseRoom
    var courseCapacity = req.body.courseCapacity
    var waitlistCapacity = req.body.waitlistlistCapacity
    var courseTerm = req.body.courseTerm
    var courseQuery = `INSERT INTO Courses (courseID, courseName, courseDept, courseDescription, courseRoom, courseCapacity, waitlistCapacity,courseTerm,currentCapacity) VALUES ('${ID}', '${courseName}', '${courseDept}','${courseDescription}' , '${courseRoom}', '${courseCapacity}', '${waitlistCapacity}','${courseTerm}',0)`;
    connection.query(courseQuery, function (error, results, fields) {
        if (error)
        {
            res.writeHead(400,{
                'Content-Type' : 'application/text'
            })
            res.end(error.toString())
            throw error;
        }
        else
        {
            let testQuery =  `select * from Courses where courseID = "${ID}" `
            connection.query(testQuery,function(error,results,fields){
                if(results.length>0)
                {
                    res.writeHead(200,{
                        'Content-Type' : 'application/text'
                    })
                    res.end(JSON.stringify(results[0]))
                }
                else
                {
                    res.end("Insertion failed")
                }
            })
            
        }
        
    });

    
})
    





    app.get("/search/courseID/:id&:operator",(req,res)=>
    {
       console.log("Inside search")
        let courseID = req.params.id;
        let symbol;
        if(req.params.operator == "equal to")
             symbol = "="
        else if(req.params.operator == "greater than")
              symbol =">"
        else
               symbol ="<" 
       
        let searchByCourseQuery = `select * from Courses where courseID ${symbol} ${courseID}`
        console.log(searchByCourseQuery)
        console.log(searchByCourseQuery)
        connection.query(searchByCourseQuery,function(error,results,fields){
            if(error)
            {
                console.log("In error block")
                res.writeHead(400,{
                    'Content-Type' : 'application/text'
                })
                res.end(error.toString())
                throw error;
            }
            else
            {
                    if(results.length>0)
                        {
                            res.writeHead(200,{
                                'Content-Type' : 'application/json'
                            })
                            
                            res.end(JSON.stringify(results))
                        }
                        else
                        {
                            res.end("No such query")
                        }
            }
        })
    })  
    app.get("/search/courseName/:name&:operator",(req,res)=>
    {
       console.log("Inside search")
        let courseName = req.params.name;
        let symbol;
        if(req.params.operator == "equal to")
             symbol = "="
        else if(req.params.operator == "greater than")
              symbol =">"
        else
               symbol ="<" 
            
        let searchByCourseQuery = `select * from Courses where courseName ${symbol} "${courseName}"`
        console.log(searchByCourseQuery)
      
        connection.query(searchByCourseQuery,function(error,results,fields){
            if(error)
            {
                console.log("In error block")
                res.writeHead(400,{
                    'Content-Type' : 'application/text'
                })
                res.end(error.toString())
                throw error;
            }
            else
            {
                    if(results.length>0)
                        {
                            res.writeHead(200,{
                                'Content-Type' : 'application/json'
                            })
                            
                            res.end(JSON.stringify(results))
                        }
                        else
                        {
                            res.end("No such query")
                        }
            }
        })
    })  

    app.get("/search/:courseTerm",(req,res)=>
    {
        console.log(req.params.courseTerm)
        let courseTerm = req.params.courseTerm;
        let searchByCourseQuery = `select * from Courses where courseTerm = "${courseTerm}"`
        console.log(searchByCourseQuery)
        connection.query(searchByCourseQuery,function(error,results,fields){
            if(error)
            {
                console.log("In error block")
                res.writeHead(400,{
                    'Content-Type' : 'application/json'
                })
                res.end(error.toString())
                throw error;
            }
            else
            {
                    if(results.length>0)
                        {
                            res.writeHead(200,{
                                'Content-Type' : 'application/json'
                            })
                            res.end(JSON.stringify(results))
                        }
                        else
                        {
                            res.end("No such query")
                        }
            }
        })
    })
    

    /*app.post('/enrollCourse',(req,res)=>{
        let userid = 1200
        let courseid = 275
        var coureseLimit= `SELECT count(courseID) FROM Courses WHERE courseID = ${courseid} AND currentCapacity < courseCapacity`
        connection.query(coureseLimit,function(error,results,fields){
            if(error)
            {
                res.writeHead(404,{
                    'Content-Type' : 'application/json'
                })
                res.end(error.toString)
                throw error
            }
            else
            {
                console.log(results)
                if(results.count(courseID) === 0)
                {
                    res.writeHead(200,{
                        'Content-Type' : 'application/text'
                    })
                    res.end('Class is full')
                }
                else
                {
                    res.writeHead(200,{
                        'Content-Type' : 'application/text'
                    })
                    let insertUser = `INSERT INTO UserCourses VALUES (${userid},${courseid})`
                    connection.query(insertUser)
                    let updateCurrentCount = `UPDATE  CanvasApp.Courses SET currentCapacity=currentCapacity+1 WHERE courseID = ${courseid}`
                    connection.query(updateCurrentCount)
                    res.end('Inserted into usercourseid table')
                    
                }
            }
        })
    })*/

app.post('/enrollCourse/:courseID',(req,res)=>{
        console.log("Inside enroll")
        var id=013725
        var courseID=req.params.courseID
        console.log("insert into user course table if currentCapacity > courseCapacity")
        var query =`INSERT INTO UserCourses (userid, courseID) Select '${id}', '${courseID}' where (SELECT COUNT(*) FROM COURSES WHERE (currentCapacity < courseCapacity) and courseID='${courseID}') > 0;` ;
        console.log(query)
        connection.query(query, function (error, results, fields) {
            if (error)
            {
                res.writeHead(404,{
                    'Content-Type' : 'application/text'
                    
                })
                 res.end(error.toString())
                 throw error;
            }
            else
            {
                console.log("check if user is entered into the table")
                var successQuery = `SELECT * FROM UserCourses WHERE userid=${id} AND courseID = ${courseID}`
                connection.query(successQuery,(error,results,fields)=>{
                    console.log("Length of results"+results.length)
                    if(results.length === 0)
                    {   
                        console.log("User is not added to the table")
                        var waitListquery =`INSERT INTO UserCourses (userid, courseID,waitListed) Select '${id}', '${courseID}',1 where (SELECT COUNT(*) FROM COURSES WHERE (waitlistCapacity > 0) and courseID='${courseID}') > 0;`
                        connection.query(waitListquery,(error,results,fields)=>{
                            var successQuery2= `SELECT * FROM UserCourses WHERE userid=${id} AND courseID = ${courseID}`
                            connection.query(successQuery2,(error,results2,fields)=>
                            {
                                
                                if(results2.length === 0)
                                {
                                    res.end("Cannot be added to the course")
                                }
                                else
                                {
                                    var updateWaitlist = `UPDATE Courses SET waitlistCapacity = waitlistCapacity -1 WHERE courseID='${courseID}'`
                                    connection.query(updateWaitlist)
                                    res.end("Waitlisted")
                                }
                            })
                        })
                       
                    }
                    else
                    {
                        console.log("User is added to the table")
                        var query2=`UPDATE Courses SET currentCapacity = currentCapacity + 1  WHERE courseID = '${courseID}'`
                        connection.query(query2);
                        res.writeHead(200,{
                            'Content-Type' : 'application/json'
                        })
                        res.end(JSON.stringify(results))
                    }
                    
                  
                })
                
            }
                 
        });
    })
app.delete('/deleteCourse/:courseid',function(req,res){
    console.log("In the delete request")
    var userid = 713
    var courseid = req.params.courseid
    var deleteCourse = `DELETE FROM UserCourses WHERE courseID=${courseid} AND userid =${userid}`
    console.log(deleteCourse)
    connection.query(deleteCourse,(error,results,fields)=>{
        
        if (error)
        {
            console.log("error block")
            res.writeHead(404,{
                'Content-Type' : 'application/text'
                
            })
             res.end(error.toString())
             throw error;
        }
        else{
            console.log("In the success block")
            var queryUpdate=`UPDATE Courses SET currentCapacity = currentCapacity - 1  WHERE courseID = '${courseid}'`
            connection.query(queryUpdate)
            res.writeHead(200,{
                'Content-Type' : 'application/text'
            })
            res.end("Dropped the course")
        }
    })
})
app.get('/viewCourses/:userid',function(req,res){
    var userid = req.params.userid
    
    var courseQuery = `SELECT  c.courseID,c.courseName,c.courseTerm,u.userid
    FROM Courses As c
    INNER JOIN UserCourses as u 
    ON c.courseID = u.courseID AND u.userid = ${userid} and u.waitListed = 0`
    connection.query(courseQuery,(error,results,fields)=>{
        if (error)
        {
            res.writeHead(404,{
                'Content-Type' : 'application/text'
                
            })
             res.end(error.toString())
             throw error;
        }
        else{
            res.writeHead(200,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
    })
})

app.get('/getGrades/userid/courseid',(req,res)=>{
    var userid = 101
    var courseid = 275
    var connectionQuery = `SELECT * FROM userCourseQuizAassignment WHERE userId=${userid} AND course`
})

app.get('/getAnnouncements/:courseid',(req,res)=>{
    var courseid = req.params.courseid
    var getAnnouncementQuery = `SELECT title,content, DATE_FORMAT(dateCreated, "%M %e %Y") as dateCreated FROM CanvasApp.Announcements where courseID=${courseid} ORDER BY idAnnouncement DESC`
    connection.query(getAnnouncementQuery,(error,results,fields)=>{
        if(error)
        {
            console.log("error")
            res.writeHead(404,{
                'Content-Type' : 'application/json'
            })
        }
        else
        {
            res.writeHead(200,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
    })
})
app.get('/getGrades',(req,res)=>{
    var courseid = 275
    var userid = 1
    var getGradesQuery = 
    `SELECT HomeWork.name,DATE_FORMAT(duedate, "%W %M %e %Y %h %i %p") as dueDate,Homework.marks,userCourseQuizAassignment.grade FROM CanvasApp.userCourseQuizAassignment  
    INNER JOIN CanvasApp.HomeWork
    on userCourseQuizAassignment.quizassignmentid = HomeWork.id
    where userCourseQuizAassignment.userid=${userid} and userCourseQuizAassignment.courseId =${courseid};`
    connection.query(getGradesQuery,(error,results,fields)=>{
        if(error)
        {
            console.log("error")
            res.writeHead(404,{
                'Content-Type' : 'application/json'
            })
        }
        else{
            res.writeHead(200,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
    })
})
app.get('/getPeople',(req,res)=>{
    var courseid =275   
    var getPeopleQuery = `SELECT Users.name,Users.profileImage,Users.type
    FROM UserCourses
    INNER JOIN Users
    on UserCourses.userid = Users.id
    WHERE courseID = ${courseid} and UserCourses.waitListed=0`    
    connection.query(getPeopleQuery,(error,results,fields)=>{
        if(error)
        {
            console.log("error")
            res.writeHead(404,{
                'Content-Type' : 'application/json'
            })
        }
        else{
            res.writeHead(200,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
    })
})

app.post('/upload',function(req, res) {
     
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
           console.log("Called")
      return res.status(200).send(req.file)

    })

});

app.get('/getEachAssignment/:courseid/:assignmentName',function(req,res){
    var courseid = req.params.courseid,id=req.params.userid;
    var name = req.params.assignmentName
    
    var displayAssignmentDetailsQuery=`SELECT name,marks,DATE_FORMAT(dueDate, "%W %M %e %Y %h %i %p") as dueDate FROM HomeWork WHERE courseId=${courseid} and name ="${name}" and type="assignment"`
    console.log(displayAssignmentDetailsQuery)
    connection.query(displayAssignmentDetailsQuery,(error,results,fields)=>{
        if(error)
            return res.status(500).json(error)
        else
            return res.status(200).json(results);
    })
})
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'public')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname )
  }
})
var upload = multer({ storage: storage }).single('file')
app.post('/upload',function(req, res) {
     
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
      return res.status(200).send(req.file)

    })

});

app.get('/getUpcomingAssignments/:courseid',function(req,res){
   
    var courseid = req.params.courseid
    var upcomingAssignmentQuery = `SELECT name,DATE_FORMAT(duedate, "%W %M %e %Y %h %i %p") as duedate,marks FROM Homework where type='assignment' and dueDate >= NOW() and courseId = ${courseid} `
    connection.query(upcomingAssignmentQuery,(error,results,fields)=>{
        if(error)
        return res.status(500).json(error)
        else
        return res.status(200).json(results);
    })
})
app.get('/getCompletedAssignments/:courseid',function(req,res){
    var courseid = req.params.courseid
    var completedAssignmentQuery = `SELECT name,DATE_FORMAT(duedate, "%W %M %e %Y %h %i %p") as duedate,marks FROM Homework where type='assignment' and dueDate < NOW() and courseId = ${courseid} `
    connection.query(completedAssignmentQuery,(error,results,fields)=>{
        if(error)
        return res.status(500).json(error)
        else
        return res.status(200).json(results);
    })
})
app.get("/getPasscode",(req,res)=>{
    var value = Math.floor((Math.random() * 10000) + 1);
    res.end(value.toString());
})

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

app.post('/createAnnouncement/:courseid/:title/:content',(req,res)=>{
    var courseid=req.params.courseid
    var content =req.params.content 
    var title=req.params.title
    var createAnnouncement = `INSERT INTO Announcements (courseID, content, title,dateCreated) VALUES (${courseid}, "${content}", "${title}", NOW());`    
    console.log(createAnnouncement)
    connection.query(createAnnouncement,(error,results,fields)=>{
        if(error)
        {
            console.log(results)
            res.writeHead(404,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
        else{
            res.writeHead(200,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
    })
})

app.post('/createAssignment/:courseid/:name/:marks/:dueDate',(req,res)=>{
    console.log("create Assignment")
    var courseid=req.params.courseid
    var name =req.params.name 
    var marks=req.params.marks
    var dueDate = req.params.dueDate+" 23:59:00"
    console.log(dueDate)
    var createAssignment = `INSERT INTO Homework (name, marks, courseId,dueDate,type) VALUES ("${name}", "${marks}", ${courseid},"${dueDate}","assignment");`    
    console.log(createAssignment)
    connection.query(createAssignment,(error,results,fields)=>{
        if(error)
        {
            console.log(results)
            res.writeHead(404,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
        else{
            res.writeHead(200,{
                'Content-Type' : 'application/json'
            })
            res.end(JSON.stringify(results))
        }
    })
})




app.get('/seeFiles',function(req,res){
    // if (process.argv.length <= 2) {
    //     console.log("Usage: " + __filename + " ./public/files");
    //     process.exit(-1);
    // }
     
    // var path = process.argv[2];
     
    fs.readdir( "public/files", function(err, items) {
        //console.log(items);
     
        res.end(JSON.stringify(items));
    });
    
    

             
})
app.post('/download-file/:file(*)', function(req, res){
    console.log('Inside DOwnload File');
    var file = req.params.file;
    var filelocation = path.join(__dirname + '/public/files', "hello.pdf");
    var img = fs.readFileSync(filelocation);
    var base64img = new Buffer(img).toString('base64');
    res.writeHead(200, {
        'Content-type': 'application/pdf'
    });
    res.end(JSON.stringify(base64img));

});

app.post('/uploadprofpic',function(req, res) {
    var user_id = req.body.user_id
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, 'public/profilepics')
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname)
      }
    })
    
    var upload = multer({ storage: storage }).single('file')
     
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
      return res.status(200).send(req.file)

    })
    
});


app.post('/Update',function(req,res){
    //  console.log(req.body.course_ID)
    //  console.log(req.param.course_ID)
    console.log(req.body)
      var profilepic = req.body.profilepic
      var username = req.body.username
      var email=req.body.email
      //var password=req.body.password
      var Aboutme=req.body.Aboutme
      var city=req.body.city
      var country=req.body.country
      var company=req.body.company
      var school = req.body.school
      var languages=req.body.languages
       var gender=req.body.gender
       var id=req.body.user_id
       var hometown=req.body.hometown
       var phonenumber=req.body.phonenumber
      console.log(profilepic)
  
    //  console.log(c_name)
      
    
      var query14 = `UPDATE Users SET profileImage="${profilepic}",name="${username}", email="${email}",aboutMe="${Aboutme}",city="${city}", country="${country}",company="${company}",school="${school}",languages="${languages}",gender="${gender}",homeTown="${hometown}",phoneNumber="${phonenumber}"where id=${id}`;
      console.log(query14)
      connection.query(query14, function (error, results, fields) {
          if (error)
          {
              res.writeHead(400,{
                  'Content-Type' : 'application/json'
              })
              res.end(error.toString())
              throw error;
          }
          
          
          else{
              res.end("Done")
          }
          connection.end();
      });
      
             
      
  })

app.listen(4000)
console.log("Server Listening on port 4000");
