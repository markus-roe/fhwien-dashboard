import { FileText, Presentation, ArrowDownToLine } from 'lucide-react'

interface Material {
  id: string
  name: string
  size: string
  addedDate: string
  type: 'pdf' | 'presentation' | 'other'
}

interface SessionPanelMaterialsProps {
  materials: Material[]
}

export const SessionPanelMaterials = ({ materials }: SessionPanelMaterialsProps) => {
  const getIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
        return FileText
      case 'presentation':
        return Presentation
      default:
        return FileText
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900">Materialien</h3>
        <button className="text-xs text-blue-600 font-medium hover:underline">Alle herunterladen</button>
      </div>

      {materials.map((material) => {
        const Icon = getIcon(material.type)
        return (
          <a
            key={material.id}
            href="#"
            className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group bg-zinc-50/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white border border-zinc-200 rounded text-zinc-500 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shadow-sm">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 group-hover:text-blue-700 transition-colors">
                  {material.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {material.size} • Hinzugefügt {material.addedDate}
                </p>
              </div>
            </div>
            <ArrowDownToLine className="w-4 h-4 text-zinc-400 group-hover:text-blue-600" />
          </a>
        )
      })}
    </div>
  )
}

