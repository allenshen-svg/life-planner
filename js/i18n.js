/* ═══ i18n · 时光记多语言 ═══ */
const I18N = (() => {
  const LANGS = ['zh-Hans','en','ja','ko','es','fr','de','pt-BR','ar','ru','it','th'];
  const _strings = {};  // { 'en': { key: value }, ... }
  LANGS.forEach(l => _strings[l] = {});

  // Detect language from browser/system
  function detectLang() {
    const saved = localStorage.getItem('lp_lang');
    if (saved && LANGS.includes(saved)) return saved;
    const nav = navigator.language || navigator.userLanguage || 'zh-Hans';
    if (nav.startsWith('zh-Hans') || nav.startsWith('zh-CN') || nav === 'zh') return 'zh-Hans';
    if (nav.startsWith('zh')) return 'zh-Hans';
    for (const code of ['ja','ko','es','fr','de','ru','it','th']) {
      if (nav.startsWith(code)) return code;
    }
    if (nav.startsWith('pt')) return 'pt-BR';
    if (nav.startsWith('ar')) return 'ar';
    if (nav.startsWith('en')) return 'en';
    return 'en';
  }

  let _currentLang = detectLang();

  // Register translations for a language
  function addLang(code, translations) {
    _strings[code] = { ...(_strings[code] || {}), ...translations };
  }

  // Translate function
  function t(key, ...args) {
    const str = (_strings[_currentLang] && _strings[_currentLang][key])
             || (_strings['zh-Hans'] && _strings['zh-Hans'][key])
             || key;
    if (!args.length) return str;
    return str.replace(/{(\d+)}/g, (m, i) => args[i] !== undefined ? args[i] : m);
  }

  function setLang(code) {
    if (LANGS.includes(code)) {
      _currentLang = code;
      localStorage.setItem('lp_lang', code);
    }
  }

  function getLang() { return _currentLang; }
  function getLangs() { return LANGS; }

  return { t, addLang, setLang, getLang, getLangs, detectLang };
})();
