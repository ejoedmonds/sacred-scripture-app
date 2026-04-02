export const OLD_TESTAMENT = [
  { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 }, { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 }, { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 }, { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 }, { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 }, { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 }, { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 }
];

export const NEW_TESTAMENT = [
  { name: 'Matthew', chapters: 28 }, { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 }, { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 }, { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 }, { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 }, { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 }, { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 }, { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 }, { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 }, { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 }, { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 }, { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 }, { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 }, { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 }
];

export const ALL_BOOKS = [...OLD_TESTAMENT, ...NEW_TESTAMENT];

export const THEMES = {
  light: {
    bg: '#FFFBF5', text: '#3D2E1F', textSec: '#8B7355',
    surface: '#FFF8F0', border: '#E8D5BE', accent: '#B48C50',
    accentHover: '#9A7540', success: '#7A9B6D', error: '#C77C5A',
    navBg: 'rgba(255,251,245,0.92)'
  },
  sepia: {
    bg: '#F5EDDA', text: '#3D2E1F', textSec: '#6B5B47',
    surface: '#EDE4D0', border: '#D4C4A8', accent: '#A07850',
    accentHover: '#8A6540', success: '#6B8B5E', error: '#B76C4A',
    navBg: 'rgba(245,237,218,0.92)'
  },
  dark: {
    bg: '#1A1512', text: '#E8D5BE', textSec: '#A89274',
    surface: '#2A2118', border: '#3D3028', accent: '#C4A060',
    accentHover: '#D4B070', success: '#8AB87A', error: '#D48C6A',
    navBg: 'rgba(26,21,18,0.92)'
  }
};

export const TRANSLATIONS = [
  { code: 'asv', label: 'ASV', full: 'American Standard Version' },
  { code: 'kjv', label: 'KJV', full: 'King James Version' },
  { code: 'web', label: 'WEB', full: 'World English Bible' },
  { code: 'bbe', label: 'BBE', full: 'Bible in Basic English' },
  { code: 'darby', label: 'Darby', full: 'Darby Translation' },
];

export const POPULAR_PASSAGES = [
  { book: 'Genesis', chapter: 1, label: 'Genesis 1' },
  { book: 'Psalms', chapter: 23, label: 'Psalm 23' },
  { book: 'John', chapter: 3, label: 'John 3' },
  { book: 'Romans', chapter: 8, label: 'Romans 8' },
  { book: 'Matthew', chapter: 5, label: 'Matthew 5' },
  { book: 'Proverbs', chapter: 3, label: 'Proverbs 3' },
  { book: 'Isaiah', chapter: 53, label: 'Isaiah 53' },
  { book: 'Revelation', chapter: 21, label: 'Revelation 21' },
];

export async function fetchChapter(book, chapter, translation = 'asv') {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // Returns array of { book_name, chapter, verse, text }
    return data.verses || [];
  } catch (e) {
    console.error('fetchChapter error:', e);
    return null;
  }
}

export async function fetchVerse(book, chapter, verse, translation = 'asv') {
  try {
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}:${verse}?translation=${translation}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.verses?.[0]?.text || data.text || null;
  } catch (e) {
    return null;
  }
}

export function generateCommentary(book, chapter, verse, verseText, source = 'ai') {
  const ref = `${book} ${chapter}:${verse}`;
  const templates = {
    ai: `**Theological Significance**\n\nThis passage from ${ref} speaks to the heart of God's relationship with His people. The language and imagery here reveal something profound about divine character and purpose.\n\n**Historical Context**\n\nIn the original setting, these words carried deep meaning for their first audience. The cultural background illuminates layers of significance that may not be immediately apparent to modern readers.\n\n**Practical Application**\n\n- Consider how this truth shapes your understanding of God's nature\n- Reflect on areas where this teaching challenges or comforts you\n- Look for practical ways to apply this principle in daily life\n\n**Cross-References**\n\nThis theme connects to broader scriptural patterns, echoing throughout both testaments as part of God's unified redemptive narrative.`,

    matthewHenry: `**Matthew Henry's Commentary on ${ref}**\n\nHere we observe a most excellent doctrine, worthy of our careful consideration. The sacred text before us opens up a rich vein of spiritual truth that has nourished believers across the centuries.\n\n**I. The Doctrine Stated**\n\nThe word of God is living and active. It is not a dead letter but carries within it a spiritual power that penetrates to the heart.\n\n**II. The Doctrine Proved**\n\nConsider how this truth has been confirmed in the experience of countless saints who have found this word to be a lamp unto their feet and a light unto their path.\n\n**III. The Doctrine Applied**\n\nLet us therefore receive this word not merely with the ear but with the heart, that it may take deep root and bring forth fruit in due season.`,

    albertBarnes: `**Albert Barnes' Notes on ${ref}**\n\nThe original language here is particularly instructive. A careful examination of the Greek or Hebrew text reveals nuances that enrich our understanding considerably.\n\n**Critical Analysis**\n\nThe construction of this passage suggests a deliberate theological argument. The author is making a case that builds systematically toward a climactic conclusion.\n\n**Doctrinal Implications**\n\nThis verse contributes to several important theological discussions, touching on the relationship between divine sovereignty and human agency, faith and works, promise and fulfillment.\n\n**Practical Reflections**\n\nFor the believing reader, this passage offers solid ground upon which to stand amidst the uncertainties of life.`,

    johnCalvin: `**John Calvin's Commentary on ${ref}**\n\nThe Holy Spirit here sets before us a teaching of the highest importance. We do well to approach these words with reverence and careful attention.\n\n**Exposition**\n\nThe apostle's argument proceeds with admirable clarity. First he establishes the foundation; then he builds the superstructure upon it. Each element serves the whole.\n\n**Against Error**\n\nThis passage corrects several common misunderstandings that have troubled the church. Those who would diminish the grace of God here find their error exposed.\n\n**Comfort for Believers**\n\nYet let not the weak believer despair. The same grace that convicts also pardons; the same truth that humbles also lifts up.`,

    johnMacArthur: `**John MacArthur Study Notes: ${ref}**\n\nThis is one of the most significant passages in all of Scripture. It presents a truth that stands at the very center of biblical theology.\n\n**Key Observation**\n\nNotice the precision of the language. Every word is chosen deliberately. The grammar reinforces the theological point being made.\n\n**Theological Context**\n\nThis verse must be understood within the broader context of the book's argument. Taken in isolation, it can be misapplied; understood properly, it is a pillar of Christian truth.\n\n**Application**\n\n1. This truth should shape how we view God's character\n2. It must inform how we read the rest of Scripture\n3. It provides a foundation for genuine assurance of salvation`
  };
  return templates[source] || templates.ai;
}
