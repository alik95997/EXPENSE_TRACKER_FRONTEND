import { configureStore } from "@reduxjs/toolkit";
import { incomeExpense } from "./services/expenseApi";
export const store = configureStore({
  reducer: {
    [incomeExpense.reducerPath]: incomeExpense.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(incomeExpense.middleware),
});
