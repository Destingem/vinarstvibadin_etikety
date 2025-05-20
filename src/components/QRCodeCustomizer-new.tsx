/**
 * Generates a QR code with current options
 * Implements client-side logo embedding and uses server-side download approach
 * with fallback to proxy API and data URL support for backward compatibility
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
    
    // Remove logoUrl from params to avoid huge URLs if it's a data URL
    if (qrOptions.logoUrl && qrOptions.logoUrl.startsWith('data:')) {
      params.delete('logoUrl');
    }
    
    const urlToFetch = `/api/qrcodes?${params.toString()}`;
    const response = await authFetch(urlToFetch, token);
    
    if (!response.ok) {
      throw new Error('Nepodařilo se vygenerovat QR kód');
    }
    
    const data = await response.json();
    
    // If we have a logo, always do client-side embedding for consistent handling
    if (qrOptions.logoUrl || qrOptions.logoFileId || data.logoFileId) {
      // Create a QR code with logo client-side
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      // Load the QR code image
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
          }
          
          setIsGenerating(false);
        };
        
        logoImg.onerror = (err) => {
          console.error('Logo load error:', err);
          setError('Nepodařilo se načíst logo. Použit QR kód bez loga.');
          onQRCodeGenerated(data.qrCode, qrOptions);
          setIsGenerating(false);
        };
        
        // Determine logo source with proper priority:
        // 1. Use logoUrl if it's a data URL (backward compatibility)
        // 2. Use logoUrl if it's a public or proxy URL
        // 3. Try to get logo from public directory using downloadAndSaveLogo API
        // 4. Fall back to proxy API if downloading fails
        
        if (qrOptions.logoUrl) {
          if (qrOptions.logoUrl.startsWith('data:')) {
            // If it's a data URL (backward compatibility)
            console.log('Using data URL for logo');
            logoImg.src = qrOptions.logoUrl;
          } else if (qrOptions.logoUrl.startsWith('/logos/')) {
            // If it's already a public URL
            console.log(`Using public URL for logo: ${qrOptions.logoUrl}`);
            logoImg.src = qrOptions.logoUrl;
          } else {
            // If it's another URL (e.g., proxy URL)
            console.log(`Using provided URL: ${qrOptions.logoUrl}`);
            logoImg.src = qrOptions.logoUrl;
          }
        } else if (qrOptions.logoFileId || data.logoFileId) {
          const fileId = qrOptions.logoFileId || data.logoFileId;
          console.log(`Attempting to load logo for file ID: ${fileId}`);
          
          // Try to download the logo to the public directory first
          fetch(`/api/logos/download?fileId=${encodeURIComponent(fileId)}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to download logo: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              console.log(`Logo downloaded, using public URL: ${data.url}`);
              logoImg.src = data.url;
            })
            .catch(error => {
              console.error('Error downloading logo, falling back to proxy:', error);
              // Fall back to proxy URL if download fails
              const proxyUrl = `/api/logo-proxy?fileId=${encodeURIComponent(fileId)}`;
              console.log(`Using proxy URL: ${proxyUrl}`);
              logoImg.src = proxyUrl;
            });
        }
      };
      
      qrCodeImg.onerror = () => {
        console.error('Failed to load QR code image');
        setError('Nepodařilo se načíst QR kód');
        setIsGenerating(false);
      };
      
      // Set QR code image source
      qrCodeImg.src = data.qrCode;
    } else {
      // If no logo, use the server-generated QR code directly
      onQRCodeGenerated(data.qrCode, data.options);
      setIsGenerating(false);
    }
  } catch (err: any) {
    console.error('Error generating QR code:', err);
    setError(err.message || 'Nastala chyba při generování QR kódu');
    setIsGenerating(false);
  }
};