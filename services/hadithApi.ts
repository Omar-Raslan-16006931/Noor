
import { Hadith } from '../types';
import { FALLBACK_HADITHS_FULL } from '../data/staticContent';

const API_KEY = '$2y$10$dEkAoE2czHhatcIUDYpJeNW2RdNrQizXpaGJzS657FlJ40QJu2Yy';
const BASE_URL = 'https://hadithapi.com/api/hadiths';

// Cache to prevent hitting rate limits
let cachedHadiths: Hadith[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const hadithApi = {
  /**
   * Fetch a list of Hadiths. Defaults to Sahih Bukhari for high trust.
   * Gracefully falls back to local data on error.
   */
  getHadiths: async (book: string = 'sahih-bukhari', page: number = 1): Promise<{ data: Hadith[], meta: any }> => {
    try {
      // Return cache if valid and requesting first page default
      if (page === 1 && book === 'sahih-bukhari' && cachedHadiths.length > 0 && (Date.now() - lastFetchTime < CACHE_DURATION)) {
        return { data: cachedHadiths, meta: { current_page: 1, last_page: 100 } };
      }

      // Prepare fallback closure
      const useFallback = () => {
          const ITEMS_PER_PAGE = 10;
          const start = (page - 1) * ITEMS_PER_PAGE;
          const end = start + ITEMS_PER_PAGE;
          const slicedData = FALLBACK_HADITHS_FULL.slice(start, end);
          const lastPage = Math.ceil(FALLBACK_HADITHS_FULL.length / ITEMS_PER_PAGE);

          return { 
              data: slicedData, 
              meta: { 
                  current_page: page, 
                  last_page: lastPage,
                  total: FALLBACK_HADITHS_FULL.length
              } 
          };
      };

      // Try fetching from API with AbortController for Timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const url = `${BASE_URL}/?apiKey=${encodeURIComponent(API_KEY)}&book=${book}&page=${page}`;
      
      try {
          const response = await fetch(url, {
             cache: 'no-cache',
             signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
             throw new Error(`API Error: ${response.status}`);
          }
    
          const json = await response.json();
          
          // Validate structure
          if (!json.hadiths?.data && !json.data) {
             throw new Error('Invalid API response structure');
          }

          // Map API response to our Hadith type
          const rawData = json.hadiths?.data || json.data || [];
          
          const mapped: Hadith[] = rawData.map((h: any) => ({
            id: h.id,
            text: h.hadithArabic || h.hadithEnglish, // Prefer Arabic
            arabic: h.hadithArabic,
            english: h.hadithEnglish,
            source: h.book?.bookName || book,
            hadithNumber: h.hadithNumber,
            narrator: h.englishNarrator || '',
            chapter: h.chapter?.chapterArabic || h.chapter?.chapterEnglish
          }));
    
          // Update cache if this was the default request and we got data
          if (mapped.length > 0 && page === 1 && book === 'sahih-bukhari') {
            cachedHadiths = mapped;
            lastFetchTime = Date.now();
          }
    
          return { 
            data: mapped, 
            meta: json.hadiths || {} 
          };

      } catch (fetchError) {
          clearTimeout(timeoutId);
          console.warn('Hadith API Fetch failed:', fetchError);
          // Directly return fallback
          return useFallback();
      }

    } catch (error) {
      console.warn('Hadith API logic error, using fallback content.', error);
      // Determine fallback one more time (DRY violation but safe)
      const ITEMS_PER_PAGE = 10;
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const slicedData = FALLBACK_HADITHS_FULL.slice(start, end);
      const lastPage = Math.ceil(FALLBACK_HADITHS_FULL.length / ITEMS_PER_PAGE);
      return { data: slicedData, meta: { current_page: page, last_page: lastPage, total: FALLBACK_HADITHS_FULL.length } };
    }
  },

  /**
   * Get a specific Hadith for the day based on a seed.
   * This ensures all users see the same "Daily Wisdom" on a given day.
   */
  getDailyHadith: async (): Promise<Hadith> => {
    try {
      // 1. Generate a consistent seed from Date (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = today.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      // 2. Pick a "random" page number (1-50) based on seed
      const randomPage = (Math.abs(hash) % 50) + 1;
      
      // 3. Try fetch that page
      const { data } = await hadithApi.getHadiths('sahih-bukhari', randomPage);
      
      // 4. Pick a random item from that page based on seed
      if (data && data.length > 0) {
        const index = Math.abs(hash) % data.length;
        return data[index];
      }
      
      return FALLBACK_HADITHS_FULL[0];
    } catch (e) {
      // Fallback to local
      const today = new Date().toISOString().split('T')[0];
      let hash = 0;
      for (let i = 0; i < today.length; i++) {
        hash = today.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % FALLBACK_HADITHS_FULL.length;
      return FALLBACK_HADITHS_FULL[index];
    }
  }
};
