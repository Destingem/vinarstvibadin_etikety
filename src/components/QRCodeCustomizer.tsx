"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { QRCodeOptions, QRCodePreset } from '@/lib/qr-code';

interface QRCodeCustomizerProps {
  wineId: string;
  onQRCodeGenerated: (qrCodeDataUrl: string, options: QRCodeOptions) => void;
}

export default function QRCodeCustomizer({ wineId, onQRCodeGenerated }: QRCodeCustomizerProps) {
  const { token } = useAuth();
  
  // QR code options
  const [width, setWidth] = useState<number>(300);
  const [margin, setMargin] = useState<number>(4);
  const [darkColor, setDarkColor] = useState<string>('#000000');
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  // Preset handling
  const [presets, setPresets] = useState<QRCodePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [presetName, setPresetName] = useState<string>('');
  
  // UI states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Load presets on mount
  useEffect(() => {
    fetchPresets();
  }, [token]);
  
  // Generate QR code when wine changes
  useEffect(() => {
    if (wineId) {
      generateQRCode();
    }
  }, [wineId]); // Only regenerate when wine changes, not when options change
  
  /**
   * Fetch saved presets from the API
   */
  const fetchPresets = async () => {
    if (!token) return;
    
    try {
      const response = await authFetch('/api/qrcodes', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getPresets',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst uložené presety');
      }
      
      const data = await response.json();
      setPresets(data.presets || []);
    } catch (err: any) {
      console.error('Error fetching presets:', err);
    }
  };
  
  /**
   * Apply a selected preset to the QR code
   */
  const applyPreset = async (presetId: string) => {
    setSelectedPresetId(presetId);
    
    if (!presetId) {
      // Reset to defaults
      setWidth(300);
      setMargin(4);
      setDarkColor('#000000');
      setLightColor('#ffffff');
      setErrorCorrectionLevel('M');
      setPresetName('');
      return;
    }
    
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;
    
    // Apply preset options
    setWidth(preset.options.width || 300);
    setMargin(preset.options.margin || 4);
    setDarkColor(preset.options.color?.dark || '#000000');
    setLightColor(preset.options.color?.light || '#ffffff');
    setErrorCorrectionLevel(preset.options.errorCorrectionLevel || 'M');
    setPresetName(preset.name);
    
    // Generate QR code with the preset options
    const optionsToUse: QRCodeOptions = {
      width: preset.options.width || 300,
      margin: preset.options.margin || 4,
      color: {
        dark: preset.options.color?.dark || '#000000',
        light: preset.options.color?.light || '#ffffff',
      },
      errorCorrectionLevel: preset.options.errorCorrectionLevel || 'M',
    };
    
    generateQRCode(optionsToUse);
  };
  
  /**
   * Save current options as a preset
   */
  const savePreset = async () => {
    if (!token) return;
    if (!presetName.trim()) {
      setError('Zadejte název presetu');
      return;
    }
    
    const presetOptions: QRCodeOptions = {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel,
    };
    
    const presetId = selectedPresetId || `preset_${Date.now()}`;
    
    const preset: QRCodePreset = {
      id: presetId,
      name: presetName,
      options: presetOptions,
    };
    
    try {
      const response = await authFetch('/api/qrcodes', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preset,
          action: 'save',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se uložit preset');
      }
      
      const data = await response.json();
      setPresets(data.presets || []);
      setSelectedPresetId(presetId);
      setSuccessMessage('Preset byl úspěšně uložen');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při ukládání presetu');
    }
  };
  
  /**
   * Delete a preset
   */
  const deletePreset = async () => {
    if (!token || !selectedPresetId) return;
    
    try {
      const response = await authFetch('/api/qrcodes', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preset: { id: selectedPresetId },
          action: 'delete',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se smazat preset');
      }
      
      const data = await response.json();
      setPresets(data.presets || []);
      setSelectedPresetId('');
      applyPreset(''); // Reset to defaults
      setSuccessMessage('Preset byl úspěšně smazán');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při mazání presetu');
    }
  };
  
  /**
   * Generates a QR code with current options
   */
  const generateQRCode = async (options?: QRCodeOptions) => {
    if (!token || !wineId) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // If options are provided, use them, otherwise use current state
      const qrOptions = options || {
        width,
        margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel,
      };
      
      // Create search params for the API call
      const params = new URLSearchParams({
        wineId,
        width: qrOptions.width?.toString() || '',
        margin: qrOptions.margin?.toString() || '',
        darkColor: qrOptions.color?.dark || '',
        lightColor: qrOptions.color?.light || '',
        errorCorrectionLevel: qrOptions.errorCorrectionLevel || '',
      });
      
      const urlToFetch = `/api/qrcodes?${params.toString()}`;
      const response = await authFetch(urlToFetch, token);
      
      if (!response.ok) {
        throw new Error('Nepodařilo se vygenerovat QR kód');
      }
      
      const data = await response.json();
      onQRCodeGenerated(data.qrCode, data.options);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(err.message || 'Nastala chyba při generování QR kódu');
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Úprava QR kódu
        </h3>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <label htmlFor="preset" className="block text-sm font-medium text-gray-700">
              Uložené presety
            </label>
            <div className="mt-1 flex space-x-2">
              <select
                id="preset"
                name="preset"
                value={selectedPresetId}
                onChange={(e) => applyPreset(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              >
                <option value="">Výchozí nastavení</option>
                {presets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
              
              {selectedPresetId && (
                <button
                  type="button"
                  onClick={deletePreset}
                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Smazat
                </button>
              )}
            </div>
          </div>
          
          {/* Save preset controls */}
          <div>
            <label htmlFor="presetName" className="block text-sm font-medium text-gray-700">
              Název presetu
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                id="presetName"
                name="presetName"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Můj preset"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              />
              
              <button
                type="button"
                onClick={savePreset}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Uložit
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Základní nastavení
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Width */}
              <div>
                <label htmlFor="width" className="block text-sm font-medium text-gray-700">
                  Velikost (px)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="width"
                    name="width"
                    min="100"
                    max="1000"
                    value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  />
                </div>
              </div>
              
              {/* Margin */}
              <div>
                <label htmlFor="margin" className="block text-sm font-medium text-gray-700">
                  Okraj
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="margin"
                    name="margin"
                    min="0"
                    max="10"
                    value={margin}
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  />
                </div>
              </div>
              
              {/* Dark color */}
              <div>
                <label htmlFor="darkColor" className="block text-sm font-medium text-gray-700">
                  Barva QR kódu
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    id="darkColor"
                    name="darkColor"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="h-8 w-8 rounded-md border-gray-300 shadow-sm"
                  />
                  <input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  />
                </div>
              </div>
              
              {/* Light color */}
              <div>
                <label htmlFor="lightColor" className="block text-sm font-medium text-gray-700">
                  Barva pozadí
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    id="lightColor"
                    name="lightColor"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="h-8 w-8 rounded-md border-gray-300 shadow-sm"
                  />
                  <input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  />
                </div>
              </div>
              
              {/* Error correction level */}
              <div>
                <label htmlFor="errorCorrectionLevel" className="block text-sm font-medium text-gray-700">
                  Úroveň korekce chyb
                </label>
                <div className="mt-1">
                  <select
                    id="errorCorrectionLevel"
                    name="errorCorrectionLevel"
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  >
                    <option value="L">Nízká (7%)</option>
                    <option value="M">Střední (15%)</option>
                    <option value="Q">Vyšší (25%)</option>
                    <option value="H">Vysoká (30%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={() => generateQRCode()}
              disabled={isGenerating}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generuji...
                </>
              ) : 'Generovat QR kód'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}