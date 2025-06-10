const CONFIG_PATH = '/subsite-config.json';
const USERNAME = 'pengjunlong';
const CACHE_TTL = 3600000; // 1小时缓存

async function loadSubsites() {
    const container = document.getElementById('subsites-container');
    const loadingIndicator = document.getElementById('subsites-loading');

    try {
        // 尝试从本地存储获取缓存
        const cachedData = localStorage.getItem('subsitesData');
        const cachedTimestamp = localStorage.getItem('subsitesTimestamp');

        let repos = [];

        // 检查缓存是否有效
        if (cachedData && cachedTimestamp &&
            Date.now() - parseInt(cachedTimestamp) < CACHE_TTL) {
            repos = JSON.parse(cachedData);
        } else {
            // 从GitHub API获取仓库列表
            const response = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
            if (!response.ok) throw new Error('GitHub API请求失败');

            repos = await response.json();

            // 缓存数据
            localStorage.setItem('subsitesData', JSON.stringify(repos));
            localStorage.setItem('subsitesTimestamp', Date.now().toString());
        }

        // 过滤有效子站点
        const validRepos = repos.filter(repo =>
            repo.has_pages &&
            !repo.archived &&
            repo.name !== `${USERNAME}.github.io`
        );

        // 并行获取配置
        const subsites = await Promise.all(
            validRepos.map(async repo => {
                try {
                    const configUrl = `https://${USERNAME}.github.io/${repo.name}${CONFIG_PATH}`;
                    const configRes = await fetch(configUrl);
                    if (!configRes.ok) return null;

                    const config = await configRes.json();
                    return {
                        ...config,
                        url: `https://${USERNAME}.github.io/${repo.name}`,
                        repoName: repo.name,
                        updated: repo.updated_at
                    };
                } catch {
                    return null;
                }
            })
        );

        // 渲染结果
        container.innerHTML = '';
        subsites.filter(Boolean).forEach(config => {
            container.innerHTML += `
                <div class="grid__item">
                    <a href="${config.url}" class="archive__item">
                        <div class="archive__item-body">
                            <div class="archive__item-title">
                                <i class="${config.icon || 'fas fa-link'} fa-fw"></i> 
                                ${config.displayName || config.repoName}
                            </div>
                            <div class="archive__item-excerpt">
                                <p>${config.description || '无描述信息'}</p>
                                <small class="text-muted">更新于: ${new Date(config.updated).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });

        // 隐藏加载指示器
        loadingIndicator.style.display = 'none';

    } catch (error) {
        console.error('子站点加载失败:', error);
        loadingIndicator.innerHTML = `
            <div class="notice--danger">
                <i class="fas fa-exclamation-triangle"></i> 
                子站点加载失败: ${error.message}
                <p>显示静态备用内容</p>
            </div>
        `;
    }
}

// 页面加载后执行
document.addEventListener('DOMContentLoaded', loadSubsites);
