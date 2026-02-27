
import { Hadith, Dua, Surah } from '../types';

export const TRUSTED_HADITHS: Hadith[] = [
  {
    id: 'h1',
    text: "بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
    source: "صحيح البخاري ٨",
    narrator: "ابن عمر رضي الله عنهما"
  },
  {
    id: 'h2',
    text: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ",
    source: "صحيح البخاري ٣٨",
    narrator: "أبي هريرة رضي الله عنه"
  },
  {
    id: 'h4',
    text: "تَسَحَّرُوا فَإِنَّ فِي السَّحُورِ بَرَكَةً",
    source: "صحيح البخاري ١٩٢٣",
    narrator: "أنس بن مالك رضي الله عنه"
  }
];

// Robust Fallback Collection (Used when API fails)
export const FALLBACK_HADITHS_FULL: Hadith[] = [
  ...TRUSTED_HADITHS,
  {
    id: 'fb-1',
    text: "يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا",
    source: "صحيح البخاري ٦٩",
    narrator: "أنس بن مالك",
    english: "Make things easy for the people, and do not make it difficult for them, and make them calm (with glad tidings) and do not repulse (them)."
  },
  {
    id: 'fb-2',
    text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    source: "صحيح البخاري ١",
    narrator: "عمر بن الخطاب",
    english: "The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended."
  },
  {
    id: 'fb-3',
    text: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    source: "صحيح البخاري ١٣",
    narrator: "أنس بن مالك",
    english: "None of you will have faith till he wishes for his (Muslim) brother what he likes for himself."
  },
  {
    id: 'fb-4',
    text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    source: "صحيح البخاري ١٠",
    narrator: "عبد الله بن عمرو",
    english: "A Muslim is the one from whose tongue and hands the Muslims are safe."
  },
  {
    id: 'fb-5',
    text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    source: "صحيح البخاري ٦٠١٨",
    narrator: "أبي هريرة",
    english: "Whoever believes in Allah and the Last Day should talk what is good or keep quiet."
  },
  {
    id: 'fb-6',
    text: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ",
    source: "صحيح البخاري ٦١١٤",
    narrator: "أبي هريرة",
    english: "The strong is not the one who overcomes the people by his strength, but the strong is the one who controls himself while in anger."
  },
  {
    id: 'fb-7',
    text: "اتَّقِ النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ",
    source: "صحيح البخاري ١٤١٧",
    narrator: "عدي بن حاتم",
    english: "Save yourself from Hell-fire even by giving half a date-fruit in charity."
  },
  {
    id: 'fb-8',
    text: "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى",
    source: "صحيح مسلم ٢٥٨٦",
    narrator: "النعمان بن بشير",
    english: "The similitude of believers in regard to mutual love, affection, fellow-feeling is that of one body; when any limb of it aches, the whole body aches, because of sleeplessness and fever."
  },
  {
    id: 'fb-9',
    text: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ",
    source: "صحيح البخاري ٢٩٨٩",
    narrator: "أبي هريرة",
    english: "A good word is a charitable deed."
  },
  {
    id: 'fb-10',
    text: "مَنْ لاَ يَرْحَمْ لاَ يُرْحَمْ",
    source: "صحيح البخاري ٥٩٩٧",
    narrator: "أبي هريرة",
    english: "He who is not merciful to others, will not be treated mercifully."
  }
];

// HISN AL-MUSLIM (Fortress of the Muslim) - Highly Trusted Sources
export const DUAS_LIBRARY: Dua[] = [
  // Morning & Evening
  { id: 'hm1', category: 'أذكار الصباح والمساء', arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", source: "صحيح مسلم", reference: "حصن المسلم" },
  { id: 'hm2', category: 'أذكار الصباح والمساء', arabic: "بِسْمِ اللَّهِ الَّـذِي لاَ يَضُـرُّ مَعَ اسْمِـهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَـاءِ وَهُـوَ السَّمِـيعُ الْعَلِـيمُ", source: "سنن أبي داود", reference: "حصن المسلم" },
  { id: 'hm3', category: 'أذكار الصباح والمساء', arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", source: "سنن الترمذي", reference: "حصن المسلم" },
  
  // Quranic Duas (Rabbana)
  { id: 'q1', category: 'أدعية قرآنية', arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", source: "سورة البقرة: 201" },
  { id: 'q2', category: 'أدعية قرآنية', arabic: "رَبَّنَا لاَ تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا", source: "سورة البقرة: 286" },
  { id: 'q3', category: 'أدعية قرآنية', arabic: "رَبَّنَا لاَ تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً", source: "سورة آل عمران: 8" },
  
  // Istighfar & Forgiveness
  { id: 'ist1', category: 'الاستغفار', arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ", source: "صحيح البخاري (سيد الاستغفار)" },
  { id: 'ist2', category: 'الاستغفار', arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", source: "صحيح مسلم" },

  // Prayer & Wudu
  { id: 'pr1', category: 'الصلاة', arabic: "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الأَبْيَضُ مِنَ الدَّنَسِ", source: "متفق عليه (دعاء الاستفتاح)" },
  { id: 'pr2', category: 'الصلاة', arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", source: "دعاء الركوع" },
  { id: 'pr3', category: 'الصلاة', arabic: "سُبْحَانَ رَبِّيَ الأَعْلَى", source: "دعاء السجود" },
  
  // Daily Life
  { id: 'dl1', category: 'الحياة اليومية', arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ", source: "سنن أبي داود (عند الخروج من المنزل)" },
  { id: 'dl2', category: 'الحياة اليومية', arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا", source: "سنن أبي داود (عند دخول المنزل)" },
  { id: 'dl3', category: 'الحياة اليومية', arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَكَفَانَا وَآوَانَا", source: "صحيح مسلم (عند النوم)" },

  // Ramadan Specific
  { id: 'rm1', category: 'رمضان', arabic: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي", source: "سنن الترمذي (ليلة القدر)" },
  { id: 'rm2', category: 'رمضان', arabic: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ", source: "سنن أبي داود (عند الإفطار)" }
];

export const RAMADAN_DUAS = DUAS_LIBRARY.filter(d => d.category === 'رمضان' || d.category === 'أدعية قرآنية');

export const SURAH_NAMES: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha", numberOfAyahs: 7, revelationType: "Meccan", startPage: 1 },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", numberOfAyahs: 286, revelationType: "Medinan", startPage: 2 },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran", numberOfAyahs: 200, revelationType: "Medinan", startPage: 50 },
  { number: 4, name: "النساء", englishName: "An-Nisa", numberOfAyahs: 176, revelationType: "Medinan", startPage: 77 },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", numberOfAyahs: 120, revelationType: "Medinan", startPage: 106 },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", numberOfAyahs: 165, revelationType: "Meccan", startPage: 128 },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", numberOfAyahs: 206, revelationType: "Meccan", startPage: 151 },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", numberOfAyahs: 75, revelationType: "Medinan", startPage: 177 },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", numberOfAyahs: 129, revelationType: "Medinan", startPage: 187 },
  { number: 10, name: "يونس", englishName: "Yunus", numberOfAyahs: 109, revelationType: "Meccan", startPage: 208 },
  { number: 11, name: "هود", englishName: "Hud", numberOfAyahs: 123, revelationType: "Meccan", startPage: 221 },
  { number: 12, name: "يوسف", englishName: "Yusuf", numberOfAyahs: 111, revelationType: "Meccan", startPage: 235 },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", numberOfAyahs: 43, revelationType: "Medinan", startPage: 249 },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", numberOfAyahs: 52, revelationType: "Meccan", startPage: 255 },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", numberOfAyahs: 99, revelationType: "Meccan", startPage: 262 },
  { number: 16, name: "النحل", englishName: "An-Nahl", numberOfAyahs: 128, revelationType: "Meccan", startPage: 267 },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", numberOfAyahs: 111, revelationType: "Meccan", startPage: 282 },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", numberOfAyahs: 110, revelationType: "Meccan", startPage: 293 },
  { number: 19, name: "مريم", englishName: "Maryam", numberOfAyahs: 98, revelationType: "Meccan", startPage: 305 },
  { number: 20, name: "طه", englishName: "Taha", numberOfAyahs: 135, revelationType: "Meccan", startPage: 312 },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbya", numberOfAyahs: 112, revelationType: "Meccan", startPage: 322 },
  { number: 22, name: "الحج", englishName: "Al-Hajj", numberOfAyahs: 78, revelationType: "Medinan", startPage: 332 },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", numberOfAyahs: 118, revelationType: "Meccan", startPage: 342 },
  { number: 24, name: "النور", englishName: "An-Nur", numberOfAyahs: 64, revelationType: "Medinan", startPage: 350 },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", numberOfAyahs: 77, revelationType: "Meccan", startPage: 359 },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", numberOfAyahs: 227, revelationType: "Meccan", startPage: 367 },
  { number: 27, name: "النمل", englishName: "An-Naml", numberOfAyahs: 93, revelationType: "Meccan", startPage: 377 },
  { number: 28, name: "القصص", englishName: "Al-Qasas", numberOfAyahs: 88, revelationType: "Meccan", startPage: 385 },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut", numberOfAyahs: 69, revelationType: "Meccan", startPage: 396 },
  { number: 30, name: "الروم", englishName: "Ar-Rum", numberOfAyahs: 60, revelationType: "Meccan", startPage: 404 },
  { number: 31, name: "لقمان", englishName: "Luqman", numberOfAyahs: 34, revelationType: "Meccan", startPage: 411 },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", numberOfAyahs: 30, revelationType: "Meccan", startPage: 415 },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", numberOfAyahs: 73, revelationType: "Medinan", startPage: 418 },
  { number: 34, name: "سبأ", englishName: "Saba", numberOfAyahs: 54, revelationType: "Meccan", startPage: 428 },
  { number: 35, name: "فاطر", englishName: "Fatir", numberOfAyahs: 45, revelationType: "Meccan", startPage: 434 },
  { number: 36, name: "يس", englishName: "Ya-Sin", numberOfAyahs: 83, revelationType: "Meccan", startPage: 440 },
  { number: 37, name: "الصافات", englishName: "As-Saffat", numberOfAyahs: 182, revelationType: "Meccan", startPage: 446 },
  { number: 38, name: "ص", englishName: "Sad", numberOfAyahs: 88, revelationType: "Meccan", startPage: 453 },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", numberOfAyahs: 75, revelationType: "Meccan", startPage: 458 },
  { number: 40, name: "غافر", englishName: "Ghafir", numberOfAyahs: 85, revelationType: "Meccan", startPage: 467 },
  { number: 41, name: "فصلت", englishName: "Fussilat", numberOfAyahs: 54, revelationType: "Meccan", startPage: 477 },
  { number: 42, name: "الشورى", englishName: "Ash-Shura", numberOfAyahs: 53, revelationType: "Meccan", startPage: 483 },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", numberOfAyahs: 89, revelationType: "Meccan", startPage: 489 },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", numberOfAyahs: 59, revelationType: "Meccan", startPage: 496 },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", numberOfAyahs: 37, revelationType: "Meccan", startPage: 499 },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", numberOfAyahs: 35, revelationType: "Meccan", startPage: 502 },
  { number: 47, name: "محمد", englishName: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan", startPage: 507 },
  { number: 48, name: "الفتح", englishName: "Al-Fath", numberOfAyahs: 29, revelationType: "Medinan", startPage: 511 },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", numberOfAyahs: 18, revelationType: "Medinan", startPage: 515 },
  { number: 50, name: "ق", englishName: "Qaf", numberOfAyahs: 45, revelationType: "Meccan", startPage: 518 },
  { number: 51, name: "الذاريات", englishName: "Ad-Dhariyat", numberOfAyahs: 60, revelationType: "Meccan", startPage: 520 },
  { number: 52, name: "الطور", englishName: "At-Tur", numberOfAyahs: 49, revelationType: "Meccan", startPage: 523 },
  { number: 53, name: "النجم", englishName: "An-Najm", numberOfAyahs: 62, revelationType: "Meccan", startPage: 526 },
  { number: 54, name: "القمر", englishName: "Al-Qamar", numberOfAyahs: 55, revelationType: "Meccan", startPage: 528 },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", numberOfAyahs: 78, revelationType: "Medinan", startPage: 531 },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", numberOfAyahs: 96, revelationType: "Meccan", startPage: 534 },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", numberOfAyahs: 29, revelationType: "Medinan", startPage: 537 },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", numberOfAyahs: 22, revelationType: "Medinan", startPage: 542 },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", numberOfAyahs: 24, revelationType: "Medinan", startPage: 545 },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", numberOfAyahs: 13, revelationType: "Medinan", startPage: 549 },
  { number: 61, name: "الصف", englishName: "As-Saff", numberOfAyahs: 14, revelationType: "Medinan", startPage: 551 },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", numberOfAyahs: 11, revelationType: "Medinan", startPage: 553 },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", numberOfAyahs: 11, revelationType: "Medinan", startPage: 554 },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", numberOfAyahs: 18, revelationType: "Medinan", startPage: 556 },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", numberOfAyahs: 12, revelationType: "Medinan", startPage: 558 },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", numberOfAyahs: 12, revelationType: "Medinan", startPage: 560 },
  { number: 67, name: "الملك", englishName: "Al-Mulk", numberOfAyahs: 30, revelationType: "Meccan", startPage: 562 },
  { number: 68, name: "القلم", englishName: "Al-Qalam", numberOfAyahs: 52, revelationType: "Meccan", startPage: 564 },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", numberOfAyahs: 52, revelationType: "Meccan", startPage: 566 },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", numberOfAyahs: 44, revelationType: "Meccan", startPage: 568 },
  { number: 71, name: "نوح", englishName: "Nuh", numberOfAyahs: 28, revelationType: "Meccan", startPage: 570 },
  { number: 72, name: "الجن", englishName: "Al-Jinn", numberOfAyahs: 28, revelationType: "Meccan", startPage: 572 },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", numberOfAyahs: 20, revelationType: "Meccan", startPage: 574 },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", numberOfAyahs: 56, revelationType: "Meccan", startPage: 575 },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", numberOfAyahs: 40, revelationType: "Meccan", startPage: 577 },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", numberOfAyahs: 31, revelationType: "Medinan", startPage: 578 },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", numberOfAyahs: 50, revelationType: "Meccan", startPage: 580 },
  { number: 78, name: "النبأ", englishName: "An-Naba", numberOfAyahs: 40, revelationType: "Meccan", startPage: 582 },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", numberOfAyahs: 46, revelationType: "Meccan", startPage: 583 },
  { number: 80, name: "عبس", englishName: "'Abasa", numberOfAyahs: 42, revelationType: "Meccan", startPage: 585 },
  { number: 81, name: "التكوير", englishName: "At-Takwir", numberOfAyahs: 29, revelationType: "Meccan", startPage: 586 },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", numberOfAyahs: 19, revelationType: "Meccan", startPage: 587 },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", numberOfAyahs: 36, revelationType: "Meccan", startPage: 587 },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", numberOfAyahs: 25, revelationType: "Meccan", startPage: 589 },
  { number: 85, name: "البروج", englishName: "Al-Buruj", numberOfAyahs: 22, revelationType: "Meccan", startPage: 590 },
  { number: 86, name: "الطارق", englishName: "At-Tariq", numberOfAyahs: 17, revelationType: "Meccan", startPage: 591 },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", numberOfAyahs: 19, revelationType: "Meccan", startPage: 591 },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", numberOfAyahs: 26, revelationType: "Meccan", startPage: 592 },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", numberOfAyahs: 30, revelationType: "Meccan", startPage: 593 },
  { number: 90, name: "البلد", englishName: "Al-Balad", numberOfAyahs: 20, revelationType: "Meccan", startPage: 594 },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", numberOfAyahs: 15, revelationType: "Meccan", startPage: 595 },
  { number: 92, name: "الليل", englishName: "Al-Layl", numberOfAyahs: 21, revelationType: "Meccan", startPage: 595 },
  { number: 93, name: "الضحى", englishName: "Ad-Duha", numberOfAyahs: 11, revelationType: "Meccan", startPage: 596 },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", numberOfAyahs: 8, revelationType: "Meccan", startPage: 596 },
  { number: 95, name: "التين", englishName: "At-Tin", numberOfAyahs: 8, revelationType: "Meccan", startPage: 597 },
  { number: 96, name: "العلق", englishName: "Al-Alaq", numberOfAyahs: 19, revelationType: "Meccan", startPage: 597 },
  { number: 97, name: "القدر", englishName: "Al-Qadr", numberOfAyahs: 5, revelationType: "Meccan", startPage: 598 },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", numberOfAyahs: 8, revelationType: "Medinan", startPage: 598 },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", numberOfAyahs: 8, revelationType: "Medinan", startPage: 599 },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", numberOfAyahs: 11, revelationType: "Meccan", startPage: 599 },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", numberOfAyahs: 11, revelationType: "Meccan", startPage: 600 },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", numberOfAyahs: 8, revelationType: "Meccan", startPage: 600 },
  { number: 103, name: "العصر", englishName: "Al-Asr", numberOfAyahs: 3, revelationType: "Meccan", startPage: 601 },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", numberOfAyahs: 9, revelationType: "Meccan", startPage: 601 },
  { number: 105, name: "الفيل", englishName: "Al-Fil", numberOfAyahs: 5, revelationType: "Meccan", startPage: 601 },
  { number: 106, name: "قريش", englishName: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan", startPage: 602 },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", numberOfAyahs: 7, revelationType: "Meccan", startPage: 602 },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", numberOfAyahs: 3, revelationType: "Meccan", startPage: 602 },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", numberOfAyahs: 6, revelationType: "Meccan", startPage: 603 },
  { number: 110, name: "النصر", englishName: "An-Nasr", numberOfAyahs: 3, revelationType: "Medinan", startPage: 603 },
  { number: 111, name: "المسد", englishName: "Al-Masad", numberOfAyahs: 5, revelationType: "Meccan", startPage: 603 },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", numberOfAyahs: 4, revelationType: "Meccan", startPage: 604 },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", numberOfAyahs: 5, revelationType: "Meccan", startPage: 604 },
  { number: 114, name: "الناس", englishName: "An-Nas", numberOfAyahs: 6, revelationType: "Meccan", startPage: 604 }
];

export const JUZ_START_PAGES = [
  { id: 1, startPage: 1 }, { id: 2, startPage: 22 }, { id: 3, startPage: 42 },
  { id: 4, startPage: 62 }, { id: 5, startPage: 82 }, { id: 6, startPage: 102 },
  { id: 7, startPage: 121 }, { id: 8, startPage: 142 }, { id: 9, startPage: 162 },
  { id: 10, startPage: 182 }, { id: 11, startPage: 201 }, { id: 12, startPage: 222 },
  { id: 13, startPage: 242 }, { id: 14, startPage: 262 }, { id: 15, startPage: 282 },
  { id: 16, startPage: 302 }, { id: 17, startPage: 322 }, { id: 18, startPage: 342 },
  { id: 19, startPage: 362 }, { id: 20, startPage: 382 }, { id: 21, startPage: 402 },
  { id: 22, startPage: 422 }, { id: 23, startPage: 442 }, { id: 24, startPage: 462 },
  { id: 25, startPage: 482 }, { id: 26, startPage: 502 }, { id: 27, startPage: 522 },
  { id: 28, startPage: 542 }, { id: 29, startPage: 562 }, { id: 30, startPage: 582 }
];

export const FRIDAY_HADITHS: Hadith[] = [
  {
    id: 'f1',
    text: "مَنْ غَسَّلَ يَوْمَ الْجُمُعَةِ وَاغْتَسَلَ، وَبَكَّرَ وَابْتَكَرَ، وَمَشَى وَلَمْ يَرْكَبْ، وَدَنَا مِنَ الإِمَامِ فَاسْتَمَعَ وَلَمْ يَلْغُ، كَانَ لَهُ بِكُلِّ خُطْوَةٍ عَمَلُ سَنَةٍ أَجْرُ صِيَامِهَا وَقِيَامِهَا",
    source: "سنن أبي داود",
    narrator: "أوس بن أوس",
    english: "Whoever performs Ghusl on Friday, goes early to the mosque, walks and does not ride, sits close to the Imam, listens and does not speak, for every step he takes he will have the reward of a year of fasting and praying."
  },
  {
    id: 'f2',
    text: "خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ، فِيهِ خُلِقَ آدَمُ، وَفِيهِ أُدْخِلَ الْجَنَّةَ، وَفِيهِ أُخْرِجَ مِنْهَا",
    source: "صحيح مسلم",
    narrator: "أبي هريرة",
    english: "The best day on which the sun has risen is Friday; on it Adam was created, on it he was made to enter Paradise, on it he was expelled from it."
  },
  {
    id: 'f3',
    text: "أَكْثِرُوا عَلَيَّ مِنَ الصَّلاَةِ فِي كُلِّ يَوْمِ جُمُعَةٍ؛ فَإِنَّ صَلاَةَ أُمَّتِي تُعْرَضُ عَلَيَّ فِي كُلِّ يَوْمِ جُمُعَةٍ",
    source: "السنن الكبرى",
    narrator: "أبي الدرداء",
    english: "Increase your supplications for me on Friday, for your supplications are presented to me on Friday."
  }
];

export const FRIDAY_DUAS: Dua[] = [
    {
        id: 'fd1',
        category: 'الجمعة',
        arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
        source: "الصلاة الإبراهيمية",
        reference: "متفق عليه"
    },
    {
        id: 'fd2',
        category: 'الجمعة',
        arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ الأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
        source: "دعاء",
        reference: "سنن الترمذي"
    }
];

// Helpers
export const getSurahInfoByPage = (page: number): Surah | null => {
  if (page < 1 || page > 604) return null;
  // Reverse search to find the last Surah that starts at or before the current page
  return [...SURAH_NAMES].reverse().find(s => s.startPage <= page) || SURAH_NAMES[0];
};

export const getJuzInfoByPage = (page: number): number => {
  if (page < 1 || page > 604) return 0;
  const juz = [...JUZ_START_PAGES].reverse().find(j => j.startPage <= page);
  return juz ? juz.id : 0;
};
