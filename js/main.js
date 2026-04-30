(() => {
  const API_BASE = 'https://api.github.com';

  const form = document.getElementById('searchForm');
  const input = document.getElementById('userInput');
  const button = document.getElementById('searchBtn');
  const resultArea = document.getElementById('resultArea');
  const emptyState = document.getElementById('emptyState');

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  };

  const normalizeUrl = (url) => {
    if (!url) return '#';
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const formatNumber = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return String(n);
  };

  const langColors = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219',       HTML: '#e34c26',       CSS: '#563d7c',
    Go: '#00ADD8',         Rust: '#dea584',       Ruby: '#701516',
    PHP: '#4F5D95',        C: '#555555',          'C++': '#f34b7d',
    'C#': '#178600',       Shell: '#89e051',      Vue: '#41b883',
    Swift: '#F05138',      Kotlin: '#A97BFF',     Dart: '#00B4AB',
  };

  function setLoading(isLoading) {
    button.disabled = isLoading;
    button.querySelector('span').textContent = isLoading ? 'Buscando…' : 'Buscar';
  }

  async function searchUser(username) {
    username = username.trim();
    if (!username) return;

    emptyState.classList.add('hidden');
    resultArea.innerHTML = `
      <div class="loader">
        <div class="loader-spinner"></div>
        <span>Buscando @${escapeHtml(username)}…</span>
      </div>`;
    setLoading(true);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`${API_BASE}/users/${encodeURIComponent(username)}`),
        fetch(`${API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`),
      ]);

      if (userRes.status === 404) {
        renderNotFound(username);
        return;
      }
      if (userRes.status === 403) {
        renderError('Limite de requisições da API atingido', 'Tente novamente em alguns minutos.');
        return;
      }
      if (!userRes.ok) {
        renderError(`Erro ${userRes.status}`, userRes.statusText || 'Não foi possível buscar o perfil.');
        return;
      }

      const user = await userRes.json();
      const repos = reposRes.ok ? await reposRes.json() : [];
      renderProfile(user, repos);
    } catch (err) {
      renderError('Falha de conexão', 'Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function renderProfile(user, repos) {
    resultArea.innerHTML = `
      <article class="profile-card">
        <img src="${user.avatar_url}" alt="Avatar de ${escapeHtml(user.login)}" class="profile-avatar" loading="lazy">
        <div class="profile-info">
          <h2>${escapeHtml(user.name || user.login)}</h2>
          <a href="${user.html_url}" target="_blank" rel="noopener" class="profile-login">
            @${escapeHtml(user.login)}
            ${arrowUpRightIcon()}
          </a>
          ${user.bio ? `<p class="profile-bio">${escapeHtml(user.bio)}</p>` : ''}
          ${renderMeta(user)}
          <div class="profile-stats">
            <div class="stat"><strong>${formatNumber(user.public_repos)}</strong><span>Repositórios</span></div>
            <div class="stat"><strong>${formatNumber(user.followers)}</strong><span>Seguidores</span></div>
            <div class="stat"><strong>${formatNumber(user.following)}</strong><span>Seguindo</span></div>
          </div>
          <a href="${user.html_url}" target="_blank" rel="noopener" class="profile-cta">
            Ver perfil no GitHub
            ${arrowUpRightIcon()}
          </a>
        </div>
      </article>

      ${repos.length > 0 ? `
        <section class="repos-section">
          <h3 class="repos-header">Repositórios recentes</h3>
          <div class="repos-grid">
            ${repos.map(renderRepo).join('')}
          </div>
        </section>
      ` : ''}
    `;
  }

  function renderMeta(user) {
    const parts = [];
    if (user.location) {
      parts.push(`<span class="meta-item">${pinIcon()}${escapeHtml(user.location)}</span>`);
    }
    if (user.company) {
      parts.push(`<span class="meta-item">${buildingIcon()}${escapeHtml(user.company)}</span>`);
    }
    if (user.blog) {
      parts.push(`<a class="meta-item" href="${normalizeUrl(user.blog)}" target="_blank" rel="noopener">${linkIcon()}${escapeHtml(user.blog)}</a>`);
    }
    if (user.twitter_username) {
      parts.push(`<a class="meta-item" href="https://twitter.com/${encodeURIComponent(user.twitter_username)}" target="_blank" rel="noopener">${twitterIcon()}@${escapeHtml(user.twitter_username)}</a>`);
    }
    return parts.length ? `<div class="profile-meta">${parts.join('')}</div>` : '';
  }

  function renderRepo(repo) {
    const langColor = langColors[repo.language] || 'var(--accent)';
    return `
      <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-card">
        <h4>${escapeHtml(repo.name)}</h4>
        ${repo.description
          ? `<p>${escapeHtml(repo.description)}</p>`
          : '<p class="muted">— sem descrição</p>'}
        <div class="repo-footer">
          ${repo.language
            ? `<span class="lang" style="color: ${langColor}"><span class="lang-dot"></span>${escapeHtml(repo.language)}</span>`
            : ''}
          <span class="repo-stat">${starIcon()} ${formatNumber(repo.stargazers_count)}</span>
          <span class="repo-stat">${forkIcon()} ${formatNumber(repo.forks_count)}</span>
        </div>
      </a>
    `;
  }

  function renderNotFound(username) {
    resultArea.innerHTML = `
      <div class="error-state">
        <strong>Usuário não encontrado</strong>
        <p>Nenhum perfil chamado <strong>@${escapeHtml(username)}</strong> existe no GitHub.</p>
      </div>
    `;
  }

  function renderError(title, msg) {
    resultArea.innerHTML = `
      <div class="error-state">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(msg)}</p>
      </div>
    `;
  }

  /* ----- inline icons (avoid extra requests) ----- */
  const arrowUpRightIcon = () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M7 7h10v10"/></svg>`;
  const pinIcon = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const buildingIcon = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>`;
  const linkIcon = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
  const twitterIcon = () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  const starIcon = () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const forkIcon = () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="12" cy="6" r="2"/><path d="M12 8v4M6 16V12h12v4"/></svg>`;

  /* ----- listeners ----- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    searchUser(input.value);
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const u = chip.dataset.user;
      input.value = u;
      searchUser(u);
    });
  });

  // Auto-load "geannyr" on first visit so the page is never empty
  document.addEventListener('DOMContentLoaded', () => {
    input.value = 'geannyr';
    searchUser('geannyr');
  });
})();
