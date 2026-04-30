# GitFinder

> Buscador de perfil GitHub — pesquise qualquer usuário e veja seu perfil + repositórios mais recentes em tempo real.

**Demo:** https://geannyr.github.io/gitfinder/

## Features

- Busca instantânea via [GitHub REST API](https://docs.github.com/en/rest)
- Perfil completo: avatar, bio, localização, empresa, blog, Twitter
- Lista os 12 repositórios mais recentes com linguagem, estrelas e forks
- Sugestões de usuários para teste rápido
- Design coerente com o portfólio (dark mode, accent roxo, glassmorphism)
- Totalmente responsivo

## Stack

HTML5 · CSS3 · JavaScript vanilla — sem build, sem dependências.

## Rodando localmente

Basta abrir `index.html` no navegador. Ou servir com qualquer static server:

```bash
npx serve .
```

## Limites

A GitHub API permite **60 requisições/hora** sem autenticação. Caso o limite seja atingido, basta aguardar.

---

Feito por [Geanny Rodrigues](https://geannyr.github.io/curriculo2/)
