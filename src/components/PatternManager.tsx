/* eslint-disable max-lines-per-function */
import React, { useState, useRef } from 'react'
import { useSequencer } from '../context/SequencerContext'
import type { PatternMetadata } from '../types/sequencer'

const PatternManager = (): React.JSX.Element => {
  const {
    savedPatterns,
    saveCurrentPattern,
    loadPattern,
    deletePattern,
    exportPattern,
    importPattern,
  } = useSequencer()

  const [isOpen, setIsOpen] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [patternName, setPatternName] = useState('')
  const [patternDescription, setPatternDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = (): void => {
    if (patternName.trim()) {
      saveCurrentPattern(patternName, patternDescription || undefined)
      setPatternName('')
      setPatternDescription('')
      setShowSaveDialog(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      void importPattern(file)
        .then(() => {
          // Reset the file input on success
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        })
        .catch(() => {
          // Import failed - file input remains unchanged
        })
    }
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (!isOpen) {
    return (
      <div className="mb-2">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-lcars-orange text-black font-bold rounded-full hover:bg-lcars-yellow transition-colors"
        >
          PATTERNS
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border-2 border-lcars-blue rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lcars-blue font-bold text-xl">PATTERN LIBRARY</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-4 py-2 bg-lcars-orange text-black font-bold rounded-full hover:bg-lcars-yellow transition-colors text-sm"
        >
          SAVE CURRENT
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-lcars-blue text-black font-bold rounded-full hover:bg-lcars-yellow transition-colors text-sm"
        >
          IMPORT
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {showSaveDialog && (
        <div className="bg-gray-800 border-2 border-lcars-orange rounded p-4 mb-4">
          <h3 className="text-lcars-orange font-bold mb-2">SAVE PATTERN</h3>
          <input
            type="text"
            value={patternName}
            onChange={e => setPatternName(e.target.value)}
            placeholder="Pattern name..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:border-lcars-orange"
          />
          <textarea
            value={patternDescription}
            onChange={e => setPatternDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 mb-2 focus:outline-none focus:border-lcars-orange resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!patternName.trim()}
              className="px-4 py-2 bg-lcars-orange text-black font-bold rounded-full hover:bg-lcars-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              SAVE
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false)
                setPatternName('')
                setPatternDescription('')
              }}
              className="px-4 py-2 bg-gray-600 text-white font-bold rounded-full hover:bg-gray-500 transition-colors text-sm"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {savedPatterns.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No saved patterns. Create one by clicking SAVE CURRENT above.
          </div>
        ) : (
          savedPatterns.map((patternMeta: PatternMetadata) => (
            <div
              key={patternMeta.id}
              className="bg-gray-800 border border-gray-700 rounded p-3 hover:border-lcars-blue transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="text-white font-bold">{patternMeta.name}</h4>
                  {patternMeta.description && (
                    <p className="text-gray-400 text-sm mt-1">{patternMeta.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {patternMeta.tempo} BPM • {formatDate(patternMeta.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => loadPattern(patternMeta.id)}
                    className="px-3 py-1 bg-lcars-blue text-black font-bold rounded hover:bg-lcars-yellow transition-colors text-xs"
                    title="Load pattern"
                  >
                    LOAD
                  </button>
                  <button
                    onClick={() => exportPattern(patternMeta.id)}
                    className="px-3 py-1 bg-gray-600 text-white font-bold rounded hover:bg-gray-500 transition-colors text-xs"
                    title="Export pattern"
                  >
                    EXPORT
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete pattern "${patternMeta.name}"?`)) {
                        deletePattern(patternMeta.id)
                      }
                    }}
                    className="px-3 py-1 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition-colors text-xs"
                    title="Delete pattern"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default PatternManager
