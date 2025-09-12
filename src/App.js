import React from "react";
import UserForm from "./UserForm";
import AdminPanel from "./AdminPanel";

function App() {
  return (
    <div>
      {/* Kullanıcı tarafı */}
      <UserForm />

      {/* Yöneticiler için */}
      {/* <AdminPanel /> */}
    </div>
  );
}

export default App;
