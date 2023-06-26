const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendmail } = require("../utility/sendmail");

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, error: "User with email already exists!" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      flatNumber: req.body.flat ? req.body.flat : null,
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + 5);

    res
      .cookie("token", token, { httpOnly: true, expires: expireTime })
      .status(201)
      .json({ success: true, error: null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Please enter all the details!" });
  }

  try {
    const existingUser = await User.findOne({ email }).select(
      "passwordHash role status"
    );
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password!" });
    }

    if (existingUser.status === false) {
      return res.status(401).json({
        success: false,
        error: "Your account is not approved by the admin!",
      });
    }

    const passCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    if (!passCorrect) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password!" });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        role: existingUser.role,
      },
      process.env.JWT_SECRET
    );

    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + 5);

    res
      .cookie("token", token, { httpOnly: true, expires: expireTime })
      .status(201)
      .json({ success: true, error: null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.logout = (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .status(200)
    .json({ success: true, error: null });
};

exports.user = async (req, res) => {
  const user = await User.findOne({ _id: req.user.id });
  if (!user) {
    res.status(500).json({ success: false, error: "No user found" });
  }
  return res.status(200).json(user);
};

exports.loggedin = (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.send(false);
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.send(false);
    }
    res.send(true);
  } catch (error) {
    console.log("Loggedin Error : ", error.message);
    res.send(false);
  }
};

exports.allusers = async (req, res) => {
  const users = await User.find({ _id: { $eq: req.user.id } });
  res.status(200).json(users);
};

exports.approve = async (req, res) => {
  const { id } = req.body;
  if (req.user.role === "admin") {
    try {
      const existing = await User.findOne({ _id: id });
      if (!existing) {
        return res.status(500).json({ success: false, error: "No user found" });
      }
      if (existing.status !== false) {
        return res
          .status(500)
          .json({ success: false, error: "User already approved!" });
      }
      const updReq = await User.updateOne(
        { _id: { $eq: id } },
        { $set: { status: true } }
      );
      return res.status(200).json({ success: true, error: null });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  } else {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const existing = await User.findOne({ _id: req.user.id });
    if (!existing) {
      return res.status(500).json({ success: false, error: "No user found" });
    }

    // File Handling

    const updReq = await User.updateOne(
      { _id: { $eq: req.user.id } },
      {
        $set: {
          verificationDocument:
            "http://localhost:5000/uploads/" + req.file.filename,
        },
      }
    );
    return res.status(200).json({ success: true, error: null });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.emergency = async (req, res) => {
  const adminReq = await User.findOne({ role: "admin" }).select("email");
  sendmail(adminReq.email, "Emergency Notice!!");
  res.send("Email Sent Successfully!!");
};

// var name = "riyaz";
// let nameCopy = name;
// console.log(nameCopy);
// console.log(name)
// name = "faiyaz"

//     for(var i=0; i<5; i++){
//       setTimeout(()=>{
//           console.log(i)
//       },2000)
//     }
// console.log('arr-length :',arr.length)

// let res = arr.reduce((acc,val)=>{
//     if(acc>val){
//         val = acc;
//     }
//     return val;
// });

// console.log(res)

const arr = [10, 20, 30, 40, 50, 50, 60, 40, 60, 50, 80];
const strings = "hello my name is riyaz shaikh";

function capitalizeString(str) {
  let words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].slice(1);
    // console.log(words)
  }
  return words;
}
console.log(capitalizeString(strings));

function sortElements(arr) {
  let newStrings = "";
  for (let i = arr.length - 1; i >= 0; i--) {
    newStrings += arr[i];
  }
  return newStrings;
}
// console.log(sortElements(strings));
// const arr1 = [70,80,...arr];
// console.log("arr :",arr," ","arr1 :",arr1)
// arr1[2] = 100;
// console.log("arr :",arr," ","arr1 :",arr1)

function removeDuplicates(arr) {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    if (!res.includes(arr[i])) {
      res.push(arr[i]);
    }
  }
  return res.sort();
}
// console.log(removeDuplicates(arr))

function kilometerToMiles(km) {
  const oneMile = 0.621371;
  return `${km} kilometer is ${km * oneMile} miles`;
}
// console.log(kilometerToMiles(2));

function swapTwoVariables(a, b) {
  console.log(`before swapping a : ${a}, b : ${b}`);
  a = a - b;
  b = a + b;
  return `after swapping a : ${a}, b : ${b}`;
}
// console.log(swapTwoVariables(10,5));

function areaOfATriangle(base, height) {
  return Math.floor(0.5 * base * height);
}
// console.log(areaOfATriangle(20,4));

function squareRoot(num) {
  return Math.sqrt(num);
}
// console.log(squareRoot(25));

// let arr = [10,20,30,40,50];
function sumOfArray(arr) {
  let sum = 1;
  for (let i = 0; i < arr.length; i++) {
    sum *= Math.floor(arr[i]);
  }
  return sum;
}
// console.log(sumOfArray(arr));
