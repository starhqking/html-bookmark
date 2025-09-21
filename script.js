// 书签管理系统主要功能
class BookmarkManager {
    constructor() {
        this.bookmarks = [];
        this.categories = [];
        this.tags = [];
        this.currentTheme = 'light';
        this.customThemes = [];
        this.selectedCategory = null;
        this.selectedTags = [];
        this.editingBookmark = null;
        this.currentView = 'list'; // 'list' 或 'card'
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderCategories();
        this.renderTags();
        this.renderBookmarks();
        this.applyTheme(this.currentTheme);
        this.updateViewButtons();
    }

    // 数据管理
    loadData() {
        const savedData = localStorage.getItem('bookmarkData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.bookmarks = data.bookmarks || [];
            this.categories = data.categories || [];
            this.tags = data.tags || [];
            this.currentTheme = data.currentTheme || 'light';
            this.customThemes = data.customThemes || [];
            this.currentView = data.currentView || 'list';
        } else {
            // 初始化默认数据
            this.initDefaultData();
        }
    }

    saveData() {
        const data = {
            bookmarks: this.bookmarks,
            categories: this.categories,
            tags: this.tags,
            currentTheme: this.currentTheme,
            customThemes: this.customThemes,
            currentView: this.currentView
        };
        localStorage.setItem('bookmarkData', JSON.stringify(data));
    }

    initDefaultData() {
        this.categories = [
            {
                id: 'cat1',
                name: '工作',
                level: 1,
                parentId: null,
                children: [
                    { id: 'cat1-1', name: '开发工具', level: 2, parentId: 'cat1', children: [
                        { id: 'cat1-1-1', name: '前端工具', level: 3, parentId: 'cat1-1', children: [] }
                    ]},
                    { id: 'cat1-2', name: '设计资源', level: 2, parentId: 'cat1', children: [] }
                ]
            },
            {
                id: 'cat2',
                name: '学习',
                level: 1,
                parentId: null,
                children: [
                    { id: 'cat2-1', name: '编程教程', level: 2, parentId: 'cat2', children: [] },
                    { id: 'cat2-2', name: '在线课程', level: 2, parentId: 'cat2', children: [] }
                ]
            }
        ];

        this.tags = ['重要', '常用', '学习', '工作', '工具', '参考'];

        this.bookmarks = [
            {
                id: 'bm1',
                name: 'GitHub',
                url: 'https://github.com',
                description: '全球最大的代码托管平台',
                categoryId: 'cat1-1-1',
                tags: ['工作', '工具', '重要'],
                dateAdded: new Date().toISOString(),
                favicon: 'https://github.com/favicon.ico'
            },
            {
                id: 'bm2',
                name: 'MDN Web Docs',
                url: 'https://developer.mozilla.org',
                description: 'Web开发者最佳参考文档',
                categoryId: 'cat2-1',
                tags: ['学习', '参考', '重要'],
                dateAdded: new Date().toISOString(),
                favicon: 'https://developer.mozilla.org/favicon.ico'
            }
        ];
    }

    // 事件监听器设置
    setupEventListeners() {
        // 搜索功能
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchBookmarks(e.target.value);
        });

        // 主题切换
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleThemePanel();
        });

        // 主题选择
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.applyTheme(theme);
                this.hideThemePanel();
            });
        });

        // 自定义主题
        document.getElementById('custom-theme-btn').addEventListener('click', () => {
            this.showCustomThemeModal();
        });

        // 导入导出
        document.getElementById('import-export-toggle').addEventListener('click', () => {
            this.toggleImportExportPanel();
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.exportJSON();
        });

        document.getElementById('export-html').addEventListener('click', () => {
            this.exportHTML();
        });

        document.getElementById('import-json').addEventListener('click', () => {
            this.importJSON();
        });

        document.getElementById('import-html').addEventListener('click', () => {
            this.importHTML();
        });

        // 添加书签
        document.getElementById('add-bookmark').addEventListener('click', () => {
            this.showBookmarkModal();
        });

        // 添加分类
        document.getElementById('add-category').addEventListener('click', () => {
            this.addCategory();
        });

        // 模态框控制
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideBookmarkModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideBookmarkModal();
        });

        document.getElementById('close-custom-theme-modal').addEventListener('click', () => {
            this.hideCustomThemeModal();
        });

        document.getElementById('cancel-custom-theme').addEventListener('click', () => {
            this.hideCustomThemeModal();
        });

        // 表单提交
        document.getElementById('bookmark-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBookmark();
        });

        document.getElementById('custom-theme-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomTheme();
        });

        // 标签输入
        this.setupTagInput();

        // 排序
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortBookmarks(e.target.value);
        });

        // 文件导入
        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.handleFileImport(e);
        });

        // 视图切换
        document.getElementById('list-view-btn').addEventListener('click', () => {
            this.switchView('list');
        });

        document.getElementById('card-view-btn').addEventListener('click', () => {
            this.switchView('card');
        });

        // 点击外部关闭面板
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#theme-toggle') && !e.target.closest('#theme-panel')) {
                this.hideThemePanel();
            }
            if (!e.target.closest('#import-export-toggle') && !e.target.closest('#import-export-panel')) {
                this.hideImportExportPanel();
            }
        });
    }

    // 主题管理
    applyTheme(themeName) {
        const body = document.body;
        body.className = body.className.replace(/theme-\w+/g, '');
        body.classList.add(`theme-${themeName}`);
        this.currentTheme = themeName;
        
        // 更新主题选择器状态
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === themeName) {
                option.classList.add('active');
            }
        });
        
        this.saveData();
    }

    toggleThemePanel() {
        const panel = document.getElementById('theme-panel');
        panel.classList.toggle('hidden');
    }

    hideThemePanel() {
        document.getElementById('theme-panel').classList.add('hidden');
    }

    showCustomThemeModal() {
        document.getElementById('custom-theme-modal').classList.remove('hidden');
        this.hideThemePanel();
    }

    hideCustomThemeModal() {
        document.getElementById('custom-theme-modal').classList.add('hidden');
    }

    saveCustomTheme() {
        const name = document.getElementById('theme-name').value;
        const primaryColor = document.getElementById('primary-color').value;
        const secondaryColor = document.getElementById('secondary-color').value;
        const backgroundType = document.getElementById('background-type').value;

        const customTheme = {
            id: `custom-${Date.now()}`,
            name,
            primaryColor,
            secondaryColor,
            backgroundType
        };

        this.customThemes.push(customTheme);
        this.applyCustomTheme(customTheme);
        this.hideCustomThemeModal();
        this.saveData();
        this.showNotification('自定义主题已保存', 'success');
    }

    applyCustomTheme(theme) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primaryColor);
        root.style.setProperty('--secondary-color', theme.secondaryColor);
        
        if (theme.backgroundType === 'gradient') {
            root.style.setProperty('--background-gradient', 
                `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`);
        } else {
            root.style.setProperty('--background-gradient', theme.primaryColor);
        }
    }

    // 导入导出功能
    toggleImportExportPanel() {
        const panel = document.getElementById('import-export-panel');
        panel.classList.toggle('hidden');
    }

    hideImportExportPanel() {
        document.getElementById('import-export-panel').classList.add('hidden');
    }

    exportJSON() {
        const data = {
            bookmarks: this.bookmarks,
            categories: this.categories,
            tags: this.tags,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.hideImportExportPanel();
        this.showNotification('JSON文件导出成功', 'success');
    }

    exportHTML() {
        let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

        // 按分类组织书签
        const categoryMap = this.buildCategoryMap();
        
        this.categories.forEach(category => {
            if (category.level === 1) {
                html += this.generateCategoryHTML(category, categoryMap, 1);
            }
        });

        html += `</DL><p>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.hideImportExportPanel();
        this.showNotification('HTML文件导出成功', 'success');
    }

    generateCategoryHTML(category, categoryMap, level) {
        let html = `${'    '.repeat(level)}<DT><H3>${category.name}</H3>\n`;
        html += `${'    '.repeat(level)}<DL><p>\n`;

        // 添加该分类下的书签
        const bookmarksInCategory = this.bookmarks.filter(bookmark => 
            bookmark.categoryId === category.id
        );

        bookmarksInCategory.forEach(bookmark => {
            html += `${'    '.repeat(level + 1)}<DT><A HREF="${bookmark.url}">${bookmark.name}</A>\n`;
        });

        // 递归添加子分类
        if (category.children) {
            category.children.forEach(child => {
                html += this.generateCategoryHTML(child, categoryMap, level + 1);
            });
        }

        html += `${'    '.repeat(level)}</DL><p>\n`;
        return html;
    }

    importJSON() {
        const input = document.getElementById('import-file-input');
        input.accept = '.json';
        input.click();
    }

    importHTML() {
        const input = document.getElementById('import-file-input');
        input.accept = '.html';
        input.click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (file.name.endsWith('.json')) {
                    this.processJSONImport(e.target.result);
                } else if (file.name.endsWith('.html')) {
                    this.processHTMLImport(e.target.result);
                }
            } catch (error) {
                this.showNotification('文件导入失败: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
        
        // 清空input值，允许重复选择同一文件
        event.target.value = '';
    }

    processJSONImport(jsonString) {
        const data = JSON.parse(jsonString);
        
        if (data.bookmarks) {
            // 合并书签，避免重复
            data.bookmarks.forEach(bookmark => {
                if (!this.bookmarks.find(b => b.url === bookmark.url)) {
                    bookmark.id = this.generateId();
                    this.bookmarks.push(bookmark);
                }
            });
        }

        if (data.categories) {
            // 合并分类
            data.categories.forEach(category => {
                if (!this.categories.find(c => c.name === category.name && c.level === category.level)) {
                    this.categories.push(category);
                }
            });
        }

        if (data.tags) {
            // 合并标签
            data.tags.forEach(tag => {
                if (!this.tags.includes(tag)) {
                    this.tags.push(tag);
                }
            });
        }

        this.saveData();
        this.renderCategories();
        this.renderTags();
        this.renderBookmarks();
        this.hideImportExportPanel();
        this.showNotification('JSON文件导入成功', 'success');
    }

    processHTMLImport(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const links = doc.querySelectorAll('a[href]');
        
        let importedCount = 0;
        links.forEach(link => {
            const url = link.getAttribute('href');
            const name = link.textContent.trim();
            
            if (url && name && !this.bookmarks.find(b => b.url === url)) {
                const bookmark = {
                    id: this.generateId(),
                    name,
                    url,
                    description: '',
                    categoryId: null,
                    tags: [],
                    dateAdded: new Date().toISOString(),
                    favicon: `${new URL(url).origin}/favicon.ico`
                };
                this.bookmarks.push(bookmark);
                importedCount++;
            }
        });

        this.saveData();
        this.renderBookmarks();
        this.hideImportExportPanel();
        this.showNotification(`HTML文件导入成功，导入了 ${importedCount} 个书签`, 'success');
    }

    // 书签管理
    showBookmarkModal(bookmark = null) {
        this.editingBookmark = bookmark;
        const modal = document.getElementById('bookmark-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('bookmark-form');

        if (bookmark) {
            title.textContent = '编辑书签';
            document.getElementById('bookmark-name').value = bookmark.name;
            document.getElementById('bookmark-url').value = bookmark.url;
            document.getElementById('bookmark-description').value = bookmark.description || '';
            document.getElementById('bookmark-category').value = bookmark.categoryId || '';
            this.setSelectedTags(bookmark.tags || []);
        } else {
            title.textContent = '添加书签';
            form.reset();
            this.setSelectedTags([]);
        }

        this.updateCategorySelect();
        modal.classList.remove('hidden');
    }

    hideBookmarkModal() {
        document.getElementById('bookmark-modal').classList.add('hidden');
        this.editingBookmark = null;
    }

    saveBookmark() {
        const name = document.getElementById('bookmark-name').value.trim();
        const url = document.getElementById('bookmark-url').value.trim();
        const description = document.getElementById('bookmark-description').value.trim();
        const categoryId = document.getElementById('bookmark-category').value;
        const tags = this.getSelectedTags();

        if (!name || !url) {
            this.showNotification('请填写书签名称和URL', 'error');
            return;
        }

        const bookmarkData = {
            name,
            url,
            description,
            categoryId: categoryId || null,
            tags,
            favicon: `${new URL(url).origin}/favicon.ico`
        };

        if (this.editingBookmark) {
            // 编辑现有书签
            Object.assign(this.editingBookmark, bookmarkData);
            this.showNotification('书签更新成功', 'success');
        } else {
            // 添加新书签
            const bookmark = {
                id: this.generateId(),
                ...bookmarkData,
                dateAdded: new Date().toISOString()
            };
            this.bookmarks.push(bookmark);
            this.showNotification('书签添加成功', 'success');
        }

        this.saveData();
        this.renderBookmarks();
        this.hideBookmarkModal();
    }

    deleteBookmark(bookmarkId) {
        if (confirm('确定要删除这个书签吗？')) {
            this.bookmarks = this.bookmarks.filter(b => b.id !== bookmarkId);
            this.saveData();
            this.renderBookmarks();
            this.showNotification('书签删除成功', 'success');
        }
    }

    // 分类管理
    addCategory() {
        const name = prompt('请输入分类名称:');
        if (!name) return;

        const category = {
            id: this.generateId(),
            name: name.trim(),
            level: 1,
            parentId: null,
            children: []
        };

        this.categories.push(category);
        this.saveData();
        this.renderCategories();
        this.updateCategorySelect();
        this.showNotification('分类添加成功', 'success');
    }

    addSubCategory(parentId, level) {
        const name = prompt('请输入子分类名称:');
        if (!name) return;

        const category = {
            id: this.generateId(),
            name: name.trim(),
            level: level + 1,
            parentId,
            children: []
        };

        // 找到父分类并添加子分类
        const parent = this.findCategoryById(parentId);
        if (parent) {
            parent.children.push(category);
        }

        this.saveData();
        this.renderCategories();
        this.updateCategorySelect();
        this.showNotification('子分类添加成功', 'success');
    }

    findCategoryById(id) {
        const findInArray = (categories) => {
            for (const category of categories) {
                if (category.id === id) return category;
                if (category.children) {
                    const found = findInArray(category.children);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInArray(this.categories);
    }

    buildCategoryMap() {
        const map = {};
        const addToMap = (categories) => {
            categories.forEach(category => {
                map[category.id] = category;
                if (category.children) {
                    addToMap(category.children);
                }
            });
        };
        addToMap(this.categories);
        return map;
    }

    // 标签管理
    setupTagInput() {
        const container = document.getElementById('tag-input-container');
        
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-tag-btn')) {
                const input = e.target.previousElementSibling;
                const tagName = input.value.trim();
                
                if (tagName && this.getSelectedTags().length < 6) {
                    this.addSelectedTag(tagName);
                    input.value = '';
                }
            }
        });

        container.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('tag-input')) {
                e.preventDefault();
                const tagName = e.target.value.trim();
                
                if (tagName && this.getSelectedTags().length < 6) {
                    this.addSelectedTag(tagName);
                    e.target.value = '';
                }
            }
        });
    }

    addSelectedTag(tagName) {
        const selectedTags = this.getSelectedTags();
        if (!selectedTags.includes(tagName)) {
            this.renderSelectedTag(tagName);
            
            // 添加到全局标签列表
            if (!this.tags.includes(tagName)) {
                this.tags.push(tagName);
                this.renderTags();
            }
        }
    }

    renderSelectedTag(tagName) {
        const container = document.getElementById('selected-tags');
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `
            ${tagName}
            <span class="remove-tag" onclick="this.parentElement.remove()">×</span>
        `;
        container.appendChild(tag);
    }

    getSelectedTags() {
        const container = document.getElementById('selected-tags');
        return Array.from(container.children).map(tag => 
            tag.textContent.replace('×', '').trim()
        );
    }

    setSelectedTags(tags) {
        const container = document.getElementById('selected-tags');
        container.innerHTML = '';
        tags.forEach(tag => this.renderSelectedTag(tag));
    }

    // 渲染功能
    renderCategories() {
        const container = document.getElementById('category-tree');
        container.innerHTML = '';

        // 添加"全部"选项
        const allItem = document.createElement('div');
        allItem.className = `category-item ${!this.selectedCategory ? 'active' : ''}`;
        allItem.innerHTML = '📁 全部书签';
        allItem.addEventListener('click', () => {
            this.selectedCategory = null;
            this.renderCategories();
            this.renderBookmarks();
        });
        container.appendChild(allItem);

        // 渲染分类树
        this.categories.forEach(category => {
            if (category.level === 1) {
                this.renderCategoryItem(category, container, 0);
            }
        });
    }

    renderCategoryItem(category, container, depth) {
        const item = document.createElement('div');
        item.className = `category-item ${this.selectedCategory === category.id ? 'active' : ''}`;
        item.style.paddingLeft = `${depth * 20 + 12}px`;
        
        const bookmarkCount = this.getBookmarkCountInCategory(category.id);
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${'📁'.repeat(Math.max(1, 4 - depth))} ${category.name}</span>
                <div class="flex items-center space-x-1">
                    <span class="text-xs text-gray-500">${bookmarkCount}</span>
                    ${category.level < 3 ? `<button class="add-subcategory text-xs text-blue-500 hover:text-blue-700" data-parent="${category.id}" data-level="${category.level}">+</button>` : ''}
                </div>
            </div>
        `;

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('add-subcategory')) {
                this.selectedCategory = category.id;
                this.renderCategories();
                this.renderBookmarks();
            }
        });

        // 添加子分类按钮事件
        const addBtn = item.querySelector('.add-subcategory');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.addSubCategory(category.id, category.level);
            });
        }

        container.appendChild(item);

        // 递归渲染子分类
        if (category.children) {
            category.children.forEach(child => {
                this.renderCategoryItem(child, container, depth + 1);
            });
        }
    }

    getBookmarkCountInCategory(categoryId) {
        return this.bookmarks.filter(bookmark => bookmark.categoryId === categoryId).length;
    }

    renderTags() {
        const container = document.getElementById('tag-filters');
        container.innerHTML = '';

        this.tags.forEach(tag => {
            const tagElement = document.createElement('button');
            tagElement.className = `tag ${this.selectedTags.includes(tag) ? 'active' : ''}`;
            tagElement.textContent = tag;
            tagElement.addEventListener('click', () => {
                this.toggleTagFilter(tag);
            });
            container.appendChild(tagElement);
        });
    }

    toggleTagFilter(tag) {
        const index = this.selectedTags.indexOf(tag);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
        } else {
            this.selectedTags.push(tag);
        }
        this.renderTags();
        this.renderBookmarks();
    }

    renderBookmarks() {
        const container = document.getElementById('bookmark-list');
        let bookmarks = this.getFilteredBookmarks();

        // 添加切换动画
        container.classList.add('switching');
        
        setTimeout(() => {
            // 设置容器类名
            container.className = this.currentView === 'card' ? 'bookmark-card-view' : 'bookmark-list-view';

            if (bookmarks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state col-span-full">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                        </svg>
                        <h3 class="text-lg font-medium mb-2">暂无书签</h3>
                        <p class="text-sm">点击"添加书签"开始收藏您喜欢的网站</p>
                    </div>
                `;
                container.classList.remove('switching');
                return;
            }

            container.innerHTML = '';
            bookmarks.forEach((bookmark, index) => {
                const bookmarkElement = this.createBookmarkElement(bookmark);
                // 添加延迟动画效果
                bookmarkElement.style.animationDelay = `${index * 0.05}s`;
                container.appendChild(bookmarkElement);
            });
            
            container.classList.remove('switching');
        }, 150);
    }

    createBookmarkElement(bookmark) {
        const element = document.createElement('div');
        element.className = 'bookmark-card fade-in';
        
        const categoryName = this.getCategoryName(bookmark.categoryId);
        const tagsHTML = bookmark.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');

        if (this.currentView === 'card') {
            // 卡片视图布局
            element.innerHTML = `
                <div class="bookmark-header">
                    <img src="${bookmark.favicon}" alt="favicon" class="bookmark-favicon" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23666%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z%22/></svg>'">
                    <div class="bookmark-content">
                        <h3 class="bookmark-title text-enhanced">
                            <a href="${bookmark.url}" target="_blank" class="hover:text-blue-400 transition-colors">
                                ${bookmark.name}
                            </a>
                        </h3>
                    </div>
                </div>
                
                ${bookmark.description ? `<p class="bookmark-description text-secondary-enhanced">${bookmark.description}</p>` : ''}
                
                <div class="bookmark-meta">
                    <div class="bookmark-url text-muted-enhanced">${bookmark.url}</div>
                    <div class="flex items-center justify-between text-xs text-muted-enhanced">
                        ${categoryName ? `<span>📁 ${categoryName}</span>` : '<span></span>'}
                        <span>${new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>
                
                ${tagsHTML ? `<div class="bookmark-tags">${tagsHTML}</div>` : ''}
                
                <div class="bookmark-actions">
                    <button class="edit-bookmark p-2 rounded-lg hover:bg-white/20 transition-all" data-id="${bookmark.id}" title="编辑">
                        <svg class="h-4 w-4 text-secondary-enhanced" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-bookmark p-2 rounded-lg hover:bg-red-200/50 transition-all" data-id="${bookmark.id}" title="删除">
                        <svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            `;
        } else {
            // 列表视图布局（原有布局）
            element.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <img src="${bookmark.favicon}" alt="favicon" class="w-4 h-4 mt-1 flex-shrink-0" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23666%22><path d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z%22/></svg>'">
                        <div class="flex-1 min-w-0">
                            <h3 class="font-semibold text-enhanced truncate">
                                <a href="${bookmark.url}" target="_blank" class="hover:text-blue-400 transition-colors">
                                    ${bookmark.name}
                                </a>
                            </h3>
                            ${bookmark.description ? `<p class="text-sm text-secondary-enhanced mt-1">${bookmark.description}</p>` : ''}
                            <div class="flex items-center space-x-2 mt-2">
                                ${categoryName ? `<span class="text-xs text-muted-enhanced">📁 ${categoryName}</span>` : ''}
                                <span class="text-xs text-muted-enhanced">${new Date(bookmark.dateAdded).toLocaleDateString()}</span>
                            </div>
                            ${tagsHTML ? `<div class="flex flex-wrap gap-1 mt-2">${tagsHTML}</div>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        <button class="edit-bookmark p-1 rounded-lg hover:bg-white/20 transition-all" data-id="${bookmark.id}">
                            <svg class="h-4 w-4 text-secondary-enhanced" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button class="delete-bookmark p-1 rounded-lg hover:bg-red-200/50 transition-all" data-id="${bookmark.id}">
                            <svg class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }

        // 添加事件监听器
        element.querySelector('.edit-bookmark').addEventListener('click', () => {
            this.showBookmarkModal(bookmark);
        });

        element.querySelector('.delete-bookmark').addEventListener('click', () => {
            this.deleteBookmark(bookmark.id);
        });

        return element;
    }

    getCategoryName(categoryId) {
        if (!categoryId) return '';
        const category = this.findCategoryById(categoryId);
        return category ? category.name : '';
    }

    getFilteredBookmarks() {
        let bookmarks = [...this.bookmarks];

        // 按分类筛选
        if (this.selectedCategory) {
            bookmarks = bookmarks.filter(bookmark => bookmark.categoryId === this.selectedCategory);
        }

        // 按标签筛选
        if (this.selectedTags.length > 0) {
            bookmarks = bookmarks.filter(bookmark => 
                this.selectedTags.some(tag => bookmark.tags.includes(tag))
            );
        }

        return bookmarks;
    }

    searchBookmarks(query) {
        const container = document.getElementById('bookmark-list');
        if (!query.trim()) {
            this.renderBookmarks();
            return;
        }

        const filteredBookmarks = this.bookmarks.filter(bookmark =>
            bookmark.name.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.description.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.url.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        // 添加切换动画
        container.classList.add('switching');
        
        setTimeout(() => {
            // 设置容器类名
            container.className = this.currentView === 'card' ? 'bookmark-card-view' : 'bookmark-list-view';
            
            if (filteredBookmarks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state col-span-full">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                        <h3 class="text-lg font-medium mb-2">未找到匹配的书签</h3>
                        <p class="text-sm">尝试使用不同的关键词搜索</p>
                    </div>
                `;
            } else {
                container.innerHTML = '';
                filteredBookmarks.forEach((bookmark, index) => {
                    const bookmarkElement = this.createBookmarkElement(bookmark);
                    bookmarkElement.style.animationDelay = `${index * 0.05}s`;
                    container.appendChild(bookmarkElement);
                });
            }
            
            container.classList.remove('switching');
        }, 150);
    }

    sortBookmarks(sortBy) {
        const container = document.getElementById('bookmark-list');
        let bookmarks = this.getFilteredBookmarks();

        switch (sortBy) {
            case 'name':
                bookmarks.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
                bookmarks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'category':
                bookmarks.sort((a, b) => {
                    const catA = this.getCategoryName(a.categoryId);
                    const catB = this.getCategoryName(b.categoryId);
                    return catA.localeCompare(catB);
                });
                break;
        }

        // 添加切换动画
        container.classList.add('switching');
        
        setTimeout(() => {
            // 设置容器类名
            container.className = this.currentView === 'card' ? 'bookmark-card-view' : 'bookmark-list-view';
            
            container.innerHTML = '';
            bookmarks.forEach((bookmark, index) => {
                const bookmarkElement = this.createBookmarkElement(bookmark);
                bookmarkElement.style.animationDelay = `${index * 0.05}s`;
                container.appendChild(bookmarkElement);
            });
            
            container.classList.remove('switching');
        }, 150);
    }

    updateCategorySelect() {
        const select = document.getElementById('bookmark-category');
        select.innerHTML = '<option value="">选择分类</option>';

        const addOptions = (categories, prefix = '') => {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = prefix + category.name;
                select.appendChild(option);

                if (category.children) {
                    addOptions(category.children, prefix + '  ');
                }
            });
        };

        addOptions(this.categories);
    }

    // 工具函数
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 视图切换功能
    switchView(viewType) {
        if (this.currentView === viewType) return;
        
        this.currentView = viewType;
        this.updateViewButtons();
        this.renderBookmarks();
        this.saveData();
    }

    updateViewButtons() {
        const listBtn = document.getElementById('list-view-btn');
        const cardBtn = document.getElementById('card-view-btn');
        
        listBtn.classList.toggle('active', this.currentView === 'list');
        cardBtn.classList.toggle('active', this.currentView === 'card');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="flex items-center">
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new BookmarkManager();
});