//adding opensource modules to application
var express = require('express'); //express
var app = express();

var path = require('path'); //for referring physical files here

var logger = require('morgan');
var cookieParser = require('cookie-parser'); //for maintain sessions

var bodyParser = require('body-parser'); //for parsing json

var bcrypt = require('bcrypt-nodejs');
var passport = require('passport'); //Using passportjs for authentication

var session = require('express-session'); //for maintaining sessions
var MongoStore = require('connect-mongo').default;
var flash = require('connect-flash');

var mongoose = require('mongoose'); //for mongodb, database
var socketio = require('socket.io');
//var consolidate = require('consolidate');
var models_user = require('./server/models/user.js'); // refering models in server.js
var models_chats = require('./server/models/chat.js');
var models_notification = require('./server/models/notification.js');
var models_friend = require('./server/models/friend.js');
var models_microblog = require('./server/models/microblog.js');
var models_event = require('./server/models/event.js');
var models_statusUpdate = require('./server/models/statusUpdates.js');

var notificationCtrl = require('./server/controllers/notification');

var mailer = require('./server/services/mailer.js'); // email

//var user_ctrl = require('./server/controllers/user.js');

// // db connection
// var dbHost = process.env.SERVER_DEV == 1 ? "localhost" : "localhost";
// var dbPort = process.env.SERVER_DEV == 1 ? 27018 : 27017;
// mongoose.Promise = Promise;
// mongoose.connect("mongodb://" + dbHost + ":" + dbPort + "/ibouge");

// //tell node the global configuration about parser,logger and passport
// app.use(cookieParser());
// app.use(logger("dev")); // logs all requests to the server side console
// app.use(
//   session({
//     secret: "a451b603ffdab9681a700cb8d484492d5a7fcb9acad9156e5cd06f27390cd3c0fb5123deac736c4d6daf716f97f09eec",
//     resave: true,
//     saveUninitialized: false,
//     store: new MongoStore({
//       mongoUrl: "mongodb://" + dbHost + ":" + dbPort + "/ibouge",
//     }),
//     secret: ")F*0fweofih0(F*H98hwef",
//   }),
// );
// db connection
var dbHost = process.env.SERVER_DEV == 1 ? 'localhost' : 'localhost';
var dbPort = process.env.SERVER_DEV == 1 ? 27018 : 27017;
mongoose.Promise = Promise;
mongoose
  .connect(
    // 'mongodb+srv://erosbalto:admin524ABC@cluster0.h0d3t.mongodb.net/ibouge?retryWrites=true&w=majority',
    'mongodb://' + dbHost + ':' + dbPort + '/ibouge',
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(() => {
    console.log('MongoDB Connected...'+'mongodb://' + dbHost + ':' + dbPort + '/ibouge');
  })
  .catch((err) => console.log(err));

//tell node the global configuration about parser,logger and passport
app.use(cookieParser());
app.use(logger('dev')); // logs all requests to the server side console
app.use(
  session({
    secret:
      'a451b603ffdab9681a700cb8d484492d5a7fcb9acad9156e5cd06f27390cd3c0fb5123deac736c4d6daf716f97f09eec',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://' + dbHost + ':' + dbPort + '/ibouge',
      // mongoUrl:
      //   'mongodb+srv://erosbalto:admin524ABC@cluster0.h0d3t.mongodb.net/ibouge?retryWrites=true&w=majority',
    }),
    secret: ')F*0fweofih0(F*H98hwef',
  })
);
app.use(flash());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(passport.initialize()); //initializing passport

app.use(passport.session()); //initializing passport session
//import the routers
var router = require('./server/routes/router');
var authenticate = require('./server/routes/authentication')(passport);
var socialAuthenticate = require('./server/routes/socialAuthentication')(
  passport
);
var userRoute = require('./server/routes/user');
var filterRoute = require('./server/routes/filter');
var chatRoute = require('./server/routes/chat');
var myDashboardRoute = require('./server/routes/myDashboard');
var microblogRoute = require('./server/routes/microblog');
var eventRoute = require('./server/routes/event');
var emailRoute = require('./server/routes/email');
var statusRoute = require('./server/routes/status.js');
var amazonBucketRoute = require('./server/routes/s3bucket.js');

// import controllers
var chatCtrl = require('./server/controllers/chat');
var microblogCtrl = require('./server/controllers/microblog');
var eventCtrl = require('./server/controllers/event');
var statusCtrl = require('./server/controllers/status.js');
var s3BucketCtrl = require('./server/controllers/amazonBucketController.js');

// //tell node that My application will use ejs engine for rendering, view engine setup
// app.set('views', path.join(__dirname, '/server/views'));
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'html');
// // Charlie changed was port 80
app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './client/build'));
});

//tell node about these directories that application may get resources from
app.use('/', router);
app.use('/auth', authenticate);
app.use('/', socialAuthenticate);
app.use('/users', userRoute);
app.use('/filter', filterRoute);
app.use('/chat', chatRoute);
app.use('/my-dashboard', myDashboardRoute);
app.use('/microblog', microblogRoute);
app.use('/email', emailRoute);
app.use('/event', eventRoute);
app.use('/status', statusRoute);
app.use('/s3Bucket', amazonBucketRoute);
// app.use(function (req, res, next) {
//   console.log(req.path);
//   res.redirect("/");
//   // if (req.path.indexOf("html") >= 0) {
//   // }
// });

app.use(express.static(path.join(__dirname, 'user')));
app.use(express.static(path.join(__dirname, 'user/controllers')));
app.use(express.static(path.join(__dirname, 'user/services')));
app.use(express.static(path.join(__dirname, 'user/directives')));
app.use(express.static(path.join(__dirname, 'user/filters')));
app.use(express.static(path.join(__dirname, 'user/views')));
app.use(express.static(path.join(__dirname, 'user/assets')));
app.use(express.static(path.join(__dirname, 'user/assets/js')));
app.use(express.static(path.join(__dirname, 'user/assets/css')));
app.use(express.static(path.join(__dirname, 'user/assets/img')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/img')));
app.use(express.static(path.join(__dirname, 'upload')));

//providing auth-api to passport so that it can use it.
var initPassport = require('./server/controllers/passport-init');
initPassport(passport);

//running server on node

const port = process.env.PORT || 5000;
var server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
  var io = socketio(server);
  /**
   * {
    cors: {
      origin: 'http://localhost:5000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  }
   */
  var Chat = mongoose.model('Chat');
  var User = mongoose.model('User');
  var Microblog = mongoose.model('Microblog');
  var Event = mongoose.model('Event');

  var getSocket = function (id) {
    // get all client sockets connected to socket.io
    var connectedSockets = io.sockets.sockets;

    // for each individual socket connected
    for (var key in connectedSockets) {
      // if the socket has a client id which matches
      // our ID passed into this function
      // then return the socket
      if (connectedSockets[key].clientID === id) {
        return connectedSockets[key];
      }
    }
  };

  var addNewChatMsg = function (room, msg) {
    chatCtrl.addNewChatMessage(room, msg);
  };

  var addNewMicroblogMsg = function (room, msg) {
    microblogCtrl.addNewMicroblogMessage(room, msg);
  };

  var addNewMicroblogUser = function (room, user) {
    microblogCtrl.addMicroblogUser(room, user);
  };

  var saveEventImage = function (eventID, data) {
    eventCtrl.saveEventImage(eventID, data);
  };

  var addEventLike = function (eventId, data) {
    eventCtrl.addLikeToEvent(eventId, data);
  };

  var removeEventLike = function (eventId, user) {
    eventCtrl.removeLikeFromEvent(eventId, user);
  };

  var addUserGoingToEvent = function (eventId, user) {
    eventCtrl
      .addUserGoing(eventId, user)
      .then((data) => console.log('eve', data))
      .catch((e) => console.log(e));
  };

  var removeUserGoingToEvent = function (eventId, user) {
    eventCtrl.removeUserGoing(eventId, user);
  };

  var addLikeToStatusOrReply = function (statusId, data, cb) {
    statusCtrl.addLikeToStatusOrReply(statusId, data, cb);
  };

  var addStatusReply = function (data, cb) {
    statusCtrl.createNewReply(
      data.status_id,
      data.from,
      data.reply_type,
      data.message,
      data.time,
      cb
    );
  };

  var removeStatusLike = function (statusId, user) {
    statusCtrl.removeLikeFromStatus(statusId, user);
  };

  var removeReplyLike = function (statusId, replyId, user) {
    statusCtrl.removeLikeFromReply(statusId, replyId, user);
  };

  var updateUserAvailability = function (id, isOnline) {
    return new Promise((resolve, reject) => {
      User.findOne({_id: id}, function (err, user) {
        if (err || !user) {
          return reject({status: 404, message: 'User not found'});
        }

        user.is_online = isOnline;

        user.save(function (err) {
          if (err) {
            return reject(err);
          }
          return resolve(user);
        });
      });
    });
  };

  var setLastLogout = function (myId, room) {
    chatCtrl.setLastLogout(myId, room);
  };

  var setLastLogOutMicroblog = function (myId, room) {
    microblogCtrl.setLastLogoutMicroblog(myId, room);
  };

  var createOrSetLastLogin = function (myId, room) {
    return new Promise((resolve, reject) => {
      chatCtrl.getChatByRoom(room).then(
        function (chat) {
          console.log('succeed to get chat....', chat);
          chatCtrl.setLastLogin(myId, room).then(
            function () {
              return resolve('login updated');
            },
            function () {
              return resolve('login update failed');
            }
          );
        },
        function (err) {
          if (err.status === 404) {
            var users = room.split('___');
            chatCtrl.createChat(myId, room, users, false).then(
              function () {
                return resolve('successfully created');
              },
              function (err) {
                return reject(err);
              }
            );
          } else {
            return reject(err);
          }
        }
      );
    });
  };

  var createOrSetLastLoginMicroblog = function (myId, room) {
    return new Promise((resolve, reject) => {
      microblogCtrl.getMicroblogByRoom(room).then(
        function (microblog) {
          microblogCtrl.setLastLoginMicroblog(myId, room).then(
            function () {
              return resolve('login updated');
            },
            function () {
              return resolve('login update failed');
            }
          );
        },
        function (err) {
          if (err.status === 404) {
            var users = room.split('___');
            microblogCtrl.createMicroblog(myId, room, users, true).then(
              function () {
                return resolve('successfully created');
              },
              function (err) {
                return reject(err);
              }
            );
          } else {
            return reject(err);
          }
        }
      );
    });
  };

  io.sockets.on('connection', function (socket) {
    // callback function for socket.on('disconnect')
    function disconnect() {
      updateUserAvailability(socket.clientID, false)
        .then((data) => {
          socket.broadcast.emit('presence', {
            user_id: socket.clientID,
            status: 0,
          });
        })
        .catch((err) => {});

      // remove the clients id so we can't
      // accidentally send anything to this socket
      // before it's totally removed from the sockets
      socket.clientID = '';
    }

    socket.on('disconnect', disconnect);

    socket.on('addUserID', function (data) {
      console.log('addUserId', data);
      socket.clientID = data.id;
      updateUserAvailability(data.id, true)
        .then((data) => {
          socket.broadcast.emit('presence', {
            user_id: data.id,
            status: 1,
          });
        })
        .catch((err) => console.log('addUserID error', err));
    });

    socket.on('join-room', function (data) {
      // join chat room
      socket.join(data.room);
    });

    socket.on('leave-room', function (data) {
      // leave the chat room
      socket.leave(data.room);
    });

    socket.on('new-notification', function (data) {
      // if (data.type === "acceptFriendRequest") {
      //   User.findById(data.from).then(user => {
      //     console.log('#################', data)
      //     const temp = {
      //       from: data.from,
      //       to: data.to,
      //       name: user.fname + ' ' + user.lname
      //     }
      //     notificationCtrl.addNotification('friend-request', temp);
      //     if(user.friend_requests_sent.indexOf(data.to)===-1)
      //       user.friend_requests_sent = [...user.friend_requests_sent, data.to]
      //     user.save()
      //   })
      // }
      // else if (data.type === "unfriend") {
      //   User.findById(data.from).then(user => {
      //     if(user.friend_requests_sent.indexOf(data.to)===-1)
      //       user.friend_requests_sent = [...user.friend_requests_sent, data.to]
      //     user.save()
      //   })
      //   User.findById(data.to).then(user => {
      //     user.friend_requests_sent = user.friend_requests_sent.filter(x=> x!==data.from)
      //     user.save()
      //   })
      // }
      // else if (data.type === "addFriendSuccess") {
      //   User.findById(data.to).then(user => {
      //     user.friend_requests_sent = user.friend_requests_sent.filter(x=> x!==data.from)
      //     user.save()
      //   })
      // }
      var _socket = getSocket(data.to);
      // console.log(_socket)
      if (_socket) {
        console.log('emit new notification request', data);
        // User.findById(data.from).then(user => {
        //   data['username'] = user.fname + ' ' + user.lname;
        //   _socket.emit('newNotification', data)
        // })
        // .catch((e)=>{console.log(e)})
        _socket.emit('newNotification', data);
      }
    });

    function sendChatEmail(fromId, toId, isGroupChat, groupName) {
      var oids = [fromId, toId].map((x) => mongoose.Types.ObjectId(x));

      User.find(
        {
          _id: {$in: oids},
        },
        function (err, users) {
          var fromUser = null;
          var toUser = null;

          if (err) {
            console.log(
              'error in sendChatEmail: failed to lookup',
              oids,
              ':',
              err
            );
            return;
          }

          for (var responseId in users) {
            var x = users[responseId];
            if (x.id == fromId) fromUser = x;
            else if (x.id == toId) toUser = x;
          }

          if (fromUser == null) {
            console.log(
              "error in sendChatEmail: couldn't lookup fromId:",
              fromId
            );
            return;
          }

          if (toUser == null) {
            console.log("error in sendChatEmail: couldn't lookup toId:", toId);
            return;
          }

          mailer.chatNotificationMail(fromUser, toUser, isGroupChat, groupName);
        }
      );
    }

    // callback function for socket.on('message')
    function sendMessage(data) {
      var time = Date.now();
      var msg = {
        from: data.from,
        message_type: 'text',
        message: data.msg,
        time: time,
      };

      addNewChatMsg(data.room, msg);

      // get the receivers socket if they are online
      var _socket = getSocket(data.to);
      // if they are online
      if (_socket) {
        // get the amount of rooms they've joined
        var roomsLength = Object.keys(_socket.rooms).length;
        var iterate = 0;

        // iterate through each room
        for (var key in _socket.rooms) {
          iterate++;

          // if they are already in room send them the message
          if (_socket.rooms[key] === data.room) {
            socket.broadcast.emit('message', data);
            console.log('====sdfsdfsdf====', data.room);
            // if they are not in the room then join them
            // then send them the message
          } else if (iterate === roomsLength) {
            _socket.join(data.room);
            console.log('====sdfs === after join  === dfsdf====', data.room);
            socket.broadcast.emit('message', data);
          }
        }
      }
      sendChatEmail(data.from, data.to, false, null);
    }

    socket.on('message', sendMessage);

    socket.on('typing', function (data) {
      console.log('User is typing', data.room);
      // get the receivers socket if they are online
      var _socket = getSocket(data.to._id);

      // if they are online
      if (_socket) {
        console.log('User online');
        // get the amount of rooms they've joined
        var roomsLength = Object.keys(_socket.rooms).length;
        var iterate = 0;

        // iterate through each room
        for (var key in _socket.rooms) {
          iterate++;

          // if they are already in room send them the message
          if (_socket.rooms[key] === data.room) {
            console.log('User online, already in room');
            socket.broadcast.emit('typing', data);

            // if they are not in the room then join them
            // then send them the message
          } else if (iterate === roomsLength) {
            console.log('User online, join the room');
            _socket.join(data.room);
            socket.broadcast.emit('typing', data);
          }
        }
      }
    });

    socket.on('group-message', function (data) {
      var time = Date.now();
      var msg = {
        from: data.from,
        message_type: 'text',
        message: data.msg,
        time: time,
      };
      addNewChatMsg(data.room, msg);

      chatCtrl.getChatByRoom(data.room).then(
        function (chat) {
          var _sockets = [];

          var users = chat._doc.users;
          var usersLength = chat._doc.users.length;
          var sender = data.from;

          for (var i = 0; i < usersLength; i++) {
            var userSocket = getSocket(users[i]._doc.user_id);
            var userID = users[i]._doc.user_id;

            if (userSocket && sender !== userID) {
              _sockets.push(userSocket);
            }

            sendChatEmail(data.from, userID, true, chat.name);
          }

          if (_sockets.length > 0) {
            for (var i = 0; i < _sockets.length; i++) {
              _sockets[i].emit('newNotification');
            }
          }

          // broadcast the message to everyone in the room except sender
          socket.broadcast.to(data.room).emit('groupMessage', data);
        },
        function (err) {
          console.log('get chat err :', err);
        }
      );
    });

    // listening for messages from the microblog
    socket.on('microblog-message', function (data) {
      var time = Date.now();
      var msg = {
        from: data.from,
        message_type: 'text',
        message: data.msg,
        time: time,
      };
      console.log('adding msg', msg);
      addNewMicroblogMsg(data.room, msg);

      microblogCtrl.getMicroblogByRoom(data.room).then(
        function (microblog) {
          socket.broadcast.to(data.room).emit('microblogMessage', data);
        },
        function (err) {
          console.log('get microblog err :', err);
        }
      );
    });

    // listening for a new status-update
    socket.on('new-status-update', function (data) {
      socket.broadcast.emit('new-status-to-show', data);
    });

    // listening for a new status-update
    socket.on('delete-status', function (data) {
      socket.broadcast.emit('status-to-delete', data);
    });

    socket.on('delete-reply', function (data) {
      socket.broadcast.emit('reply-to-delete', data);
    });

    // listening for an image message from the microblog
    socket.on('microblog-image-message', function (room, data) {
      microblogCtrl.getMicroblogByRoom(room).then(
        function (microblog) {
          socket.broadcast
            .to(room)
            .emit('microblog-image-message-to-friends', data);
        },
        function (err) {
          console.log('get microblog err :', err);
        }
      );
    });

    // listening for an image message from a group-chat
    socket.on('group-chat-image-message', function (room, data) {
      chatCtrl.getChatByRoom(room).then(
        function (chat) {
          var _sockets = [];

          var users = chat._doc.users;
          var usersLength = chat._doc.users.length;
          var sender = data.from;

          for (var i = 0; i < usersLength; i++) {
            var userSocket = getSocket(users[i]._doc.user_id);
            var userID = users[i]._doc.user_id;

            if (userSocket && sender !== userID) {
              _sockets.push(userSocket);
            }
          }

          if (_sockets.length > 0) {
            for (var i = 0; i < _sockets.length; i++) {
              _sockets[i].emit('newNotification');
            }
          }

          socket.broadcast.to(room).emit('groupChatImageMessage', data);
        },
        function (err) {
          console.log('get chat err : ', err);
        }
      );
    });

    // listening for a new user added to a microblog
    socket.on('new-microblog-user', function (data) {
      addNewMicroblogUser(data.room, data.user);

      microblogCtrl.getMicroblogByRoom(data.room).then(
        function (microblog) {
          socket.broadcast.to(data.room).emit('new-microblog-user', data);
        },
        function (err) {
          console.log('get microblog err :', err);
        }
      );
    });

    // listening for session user to be added to the allInvolved array in microblog database
    socket.on('add-me-to-allInvolved', function (data) {
      microblogCtrl
        .addMeToAllInvolved(data)
        .then((res) => console.log('add-me-to-allInvolved'))
        .catch((err) => console.log('add-me-to-allInvolved error: ', err));
    });

    // listening for other people to be added to the allInvolved array in microblog database
    socket.on('update-all-involved-array', function (data) {
      microblogCtrl
        .updateAllInvolvedArray(data)
        .then((res) => console.log('update-all-involved-array'))
        .catch((err) => console.log('update-all-involved-array error: ', err));
    });

    socket.on('close-chat', function (data) {
      setLastLogout(data.id, data.room);
    });

    // when the page is refreshed
    socket.on('on-refresh-p2p-chat', function (data) {
      // set the last logout info for the P2P chats
      for (var i = 0; i < data.chats.length; i++) {
        setLastLogout(data.chats[i].me._id, data.chats[i].room);
      }
    });

    socket.on('close-microblog', function (data) {
      setLastLogOutMicroblog(data.id, data.room);
    });

    socket.on('open-chat', function (data) {
      console.log('trying to open chat...', data.room);
      createOrSetLastLogin(data.id, data.room).then(
        function () {
          data.isGroupChat
            ? socket.emit('loadGroupChatHistory', data)
            : socket.emit('loadP2PChatHistory', data);
        },
        function (err) {
          console.log('error open chat:', err);
        }
      );
    });

    // fetches microblog history
    socket.on('open-microblog', function (data) {
      createOrSetLastLoginMicroblog(data.id, data.room).then(
        function () {
          socket.emit('loadMicroblogHistory', data);
        },
        function (err) {
          console.log('error open microblog:', err);
        }
      );
    });

    // event image
    socket.on('save-event-image', function (data) {
      var image = {
        hasFile: data.hasFile,
        isImageFile: data.isImageFile,
        filename: data.filename,
        src: data.serverfilename,
        size: data.size,
      };
      saveEventImage(data.eventID, image);
    });

    // this adds a like to an event
    socket.on('add-event-like', function (data) {
      var like = {
        from: data.me,
        when: Date.now(),
      };

      addEventLike(data.event, like);
    });

    // a like will be removed from an event in the database
    socket.on('remove-event-like', function (data) {
      removeEventLike(data.event, data.me);
    });

    // a user will be added to the "going" to an event array in the database
    socket.on('going-to-event', function (data) {
      addUserGoingToEvent(data.eventID, data.user);
    });

    // a user will be removed from the "going" to an event array in the database
    socket.on('not-going-to-event', function (data) {
      removeUserGoingToEvent(data.eventID, data.user);
    });

    // this adds a like to a status update
    socket.on('add-status-like', function (data) {
      var like = {
        from: data.me,
        when: Date.now(),
        createdBy: data.createdBy,
        reply: data.reply,
      };

      addLikeToStatusOrReply(data.status, like, function (err, receivers) {
        if (err) {
          return;
        }
        if (data.createdBy != data.me) {
          var _socket = getSocket(data.createdBy);
          if (_socket) {
            _socket.emit('new-notification-to-show', data);
          }
        }
      });
    });

    // this adds a like to a status update
    socket.on('add-reply', function (data) {
      var reply = {
        status_id: data.status_id,
        from: data.from,
        reply_type: data.reply_type,
        message: data.message,
        time: Date.now(),
      };
      console.log('===============', data);
      addStatusReply(data, function (err, receivers, oData) {
        data._id = oData.reply._id;
        if (err) {
          return;
        }
        if (oData.from != oData.to) {
          var _socket = getSocket(oData.to);
          if (_socket) {
            _socket.emit('new-notification-to-show', data);
          }
        }
        socket.broadcast.emit('new-reply-to-show', data);
        socket.emit('new-reply-to-show', data);
      });
    });

    // a like will be removed from a status update in the database
    socket.on('remove-status-like', function (data) {
      if (data.type == 'status') {
        removeStatusLike(data.status, data.me);
      } else {
        removeReplyLike(data.status, data.reply, data.me);
      }
    });
  });
});

//export the application as a module
module.exports = app;

DEBUG = 'Main*,Worker*,Cli*';
