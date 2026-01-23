import { useEffect, useState, useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import '../App.css'
import Header from './Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

function ModeloOrcamento() {
  const editorRef = useRef(null)
  const [modelo, setModelo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadModelo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/orcamento-modelo`)
        if (!response.ok) {
          throw new Error(`Falha ao carregar modelo (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setModelo(data.modelo || '')
          setErrorMessage('')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar modelo')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadModelo()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSave = async () => {
    if (!editorRef.current) return

    const content = editorRef.current.getContent()
    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/orcamento-modelo`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ modelo: content }),
      })

      if (!response.ok) {
        throw new Error(`Falha ao salvar modelo (${response.status})`)
      }

      const data = await response.json()
      setModelo(data.modelo || '')
      setSuccessMessage('Modelo salvo com sucesso!')
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao salvar modelo')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="app users-page">
      <Header />
      <main className="users-container">
        <header className="users-header" style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'normal', color: '#333' }}>
            Modelo de Orçamento
          </h1>
        </header>

        {isLoading ? (
          <section className="users-card">
            <p>Carregando modelo...</p>
          </section>
        ) : errorMessage && !modelo ? (
          <section className="users-card">
            <p style={{ color: '#d32f2f' }}>{errorMessage}</p>
          </section>
        ) : (
          <section className="users-card" style={{ padding: '0', overflow: 'hidden' }}>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              onInit={(_evt, editor) => (editorRef.current = editor)}
              initialValue={modelo}
              init={{
                height: 500,
                width: '100%',
                menubar: false,
                statusbar: true,
                elementpath: true,
                branding: false,
                promotion: false,
                license_key: 'gpl',
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
                  'pagebreak', 'nonbreaking', 'directionality'
                ],
                toolbar: [
                  'save newdocument | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | styles | fontfamily fontsize',
                  'cut copy paste pastetext | searchreplace | bullist numlist | outdent indent blockquote | undo redo | link unlink anchor image | insertdatetime preview | forecolor backcolor',
                  'table | hr removeformat visualaid | subscript superscript | charmap emoticons media | print | ltr rtl | fullscreen',
                  'pagebreak | visualblocks nonbreaking | code help'
                ],
                toolbar_mode: 'wrap',
                content_style: `
                  body { 
                    font-family: Helvetica, Arial, sans-serif; 
                    font-size: 14px;
                    padding: 10px;
                  }
                  table {
                    border-collapse: collapse;
                  }
                  table td, table th {
                    border: 1px solid #ccc;
                    padding: 5px;
                  }
                `,
                font_family_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino; Times New Roman=times new roman,times; Verdana=verdana,geneva',
                font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
                block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
                table_default_attributes: {
                  border: '1'
                },
                table_default_styles: {
                  'border-collapse': 'collapse',
                  'width': '100%'
                },
                image_advtab: true,
                paste_data_images: true,
                automatic_uploads: false,
                file_picker_types: 'image',
                convert_urls: false,
              }}
            />

            {/* Mensagens de feedback e botão salvar */}
            <div style={{ 
              padding: '12px 16px', 
              borderTop: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f9f9f9'
            }}>
              <div>
                {errorMessage && (
                  <span style={{ color: '#d32f2f', fontSize: '14px' }}>
                    {errorMessage}
                  </span>
                )}
                {successMessage && (
                  <span style={{ color: '#2e7d32', fontSize: '14px' }}>
                    {successMessage}
                  </span>
                )}
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default ModeloOrcamento
