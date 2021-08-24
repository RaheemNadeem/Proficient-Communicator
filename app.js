//jshint esversion:6

var express = require("express");
const app = express();
var bodyParser = require("body-parser");

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createBrotliCompress } = require("zlib");
const { pathToFileURL } = require("url");
const { Console } = require("console");

/////////////////////////////Initializing Variables///////////////////
var user_name_pass = 4;
var groupchat = 4;
var i = 0;
var n = 0;
var p = false;
var g = 0;
var MessageTemplate = 4;
var messageCount = 4;
var chats = 4;
var chats_length = 0;
var chat_length2 = 0;
var j = true;
var active_chat_template = 0;
var download_template = 0;

//////////////////Multer Set Storage Engine//////////////////////

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

/////////////Init upload//////////////////////////////////////////

const upload = multer({
  storage: storage,
}).single("myfile");

//////////////////Loading User name and Passwords////////////////////

// fs.readFile(`${__dirname}/user_password.json`, 'utf-8', (err, data) => {
//   const productData = JSON.parse(data);
//   user_name_pass = productData;
//   n = productData.length;

// });

/////////////////////loading Group chat////////////////////

fs.readFile(`${__dirname}/groupchat.json`, "utf-8", (err, data) => {
  const productData = JSON.parse(data);
  groupchat = productData;
  g = productData.length;
});

///////////////////loading all    chats////////////////////

fs.readFile(`${__dirname}/chats.json`, "utf-8", (err, data) => {
  const productData = JSON.parse(data);
  chats = productData;
  chats_length = productData.length;
});

//////////////////////loading message template/////////////////////////

MessageTemplate = fs.readFileSync(`${__dirname}/tempMesg.html`, "utf-8");
active_chat_template = fs.readFileSync(
  `${__dirname}/tempActiveChat.html`,
  "utf-8"
);
download_template = fs.readFileSync(
  `${__dirname}/DownloadTemplate.html`,
  "utf-8"
);

////////////////////data filling function///////////////////////////

const replaceTemplate = (temp, el) => {
  let output = temp.replace(/{%%username%%}/g, el.username);
  output = output.replace(/{%%message%%}/g, el.message);
  return output;
};

//////////////Starting server////////////////////////////////

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

server.listen(port, function () {
  console.log(`Server Has started on port ${port}  Successfully`);
});

//////////////////////////Getting Requests from the Server//////////////////
app.get("/", function (req, res) {
  res.render("index", { message: "" });
});
app.get("/test", function (req, res) {
  fs.readFile(`${__dirname}/files.json`, "utf-8", (err, data) => {
    const productData = JSON.parse(data);
    user_name_pass = productData;
    n = productData.length;
    var y = 0;
    var s = "";

    for (i = n - 1; i >= 0; i--) {
      var y = download_template.replace(
        /{%%description%%}/g,
        productData[i].Description
      );
      y = y.replace(/{%%username%%}/g, productData[i].username);
      y = y.replace(/{%%number%%}/g, i);

      s = s + y;
    }

    res.render("Studentupload", { data: s, username: "req.body.username1" });
  });
});

app.get("/testui", function (req, res) {
  res.render("whitechat");
});

app.get("/==%3EAdmin", function (req, res) {
  res.render("Admin", { message: "" });
});

/////////////////////Upload Post Method For accepting Files/////////////////

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`${__dirname}/files.json`, "utf-8", (err, data) => {
      const productData = JSON.parse(data);

      n = productData.length;

      productData.push({
        filename: `${req.file.filename}`,
        Description: `${req.body.Description}`,
        username: `${req.body.username1}`,
      });
      fs.writeFile(
        `${__dirname}/files.json`,
        JSON.stringify(productData),
        "utf-8",
        function (err) {
          if (err) throw err;

          fs.readFile(`${__dirname}/files.json`, "utf-8", (err, data) => {
            const productData = JSON.parse(data);
            user_name_pass = productData;
            n = productData.length;
            var y = 0;
            var s = "";

            for (i = n - 1; i >= 0; i--) {
              var y = download_template.replace(
                /{%%description%%}/g,
                productData[i].Description
              );
              y = y.replace(/{%%username%%}/g, productData[i].username);
              y = y.replace(/{%%number%%}/g, i);

              s = s + y;
            }

            res.render("upload", { data: s, username: req.body.username1 });
          });
        }
      );
    });
  });
});

////////////////User Validation post Method//////////////

app.post("/Login", function (req, res) {
  var p = false;

  fs.readFile(
    `${__dirname}/Teacher_user_password.json`,
    "utf-8",
    (err, data) => {
      const productData = JSON.parse(data);
      user_name_pass = productData;
      n = productData.length;

      for (i = 0; i < n; i++) {
        if (
          user_name_pass[i].username == req.body.urId &&
          user_name_pass[i].password == req.body.urPass
        ) {
          res.render("home", { message: req.body.urId });

          p = true;
        }
      }

      fs.readFile(
        `${__dirname}/Student_user_password.json`,
        "utf-8",
        (err, data) => {
          const productData = JSON.parse(data);
          user_name_pass = productData;
          n = productData.length;

          for (i = 0; i < n; i++) {
            if (
              user_name_pass[i].username == req.body.urId &&
              user_name_pass[i].password == req.body.urPass
            ) {
              res.render("Studenthome", { message: req.body.urId });

              p = true;
            }
          }
          if (p) {
          } else {
            res.render("index", { message: "Id or Password is incorrect" });
          }
        }
      );
    }
  );
});

app.get("/download/:id", (req, res) => {
  fs.readFile(`${__dirname}/files.json`, "utf-8", (err, data) => {
    const productData = JSON.parse(data);

    var x =
      __dirname + "/public/uploads/" + productData[req.params.id].filename;
    res.download(x);
  });
});

app.post("/NoticeBoard", (req, res) => {
  fs.readFile(`${__dirname}/files.json`, "utf-8", (err, data) => {
    const productData = JSON.parse(data);
    user_name_pass = productData;
    n = productData.length;
    var y = 0;
    var s = "";

    for (i = n - 1; i >= 0; i--) {
      var y = download_template.replace(
        /{%%description%%}/g,
        productData[i].Description
      );
      y = y.replace(/{%%username%%}/g, productData[i].username);
      y = y.replace(/{%%number%%}/g, i);

      s = s + y;
    }

    fs.readFile(
      `${__dirname}/Teacher_user_password.json`,
      "utf-8",
      (err, data) => {
        const productData = JSON.parse(data);
        user_name_pass = productData;
        n = productData.length;

        for (i = 0; i < n; i++) {
          if (user_name_pass[i].username == req.body.username1) {
            res.render("upload", { data: s, username: req.body.username1 });
          }
        }
      }
    );
    fs.readFile(
      `${__dirname}/Student_user_password.json`,
      "utf-8",
      (err, data) => {
        const productData = JSON.parse(data);
        user_name_pass = productData;
        n = productData.length;

        for (i = 0; i < n; i++) {
          if (user_name_pass[i].username == req.body.username1) {
            res.render("Studentupload", { data: s });
          }
        }
      }
    );

    //
  });
});

////////////////////Socket io//////////////////////////

io.on("connection", (socket) => {
  fs.readFile(`${__dirname}/groupchat.json`, "utf-8", (err, data) => {
    const productData = JSON.parse(data);
    groupchat = productData;
    g = productData.length;

    const y = groupchat
      .map((el) => replaceTemplate(MessageTemplate, el))
      .join("");

    socket.emit("chats", y);
  });

  socket.on("active_chats", (username) => {
    var h = "hello";
    fs.readFile(`${__dirname}/chats.json`, "utf-8", (err, data) => {
      const productData = JSON.parse(data);
      groupchat = productData;
      g = productData.length;
      var c = [];

      for (var i = 0; i < productData.length; i++) {
        if (productData[i].username == username) {
          c.push(productData[i].with_user);
        } else if (productData[i].with_user == username) {
          c.push(productData[i].username);
        }
      }
      const y = c
        .map((el) => replaceTemplate2(active_chat_template, el))
        .join("");

      socket.emit("active_chats", y, username);
    });
  });

  const replaceTemplate2 = (temp, el) => {
    let output = temp.replace(/{%%username%%}/g, el);

    return output;
  };

  ////////////////////chat clicked ///////////////////

  socket.on("chat_clicked", (with_user, username) => {
    var i,
      j = false;

    if (with_user == "groupchat") {
      fs.readFile(`${__dirname}/groupchat.json`, "utf-8", (err, data) => {
        const productData = JSON.parse(data);
        groupchat = productData;
        g = productData.length;

        const y = groupchat
          .map((el) => replaceTemplate(MessageTemplate, el))
          .join("");

        socket.emit("chats", y);
      });
    } else {
      fs.readFile(`${__dirname}/chats.json`, "utf-8", (err, data) => {
        const productData = JSON.parse(data);
        chats = productData;
        chats_length = productData.length;

        for (i = 0; i < chats_length; i++) {
          if (
            (chats[i].username == username &&
              chats[i].with_user == with_user) ||
            (chats[i].username == with_user && chats[i].with_user == username)
          ) {
            const y = chats[i].chat
              .map((el) => replaceTemplate(MessageTemplate, el))
              .join("");

            socket.emit("chat_received", username, with_user, y);
            socket.broadcast.emit("chat_received", username, with_user, y);

            j = true;
          }
        }

        if (j) {
        } else {
          fs.readFile(`${__dirname}/chats.json`, "utf-8", (err, data) => {
            const productData = JSON.parse(data);
            productData.push({
              username: `${username}`,
              with_user: `${with_user}`,
              chat: [],
            });

            fs.writeFile(
              `${__dirname}/chats.json`,
              JSON.stringify(productData),
              "utf-8",
              function (err) {
                if (err) throw err;
              }
            );

            socket.broadcast.emit("reload");
            socket.emit("reload");
          });
        }
      });
    }
  });

  //////////////On recieving the message from user////////////////
  socket.on("message", (data, id, with_user) => {
    const mesg = data;
    if (data != null && data != "") {
      //////////////////////////////Storing the chat/////////////////
      if (with_user == "groupchat") {
        fs.readFile(`${__dirname}/groupchat.json`, "utf-8", (err, data) => {
          const productData = JSON.parse(data);
          productData.push({ username: `${id}`, message: `${mesg}` });

          fs.writeFile(
            `${__dirname}/groupchat.json`,
            JSON.stringify(productData),
            "utf-8",
            function (err) {
              if (err) throw err;
            }
          );
        });
      } else {
        fs.readFile(`${__dirname}/chats.json`, "utf-8", (err, data) => {
          const productData = JSON.parse(data);
          chats = productData;

          chat_length2 = productData.length;
          setTimeout(function () {
            for (i = 0; i < chat_length2; i++) {
              if (
                (chats[i].username == id && chats[i].with_user == with_user) ||
                (chats[i].username == with_user && chats[i].with_user == id)
              ) {
                chats[i].chat.push({ username: `${id}`, message: `${mesg}` });

                fs.writeFile(
                  `${__dirname}/chats.json`,
                  JSON.stringify(chats),
                  "utf-8",
                  function (err) {
                    if (err) throw err;
                  }
                );
              }
            }
          }, 1);
        });

        var i = 0;
      }

      /////////////////////////////////

      socket.emit("message", data, id, with_user);
      socket.broadcast.emit("message", data, id, with_user);
    }
  });
});

///////////////////////////////////////////////////////

//////////////// Adding users    //////////////////////

app.post("/add", function (req, res) {
  const c = req.body.urId;
  const d = req.body.urPass;
  const u = "Student_user_password";
  const p = "Teacher_user_password";
  var t = false;
  const k = req.body.filename1;

  if (c != null && c != "") {
    if (d != null && d != "") {
      t = true;
    }
  }

  if (t) {
    if (k == "Student") {
      fs.readFile(`${__dirname}/${u}.json`, "utf-8", (err, data) => {
        const productData = JSON.parse(data);
        productData.push({ username: `${c}`, password: `${d}` });

        fs.writeFile(
          `${__dirname}/${u}.json`,
          JSON.stringify(productData),
          "utf-8",
          function (err) {
            if (err) throw err;
          }
        );
      });
    }

    if (k == "Teacher") {
      fs.readFile(`${__dirname}/${p}.json`, "utf-8", (err, data) => {
        const productData = JSON.parse(data);
        productData.push({ username: `${c}`, password: `${d}` });

        fs.writeFile(
          `${__dirname}/${p}.json`,
          JSON.stringify(productData),
          "utf-8",
          function (err) {
            if (err) throw err;
          }
        );
      });
    }
    res.render("Admin", { message: "Added" });
  } else res.render("Admin", { message: "Please enter the values" });
});
/////////////////////////////////////////////////////////////
