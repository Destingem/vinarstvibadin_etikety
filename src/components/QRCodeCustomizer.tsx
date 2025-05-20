"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { QRCodeOptions, QRCodePreset } from '@/lib/qr-code';
import { uploadLogo, getFilePreview } from '@/lib/appwrite-storage';

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
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoFileId, setLogoFileId] = useState<string>('');
  const [logoSize, setLogoSize] = useState<number>(20);
  const [logoBackgroundColor, setLogoBackgroundColor] = useState<string>('#ffffff');
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  // Preset handling
  const [presets, setPresets] = useState<QRCodePreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [presetName, setPresetName] = useState<string>('');
  
  // UI states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  // Load presets on mount
  useEffect(() => {
    fetchPresets();
  }, [token]);
  
  // Generate QR code when options change
  useEffect(() => {
    if (wineId) {
      generateQRCode();
    }
  }, [wineId]); // Only regenerate when wine changes, not when options change
  
  // Fetch saved presets
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
  
  // Apply selected preset
  const applyPreset = async (presetId: string) => {
    setSelectedPresetId(presetId);
    
    if (!presetId) {
      // Reset to defaults
      setWidth(300);
      setMargin(4);
      setDarkColor('#000000');
      setLightColor('#ffffff');
      setLogoUrl('');
      setLogoFileId('');
      setLogoSize(20);
      setLogoBackgroundColor('#ffffff');
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
    
    // Handle logo from different sources based on what's available
    if (preset.hasStoredLogo && preset.options.logoFileId) {
      // If the preset uses a stored logo, get the preview URL
      setLogoFileId(preset.options.logoFileId);
      try {
        const previewUrl = getFilePreview(preset.options.logoFileId);
        setLogoUrl(previewUrl);
      } catch (err) {
        console.error('Error loading logo from storage:', err);
        setLogoUrl('');
        setError('Failed to load logo from storage. Please re-upload your logo.');
      }
    } else if (preset.options.logoUrl === '[LOGO_DATA_URL_TOO_LARGE]') {
      // If the preset had a logo but it was too large to save, inform the user
      setLogoUrl('');
      setLogoFileId('');
      setError('Logo from this preset was too large to save. Please re-upload your logo.');
    } else if (preset.options.logoUrl) {
      // Use the original data URL if available (for backwards compatibility)
      setLogoUrl(preset.options.logoUrl);
      setLogoFileId('');
    } else {
      // No logo
      setLogoUrl('');
      setLogoFileId('');
    }
    
    setLogoSize(preset.options.logoSize || 20);
    setLogoBackgroundColor(preset.options.logoBackgroundColor || '#ffffff');
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
      logoSize: preset.options.logoSize || 20,
      logoBackgroundColor: preset.options.logoBackgroundColor || '#ffffff',
      errorCorrectionLevel: preset.options.errorCorrectionLevel || 'M',
    };
    
    // Include logo information
    if (preset.hasStoredLogo && preset.options.logoFileId) {
      optionsToUse.logoFileId = preset.options.logoFileId;
      optionsToUse.logoUrl = logoUrl; // Use the URL we just fetched
    } else if (preset.options.logoUrl && preset.options.logoUrl !== '[LOGO_DATA_URL_TOO_LARGE]') {
      optionsToUse.logoUrl = preset.options.logoUrl;
    }
    
    generateQRCode(optionsToUse);
  };
  
  // Save current options as a preset
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
      logoSize,
      logoBackgroundColor,
      errorCorrectionLevel,
    };
    
    // Set logo information, prioritizing file ID if available
    const hasStoredLogo = !!logoFileId;
    
    if (logoFileId) {
      // If we have a file ID, use that instead of the URL
      presetOptions.logoFileId = logoFileId;
    } else if (logoUrl) {
      // For backwards compatibility and small data URLs
      presetOptions.logoUrl = logoUrl;
    }
    
    const presetId = selectedPresetId || `preset_${Date.now()}`;
    
    const preset: QRCodePreset = {
      id: presetId,
      name: presetName,
      options: presetOptions,
      hasStoredLogo,
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
  
  // Delete preset
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

  // Handle logo file upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setError('Prosím vyberte obrázek');
      return;
    }
    
    setLogoFile(file);
    setIsUploading(true);
    setError(null); // Clear any previous errors
    
    try {
      // Upload the logo to Appwrite Storage
      const uploadResult = await uploadLogo(file);
      
      // Store the file ID and preview URL
      setLogoFileId(uploadResult.fileId);
      setLogoUrl(uploadResult.url);
      
      // Automatically generate a QR code with the new logo
      const options: QRCodeOptions = {
        width,
        margin,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        logoFileId: uploadResult.fileId,
        logoUrl: uploadResult.url,
        logoSize,
        logoBackgroundColor,
        errorCorrectionLevel: 'H', // Set higher error correction for logo
      };
      
      // Show success message
      setSuccessMessage('Logo bylo úspěšně nahráno');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      generateQRCode(options);
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setError(`Chyba při nahrávání loga: ${err.message || 'Neznámá chyba'}`);
      
      // If upload fails, use traditional data URL method as fallback
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
        
        // Automatically generate a QR code with the new logo
        const options: QRCodeOptions = {
          width,
          margin,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          logoUrl: reader.result as string,
          logoSize,
          logoBackgroundColor,
          errorCorrectionLevel: 'H', // Set higher error correction for logo
        };
        
        generateQRCode(options);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Generate QR code with current options
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
        logoUrl,
        logoFileId,
        logoSize,
        logoBackgroundColor,
        errorCorrectionLevel,
      };
      
      // Create search params for the API call
      const params = new URLSearchParams({
        wineId,
        width: qrOptions.width?.toString() || '',
        margin: qrOptions.margin?.toString() || '',
        darkColor: qrOptions.color?.dark || '',
        lightColor: qrOptions.color?.light || '',
        logoSize: qrOptions.logoSize?.toString() || '',
        logoBackgroundColor: qrOptions.logoBackgroundColor || '',
        errorCorrectionLevel: qrOptions.errorCorrectionLevel || '',
      });
      
      // If we have a logoFileId, include it in the parameters
      if (qrOptions.logoFileId) {
        params.append('logoFileId', qrOptions.logoFileId);
      }
      
      // If logoUrl is a data URL, it's too big for URL parameters
      // We'll need to pass it client-side only
      let urlToFetch = `/api/qrcodes?${params.toString()}`;
      
      // Remove logoUrl from params to avoid huge URLs
      if (qrOptions.logoUrl && !qrOptions.logoUrl.startsWith('https://')) {
        params.delete('logoUrl');
        urlToFetch = `/api/qrcodes?${params.toString()}`;
      }
      
      const response = await authFetch(urlToFetch, token);
      
      if (!response.ok) {
        throw new Error('Nepodařilo se vygenerovat QR kód');
      }
      
      const data = await response.json();
      
      // If we have a logo URL or file ID that wasn't processed by the server,
      // or if the server provided logoFileId indicating we need to do client-side embedding,
      // we need to add it to the QR code client-side using canvas
      if ((qrOptions.logoUrl || qrOptions.logoFileId) && (!data.options.logoUrl || data.logoFileId)) {
        // Create a QR code with logo client-side
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        const qrCodeImg = new Image();
        qrCodeImg.crossOrigin = 'anonymous';
        qrCodeImg.onload = () => {
          // Set canvas size to match QR code
          canvas.width = qrCodeImg.width;
          canvas.height = qrCodeImg.height;
          
          // Draw QR code to canvas
          ctx.drawImage(qrCodeImg, 0, 0);
          
          // Load logo
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.onload = () => {
            // Calculate logo size (as percentage of QR code size)
            const logoSizePixels = Math.min(50, qrOptions.logoSize || 20) / 100 * qrCodeImg.width;
            
            // Calculate logo position (centered)
            const logoX = (qrCodeImg.width - logoSizePixels) / 2;
            const logoY = (qrCodeImg.height - logoSizePixels) / 2;
            
            // If a background color is specified, draw a background for the logo
            if (qrOptions.logoBackgroundColor) {
              ctx.fillStyle = qrOptions.logoBackgroundColor;
              ctx.fillRect(logoX, logoY, logoSizePixels, logoSizePixels);
            }
            
            // Draw logo on canvas
            ctx.drawImage(logoImg, logoX, logoY, logoSizePixels, logoSizePixels);
            
            try {
              // Get the final data URL
              const finalQrCodeWithLogo = canvas.toDataURL();
              
              // Send the QR code back to parent component
              onQRCodeGenerated(finalQrCodeWithLogo, qrOptions);
            } catch (error) {
              console.error('Error generating QR code with logo:', error);
              // If we can't generate with logo due to CORS, use the original QR code
              setError('Nelze vložit logo kvůli omezení CORS. Použit QR kód bez loga.');
              onQRCodeGenerated(data.qrCode, qrOptions);
              setIsGenerating(false);
            }
          };
          
          logoImg.onerror = () => {
            setError('Nepodařilo se načíst logo');
            setIsGenerating(false);
          };
          
          // Use logoUrl first if available, otherwise try to get a preview URL from logoFileId
          if (qrOptions.logoUrl) {
            logoImg.src = qrOptions.logoUrl;
          } else if (qrOptions.logoFileId || data.logoFileId) {
            try {
              // Use either the options logoFileId or the one returned from the server
              const fileId = qrOptions.logoFileId || data.logoFileId;
              const previewUrl = getFilePreview(fileId);
              logoImg.src = previewUrl;
            } catch (err) {
              setError('Nepodařilo se načíst logo ze storage');
              setIsGenerating(false);
            }
          }
        };
        
        qrCodeImg.onerror = () => {
          setError('Nepodařilo se načíst QR kód');
          setIsGenerating(false);
        };
        
        qrCodeImg.src = data.qrCode;
      } else {
        // Send the server-generated QR code back to parent component
        onQRCodeGenerated(data.qrCode, data.options);
      }
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při generování QR kódu');
    } finally {
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
                    <option value="H">Vysoká (30%) - Doporučeno pro logo</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  S logem zvolte vysokou úroveň korekce
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Logo
            </h4>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {/* Logo upload */}
              <div className="sm:col-span-2">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                  Nahrát logo
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
                  />
                  {isUploading && (
                    <div className="mt-2 flex items-center text-sm text-indigo-600">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Nahrávám logo...
                    </div>
                  )}
                </div>
                {logoFileId && (
                  <p className="mt-1 text-xs text-green-600">
                    Logo je uloženo v Appwrite Storage (ID: {logoFileId.substring(0, 8)}...)
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Pro nejlepší výsledky použijte čtvercový PNG obrázek s průhledným pozadím
                </p>
              </div>
              
              {/* Logo size */}
              <div>
                <label htmlFor="logoSize" className="block text-sm font-medium text-gray-700">
                  Velikost loga (% z QR kódu)
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="logoSize"
                    name="logoSize"
                    min="5"
                    max="30"
                    value={logoSize}
                    onChange={(e) => setLogoSize(parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    disabled={!logoUrl}
                  />
                </div>
              </div>
              
              {/* Logo background color */}
              <div>
                <label htmlFor="logoBackgroundColor" className="block text-sm font-medium text-gray-700">
                  Barva pozadí loga
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    id="logoBackgroundColor"
                    name="logoBackgroundColor"
                    value={logoBackgroundColor}
                    onChange={(e) => setLogoBackgroundColor(e.target.value)}
                    className="h-8 w-8 rounded-md border-gray-300 shadow-sm"
                    disabled={!logoUrl}
                  />
                  <input
                    type="text"
                    value={logoBackgroundColor}
                    onChange={(e) => setLogoBackgroundColor(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    disabled={!logoUrl}
                  />
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