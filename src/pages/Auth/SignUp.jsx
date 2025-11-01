import React, { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import axios from "axios";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!fullName) {
      setError("Please enter your full name");
      return;
    }

 const nameRegex = /^[A-Za-z\s'-]+$/;
    if (!nameRegex.test(fullName)) {
        setError("Name can only contain letters, spaces, hyphens, or apostrophes.");
        return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        "https://expense-tracker-backend-chi-six.vercel.app/api/auth/signup",
        {
          fullName,
          email,
          password,
          profilePic, // optional — depends if you plan to store it later
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // const response = await axios.post(
      //     "http://localhost:5000/api/auth/signup",
      //     {
      //       fullName,
      //       email,
      //       password,
      //       profilePic, // optional — depends if you plan to store it later
      //     },
      //     {
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //     }
      //   );
      console.log("Signup success:", response.data);

      // Show success message or redirect
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
      alert(error.message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        <h3 className="text-2xl sm:text-3xl font-semibold text-black">
          Create An Account
        </h3>
        <p className="text-sm sm:text-base text-slate-700 mt-2 mb-6">
          Join us today by entering your details below.
        </p>

        <form onSubmit={handleSignup} className="w-full">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
            />
            <Input
              type="text"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
            />
            <div className="sm:col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs sm:text-sm pb-2.5 mt-2">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full mt-4">
            SIGN UP
          </button>

          <p className="text-xs sm:text-sm text-slate-800 mt-3 text-center">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
