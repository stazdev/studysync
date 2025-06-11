import React from 'react'
import { FileText, FileImage, File as FilePdf, FileType, Download, Eye, X } from 'lucide-react'
import { Button } from '../ui/Button'

interface FilePreviewProps {
  file: File
  preview?: string
  onClose: () => void
  onDownload?: () => void
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  preview,
  onClose,
  onDownload
}) => {
  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return FileImage
    if (file.type === 'application/pdf') return FilePdf
    if (file.type === 'text/plain') return FileText
    return FileType
  }

  const FileIcon = getFileIcon()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{file.name}</h3>
              <p className="text-sm text-gray-500">
                {file.type} • {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onDownload && (
              <Button variant="outline\" size="sm\" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-auto">
          {file.type.startsWith('image/') && preview ? (
            <div className="text-center">
              <img
                src={preview}
                alt={file.name}
                className="max-w-full max-h-[60vh] object-contain mx-auto rounded-lg shadow-lg"
              />
            </div>
          ) : file.type === 'text/plain' ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                {/* Text content would be loaded here */}
                Loading text content...
              </pre>
            </div>
          ) : file.type === 'application/pdf' ? (
            <div className="text-center py-12">
              <FilePdf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">PDF Preview</h4>
              <p className="text-gray-600 mb-4">
                PDF preview is not available in this demo. In a production environment,
                you would integrate PDF.js or a similar library for PDF viewing.
              </p>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Open in PDF Viewer
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileType className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">File Preview</h4>
              <p className="text-gray-600">
                Preview not available for this file type.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}