(() => {
  const translations = {
    en: {
      meta: {
        title: 'GitFinder · GitHub Profile Finder',
        description: 'GitFinder — search any GitHub profile and see their most recent repositories in real time.'
      },
      back: 'Portfolio',
      tagline: 'Search any GitHub profile and see their repositories in real time.',
      placeholder: 'github username',
      search: 'Search',
      searching: 'Searching @{user}…',
      tryLabel: 'Try:',
      emptyState: 'Type a username above to get started.',
      recentRepos: 'Recent repositories',
      noDescription: '— no description',
      viewProfile: 'View on GitHub',
      stats: {
        repos: 'Repositories',
        followers: 'Followers',
        following: 'Following'
      },
      errors: {
        notFoundTitle: 'User not found',
        notFoundDesc: 'No profile named @{user} exists on GitHub.',
        rateLimitTitle: 'API rate limit reached',
        rateLimitDesc: 'Please try again in a few minutes.',
        genericTitle: 'Error {code}',
        genericDesc: 'Could not fetch the profile.',
        networkTitle: 'Connection failed',
        networkDesc: 'Check your internet and try again.'
      },
      footer: 'Made by {author} · data via {api}',
      a11y: { changeLang: 'Change language' }
    },

    pt: {
      meta: {
        title: 'GitFinder · Buscador de Perfil GitHub',
        description: 'GitFinder — pesquise qualquer perfil do GitHub e veja seus repositórios mais recentes em tempo real.'
      },
      back: 'Portfólio',
      tagline: 'Pesquise qualquer perfil do GitHub e veja seus repositórios em tempo real.',
      placeholder: 'usuário do github',
      search: 'Buscar',
      searching: 'Buscando @{user}…',
      tryLabel: 'Tente:',
      emptyState: 'Digite um usuário acima para começar.',
      recentRepos: 'Repositórios recentes',
      noDescription: '— sem descrição',
      viewProfile: 'Ver perfil no GitHub',
      stats: {
        repos: 'Repositórios',
        followers: 'Seguidores',
        following: 'Seguindo'
      },
      errors: {
        notFoundTitle: 'Usuário não encontrado',
        notFoundDesc: 'Nenhum perfil chamado @{user} existe no GitHub.',
        rateLimitTitle: 'Limite de requisições da API atingido',
        rateLimitDesc: 'Tente novamente em alguns minutos.',
        genericTitle: 'Erro {code}',
        genericDesc: 'Não foi possível buscar o perfil.',
        networkTitle: 'Falha de conexão',
        networkDesc: 'Verifique sua internet e tente novamente.'
      },
      footer: 'Feito por {author} · dados via {api}',
      a11y: { changeLang: 'Alterar idioma' }
    },

    es: {
      meta: {
        title: 'GitFinder · Buscador de Perfiles GitHub',
        description: 'GitFinder — busca cualquier perfil de GitHub y mira sus repositorios más recientes en tiempo real.'
      },
      back: 'Portafolio',
      tagline: 'Busca cualquier perfil de GitHub y mira sus repositorios en tiempo real.',
      placeholder: 'usuario de github',
      search: 'Buscar',
      searching: 'Buscando @{user}…',
      tryLabel: 'Prueba:',
      emptyState: 'Escribe un usuario arriba para comenzar.',
      recentRepos: 'Repositorios recientes',
      noDescription: '— sin descripción',
      viewProfile: 'Ver perfil en GitHub',
      stats: {
        repos: 'Repositorios',
        followers: 'Seguidores',
        following: 'Siguiendo'
      },
      errors: {
        notFoundTitle: 'Usuario no encontrado',
        notFoundDesc: 'Ningún perfil llamado @{user} existe en GitHub.',
        rateLimitTitle: 'Límite de la API alcanzado',
        rateLimitDesc: 'Intenta de nuevo en unos minutos.',
        genericTitle: 'Error {code}',
        genericDesc: 'No fue posible buscar el perfil.',
        networkTitle: 'Falla de conexión',
        networkDesc: 'Verifica tu internet e intenta de nuevo.'
      },
      footer: 'Hecho por {author} · datos vía {api}',
      a11y: { changeLang: 'Cambiar idioma' }
    }
  };

  const STORAGE_KEY = 'gitfinder.lang';
  const HTML_LANG = { en: 'en', pt: 'pt-BR', es: 'es' };
  const DEFAULT_LANG = 'en';

  const get = (obj, path) => path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);

  function detectLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) return saved;
    } catch (_) {}
    const nav = (navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();
    return translations[nav] ? nav : DEFAULT_LANG;
  }

  // Public state — main.js can read window.i18n
  const state = {
    lang: detectLang(),
    dict: null,
    listeners: new Set()
  };
  state.dict = translations[state.lang];

  function t(path, vars) {
    let value = get(state.dict, path) ?? get(translations[DEFAULT_LANG], path);
    if (typeof value !== 'string') return path;
    if (vars) {
      Object.keys(vars).forEach(key => {
        value = value.replaceAll(`{${key}}`, vars[key]);
      });
    }
    return value;
  }

  function applyStaticTranslations() {
    document.documentElement.lang = HTML_LANG[state.lang] || state.lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const value = get(state.dict, el.dataset.i18n);
      if (typeof value === 'string') el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(',').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        const value = get(state.dict, key);
        if (typeof value === 'string') el.setAttribute(attr, value);
      });
    });

    if (state.dict.meta?.title) document.title = state.dict.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && state.dict.meta?.description) {
      metaDesc.setAttribute('content', state.dict.meta.description);
    }

    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === state.lang);
    });
  }

  function setLang(lang) {
    if (!translations[lang] || lang === state.lang) return;
    state.lang = lang;
    state.dict = translations[lang];
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    applyStaticTranslations();
    state.listeners.forEach(fn => fn(lang));
  }

  // Expose to main.js
  window.i18n = {
    t,
    get lang() { return state.lang; },
    onChange(fn) { state.listeners.add(fn); }
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyStaticTranslations();

    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  });
})();
