import { FC, useEffect } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import { useTheme } from '@/hooks/use-theme'

type JsonEditorProps = {
  value: string
  schema: Record<string, unknown> | undefined
  onChange: (value: string) => void
  onValidate: (isValid: boolean) => void
}

export const JsonEditor: FC<JsonEditorProps> = ({ value, schema, onChange, onValidate }) => {
  const monaco = useMonaco()
  const { theme } = useTheme()

  useEffect(() => {
    if (!monaco || !schema) return

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: window.location.href,
          fileMatch: ['*'],
          schema,
        },
      ],
    })
    monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'light')
  }, [monaco, schema, theme])

  return (
    <Editor
      height="200px"
      language="json"
      value={value}
      onChange={(value) => {
        onChange(value ?? '')
      }}
      onValidate={(markers) => {
        onValidate(markers.length === 0)
      }}
      options={{
        lineNumbers: 'off',
        minimap: { enabled: false },
      }}
    />
  )
}
