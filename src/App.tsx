import { useState } from "react"
import { DiagramEditor } from "./components/DiagramEditor"
import { Login } from "./components/LoginForm.tsx"
import { Register } from "./components/RegisterForm.tsx"
import { useAuth } from "./auth/AuthProvider.tsx"

function App() {
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(true)

  if (isAuthenticated) {
    return <DiagramEditor />
  }

  return (
    <div className="App">
      {showLogin ? (
        <>
          <Login />
          <div className="text-center mt-4 text-gray-600">
            ¿No tienes cuenta?
            <button
              className="text-indigo-600 font-medium ml-2 hover:text-indigo-800"
              onClick={() => setShowLogin(false)}
            >
              Regístrate
            </button>
          </div>
        </>
      ) : (
        <>
          <Register />
          <div className="text-center mt-4 text-gray-600">
            ¿Ya tienes cuenta?
            <button
              className="text-indigo-600 font-medium ml-2 hover:text-indigo-800"
              onClick={() => setShowLogin(true)}
            >
              Inicia sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default App
