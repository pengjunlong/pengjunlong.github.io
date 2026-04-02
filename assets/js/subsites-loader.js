/**
 * subsites-loader.js
 * 自动从 GitHub API 发现并渲染子站点导航卡片
 *
 * 子站点接入规范：
 * 在子仓库根目录放置 subsite-config.json，格式：
 * {
 *   "displayName": "站点名称",       // 必填
 *   "description": "站点简介",       // 必填
 *   "icon": "🚀",                    // 可选，emoji 或 Font Awesome 类名
 *   "tags": ["分类1", "分类2"],      // 可选，用于分类过滤
 *   "color": "#FF6B6B",              // 可选，卡片强调色（hex）
 *   "order": 1                       // 可选，数字越小越靠前
 * }
 */

(function () {
  'use strict';

  // ── 配置 ───────────────────────────────────────────────
  const USERNAME   = 'pengjunlong';
  const CONFIG_FILE = '/subsite-config.json';
  const CACHE_KEY  = 'subsitesCache_v2';
  const CACHE_TTL  = 60 * 60 * 1000; // 1 小时
  const MAX_RETRY  = 2;

  // ── 状态 ───────────────────────────────────────────────
  let allSubsites  = [];   // 所有加载成功的子站

  // ── DOM 引用（DOMContentLoaded 后赋值）──────────────────
  let container, loadingEl, errorEl, errorMsgEl, retryBtn;

  // ── 工具函数 ────────────────────────────────────────────

  /** 带重试的 fetch */
  async function fetchWithRetry(url, retries = MAX_RETRY) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      } catch (e) {
        if (i === retries) throw e;
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    }
  }

  /** 读取本地缓存 */
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) return null;
      return data;
    } catch {
      return null;
    }
  }

  /** 写入本地缓存 */
  function writeCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch { /* 存储满时忽略 */ }
  }

  /** 格式化日期 */
  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** 判断 icon 是 emoji 还是 FA 类名 */
  function renderIcon(icon) {
    if (!icon) return '<i class="fas fa-link fa-fw"></i>';
    // emoji 通常以 Unicode 范围字符开头
    const isEmoji = /\p{Emoji}/u.test(icon.trim().charAt(0));
    if (isEmoji) return `<span class="subsite-emoji-icon">${icon}</span>`;
    return `<i class="${icon} fa-fw"></i>`;
  }

  /** 生成一个色板色（根据名称哈希） */
  function hashColor(str) {
    const palette = [
      '#FF6B6B', '#FF8E53', '#FFCD3C', '#2EC4B6',
      '#4ECDC4', '#45B7D1', '#6C63FF', '#F7797D',
      '#48C9B0', '#F39C12', '#8E44AD', '#27AE60'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) & 0xFFFFFF;
    return palette[Math.abs(hash) % palette.length];
  }

  // ── 渲染 ────────────────────────────────────────────────

  /** 构建单张卡片 HTML */
  function buildCard(config) {
    const accentColor = config.color || hashColor(config.displayName || config.repoName || '');
    const tags = (config.tags || []).map(t => `<span class="subsite-tag">${t}</span>`).join('');
    const updatedStr = config.updated ? `<span class="subsite-card__meta"><i class="fas fa-clock"></i> ${formatDate(config.updated)}</span>` : '';

    return `
      <a href="${config.url}" class="subsite-card" target="_blank" rel="noopener"
         data-tags="${(config.tags || []).join(',')}"
         data-name="${config.displayName || ''}"
         style="--accent: ${accentColor}">
        <div class="subsite-card__stripe"></div>
        <div class="subsite-card__icon">${renderIcon(config.icon)}</div>
        <div class="subsite-card__body">
          <h3 class="subsite-card__title">${config.displayName || config.repoName}</h3>
          <p class="subsite-card__desc">${config.description || '暂无描述'}</p>
          <div class="subsite-card__footer">
            <div class="subsite-card__tags">${tags}</div>
            ${updatedStr}
          </div>
        </div>
        <div class="subsite-card__arrow"><i class="fas fa-arrow-right"></i></div>
      </a>`;
  }

  /** 渲染卡片列表（按 order + 名称排序） */
  function renderCards() {
    allSubsites.sort((a, b) => {
      const oa = a.order !== undefined ? a.order : 999;
      const ob = b.order !== undefined ? b.order : 999;
      if (oa !== ob) return oa - ob;
      return (a.displayName || '').localeCompare(b.displayName || '', 'zh');
    });

    container.innerHTML = allSubsites.map(buildCard).join('');
    // 入场动画
    container.querySelectorAll('.subsite-card').forEach((el, i) => {
      el.style.animationDelay = `${i * 60}ms`;
      el.classList.add('subsite-card--animate');
    });
  }

  // ── 主加载流程 ──────────────────────────────────────────

  async function loadSubsites() {
    loadingEl.style.display  = '';
    errorEl.style.display    = 'none';

    try {
      let repos = readCache();

      if (!repos) {
        const res = await fetchWithRetry(
          `https://api.github.com/users/${USERNAME}/repos?per_page=100&type=public`
        );
        repos = await res.json();
        writeCache(repos);
      }

      // 过滤启用了 GitHub Pages 且非归档、非主站的仓库
      const validRepos = repos.filter(r =>
        r.has_pages &&
        !r.archived &&
        r.name !== `${USERNAME}.github.io`
      );

      // 并行拉取各子站 subsite-config.json
      const results = await Promise.allSettled(
        validRepos.map(async repo => {
          const configUrl = `https://${USERNAME}.github.io/${repo.name}${CONFIG_FILE}`;
          const res = await fetchWithRetry(configUrl, 1);
          const config = await res.json();
          return {
            ...config,
            url:      `https://${USERNAME}.github.io/${repo.name}`,
            repoName: repo.name,
            updated:  repo.updated_at
          };
        })
      );

      allSubsites = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

      loadingEl.style.display = 'none';

      if (allSubsites.length > 0) {
        renderCards();
      }

    } catch (err) {
      console.error('[SubsitesLoader] 加载失败:', err);
      loadingEl.style.display = 'none';
      errorMsgEl.textContent  = `加载失败：${err.message}`;
      errorEl.style.display   = '';
    }
  }

  // ── 初始化 ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    container  = document.getElementById('subsites-container');
    loadingEl  = document.getElementById('subsites-loading');
    errorEl    = document.getElementById('subsites-error');
    errorMsgEl = document.getElementById('subsites-error-msg');
    retryBtn   = document.getElementById('subsites-retry');

    if (!container) return; // 不在子站导航页则跳过

    // 重试
    retryBtn.addEventListener('click', loadSubsites);

    // 开始加载
    loadSubsites();
  });
})();
