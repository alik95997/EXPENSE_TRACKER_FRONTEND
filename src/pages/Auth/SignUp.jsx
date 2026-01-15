import React, { useState } from "react";
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import axios from "axios";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`,
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          profilePic,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Signup success:", response.data);

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      setFormError("root", {
        type: "manual",
        message: message,
      });
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

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("fullName", {
                required: "Please enter your full name",
                pattern: {
                  value: /^[A-Za-z\s'-]+$/,
                  message:
                    "Name can only contain letters, spaces, hyphens, or apostrophes.",
                },
              })}
              label="Full Name"
              placeholder="John Doe"
              type="text"
              error={errors.fullName?.message}
            />
            <Input
              {...register("email", {
                required: "Please enter your email address",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              type="text"
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email?.message}
            />
            <div className="sm:col-span-2">
              <Input
                {...register("password", {
                  required: "Please enter your password",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long.",
                  },
                })}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
                error={errors.password?.message}
              />
            </div>
          </div>

          {errors.root && (
            <p className="text-red-500 text-xs sm:text-sm pb-2.5 mt-2">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            className="btn-primary w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "SIGNING UP..." : "SIGN UP"}
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
