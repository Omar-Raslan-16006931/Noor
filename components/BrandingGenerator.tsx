import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Download, RefreshCw, Image as ImageIcon, Twitter } from 'lucide-react';

export const BrandingGenerator: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loadingLogo, setLoadingLogo] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [error, setError] = useState<string>('');

  const generateImage = async (prompt: string, type: 'logo' | 'banner') => {
    const isLogo = type === 'logo';
    if (isLogo) setLoadingLogo(true);
    else setLoadingBanner(true);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key not found');

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
            // @ts-ignore - imageConfig might not be fully typed in all SDK versions yet, but this is per docs
            imageConfig: {
                aspectRatio: isLogo ? "1:1" : "16:9", 
            }
        }
      });

      let imageUrl = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
      }

      if (imageUrl) {
        if (isLogo) setLogoUrl(imageUrl);
        else setBannerUrl(imageUrl);
      } else {
        throw new Error('No image generated');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate image');
    } finally {
      if (isLogo) setLoadingLogo(false);
      else setLoadingBanner(false);
    }
  };

  const handleGenerateLogo = () => {
    generateImage(
      "Minimalist, modern app logo icon for an Islamic app named 'Noor'. The design should feature a stylized, glowing lantern or the Arabic letter Nun (ن) with a star. Colors: Emerald Green (#10B981) and Gold. Dark background. Vector style, flat design, high quality, centered.",
      'logo'
    );
  };

  const handleGenerateBanner = () => {
    generateImage(
      "Twitter header banner for an Islamic app named 'Noor'. Wide aspect ratio. A serene, spiritual background with subtle Islamic geometric patterns in emerald green and dark teal. Soft golden lighting effects. Modern, clean, professional. High resolution.",
      'banner'
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-2 px-4">
         <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-purple-500">
            <ImageIcon size={20} />
         </div>
         <h2 className="text-2xl font-bold text-white">Branding Assets</h2>
      </div>

      <div className="px-4 space-y-6">
        {error && (
            <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-xl text-red-200 text-xs text-center">
                {error}
            </div>
        )}

        {/* Logo Section */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/50 to-transparent">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"/>
                App Logo
            </h3>
            
            <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-3xl bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
                    {loadingLogo ? (
                        <Loader2 className="animate-spin text-emerald-500" size={32} />
                    ) : logoUrl ? (
                        <img src={logoUrl} alt="Generated Logo" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-600 text-xs">No Logo</span>
                    )}
                </div>

                <div className="flex gap-2 w-full">
                    <button 
                        onClick={handleGenerateLogo}
                        disabled={loadingLogo}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loadingLogo ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Generate Logo
                    </button>
                    {logoUrl && (
                        <a 
                            href={logoUrl} 
                            download="noor-app-logo.png"
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        >
                            <Download size={18} />
                        </a>
                    )}
                </div>
            </div>
        </div>

        {/* Banner Section */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/50 to-transparent">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Twitter className="text-blue-400" size={20} />
                Twitter Banner
            </h3>
            
            <div className="flex flex-col items-center gap-4">
                <div className="w-full aspect-[3/1] rounded-2xl bg-black/30 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl">
                    {loadingBanner ? (
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                    ) : bannerUrl ? (
                        <img src={bannerUrl} alt="Generated Banner" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-600 text-xs">No Banner</span>
                    )}
                </div>

                <div className="flex gap-2 w-full">
                    <button 
                        onClick={handleGenerateBanner}
                        disabled={loadingBanner}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loadingBanner ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        Generate Banner
                    </button>
                    {bannerUrl && (
                        <a 
                            href={bannerUrl} 
                            download="noor-twitter-banner.png"
                            className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        >
                            <Download size={18} />
                        </a>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
