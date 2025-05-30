const CONFIG_PATH = '/subsite-config.json';
const USERNAME = 'pengjunlong';

async function loadSubsites() {
    try {
        // 获取所有仓库列表
        const repos = await fetch(`https://api.github.com/users/${USERNAME}/repos`)
            .then(r => r.json());

        // 过滤有效子站点
        const validRepos = repos.filter(repo =>
            repo.has_pages &&
            repo.name !== `${USERNAME}.github.io`
        );

        // 并行获取所有配置
        const subsites = await Promise.all(
            validRepos.map(async repo => {
                const configUrl = `https://${USERNAME}.github.io/${repo.name}${CONFIG_PATH}`;
                try {
                    const config = await fetch(configUrl).then(r => r.json());
                    return { ...config, repoName: repo.name };
                } catch {
                    return null; // 忽略无配置的子站
                }
            })
        );

        // 渲染导航
        const nav = document.getElementById('subsites-nav');
        subsites
            .filter(Boolean)
            .forEach(config => {
                nav.innerHTML += `
          <a href="${config.url}" class="subsite-card">
            <span class="icon">${config.icon}</span>
            <div>
              <h3>${config.displayName}</h3>
              <p>${config.description}</p>
            </div>
          </a>
        `;
            });
    } catch (error) {
        console.error('导航加载失败:', error);
    }
}

// 页面加载后执行
window.addEventListener('DOMContentLoaded', loadSubsites);
