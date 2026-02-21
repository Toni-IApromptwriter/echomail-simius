export type Language =
  | "ca"
  | "pt"
  | "es"
  | "es-LA"
  | "en-US"
  | "en-GB"
  | "fr"
  | "de"

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: "ca", label: "Català" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español (España)" },
  { code: "es-LA", label: "Español (Latam)" },
  { code: "en-US", label: "English (USA)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
]

// Claves internas de técnicas (API usa las versiones en español)
export const TECHNIQUE_KEYS = [
  "direct-sale",
  "hormozi",
  "empathy",
  "minimalist",
  "informative",
  "storytelling",
  "educational",
  "strategic",
  "technical",
  "aggressive",
] as const

export const LENGTH_KEYS = ["short", "medium", "long"] as const

// Mapeo de claves a los valores que espera la API (español)
export const TECHNIQUE_KEY_TO_API: Record<(typeof TECHNIQUE_KEYS)[number], string> = {
  "direct-sale": "Venta Directa y Provocadora",
  hormozi: "Valor Lógico y Oferta Irresistible",
  empathy: "Empatía y Conexión Emocional",
  minimalist: "Reflexión Minimalista",
  informative: "Informativo con Chispa",
  storytelling: "Historia Inspiracional",
  educational: "Guía Educativa y Cercana",
  strategic: "Análisis Estratégico Profundo",
  technical: "Al Grano y Tecnológico",
  aggressive: "Venta Agresiva y Polarizante (Sin Filtros)",
}

export const LENGTH_KEY_TO_API: Record<(typeof LENGTH_KEYS)[number], string> = {
  short: "Corto (Directo al grano)",
  medium: "Medio (Aprox. 300 palabras)",
  long: "Largo (Storytelling completo)",
}

export const API_TO_TECHNIQUE_KEY: Record<string, (typeof TECHNIQUE_KEYS)[number]> =
  Object.fromEntries(
    Object.entries(TECHNIQUE_KEY_TO_API).map(([k, v]) => [
      v,
      k as (typeof TECHNIQUE_KEYS)[number],
    ])
  ) as Record<string, (typeof TECHNIQUE_KEYS)[number]>

export const API_TO_LENGTH_KEY: Record<string, (typeof LENGTH_KEYS)[number]> =
  Object.fromEntries(
    Object.entries(LENGTH_KEY_TO_API).map(([k, v]) => [
      v,
      k as (typeof LENGTH_KEYS)[number],
    ])
  ) as Record<string, (typeof LENGTH_KEYS)[number]>

// Idioma base para fallback (es-LA → es, en-GB → en-US, fr → es, de → es)
const LANG_FALLBACK: Record<Language, Language> = {
  ca: "ca",
  pt: "pt",
  es: "es",
  "es-LA": "es",
  "en-US": "en-US",
  "en-GB": "en-US",
  fr: "fr",
  de: "de",
}

const TECHNIQUES: Record<(typeof TECHNIQUE_KEYS)[number], Partial<Record<Language, string>>> = {
  "direct-sale": {
    ca: "Venda Directa i Provocadora",
    pt: "Venda Direta e Provocadora",
    es: "Venta Directa y Provocadora",
    "es-LA": "Venta Directa y Provocadora",
    "en-US": "Direct and Provocative Sale",
    "en-GB": "Direct and Provocative Sale",
    fr: "Vente Directe et Provocatrice",
    de: "Direkter und provokanter Verkauf",
  },
  hormozi: {
    ca: "Valor Lògic i Oferta Irresistible",
    pt: "Valor Lógico e Oferta Irresistível",
    es: "Valor Lógico y Oferta Irresistible",
    "es-LA": "Valor Lógico y Oferta Irresistible",
    "en-US": "Logical Value and Irresistible Offer",
    "en-GB": "Logical Value and Irresistible Offer",
    fr: "Valeur Logique et Offre Irrésistible",
    de: "Logischer Wert und unwiderstehliches Angebot",
  },
  empathy: {
    ca: "Empatia i Connexió Emocional",
    pt: "Empatia e Conexão Emocional",
    es: "Empatía y Conexión Emocional",
    "es-LA": "Empatía y Conexión Emocional",
    "en-US": "Empathy and Emotional Connection",
    "en-GB": "Empathy and Emotional Connection",
    fr: "Empathie et Connexion Emotionnelle",
    de: "Empathie und emotionale Verbindung",
  },
  minimalist: {
    ca: "Reflexió Minimalista",
    pt: "Reflexão Minimalista",
    es: "Reflexión Minimalista",
    "es-LA": "Reflexión Minimalista",
    "en-US": "Minimalist Reflection",
    "en-GB": "Minimalist Reflection",
    fr: "Réflexion Minimaliste",
    de: "Minimalistische Reflexion",
  },
  informative: {
    ca: "Informatiu amb Espurna",
    pt: "Informativo com Brilho",
    es: "Informativo con Chispa",
    "es-LA": "Informativo con Chispa",
    "en-US": "Informative with Spark",
    "en-GB": "Informative with Spark",
    fr: "Informatif avec du Peps",
    de: "Informativ mit Pep",
  },
  storytelling: {
    ca: "Història Inspiracional",
    pt: "História Inspiracional",
    es: "Historia Inspiracional",
    "es-LA": "Historia Inspiracional",
    "en-US": "Inspirational Story",
    "en-GB": "Inspirational Story",
    fr: "Histoire Inspirante",
    de: "Inspirierende Geschichte",
  },
  educational: {
    ca: "Guia Educativa i Propera",
    pt: "Guia Educativa e Próxima",
    es: "Guía Educativa y Cercana",
    "es-LA": "Guía Educativa y Cercana",
    "en-US": "Educational and Approachable Guide",
    "en-GB": "Educational and Approachable Guide",
    fr: "Guide Éducatif et Proche",
    de: "Lehrreicher und nahbarer Leitfaden",
  },
  strategic: {
    ca: "Anàlisi Estratègica Profunda",
    pt: "Análise Estratégica Profunda",
    es: "Análisis Estratégico Profundo",
    "es-LA": "Análisis Estratégico Profundo",
    "en-US": "Deep Strategic Analysis",
    "en-GB": "Deep Strategic Analysis",
    fr: "Analyse Stratégique Approfondie",
    de: "Tiefe strategische Analyse",
  },
  technical: {
    ca: "Al Gra i Tecnològic",
    pt: "Direto ao Ponto e Tecnológico",
    es: "Al Grano y Tecnológico",
    "es-LA": "Al Grano y Tecnológico",
    "en-US": "Straight to the Point and Technical",
    "en-GB": "Straight to the Point and Technical",
    fr: "Direct et Technologique",
    de: "Direkt und technisch",
  },
  aggressive: {
    ca: "Venda Agressiva i Polaritzant (Sense Filtres)",
    pt: "Venda Agressiva e Polarizante (Sem Filtros)",
    es: "Venta Agresiva y Polarizante (Sin Filtros)",
    "es-LA": "Venta Agresiva y Polarizante (Sin Filtros)",
    "en-US": "Aggressive and Polarizing Sale (No Filters)",
    "en-GB": "Aggressive and Polarising Sale (No Filters)",
    fr: "Vente Agressive et Polarisante (Sans Filtres)",
    de: "Aggressiver und polarisierender Verkauf (Ohne Filter)",
  },
}

const LENGTHS: Record<(typeof LENGTH_KEYS)[number], Partial<Record<Language, string>>> = {
  short: {
    ca: "Curt (Directe al gra)",
    pt: "Curto (Direto ao ponto)",
    es: "Corto (Directo al grano)",
    "es-LA": "Corto (Directo al grano)",
    "en-US": "Short (Straight to the point)",
    "en-GB": "Short (Straight to the point)",
    fr: "Court (Direct au but)",
    de: "Kurz (Direkt auf den Punkt)",
  },
  medium: {
    ca: "Mig (Aprox. 300 paraules)",
    pt: "Médio (Aprox. 300 palavras)",
    es: "Medio (Aprox. 300 palabras)",
    "es-LA": "Medio (Aprox. 300 palabras)",
    "en-US": "Medium (Approx. 300 words)",
    "en-GB": "Medium (Approx. 300 words)",
    fr: "Moyen (Environ 300 mots)",
    de: "Mittel (Ca. 300 Wörter)",
  },
  long: {
    ca: "Llarg (Storytelling complet)",
    pt: "Longo (Storytelling completo)",
    es: "Largo (Storytelling completo)",
    "es-LA": "Largo (Storytelling completo)",
    "en-US": "Long (Full storytelling)",
    "en-GB": "Long (Full storytelling)",
    fr: "Long (Récit complet)",
    de: "Lang (Vollständige Erzählung)",
  },
}

const BASE_TRANSLATIONS = {
  // Header
  greeting: "",
  subtitle: "",

  // Sidebar
  dashboard: "",
  settings: "",
  help: "",

  // Record button
  processing: "",
  stopRecording: "",
  startRecording: "",
  processingAI: "",
  recording: "",
  clickToRecord: "",
  micAccessError: "",

  // Copywriting selectors
  techniqueLabel: "",
  lengthLabel: "",

  // Results
  results: "",
  yourTranscription: "",
  generatedEmail: "",
  loading: "",
  copyEmail: "",
  copied: "",
  reminder: "",

  // Errors
  transcribeError: "",
  generateError: "",
  copyError: "",

  // History
  historyTitle: "",
  clearHistory: "",
  noHistory: "",
    confirmClearHistory: "",
    deleteEntry: "",
    confirmDeleteEntry: "",

  // Language selector
  language: "",

  // Modal
  close: "",

  // History dates
  now: "",
  minutesAgo: "",
  hoursAgo: "",
  daysAgo: "",
} as const

export const translations: Record<Language, Record<keyof typeof BASE_TRANSLATIONS, string>> = {
  ca: {
    greeting: "Bon dia",
    subtitle: "Crea el teu email d'avui en segons",
    dashboard: "Tauler",
    settings: "Configuració",
    help: "Ajuda",
    processing: "Processant",
    stopRecording: "Atura la gravació",
    startRecording: "Inicia la gravació",
    processingAI: "Processant amb IA... (Pot trigar uns segons)",
    recording: "Gravant... Clica per aturar (màx. 60 s)",
    clickToRecord: "Clica per gravar el teu missatge",
    micAccessError: "No s'ha pogut accedir al micròfon",
    techniqueLabel: "Tècnica de Copywriting",
    lengthLabel: "Longitud de l'email",
    results: "Resultats",
    yourTranscription: "La teva Transcripció",
    generatedEmail: "Email Generat",
    loading: "Carregant...",
    copyEmail: "Copiar Email",
    copied: "Copiat! ✅",
    reminder: "💡 Recorda: EchoMail és el teu assistent. Fes una última revisió humana abans d'enviar-lo.",
    transcribeError: "Error en transcriure",
    generateError: "Error en generar",
    copyError: "Error en copiar",
    historyTitle: "Historial d'Emails",
    clearHistory: "Esborrar historial",
    noHistory: "No hi ha emails a l'historial.",
    confirmClearHistory: "Esborrar tot l'historial? Aquesta acció no es pot desfer.",
    deleteEntry: "Esborrar aquest email",
    confirmDeleteEntry: "Vols esborrar aquest email?",
    language: "Idioma",
    close: "Tancar",
    now: "Ara",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
  pt: {
    greeting: "Bom dia",
    subtitle: "Crie o seu email de hoje em segundos",
    dashboard: "Painel",
    settings: "Configurações",
    help: "Ajuda",
    processing: "Processando",
    stopRecording: "Parar gravação",
    startRecording: "Iniciar gravação",
    processingAI: "Processando com IA... (Pode demorar alguns segundos)",
    recording: "Gravando... Clique para parar (máx. 60 s)",
    clickToRecord: "Clique para gravar a sua mensagem",
    micAccessError: "Não foi possível aceder ao microfone",
    techniqueLabel: "Técnica de Copywriting",
    lengthLabel: "Comprimento do email",
    results: "Resultados",
    yourTranscription: "A sua Transcrição",
    generatedEmail: "Email Gerado",
    loading: "A carregar...",
    copyEmail: "Copiar Email",
    copied: "Copiado! ✅",
    reminder: "💡 Lembre-se: EchoMail é o seu assistente. Dê uma última revisão humana antes de enviar.",
    transcribeError: "Erro ao transcrever",
    generateError: "Erro ao gerar",
    copyError: "Erro ao copiar",
    historyTitle: "Histórico de Emails",
    clearHistory: "Limpar histórico",
    noHistory: "Não há emails no histórico.",
    confirmClearHistory: "Limpar todo o histórico? Esta ação não pode ser desfeita.",
    deleteEntry: "Eliminar este email",
    confirmDeleteEntry: "Eliminar este email?",
    language: "Idioma",
    close: "Fechar",
    now: "Agora",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
  es: {
    greeting: "Buenos días",
    subtitle: "Crea tu email de hoy en segundos",
    dashboard: "Panel",
    settings: "Configuración",
    help: "Ayuda",
    processing: "Procesando",
    stopRecording: "Detener grabación",
    startRecording: "Iniciar grabación",
    processingAI: "Procesando con IA... (Esto puede tardar unos segundos)",
    recording: "Grabando... Haz clic para detener (máx. 60 s)",
    clickToRecord: "Haz clic para grabar tu mensaje",
    micAccessError: "No se pudo acceder al micrófono",
    techniqueLabel: "Técnica de Copywriting",
    lengthLabel: "Longitud del email",
    results: "Resultados",
    yourTranscription: "Tu Transcripción",
    generatedEmail: "Email Generado",
    loading: "Cargando...",
    copyEmail: "Copiar Email",
    copied: "¡Copiado! ✅",
    reminder: "💡 Recuerda: EchoMail es tu asistente. Dale un último repaso humano antes de enviarlo.",
    transcribeError: "Error al transcribir",
    generateError: "Error al generar",
    copyError: "Error al copiar",
    historyTitle: "Historial de Emails",
    clearHistory: "Borrar historial",
    noHistory: "No hay emails en el historial.",
    confirmClearHistory: "¿Borrar todo el historial? Esta acción no se puede deshacer.",
    deleteEntry: "Borrar este email",
    confirmDeleteEntry: "¿Borrar este email?",
    language: "Idioma",
    close: "Cerrar",
    now: "Ahora",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
  "es-LA": {
    greeting: "Buenos días",
    subtitle: "Crea tu email de hoy en segundos",
    dashboard: "Panel",
    settings: "Configuración",
    help: "Ayuda",
    processing: "Procesando",
    stopRecording: "Detener grabación",
    startRecording: "Iniciar grabación",
    processingAI: "Procesando con IA... (Esto puede tardar unos segundos)",
    recording: "Grabando... Haz clic para detener (máx. 60 s)",
    clickToRecord: "Haz clic para grabar tu mensaje",
    micAccessError: "No se pudo acceder al micrófono",
    techniqueLabel: "Técnica de Copywriting",
    lengthLabel: "Longitud del email",
    results: "Resultados",
    yourTranscription: "Tu Transcripción",
    generatedEmail: "Email Generado",
    loading: "Cargando...",
    copyEmail: "Copiar Email",
    copied: "¡Copiado! ✅",
    reminder: "💡 Recuerda: EchoMail es tu asistente. Dale un último repaso humano antes de enviarlo.",
    transcribeError: "Error al transcribir",
    generateError: "Error al generar",
    copyError: "Error al copiar",
    historyTitle: "Historial de Emails",
    clearHistory: "Borrar historial",
    noHistory: "No hay emails en el historial.",
    confirmClearHistory: "¿Borrar todo el historial? Esta acción no se puede deshacer.",
    deleteEntry: "Borrar este email",
    confirmDeleteEntry: "¿Borrar este email?",
    language: "Idioma",
    close: "Cerrar",
    now: "Ahora",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
  "en-US": {
    greeting: "Good morning",
    subtitle: "Create today's email in seconds",
    dashboard: "Dashboard",
    settings: "Settings",
    help: "Help",
    processing: "Processing",
    stopRecording: "Stop recording",
    startRecording: "Start recording",
    processingAI: "Processing with AI... (This may take a few seconds)",
    recording: "Recording... Click to stop (max. 60 s)",
    clickToRecord: "Click to record your message",
    micAccessError: "Could not access microphone",
    techniqueLabel: "Copywriting Technique",
    lengthLabel: "Email length",
    results: "Results",
    yourTranscription: "Your Transcription",
    generatedEmail: "Generated Email",
    loading: "Loading...",
    copyEmail: "Copy Email",
    copied: "Copied! ✅",
    reminder: "💡 Remember: EchoMail is your assistant. Give it a final human review before sending.",
    transcribeError: "Error transcribing",
    generateError: "Error generating",
    copyError: "Error copying",
    historyTitle: "Email History",
    clearHistory: "Clear history",
    noHistory: "No emails in history.",
    confirmClearHistory: "Clear all history? This action cannot be undone.",
    deleteEntry: "Delete this email",
    confirmDeleteEntry: "Delete this email?",
    language: "Language",
    close: "Close",
    now: "Now",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
  "en-GB": {
    greeting: "Good morning",
    subtitle: "Create today's email in seconds",
    dashboard: "Dashboard",
    settings: "Settings",
    help: "Help",
    processing: "Processing",
    stopRecording: "Stop recording",
    startRecording: "Start recording",
    processingAI: "Processing with AI... (This may take a few seconds)",
    recording: "Recording... Click to stop (max. 60 s)",
    clickToRecord: "Click to record your message",
    micAccessError: "Could not access microphone",
    techniqueLabel: "Copywriting Technique",
    lengthLabel: "Email length",
    results: "Results",
    yourTranscription: "Your Transcription",
    generatedEmail: "Generated Email",
    loading: "Loading...",
    copyEmail: "Copy Email",
    copied: "Copied! ✅",
    reminder: "💡 Remember: EchoMail is your assistant. Give it a final human review before sending.",
    transcribeError: "Error transcribing",
    generateError: "Error generating",
    copyError: "Error copying",
    historyTitle: "Email History",
    clearHistory: "Clear history",
    noHistory: "No emails in history.",
    confirmClearHistory: "Clear all history? This action cannot be undone.",
    deleteEntry: "Delete this email",
    confirmDeleteEntry: "Delete this email?",
    language: "Language",
    close: "Close",
    now: "Now",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
  fr: {
    greeting: "Bonjour",
    subtitle: "Créez l'email du jour en quelques secondes",
    dashboard: "Tableau de bord",
    settings: "Paramètres",
    help: "Aide",
    processing: "Traitement en cours",
    stopRecording: "Arrêter l'enregistrement",
    startRecording: "Démarrer l'enregistrement",
    processingAI: "Traitement par IA... (Cela peut prendre quelques secondes)",
    recording: "Enregistrement... Cliquez pour arrêter (max. 60 s)",
    clickToRecord: "Cliquez pour enregistrer votre message",
    micAccessError: "Impossible d'accéder au microphone",
    techniqueLabel: "Technique de copywriting",
    lengthLabel: "Longueur de l'email",
    results: "Résultats",
    yourTranscription: "Votre transcription",
    generatedEmail: "Email généré",
    loading: "Chargement...",
    copyEmail: "Copier l'email",
    copied: "Copié ! ✅",
    reminder: "💡 Rappel : EchoMail est votre assistant. Faites une dernière relecture humaine avant d'envoyer.",
    transcribeError: "Erreur de transcription",
    generateError: "Erreur de génération",
    copyError: "Erreur de copie",
    historyTitle: "Historique des emails",
    clearHistory: "Effacer l'historique",
    noHistory: "Aucun email dans l'historique.",
    confirmClearHistory: "Effacer tout l'historique ? Cette action est irréversible.",
    deleteEntry: "Supprimer cet email",
    confirmDeleteEntry: "Supprimer cet email ?",
    language: "Langue",
    close: "Fermer",
    now: "Maintenant",
    minutesAgo: "{n} min",
    hoursAgo: "{n}h",
    daysAgo: "{n}j",
  },
  de: {
    greeting: "Guten Tag",
    subtitle: "Erstellen Sie die E-Mail von heute in Sekunden",
    dashboard: "Übersicht",
    settings: "Einstellungen",
    help: "Hilfe",
    processing: "Wird verarbeitet",
    stopRecording: "Aufnahme stoppen",
    startRecording: "Aufnahme starten",
    processingAI: "KI-Verarbeitung... (Dies kann einige Sekunden dauern)",
    recording: "Aufnahme... Klicken Sie zum Stoppen (max. 60 s)",
    clickToRecord: "Klicken Sie, um Ihre Nachricht aufzunehmen",
    micAccessError: "Mikrofonzugriff nicht möglich",
    techniqueLabel: "Copywriting-Technik",
    lengthLabel: "E-Mail-Länge",
    results: "Ergebnisse",
    yourTranscription: "Ihre Transkription",
    generatedEmail: "Generierte E-Mail",
    loading: "Wird geladen...",
    copyEmail: "E-Mail kopieren",
    copied: "Kopiert! ✅",
    reminder: "💡 Hinweis: EchoMail ist Ihr Assistent. Führen Sie vor dem Versand eine letzte menschliche Überprüfung durch.",
    transcribeError: "Transkriptionsfehler",
    generateError: "Fehler bei der Generierung",
    copyError: "Kopierfehler",
    historyTitle: "E-Mail-Verlauf",
    clearHistory: "Verlauf löschen",
    noHistory: "Keine E-Mails im Verlauf.",
    confirmClearHistory: "Gesamten Verlauf löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteEntry: "Diese E-Mail löschen",
    confirmDeleteEntry: "Diese E-Mail löschen?",
    language: "Sprache",
    close: "Schließen",
    now: "Jetzt",
    minutesAgo: "{n} Min.",
    hoursAgo: "{n}h",
    daysAgo: "{n}d",
  },
}

export function getTechniqueLabel(
  key: (typeof TECHNIQUE_KEYS)[number],
  lang: Language
): string {
  const fallback = LANG_FALLBACK[lang]
  return (
    TECHNIQUES[key]?.[lang] ??
    TECHNIQUES[key]?.[fallback] ??
    TECHNIQUE_KEY_TO_API[key] ??
    key
  )
}

export function getLengthLabel(
  key: (typeof LENGTH_KEYS)[number],
  lang: Language
): string {
  const fallback = LANG_FALLBACK[lang]
  return (
    LENGTHS[key]?.[lang] ??
    LENGTHS[key]?.[fallback] ??
    LENGTH_KEY_TO_API[key] ??
    key
  )
}

export type TranslationKeys = Record<keyof typeof BASE_TRANSLATIONS, string>

export function t(lang: Language): TranslationKeys {
  const fallback = LANG_FALLBACK[lang]
  return (translations[lang] ?? translations[fallback] ?? translations.es) as TranslationKeys
}
