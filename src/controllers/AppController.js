const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
// SIGNUP
async function signup(req, res) {
  try {
    // GET USER INPUT
    const { email, firstname, lastname, password } = req.body;

    // CHECK IF USER ALREADY EXISTS
    // VALIDATE IF USER EXISTS IN OUR DATABASE
    const oldUser = await UserModel.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login 😑");
    }

    // ENCRYPT USER PASSWORD
    encryptedPassword = await bcrypt.hash(password, 10);

    // CREATE USER IN OUR DATABASE
    const user = await UserModel.create({
      email: email.toLowerCase(), // SANITIZE: CONVERT EMAIL TO LOWERCASE
      firstname: firstname,
      lastname: lastname,
      password: encryptedPassword,
      created_on: Date.now(),
      confirmed: "0",
      reset_password_token: ""
    });

    // CREATE TOKEN
    const token = jwt.sign(
      { user_id: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "6h",
      }
    );

    // SAVE USER TOKEN
    user.token = token;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: 'topdeveloper9032@gmail.com',
        pass: 'achcdqtjgpjikznx',
        },
    });
    var mailOptions = {
        from: 'admin@gmail.com',
        to: email.trim(),
        subject: 'Please verify your email',
        html: `Please click this email to confirm your email: <a href="${req.protocol}://${req.get(
        'host'
        )}/user/confirmation/${token}">`,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
    })

    // RETURN TOKEN TO USER
    return res.status(201).json({
      status: 201,
      message: "User Signed Up Successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}

// *********************************************************************************************************************

// LOGIN
async function login(req, res) {
  try {
    // GET USER INPUT
    const { email, password } = req.body;

    // VALIADTE USER INPUT
    if (!(email && password)) {
      res.status(400).send("All Input Is Required 😑");
    }

    // VALIDATE IF USER EXISTS IN OUR DATABASE
    const user = await UserModel.findOne({ email });
    if (user) { 
      if(user.confirmed == "0"){
        res.status(403).send("Unconfirmed Account!");
      } else {
        if (user && (await bcrypt.compare(password, user.password))) {
        // CREATE TOKEN
          const token = jwt.sign(
            { user_id: user._id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "6h",
            }
          );

          // SAVE USER TOKEN
          user.token = token;

          // RETURN TOKEN TO USER
          return res.status(200).json({
            status: 200,
            message: "User Logged In Successfully",
            data: {
              token, token,
              email: user.email
            }
          });
        }
        res.status(400).send("Invalid Credentials");
      }
    }    
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}
// ********************************************************************************************************************

// CONFIRM SIGN UP
async function confirmation(req, res){
  try{
    //const user = req.user;
    const { user_id } = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.updateOne( { _id: user_id }, { $set: { confirmed: "1" } } ); 

    if(user){
       return res.status(200).json({
        status: 200,
        message: "User Confirmed In Successfully",
      });
    } 
  }catch(error){
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}

// ********************************************************************************************************************

// CONFIRM SIGN UP
async function forgetpassword(req, res){
  try{
    const { email } = req.body;
    var token = jwt.sign({ email:email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
           user: 'topdeveloper9032@gmail.com',
           pass: 'achcdqtjgpjikznx',
      },
    });
    var mailOptions = {
        from: 'admin@gmail.com',
        to: email.trim(),
        subject: "Password Reset",
        html: `<p>You have requested for password reset</p>
        <h5>click in this <a href="http://localhost:3000/resetpassword/${token}">link</a> to reset password</h5>`
    };
    const user = await UserModel.updateOne( { email: email }, { $set: { reset_password_token: token } } );
    if(user){
      transporter.sendMail(mailOptions, function (err, info) {
          if (err) console.log(err);
          else console.log(info);
      })
       return res.status(200).json({
        status: 200,
        message: "Update Refrash Token for ForgetPassword",
        token
      });
    } 

  }catch(error){
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}

// ********************************************************************************************************************

// RESET PASSWORD
async function newPassword(req, res){
  try{
    const { password, token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if(decoded) {
      const user = await UserModel.findOne({ email: decoded.email });
      if (user !={} && token == user.reset_password_token) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user1 = await UserModel.updateOne( { email: decoded.email }, { $set: { password: hashedPassword } } );
        if(user1){
           return res.status(200).json({
            status: 200,
            message: "Reset New Password IN Successfully!",
          });
        } else {
          return res.status(500).json({
            status: 500,
            message: "Reset Password IN Failure!",
          });
        }
      } else {
        return res.status(403).json({
          status: 403,
          message: "Token Is Expired!",
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
         message: "Unauthorized!",
      });
    }
    
  }catch(error) {
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}

// *********************************************************************************************************************

// GOOGLE SIGNIN/SIGNUP
async function googlelogin(req, res) {
  try{
    const { firstname, lastname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.findOne({ email: email });
    if (user) {
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "6h",
        }
      );
      return res.status(200).json({
        status: 200,
        message: "Google Signed In Successfully",
        data: {
              token, token,
              email: user.email
            }
      });
    } else {
      const user = await UserModel.create({
        email: email.toLowerCase(), // SANITIZE: CONVERT EMAIL TO LOWERCASE
        firstname: firstname,
        lastname: lastname,
        password: hashedPassword,
        created_on: Date.now(),
        confirmed: "1",
        reset_password_token: ""
      });

      // CREATE TOKEN
      const token = jwt.sign(
        { user_id: user._id },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "6h",
        }
      );

      // SAVE USER TOKEN
      user.token = token;
      return res.status(201).json({
        status: 201,
        message: "User Signed Up Successfully",
        token,
      });
    }

  }catch(error){
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
}
// *********************************************************************************************************************

// DELETE USER BY EMAIL
async function deleteUserData(req, res) {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      const deleted = await UserModel.deleteOne({ email: email });
      if (deleted) {
        return res.status(201).json({
          status: 200,
          message: "User Deleting was successfly!",
        });
      }

    } else { 
      console.error(error);
      return res.status(403).json({
        status: 403,
        message: "There is no user with this email",
      });
    }
  } catch (err) { 
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
} 


// *********************************************************************************************************************

// GET USER DATA
async function getUserData(req, res) {
  try {
    const { firstname, lastname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // GET USER
    const user = req.user;
    data = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      confirmed:user.confirmed,
    }
    return res.status(200).json({
      status: 200,
      data
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
}

module.exports = { signup, login, getUserData, googlelogin, newPassword, forgetpassword, confirmation, deleteUserData };
