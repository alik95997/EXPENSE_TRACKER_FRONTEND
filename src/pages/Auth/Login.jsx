import React from "react";
import { useForm } from "react-hook-form";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      console.log("Login success:", response.data);

      // Save user info to localStorage (for UI display only, not authentication)
      if (response.data.userId) {
        localStorage.setItem("userId", response.data.userId);
      }
      if (response.data.data?.fullName) {
        localStorage.setItem("userName", response.data.data.fullName);
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setFormError("root", {
        type: "manual",
        message: message,
      });
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your details to log in.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            {...register("email", {
              required: "Please enter your email address",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            type="email"
            label="Email Address"
            placeholder="john@example.com"
            error={errors.email?.message}
          />

          <Input
            {...register("password", {
              required: "Please enter your password",
            })}
            type="password"
            label="Password"
            placeholder="Min 8 Characters"
            error={errors.password?.message}
          />

          {errors.root && (
            <p className="text-red-500 text-xs pb-2.5">
              {errors.root.message}
            </p>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "LOGGING IN..." : "LOGIN"}
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an Account?{" "}
            <Link className="font-medium text-primary underline" to="/signup">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
