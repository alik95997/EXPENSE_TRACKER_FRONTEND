import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const incomeExpense = createApi({
  reducerPath: "incomeExpenseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://expense-tracker-backend-chi-six.vercel.app/api",
    credentials: true,
  }),
  endpoints: (build) => ({
    getIncome: build.query({
      query: () => "/income/getincome",
    }),

    createIncome: build.mutation({
      query: (newIncome) => ({
        url: "/income/addincome",
        method: "POST",
        body: newIncome,
      }),
    }),
  }),
});

export const { useGetIncomeQuery, useCreateIncomeMutation } = incomeExpense;
