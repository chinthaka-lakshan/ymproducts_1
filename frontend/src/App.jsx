import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import './App.css';
import Login from './Pages/Login/AdminLogin/login.jsx';
import AdminDashboard from './Pages/Dashboard/AdminDashboard/AdminDashboard.jsx';
import DistributionStock from './Pages/DistributionStock/DistributionStock.jsx';
import PurchaseStock from './Pages/PurchaseStock/PurchaseStock.jsx';
import Orders from './Pages/Orders/Orders.jsx';
import AdminShops from './Pages/AdminShops/AdminShops.jsx';
import Return from './Pages/Returns/Returns.jsx';
import CashFlow from './Pages/CashFlowAnalysis/CashFlowAnalysis.jsx';
import OrdersHistory from './Pages/OrdersHistory/OrdersHistory.jsx';
import SalesReps from './Pages/SalesReps/SalesReps.jsx';
import RepInvoice from './Pages/RepInvoice/RepInvoice.jsx';
import Invoice from "./Pages/Invoice/Invoice.jsx";
import RepReturns from "./Pages/RepReturns/RepReturns.jsx";
import RegisterRep from './Pages/RegisterRep/RegisterRep.jsx';
import RepLogin from './Pages/Login/RepLogin/RepLogin.jsx';
import RepDashboard from './Pages/Dashboard/RepDashboard/RepDashboard.jsx';
import RepOrders from './Pages/RepOrders/RepOrders.jsx';
import RepShops from './Pages/RepShops/RepShops.jsx';
import AddOrder from './Pages/AddOrder/AddOrder.jsx';
import AddReturn from './Pages/AddReturn/AddReturn.jsx';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />}/>
          
          <Route path="/admindashboard" element={<AdminDashboard />}/>
          <Route path="/distributionStock" element={<DistributionStock />}/>
          <Route path="/purchaseStock" element={<PurchaseStock />}/>
          <Route path="/adminOrders" element={<Orders />}/>  
          <Route path="/adminShops" element={<AdminShops />}/>
          <Route path="/returns" element={<Return />}/>
          <Route path="/cashFlow" element={<CashFlow />}/>
          <Route path='/adminOrdersHistory' element={<OrdersHistory/>}/>
          <Route path="/salesreps" element={<SalesReps />}/>
          <Route path='/register-rep' element={<RegisterRep />}/>
          <Route path="/repLogin" element={<RepLogin />}/>
          <Route path='/repDashboard' element={<RepDashboard/>}/>
          <Route path='/repOrders' element={<RepOrders/>}/>
          <Route path="/repinvoice" element={<RepInvoice />}/>
          <Route path="/invoice" element={<Invoice />}/>
          <Route path="/repReturns" element={<RepReturns />}/>
          <Route path="/repShops" element={<RepShops/>}/>
          <Route path="/addOrder" element={<AddOrder/>}/>
          <Route path="/addReturn" element={<AddReturn/>}/>

          {/* edit rep by rep id */}
          <Route path="/edit-rep/:id" element={<RegisterRep isEdit={true}/>} />

          
        </Routes>
      </div>
    </Router>
  );
}

export default App;