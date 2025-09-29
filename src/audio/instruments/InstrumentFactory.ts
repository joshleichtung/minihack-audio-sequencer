// Instrument factory for creating modular instruments

import type {
  InstrumentFactory,
  InstrumentInterface,
  InstrumentConfig,
  InstrumentTypeInfo,
  ParameterDefinition,
} from '../../types/instruments'
// InstrumentType and ParameterType used in imported constants

// Import instrument implementations
import { ModularSynth } from './ModularSynth'
import { ModularDrumKit } from './ModularDrumKit'

// Import definitions and presets
import { INSTRUMENT_TYPE_DEFINITIONS } from './InstrumentTypeDefinitions'
import { INSTRUMENT_PRESETS } from './InstrumentPresets'

export class StandardInstrumentFactory implements InstrumentFactory {
  private static instance: StandardInstrumentFactory | null = null

  // Singleton pattern for global access
  static getInstance(): StandardInstrumentFactory {
    if (!StandardInstrumentFactory.instance) {
      StandardInstrumentFactory.instance = new StandardInstrumentFactory()
    }
    return StandardInstrumentFactory.instance
  }

  async create(config: InstrumentConfig): Promise<InstrumentInterface> {
    if (!this.canCreate(config.type)) {
      throw new Error(`Unknown instrument type: ${config.type}`)
    }

    const { id, name } = this.generateIdAndName(config)
    const instrument = this.createInstrument(config.type, id, name)

    this.applyParameters(instrument, config.parameters)
    await instrument.initialize()

    return instrument
  }

  private generateIdAndName(config: InstrumentConfig): { id: string; name: string } {
    const id =
      config.id || `${config.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const name = config.name || `${config.type} ${id.split('_')[1]}`
    return { id, name }
  }

  private createInstrument(type: string, id: string, name: string): InstrumentInterface {
    switch (type) {
      case 'polySynth':
        return new ModularSynth(id, name, 'polySynth')
      case 'monoSynth':
        return new ModularSynth(id, name, 'monoSynth')
      case 'drumKit':
        return new ModularDrumKit(id, name)
      case 'sampler':
        throw new Error('Sampler instruments not yet implemented')
      default:
        throw new Error(`Unsupported instrument type: ${type}`)
    }
  }

  private applyParameters(
    instrument: InstrumentInterface,
    parameters?: Record<string, unknown>
  ): void {
    if (!parameters) return

    for (const [paramId, value] of Object.entries(parameters)) {
      try {
        instrument.setParameter(paramId, value)
      } catch {
        // Silently skip invalid parameters during initialization
      }
    }
  }

  getAvailableTypes(): InstrumentTypeInfo[] {
    return INSTRUMENT_TYPE_DEFINITIONS
  }

  canCreate(type: string): boolean {
    const supportedTypes = ['polySynth', 'monoSynth', 'drumKit']
    return supportedTypes.includes(type)
  }

  // Helper method to get parameter definitions for a specific type
  getParameterDefinitions(type: string): ParameterDefinition[] {
    const typeInfo = this.getAvailableTypes().find(t => t.type === type)
    return typeInfo?.parameterDefinitions || []
  }

  // Helper method to create with preset configurations
  async createWithPreset(
    type: string,
    presetName: string,
    config?: Partial<InstrumentConfig>
  ): Promise<InstrumentInterface> {
    const presets = this.getPresets(type)
    const presetMap = new Map(Object.entries(presets))
    const preset = presetMap.get(presetName)

    if (!preset) {
      throw new Error(`Preset '${presetName}' not found for instrument type '${type}'`)
    }

    const fullConfig: InstrumentConfig = {
      type,
      parameters: preset,
      ...config,
    }

    return this.create(fullConfig)
  }

  // Predefined presets for different instrument types
  private getPresets(type: string): Record<string, Record<string, unknown>> {
    const presetsMap = new Map(Object.entries(INSTRUMENT_PRESETS))
    return presetsMap.get(type) || {}
  }
}
