import React from 'react'
import Home from './pages/Home'
import Auth from './pages/Auth'
import InterviewPage from './pages/InterviewPage'
import Pricing from "./pages/Pricing";
import History from "./pages/History.jsx";

import {Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { setUserData } from './redux/userSlice'
import { useDispatch } from 'react-redux';

export const serverUrl = "http://localhost:5000"


const App = () => {
  const dispatch = useDispatch()
  useEffect(()=>{
    const getUser = async()=>{
      try {
        const result = await axios.get(serverUrl+"/api/user/current_user",{withCredentials:true})
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
      getUser()
  },[dispatch])
  return (
   <Routes>
<Route path = '/' element  = {<Home/>}/>
<Route path = '/auth' element  = {<Auth/>}/>
<Route path = '/interview' element  = {<InterviewPage/>}/>
<Route path="/pricing" element={<Pricing />} />
<Route path="/history" element={<History />} />
   </Routes>
  )
}

export default App