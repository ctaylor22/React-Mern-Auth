import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import PrivateRoute from './components/routing/PrivateRoute';
import PrivateScreen from './components/screens/PrivateScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import LoginScreen from './components/screens/LoginScreen';
import ForgotPasswordScreen from './components/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './components/screens/ResetPasswordScreen';

const App = () => {
  return (
    <Router>
      <div className='app'>
        <Routes>
          <Route exact path='/' element={<PrivateRoute/>}>
            <Route exact path='/' element={<PrivateScreen/>}/>
          </Route>
          <Route exact path="/login" element={<LoginScreen/>}/>
          <Route exact path="/register" element={<RegisterScreen/>}/>
          <Route exact path="/forgotpassword" element={<ForgotPasswordScreen/>}/>
          <Route exact path="/passwordreset/:resetToken" element={<ResetPasswordScreen/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;