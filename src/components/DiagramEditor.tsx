import { useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { Upload, Download, Play, Copy, Github, LogOut } from "lucide-react"

// Componente principal del editor
export const DiagramEditor = () => {
  const [code, setCode] = useState("")
  const [diagramType, setDiagramType] = useState("flowchart")
  const [generatedDiagram, setGeneratedDiagram] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [githubUrl, setGithubUrl] = useState("")
  const { user, logout } = useAuth()

  const diagramTypes = [
    { value: "flowchart", label: "Flowchart" },
    { value: "sequence", label: "Sequence Diagram" },
    { value: "class", label: "Class Diagram" },
    { value: "er", label: "ER Diagram" },
    { value: "aws", label: "AWS Architecture" },
    { value: "network", label: "Network Diagram" },
  ]

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === "text/plain") {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCode(e.target.result as string)
      }
      reader.readAsText(file)
    } else {
      alert("Por favor selecciona un archivo .txt válido")
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCode(text)
    } catch (err) {
      alert("No se pudo acceder al portapapeles. Asegúrate de dar permisos.")
    }
  }

  const loadFromGithub = async () => {
    if (!githubUrl) return

    try {
      // Convertir URL de GitHub a raw URL
      const rawUrl = githubUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
      const response = await fetch(rawUrl)
      const text = await response.text()
      setCode(text)
      setGithubUrl("")
    } catch (error) {
      alert("Error al cargar desde GitHub. Verifica la URL.")
    }
  }

  const generateDiagram = async () => {
    if (!code.trim()) {
      alert("Por favor ingresa código para generar el diagrama")
      return
    }

    setIsGenerating(true)

    try {
      const parsedJson = JSON.parse(code) // <- si `code` viene como string

      console.log(localStorage.getItem("token"));
      console.log(parsedJson);
      const response = await fetch("https://lnvew987t4.execute-api.us-east-1.amazonaws.com/dev/diagrams/with-json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("token"), // SIN Bearer
        },
        body: JSON.stringify({ json: parsedJson }), // <- así espera tu API
      })

      console.log(response)


      if (response.status === 403) {
        setIsGenerating(false)
        return
      }

      console.log(response)

      const data = await response.json()
      console.log(response)

      if (data.url) {
        setGeneratedDiagram({
          url: data.url,
          type: diagramType,
        })
      } else {
        alert("No se pudo generar el diagrama.")
      }
    } catch (error) {
      alert("Error al generar el diagrama. Verifica que el JSON esté bien formado.")
      console.error(error)
    }

    setIsGenerating(false)
  }


  const exportDiagram = (format) => {
    if (!generatedDiagram) return

    const element = document.createElement("a")

    if (format === "svg") {
      const blob = new Blob([generatedDiagram.svg], { type: "image/svg+xml" })
      element.href = URL.createObjectURL(blob)
      element.download = `diagram.svg`
    } else if (format === "png") {
      // Convertir SVG a PNG
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          element.href = URL.createObjectURL(blob)
          element.download = `diagram.png`
          element.click()
        })
      }

      const svgBlob = new Blob([generatedDiagram.svg], { type: "image/svg+xml" })
      img.src = URL.createObjectURL(svgBlob)
      return
    }

    element.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Generador de Diagramas</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hola, {user?.username}</span>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel del Editor */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Editor de Código</h2>

              {/* Controles superiores */}
              <div className="flex flex-wrap gap-3 mb-4">
                <select
                  value={diagramType}
                  onChange={(e) => setDiagramType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  {diagramTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Subir .txt</span>
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  onClick={handlePasteFromClipboard}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Pegar</span>
                </button>
              </div>

              {/* GitHub URL */}
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="URL de GitHub (opcional)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={loadFromGithub}
                  disabled={!githubUrl}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>Cargar</span>
                </button>
              </div>

              {/* Editor de texto */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Escribe tu código de diagrama aquí..."
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-sm resize-none"
              />

              {/* Botón generar */}
              <button
                onClick={generateDiagram}
                disabled={isGenerating || !code.trim()}
                className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>{isGenerating ? "Generando..." : "Generar Diagrama"}</span>
              </button>
            </div>
          </div>

          {/* Panel de Visualización */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Diagrama Generado</h2>
                {generatedDiagram && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportDiagram("svg")}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>SVG</span>
                    </button>
                    <button
                      onClick={() => exportDiagram("png")}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>PNG</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando diagrama...</p>
                  </div>
                ) : generatedDiagram ? (
                  <div className="w-full flex justify-center">
                    <img
                      src={generatedDiagram.url}
                      alt="Diagrama generado"
                      className="max-w-full max-h-[500px] object-contain rounded shadow"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>El diagrama aparecerá aquí después de generarlo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}