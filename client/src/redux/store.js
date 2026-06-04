import { configureStore } from '@reduxjs/toolkit'
import userSlice from "../redux/userSlice.js"

export default configureStore({
  reducer: {
    user:userSlice
  },
})